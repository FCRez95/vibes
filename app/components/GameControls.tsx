import React, { useState } from 'react';
import { Joystick } from './Joystick';
import { PlayerModal } from './PlayerModal';
import { EquipmentModal } from './EquipmentModal';
import { ExitButton } from './ExitButton';
import { PrayModal } from './PrayModal';
import { RunesModal } from './RunesModal';
import { Item } from '../game/items/Item';
import { EquippedItemsModel, PlayerModel } from '../models/game/entities/player-model';
import characterPic from '../../public/assets/character/char-idle.png'; 
import runesPic from '../../public/assets/runes/water.png';
import Image from 'next/image';
import { RuneModel } from '../models/game/Rune';

interface GameControlsProps {
  onAttackClick: () => void;
  onJoystickMove: (direction: { x: number; y: number }) => void;
  onJoystickStart: () => void;
  onJoystickEnd: () => void;
  player: () => PlayerModel | undefined;
  openLoot: () => void;
  inventory: () => Item[] | undefined;
  equipment: () => EquippedItemsModel | undefined;
  saveGameState: () => Promise<boolean>;
  equipItem: (item: Item) => void;
  unequipItem: (item: Item) => void;
  prayButtonVisible: boolean;
  useItem: (item: Item) => void;
}

export function GameControls({ 
  onAttackClick,
  onJoystickMove,
  onJoystickStart,
  onJoystickEnd,
  player,
  openLoot,
  inventory,
  equipment,
  saveGameState,
  equipItem,
  unequipItem,
  prayButtonVisible,
  useItem
}: GameControlsProps) {
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isPrayModalOpen, setIsPrayModalOpen] = useState(false);
  const [isRunesModalOpen, setIsRunesModalOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="flex w-full h-full">
        <div className="absolute top-1 flex justify-center items-center w-full gap-4">
            <button 
              onClick={() => setIsPlayerModalOpen(true)}
              className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
              <Image src={characterPic} alt="skills" className="w-8 h-8" />
            </button>
            <button 
              onClick={() => setIsEquipmentModalOpen(true)}
              className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
              <span role="img" aria-label="equipment">🎒</span>
            </button>
            <button 
              onClick={() => setIsRunesModalOpen(true)}
              className="w-16 h-16 rounded-full bg-[#4a90e2a6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
              <Image src={runesPic} alt="runes" className="w-full h-full rounded-full opacity-50" />
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

        {prayButtonVisible && (
          <div className="absolute bottom-[200px] right-6 flex gap-4">
            <button 
              onClick={() => setIsPrayModalOpen(true)}
              className="w-16 h-16 rounded-full bg-white/50 border-none pointer-events-auto flex items-center justify-center text-white transition-colors"
            >
              <span role="img" aria-label="pray">🙏</span>
            </button>
          </div>
        )}
      </div>
      
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        player={player}
      />
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        inventory={inventory}
        equipment={equipment}
        equipItem={equipItem}
        unequipItem={unequipItem}
      />
      <PrayModal
        isOpen={isPrayModalOpen}
        onClose={() => setIsPrayModalOpen(false)}
        inventory={inventory}
        player={player}
        useItem={useItem}
      />
      <RunesModal
        isOpen={isRunesModalOpen}
        onClose={() => setIsRunesModalOpen(false)}
        player={player}
      />
    </div>
  );
} 