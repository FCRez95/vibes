import React, { useState } from 'react';
import { Joystick } from './Joystick';
import { SkillsModal } from './SkillsModal';
import { SkillsModel } from '../models/game/entities/skill-model';

interface GameControlsProps {
  onAttackClick: () => void;
  onJoystickMove: (direction: { x: number; y: number }) => void;
  onJoystickStart: () => void;
  onJoystickEnd: () => void;
  skills: () => SkillsModel | undefined;
}

export function GameControls({ 
  onAttackClick,
  onJoystickMove,
  onJoystickStart,
  onJoystickEnd,
  skills
}: GameControlsProps) {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="flex w-full h-full">
        <div className="absolute top-1 flex justify-center items-center w-full">
            <button 
                onClick={() => setIsSkillsModalOpen(true)}
                className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
                <span role="img" aria-label="skills">📚</span>
          </button>
        </div>
        <div className="pointer-events-auto">
          <Joystick 
            onMove={onJoystickMove}
            onStart={onJoystickStart}
            onEnd={onJoystickEnd}
          />
        </div>
        <div className="absolute bottom-6 right-6 flex gap-4">
          <button 
            onClick={onAttackClick} 
            className="w-24 h-24 rounded-full bg-[#f70d235c] border-none pointer-events-auto"
          >
            <span role="img" aria-label="sword">⚔️</span>
          </button>
        </div>
      </div>
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
      />
    </div>
  );
} 