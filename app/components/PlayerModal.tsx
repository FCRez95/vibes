import React, { useEffect, useState } from 'react';
import { PlayerModel } from '../models/game/entities/player-model';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: () => PlayerModel | undefined;
}

export function PlayerModal({ isOpen, onClose, player }: PlayerModalProps) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>(player());

  useEffect(() => {
    setCurrentPlayer(player());
  }, [isOpen]);

  return (
    isOpen && (
    <div className="fixed inset-0 bg-[#000000c4] flex items-center justify-center z-50 text-[#383838]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-bold">{currentPlayer?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Health</h3>
              <span className="text-sm text-gray-600">{currentPlayer?.health} / {currentPlayer?.maxHealth}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-700 h-2.5 rounded-full"
                style={{
                  width: `${((currentPlayer?.health || 0) / (currentPlayer?.maxHealth || 0)) * 100}%`
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{currentPlayer?.health} / {currentPlayer?.maxHealth}</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Mana</h3>
              <span className="text-sm text-gray-600">{currentPlayer?.mana} / {currentPlayer?.maxMana}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-800 h-2.5 rounded-full"
                style={{
                  width: `${((currentPlayer?.mana || 0) / (currentPlayer?.maxMana || 0)) * 100}%`
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{currentPlayer?.mana} / {currentPlayer?.maxMana}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlayer?.skills && Object.entries(currentPlayer.skills).map(([skillKey, skill]) => (
            <div key={skillKey} className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{skill.name}</h3>
                <span className="text-sm text-gray-600">Level {skill.level}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{
                    width: `${(skill.experience / skill.maxExperience) * 100}%`
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{skill.experience} XP</span>
                <span>{skill.maxExperience} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    )
  );
} 