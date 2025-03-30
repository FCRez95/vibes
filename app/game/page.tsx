'use client'

import { useEffect, useRef, useState } from 'react';
import { CanvasManipulator } from '../constructors/engine/canvas';
import { GameConstructor } from '../constructors/engine/game';
import { GameControls } from '../components/GameControls';
import { Player } from '../constructors/entitites/player';
import { EquippedItemsModel } from '../models/game/entities/player-model';
import { SkillsModel } from '../models/game/entities/skill-model';
import { useRouter } from 'next/navigation';
import { Character, fetchCharacter, fetchOnlineCharacters, supabase, updateCharacter, updateCharacterSkills } from '../lib/supabaseClient';

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Character | null>(null);
  const [onlineCharacters, setOnlineCharacters] = useState<Character[]>([]);
  
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
    const player = initializePlayer(selectedPlayer, true);
    const onlinePlayers = onlineCharacters.map(character => initializePlayer(character, false));
    console.log('onlinePlayers', onlinePlayers);
    gameInstanceRef.current = new GameConstructor(canvas, player, onlinePlayers);

    // Set up game loop with frame rate control
    let lastTime = 0;
    const targetFPS = gameInstanceRef.current?.isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    let animationFrameId: number;
    
    const gameLoop = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        if (gameInstanceRef.current) {
          gameInstanceRef.current.update();
          gameInstanceRef.current.draw();
        }
        lastTime = currentTime - (deltaTime % frameInterval);
      }
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      gameInstanceRef.current = null;
    };
  }, [selectedPlayer]); // Only depend on selectedPlayer, not onlineCharacters

  // Handle online players updates
  useEffect(() => {
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
          
          if (id !== selectedPlayer?.id && gameInstanceRef.current) {
            // Update the game instance with new player position
            console.log('updating online player', id, name, position_x, position_y, health, mana, max_health, max_mana, last_attack_time, online);
            gameInstanceRef.current.updateOnlinePlayer(id, position_x, position_y, health, mana);
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPlayer?.id]); // Only depend on selectedPlayer.id

  // Helper function to initialize a player
  const initializePlayer = (character: Character, isLocalPlayer: boolean = false) => {
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
      equipment,
      isLocalPlayer
    );
  };

  // Function to save game state and character progress
  const saveGameState = async (): Promise<boolean> => {
    try {
      if (!gameInstanceRef.current || !selectedPlayer) {
        console.error('Game instance or player not available');
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
      
      // Save skills
      const skillsData = {
        running: player.skills.running.level,
        running_exp: player.skills.running.experience,
        unarmed: player.skills.unarmed.level,
        unarmed_exp: player.skills.unarmed.experience,
        axe: player.skills.axe.level,
        axe_exp: player.skills.axe.experience,
        throwing: player.skills.throwing.level,
        throwing_exp: player.skills.throwing.experience,
        bow: player.skills.bow.level,
        bow_exp: player.skills.bow.experience,
        club: player.skills.club.level,
        club_exp: player.skills.club.experience,
        elemental_magic: player.skills.elementalMagic.level,
        elemental_magic_exp: player.skills.elementalMagic.experience,
        nature_magic: player.skills.natureMagic.level,
        nature_magic_exp: player.skills.natureMagic.experience,
        summoning_magic: player.skills.summoningMagic.level,
        summoning_magic_exp: player.skills.summoningMagic.experience,
        shamman_magic: player.skills.shammanMagic.level,
        shamman_magic_exp: player.skills.shammanMagic.experience,
        shield: player.skills.shield.level,
        shield_exp: player.skills.shield.experience
      };
      
      // Update character data
      const { error: characterError } = await updateCharacter(selectedPlayer.id, characterData);
      if (characterError) {
        console.log('Character data', characterData);
        console.error('Error updating character:', characterError);
        return false;
      }
      
      // Update skills
      const { error: skillsError } = await updateCharacterSkills(selectedPlayer.id, skillsData);
      if (skillsError) {
        console.error('Error updating skills:', skillsError);
        return false;
      }
      
      console.log('Game state saved successfully');
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
