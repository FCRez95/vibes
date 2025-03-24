'use client'

import { useEffect, useRef } from 'react';
import { CanvasManipulator } from './constructors/engine/canvas';
import { GameConstructor } from './constructors/engine/game';
import { GameControls } from './components/GameControls';
import { Player } from './constructors/entitites/player';

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
    const player = new Player(0, 0, {
      running: { name: 'Running', level: 8, experience: 0, maxExperience: 100 },
      unarmed: { name: 'Unarmed', level: 1, experience: 0, maxExperience: 100 },
      axe: { name: 'Axe', level: 1, experience: 0, maxExperience: 100 },
      throwing: { name: 'Throwing', level: 1, experience: 0, maxExperience: 100 },
      bow: { name: 'Bow', level: 1, experience: 0, maxExperience: 100 },
      club: { name: 'Club', level: 1, experience: 0, maxExperience: 100 },
      summoningMagic: { name: 'Summoning Magic', level: 1, experience: 0, maxExperience: 100 },
      elementalMagic: { name: 'Elemental Magic', level: 1, experience: 0, maxExperience: 100 },
      shammanMagic: { name: 'Shamman Magic', level: 1, experience: 0, maxExperience: 100 },
      natureMagic: { name: 'Nature Magic', level: 1, experience: 0, maxExperience: 100 },
    });
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

    // Handle touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && gameInstanceRef.current) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        gameInstanceRef.current.handleTouchStart(x, y);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && gameInstanceRef.current) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        gameInstanceRef.current.handleTouchMove(x, y);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (gameInstanceRef.current) {
        gameInstanceRef.current.handleTouchEnd();
      }
    };

    canvasRef.current.addEventListener('touchstart', handleTouchStart);
    canvasRef.current.addEventListener('touchmove', handleTouchMove);
    canvasRef.current.addEventListener('touchend', handleTouchEnd);

    // Add mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && gameInstanceRef.current) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gameInstanceRef.current.handleTouchStart(x, y);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && gameInstanceRef.current) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gameInstanceRef.current.handleTouchMove(x, y);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      if (gameInstanceRef.current) {
        gameInstanceRef.current.handleTouchEnd();
      }
    };

    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);
    canvasRef.current.addEventListener('mouseleave', handleMouseUp);

    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('touchstart', handleTouchStart);
        canvasRef.current.removeEventListener('touchmove', handleTouchMove);
        canvasRef.current.removeEventListener('touchend', handleTouchEnd);
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
        canvasRef.current.removeEventListener('mouseleave', handleMouseUp);
      }
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
      />
    </main>
  );  
}
