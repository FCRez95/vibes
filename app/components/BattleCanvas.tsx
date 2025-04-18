import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RuneModel } from '../models/game/Rune';

interface BattleCanvasProps {
  battleCanvas: {
    1: RuneModel | null;
    2: RuneModel | null;
    3: RuneModel | null;
    4: RuneModel | null;
    5: RuneModel | null;
    6: RuneModel | null;
    7: RuneModel | null;
    8: RuneModel | null;
    9: RuneModel | null;
  };
  createSpell: (spell: string[]) => void;
}

export function BattleCanvas({ battleCanvas, createSpell }: BattleCanvasProps) {
  const [activatedRunes, setActivatedRunes] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDrawingRef = useRef(false);

  const resetSpell = () => {
    if (activatedRunes.length > 0) {
      const spell: string[] = [];
      activatedRunes.forEach(runeKey => {
        const rune = battleCanvas[Number(runeKey) as keyof typeof battleCanvas];
        if (rune) {
          console.log('Rune:', rune.id);
          spell.push(rune.id);
        }
      });
      setActivatedRunes([]);
      createSpell(spell);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRuneActivation = (runeKey: string) => {
    if (!activatedRunes.includes(runeKey)) {
      setActivatedRunes((prev) => [...prev, runeKey]);
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(resetSpell, 1000);
  };

  const handleTouchStart = () => {
    isDrawingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const runeElement = element?.closest('[data-rune-key]');
    
    if (runeElement) {
      const key = runeElement.getAttribute('data-rune-key');
      if (key) handleRuneActivation(key);
    }
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
  };

  return (
    <div 
      className="absolute bottom-6 right-[180px]"
      onTouchEnd={handleTouchEnd}
    >
      <div className="grid grid-cols-3 gap-[20px]">
        {Object.entries(battleCanvas).map(([key, rune]) => (
          <div
            key={key}
            data-rune-key={key}
            className={`w-12 h-12 relative cursor-pointer ${
              activatedRunes.includes(key) ? 'rounded-full ring-2 ring-purple-500' : ''
            }`}
            onClick={() => handleRuneActivation(key)}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e)}
          >
            {rune && (
              <Image
                src={rune.image.src}
                alt={rune.name}
                layout="fill"
                objectFit="contain"
                className={`rounded-full ${
                  activatedRunes.includes(key) ? 'opacity-100' : 'opacity-15'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 