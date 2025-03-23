import React from 'react';
import { Joystick } from './Joystick';

interface GameControlsProps {
  onAttackClick: () => void;
  onJoystickMove: (direction: { x: number; y: number }) => void;
  onJoystickStart: () => void;
  onJoystickEnd: () => void;
}

export function GameControls({ 
  onAttackClick,
  onJoystickMove,
  onJoystickStart,
  onJoystickEnd
}: GameControlsProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="flex w-full h-full">
        <Joystick 
          onMove={onJoystickMove}
          onStart={onJoystickStart}
          onEnd={onJoystickEnd}
        />
        <button 
          onClick={onAttackClick} 
          className="absolute bottom-5 right-5 w-20 h-20 rounded-full bg-[#f70d235c] border-none"
        >
          <span role="img" aria-label="sword">⚔️</span>
        </button>
      </div>
    </div>
  );
} 