import React, { useState } from 'react';
import { Joystick } from './Joystick';
import { SkillsModal } from './SkillsModal';
import { EquipmentModal } from './EquipmentModal';
import { ExitButton } from './ExitButton';
import { SkillsModel } from '../models/game/entities/skill-model';
import { Item } from '../game/items/Item';
import { EquippedItemsModel } from '../models/game/entities/player-model';

interface GameControlsProps {
  onAttackClick: () => void;
  onJoystickMove: (direction: { x: number; y: number }) => void;
  onJoystickStart: () => void;
  onJoystickEnd: () => void;
  skills: () => SkillsModel | undefined;
  openLoot: () => void;
  inventory: () => Item[] | undefined;
  equipment: () => EquippedItemsModel | undefined;
  saveGameState: () => Promise<boolean>;
  equipItem: (item: Item) => void;
  unequipItem: (item: Item) => void;
}

export function GameControls({ 
  onAttackClick,
  onJoystickMove,
  onJoystickStart,
  onJoystickEnd,
  skills,
  openLoot,
  inventory,
  equipment,
  saveGameState,
  equipItem,
  unequipItem
}: GameControlsProps) {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="flex w-full h-full">
        <div className="absolute top-1 flex justify-center items-center w-full gap-4">
            <button 
                onClick={() => setIsSkillsModalOpen(true)}
                className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
                <span role="img" aria-label="skills">📚</span>
            </button>
            <button 
                onClick={() => setIsEquipmentModalOpen(true)}
                className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
                <span role="img" aria-label="equipment">🎒</span>
            </button>
            <ExitButton onSaveGameState={saveGameState} />
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
        <div className="absolute bottom-[130px] right-6 flex gap-4">
          <button 
            onClick={openLoot}
            className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
          >
            <span role="img" aria-label="loot">🖐️</span>
          </button>
        </div>
      </div>
      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={skills}
      />
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        inventory={inventory}
        equipment={equipment}
        equipItem={equipItem}
        unequipItem={unequipItem}
      />
    </div>
  );
} 