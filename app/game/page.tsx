'use client'

import { useEffect, useRef, useState } from 'react';
import { CanvasManipulator } from '../constructors/engine/canvas';
import { GameConstructor } from '../constructors/engine/game';
import { GameControls } from '../components/GameControls';
import { Player } from '../constructors/entitites/player';
import { ItemModel } from '../models/game/entities/items-model';
import { EquippedItemsModel } from '../models/game/entities/player-model';
import { SkillsModel } from '../models/game/entities/skill-model';
import router from 'next/router';
import { Character, fetchCharacter } from '../lib/supabaseClient';

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Character | null>(null);

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
 
  }, []);

  useEffect(() => {
    console.log('here', selectedPlayer);
    if (!canvasRef.current) return;
    
    if (selectedPlayer && selectedPlayer.skills) {
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

      // Initialize game
      const inventory: ItemModel[] = []
      const equipment: EquippedItemsModel = {
        helmet: { name: 'Tribal Helmet', type: 'helmet', defense: 1 },
        chestplate: { name: 'Chief Chestplate', type: 'chestplate', defense: 1 },
        weapon: { name: 'Divine Axe', type: 'weapon', damage: 1, weaponType: 'axe' },
        shield: null,
        legs: null,
        boots: null,
      }

      const skills: SkillsModel = {
        running: { name: 'Running', level: selectedPlayer.skills[0].running, experience: selectedPlayer.skills[0].running_exp, maxExperience: 100 },
        unarmed: { name: 'Unarmed', level: selectedPlayer.skills[0].unarmed, experience: selectedPlayer.skills[0].unarmed_exp, maxExperience: 100 },
        axe: { name: 'Axe', level: selectedPlayer.skills[0].axe, experience: selectedPlayer.skills[0].axe_exp, maxExperience: 100 },
        throwing: { name: 'Throwing', level: selectedPlayer.skills[0].throwing, experience: selectedPlayer.skills[0].throwing_exp, maxExperience: 100 },
        bow: { name: 'Bow', level: selectedPlayer.skills[0].bow, experience: selectedPlayer.skills[0].bow_exp, maxExperience: 100 },
        club: { name: 'Club', level: selectedPlayer.skills[0].club, experience: selectedPlayer.skills[0].club_exp, maxExperience: 100 },
        elementalMagic: { name: 'Elemental Magic', level: selectedPlayer.skills[0].elemental_magic, experience: selectedPlayer.skills[0].elemental_magic_exp, maxExperience: 100 },
        shammanMagic: { name: 'Shamman Magic', level: selectedPlayer.skills[0].shamman_magic, experience: selectedPlayer.skills[0].shamman_magic_exp, maxExperience: 100 },
        natureMagic: { name: 'Nature Magic', level: selectedPlayer.skills[0].nature_magic, experience: selectedPlayer.skills[0].nature_magic_exp, maxExperience: 100 },
        summoningMagic: { name: 'Summoning Magic', level: selectedPlayer.skills[0].summoning_magic, experience: selectedPlayer.skills[0].summoning_magic_exp, maxExperience: 100 },
        shield: { name: 'Shield', level: selectedPlayer.skills[0].shield, experience: selectedPlayer.skills[0].shield_exp, maxExperience: 100 },
      }
      console.log('skills', skills);
      console.log('inventory', inventory);
      console.log('equipment', equipment);
      const player = new Player(
        selectedPlayer.position_x,
        selectedPlayer.position_y,
        selectedPlayer.name,
        selectedPlayer.health,
        selectedPlayer.max_health,
        selectedPlayer.mana,
        selectedPlayer.max_mana,
        selectedPlayer.last_attack_time,
        skills,
        inventory,
        equipment
      );
      console.log('player', player);
      gameInstanceRef.current = new GameConstructor(canvas, player);

      // Set up game loop
      let animationFrameId: number;
      const gameLoop = () => {
        if (gameInstanceRef.current) {
          gameInstanceRef.current.update();
          gameInstanceRef.current.draw();
        }
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      gameLoop();

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        gameInstanceRef.current = null;
      };
    }

  }, [selectedPlayer]);

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
