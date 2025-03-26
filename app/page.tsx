'use client'

import { useEffect, useRef } from 'react';
import { CanvasManipulator } from './constructors/engine/canvas';
import { GameConstructor } from './constructors/engine/game';
import { GameControls } from './components/GameControls';
import { Player } from './constructors/entitites/player';
import { ItemModel } from './models/game/entities/items-model';
import { EquippedItemsModel } from './models/game/entities/player-model';
import { SkillsModel } from './models/game/entities/skill-model';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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
      running: { name: 'Running', level: 20, experience: 0, maxExperience: 100 },
      unarmed: { name: 'Unarmed', level: 1, experience: 0, maxExperience: 100 },
      axe: { name: 'Axe', level: 1, experience: 0, maxExperience: 100 },
      throwing: { name: 'Throwing', level: 1, experience: 0, maxExperience: 100 },
      bow: { name: 'Bow', level: 1, experience: 0, maxExperience: 100 },
      club: { name: 'Club', level: 1, experience: 0, maxExperience: 100 },
      elementalMagic: { name: 'Elemental Magic', level: 1, experience: 0, maxExperience: 100 },
      shammanMagic: { name: 'Shamman Magic', level: 1, experience: 0, maxExperience: 100 },
      natureMagic: { name: 'Nature Magic', level: 1, experience: 0, maxExperience: 100 },
      summoningMagic: { name: 'Summoning Magic', level: 1, experience: 0, maxExperience: 100 },
      shield: { name: 'Shield', level: 1, experience: 0, maxExperience: 100 },
    }

    const player = new Player(0, 0, skills, inventory, equipment);

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
  }, []);

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
