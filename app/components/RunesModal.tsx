import React, { useEffect, useState } from 'react';
import { RuneModel } from '../models/game/Rune';
import Image from 'next/image';
import { fetchAllPlayerRunes, updateRuneBattleCanvas } from '../lib/supabaseClient';
import { PlayerModel } from '../models/game/entities/player-model';
import { runesList } from '../game/runes/Runes';

interface RunesModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: () => PlayerModel | undefined;
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
  setBattleCanvas: React.Dispatch<React.SetStateAction<{
    1: RuneModel | null;
    2: RuneModel | null;
    3: RuneModel | null;
    4: RuneModel | null;
    5: RuneModel | null;
    6: RuneModel | null;
    7: RuneModel | null;
    8: RuneModel | null;
    9: RuneModel | null;
  }>>;
}

const runeLevels = {
  1: 5,
  2: 10,
  3: 20,
  4: 50,
  5: 100,
};

interface BattleCanvas {
  1: RuneModel | null;
  2: RuneModel | null;
  3: RuneModel | null;
  4: RuneModel | null;
  5: RuneModel | null;
  6: RuneModel | null;
  7: RuneModel | null;
  8: RuneModel | null;
  9: RuneModel | null;
}

interface RuneCardProps {
  rune: RuneModel;
  isBattleCanvas: boolean;
}

export function RunesModal({ 
  isOpen, 
  onClose, 
  player, 
  battleCanvas,
  setBattleCanvas 
}: RunesModalProps) {
  const [playerRunes, setPlayerRunes] = useState<RuneCardProps[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>(player());
  const [runeToAssign, setRuneToAssign] = useState<RuneModel | null>(null);

  useEffect(() => {
    setCurrentPlayer(player());
  }, [isOpen, player]);

  useEffect(() => {
    const fetchPlayerRunes = async () => {
      if (!currentPlayer) return;
      const { data, error } = await fetchAllPlayerRunes(currentPlayer.id);
      if (error) throw error;
      const newPlayerRunes: RuneCardProps[] = [];
      const newBattleCanvas = { ...battleCanvas };
      
      data?.forEach((rune) => {
        const runeData = runesList[rune.rune as keyof typeof runesList];
        if (runeData) {
          runeData.amount = rune.amount;
          runeData.level = rune.level;
          if (rune.battle_canvas) {
            newBattleCanvas[rune.battle_canvas as keyof BattleCanvas] = runeData;
            const runeCard: RuneCardProps = {
              rune: runeData,
              isBattleCanvas: true,
            };
            newPlayerRunes.push(runeCard);
          } else {
            const runeCard: RuneCardProps = {
              rune: runeData,
              isBattleCanvas: false,
            };
            newPlayerRunes.push(runeCard);
          }
        }
      });
      
      setBattleCanvas(newBattleCanvas);
      setPlayerRunes(newPlayerRunes);
    };
    fetchPlayerRunes();
  }, [currentPlayer]);

  const handleAssignRune = (rune: RuneModel) => {
    setRuneToAssign(rune);
    const runeModal = document.getElementById('rune-modal');
    if (runeModal) {
      runeModal.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSlot = async (slotNumber: number) => {
    if (!runeToAssign) return;

    const newBattleCanvas = { ...battleCanvas };
    const oldRune = newBattleCanvas[slotNumber as keyof BattleCanvas];
    
    // If there was a rune in the slot, return it to inventory
    if (oldRune) {
      if (!currentPlayer?.id) return;
      const { error } = await updateRuneBattleCanvas(currentPlayer?.id, oldRune.id, null);
      if (error) throw error;
      setPlayerRunes(prev => prev.map(r => r.rune.id === oldRune.id ? { ...r, isBattleCanvas: false } : r));
    }
    
    // Assign the new rune to the slot
    newBattleCanvas[slotNumber as keyof BattleCanvas] = runeToAssign;
    if (!currentPlayer?.id) return;
    const { error } = await updateRuneBattleCanvas(currentPlayer?.id, runeToAssign.id, slotNumber);
    if (error) throw error;
    setBattleCanvas(newBattleCanvas);
    
    // Update the assigned rune in inventory
    setPlayerRunes(prev => prev.map(r => r.rune.id === runeToAssign.id ? { ...r, isBattleCanvas: true } : r));
    
    // Clear the rune to assign
    setRuneToAssign(null);
  };

  const handleRemoveRune = async (slotNumber: number) => {
    const newBattleCanvas = { ...battleCanvas };
    const runeToRemove = newBattleCanvas[slotNumber as keyof BattleCanvas];
    
    if (!runeToRemove || !currentPlayer?.id) return;
    
    // Remove from battle canvas
    newBattleCanvas[slotNumber as keyof BattleCanvas] = null;
    setBattleCanvas(newBattleCanvas);
    
    // Add to inventory
    setPlayerRunes(prev => prev.map(r => r.rune.id === runeToRemove.id ? { ...r, isBattleCanvas: false } : r));
    
    // Update database
    const { error } = await updateRuneBattleCanvas(currentPlayer.id, runeToRemove.id, null);
    if (error) throw error;
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-[#000000c4] flex items-center justify-center z-50 text-[#383838]">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto" id="rune-modal">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold mb-4">Battle Canvas</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Battle Canvas Section */}
            <div className="flex justify-center items-center">
              <div className="bg-gray-100 rounded-lg p-4 w-[40%]">
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(battleCanvas).map(([key, rune]) => (
                    <div
                      key={key}
                      className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative"
                    >
                      {runeToAssign && (
                        <button
                          onClick={() => handleSelectSlot(Number(key))}
                          className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs z-10"
                        >
                          Select
                        </button>
                      )}
                      {rune ? (
                        <div className="flex flex-col w-full h-full bg-black rounded-lg relative">
                          <button
                            onClick={() => handleRemoveRune(Number(key))}
                            className="absolute top-1 right-2 text-white text-xs z-10"
                          >
                            ✕
                          </button>
                          <Image 
                            src={rune.image.src} 
                            alt={rune.name}
                            width={500}
                            height={500}
                            className="w-full h-full rounded-lg"
                          />
                          <span className="text-gray-400 text-sm relative bottom-[20px] left-[5px]">{rune.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Slot {key}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Runes Collection Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Runes</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playerRunes?.map((rune) => (
                    <div key={rune.rune.id} className="bg-gray-200 rounded-lg p-4">
                      <div className="flex flex-col items-center justify-between h-full gap-4">
                        <div className="w-16 h-16 relative">
                          <Image 
                            src={rune.rune.image.src} 
                            alt={rune.rune.name} 
                            layout="fill" 
                            objectFit="contain" 
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-[20px]">
                            <h4 className="font-bold">{rune.rune.name}</h4>
                            <span className="text-xs text-gray-500">Level: {rune.rune.level}</span>
                            <span className="text-xs text-gray-500">Total: {rune.rune.amount}/{runeLevels[rune.rune.level as keyof typeof runeLevels]}</span>
                          </div>
                          <p className="text-sm text-gray-600">{rune.rune.description}</p>
                          <div className="mt-2">
                            {rune.rune.effect.map((effect: string, i: number) => (
                              <p key={i} className="text-xs text-gray-500">{effect}</p>
                            ))}
                          </div>
                        </div>
                        {!rune.isBattleCanvas && (
                          <button
                            onClick={() => handleAssignRune(rune.rune)}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded w-full"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )    
  )
} 