'use client'

import { useEffect, useRef, useState } from 'react';
import { CanvasManipulator } from '../constructors/engine/canvas';
import { GameConstructor } from '../constructors/engine/game';
import { GameControls } from '../components/GameControls';
import { Player } from '../constructors/entitites/player';
import { EquippedItemsModel } from '../models/game/entities/player-model';
import { SkillsModel } from '../models/game/entities/skill-model';
import { useRouter } from 'next/navigation';
import { Character, fetchCharacter, fetchOnlineCharacters, supabase, updateCharacter } from '../lib/supabaseClient';

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Character | null>(null);
  const [onlineCharacters, setOnlineCharacters] = useState<Character[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const FPS = 60; // Limit FPS to 60
  const frameTime = 1000 / FPS;
  const UPDATE_INTERVAL = 100; // Update database every 100ms
  
  // Handle selected character and initial online players fetch
  useEffect(() => {
    // Load character from database
    const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');
    if (!selectedCharacter) {
      router.push('/account');
      return;
    }

    const fetchCharacterInfo = async () => {
      const { data: character, error: characterError } = await fetchCharacter(selectedCharacter.id);
      if (characterError) throw characterError;
      if (character && character.length > 0) {
        setSelectedPlayer(character[0] as Character);
      }
    }
    fetchCharacterInfo();

    const fetchOnlinePlayers = async () => {
      const { data: onlinePlayers, error: onlinePlayersError } = await fetchOnlineCharacters();
      if (onlinePlayersError) throw onlinePlayersError;
      setOnlineCharacters(onlinePlayers as Character[]);
    }
    fetchOnlinePlayers();
  }, [router]);

  // Initialize game only when selectedPlayer changes
  useEffect(() => {
    if (!canvasRef.current || !selectedPlayer || !selectedPlayer.skills) return;
    
    // Set up canvas
    const canvas = new CanvasManipulator(canvasRef.current);
    
    // Set canvas size to match container
    const container = canvasRef.current.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.resize(rect.width, rect.height);
    } else {
      canvas.resize(window.innerWidth-50, window.innerHeight-50);
    }

    // Initialize Player and game instance
    const player = initializePlayer(selectedPlayer);
    const onlinePlayers = onlineCharacters.map(character => initializePlayer(character));
    
    gameInstanceRef.current = new GameConstructor(canvas, player, onlinePlayers);

    let lastFrameTime = 0;
    // Set up game loop with frame timing
    const gameLoop = (timestamp: number) => {
      if (!gameInstanceRef.current) return;

      // Calculate time since last frame
      const deltaTime = timestamp - lastFrameTime;

      // Only update if enough time has passed
      if (deltaTime >= frameTime) {
        gameInstanceRef.current.update();
        gameInstanceRef.current.draw();
        
        // Update database if enough time has passed
        const now = Date.now();
        if (now - lastUpdateRef.current >= UPDATE_INTERVAL) {
          saveGameState();
          lastUpdateRef.current = now;
        }

        lastFrameTime = timestamp;
      }

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      gameInstanceRef.current = null;
    };
  }, [selectedPlayer]); // Only depend on selectedPlayer, not onlineCharacters

  // Handle online players updates with debouncing
  useEffect(() => {
    interface PendingUpdate {
      id: number;
      position_x: number;
      position_y: number;
      health: number;
      max_health: number;
      mana: number;
      max_mana: number;
      last_attack_time: number;
      online: boolean;
      name: string;
    }

    const pendingUpdates = new Map<number, PendingUpdate>();
    let updateTimeout: NodeJS.Timeout | null = null;

    const processUpdates = () => {
      if (!gameInstanceRef.current) return;

      // Apply all pending updates at once
      pendingUpdates.forEach((data) => {
        gameInstanceRef.current?.updateOnlinePlayer(
          data.id,
          data.position_x,
          data.position_y,
          data.health,
          data.mana
        );
      });

      // Update React state once for all changes
      setOnlineCharacters(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        pendingUpdates.forEach((data) => {
          const index = updatedPlayers.findIndex(player => player.id === data.id);
          if (index !== -1) {
            updatedPlayers[index] = { 
              ...updatedPlayers[index], 
              position_x: data.position_x,
              position_y: data.position_y,
              health: data.health,
              mana: data.mana,
              online: data.online
            };
          } else {
            // Create a proper Character object
            const newPlayer: Character = {
              id: data.id,
              position_x: data.position_x,
              position_y: data.position_y,
              health: data.health,
              max_health: data.max_health,
              mana: data.mana,
              max_mana: data.max_mana,
              last_attack_time: data.last_attack_time,
              online: data.online,
              name: data.name
            };
            updatedPlayers.push(newPlayer);
          }
        });
        return updatedPlayers;
      });

      pendingUpdates.clear();
    };

    const channel = supabase
      .channel('all_players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'all_players',
        },
        (payload) => {
          const { id, position_x, position_y, health, max_health, mana, max_mana, last_attack_time, online, name } = payload.new as Character;
          
          if (id !== selectedPlayer?.id) {
            // Collect updates
            pendingUpdates.set(id, { id, position_x, position_y, health, max_health, mana, max_mana, last_attack_time, online, name });

            // Clear existing timeout
            if (updateTimeout) {
              clearTimeout(updateTimeout);
            }

            // Process updates after a short delay
            updateTimeout = setTimeout(processUpdates, 16); // Approximately 60fps
          }
        }
      )
      .subscribe();
  
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      supabase.removeChannel(channel);
    };
  }, [selectedPlayer?.id]);

  // Helper function to initialize a player
  const initializePlayer = (character: Character) => {
    const skills: SkillsModel = {
      running: { name: 'Running', level: character.skills ? character.skills[0].running : 0, experience: character.skills ? character.skills[0].running_exp : 0, maxExperience: 100 },
      unarmed: { name: 'Unarmed', level: character.skills ? character.skills[0].unarmed : 0, experience: character.skills ? character.skills[0].unarmed_exp : 0, maxExperience: 100 },
      axe: { name: 'Axe', level: character.skills ? character.skills[0].axe : 0, experience: character.skills ? character.skills[0].axe_exp : 0, maxExperience: 100 },
      throwing: { name: 'Throwing', level: character.skills ? character.skills[0].throwing : 0, experience: character.skills ? character.skills[0].throwing_exp : 0, maxExperience: 100 },
      bow: { name: 'Bow', level: character.skills ? character.skills[0].bow : 0, experience: character.skills ? character.skills[0].bow_exp : 0, maxExperience: 100 },
      club: { name: 'Club', level: character.skills ? character.skills[0].club : 0, experience: character.skills ? character.skills[0].club_exp : 0, maxExperience: 100 },
      elementalMagic: { name: 'Elemental Magic', level: character.skills ? character.skills[0].elemental_magic : 0, experience: character.skills ? character.skills[0].elemental_magic_exp : 0, maxExperience: 100 },
      shammanMagic: { name: 'Shamman Magic', level: character.skills ? character.skills[0].shamman_magic : 0, experience: character.skills ? character.skills[0].shamman_magic_exp : 0, maxExperience: 100 },
      natureMagic: { name: 'Nature Magic', level: character.skills ? character.skills[0].nature_magic : 0, experience: character.skills ? character.skills[0].nature_magic_exp : 0, maxExperience: 100 },
      summoningMagic: { name: 'Summoning Magic', level: character.skills ? character.skills[0].summoning_magic : 0, experience: character.skills ? character.skills[0].summoning_magic_exp : 0, maxExperience: 100 },
      shield: { name: 'Shield', level: character.skills ? character.skills[0].shield : 0, experience: character.skills ? character.skills[0].shield_exp : 0, maxExperience: 100 },
    };

    const equipment: EquippedItemsModel = {
      helmet: { name: 'Tribal Helmet', type: 'helmet', defense: 1 },
      chestplate: { name: 'Chief Chestplate', type: 'chestplate', defense: 1 },
      weapon: { name: 'Divine Axe', type: 'weapon', damage: 1, weaponType: 'axe' },
      shield: null,
      legs: null,
      boots: null,
    };

    return new Player(
      character.id,
      character.position_x,
      character.position_y,
      character.name,
      character.health,
      character.max_health,
      character.mana,
      character.max_mana,
      character.last_attack_time,
      character.online,
      skills,
      [],
      equipment
    );
  };

  // Function to save game state and character progress
  const saveGameState = async (): Promise<boolean> => {
    try {
      if (!gameInstanceRef.current || !selectedPlayer) {
        return false;
      }

      const player = gameInstanceRef.current.player;
      
      // Save player position, health, mana, etc.
      const characterData = {
        health: Math.floor(player.health),
        max_health: Math.floor(player.maxHealth),
        mana: Math.floor(player.mana),
        max_mana: Math.floor(player.maxMana),
        position_x: Math.floor(player.position.x),
        position_y: Math.floor(player.position.y),
        last_attack_time: 0,
        online: true
      };

      // Update character data only
      const { error: characterError } = await updateCharacter(selectedPlayer.id, characterData);
      if (characterError) {
        console.error('Error updating character:', characterError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  };

  return (
    <main className="w-full h-full flex justify-center items-center overflow-hidden">
      <canvas ref={canvasRef} className="border border-gray-300" />
      <GameControls 
        onAttackClick={() => {
          if (gameInstanceRef.current) {
            gameInstanceRef.current.controls.handleAttackClick();  
          }
        }} 
        onJoystickMove={(direction) => {
          if (gameInstanceRef.current) {
            gameInstanceRef.current.controls.handleJoystickMove(direction);
          }
        }} 
        onJoystickStart={() => {
          if (gameInstanceRef.current) {
            gameInstanceRef.current.controls.handleJoystickStart();
          }
        }} 
        onJoystickEnd={() => {
          if (gameInstanceRef.current) {
            gameInstanceRef.current.controls.handleJoystickEnd();
          }
        }}
        onSaveGameState={saveGameState}
        skills={() => {
          if (gameInstanceRef.current) {
            return gameInstanceRef.current.player.skills;
          }
        }}
        inventory={() => {
          if (gameInstanceRef.current) {
            return gameInstanceRef.current.player.inventory;
          }
        }}
        equipment={() => {
          if (gameInstanceRef.current) {
            return gameInstanceRef.current.player.equipment;
          }
        }}
      />
    </main>
  );  
}
