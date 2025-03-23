'use client'

import { useEffect, useRef } from 'react';
import { CanvasConstructor } from './constructors/CanvasConstructor';
import { GameConstructor } from './constructors/GameConstructor';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set up canvas
    const canvas = new CanvasConstructor(canvasRef.current);
    canvas.resize(window.innerWidth-50, window.innerHeight-50);

    // Initialize game
    gameInstanceRef.current = new GameConstructor(canvas);

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

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('touchstart', handleTouchStart);
        canvasRef.current.removeEventListener('touchmove', handleTouchMove);
        canvasRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      gameInstanceRef.current = null;
    };
  }, []);

  return (
    <main className="w-full h-full flex justify-center items-center">
      <canvas ref={canvasRef} className="border border-gray-300" />
    </main>
  );
}
