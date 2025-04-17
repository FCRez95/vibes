import React, { useEffect, useState } from 'react';
import { Item } from '../game/items/Item';
import Image from 'next/image';
import { createPray, fetchPray, deletePrayer, addRuneToPlayer } from '../lib/supabaseClient';
import { PlayerModel } from '../models/game/entities/player-model';
import SmallCore from '../../public/assets/items/core-1.png';
import MediumCore from '../../public/assets/items/core-2.png';
import LargeCore from '../../public/assets/items/core-3.png';
import { runesList } from '../game/runes/Runes';
import { RuneModel } from '../models/game/Rune';

interface PrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: () => Item[] | undefined;
  player: () => PlayerModel | undefined;
  usingItem: (item: Item) => void;
}

interface Prayer {
  id: number;
  core_lvl: number;
  created_at: string;
}

export function PrayModal({ isOpen, onClose, inventory, player, usingItem }: PrayModalProps) {
  const [currentInventory, setCurrentInventory] = useState<Item[]>(inventory() || []);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerModel | undefined>(player());
  const [currentPrayer, setCurrentPrayer] = useState<Prayer | undefined>();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showRunes, setShowRunes] = useState<boolean>(false);
  const [blessingRunes, setBlessingRunes] = useState<RuneModel[]>([]);
  
  useEffect(() => {
    setCurrentInventory(inventory() || []);
    setCurrentPlayer(player());
  }, [isOpen, inventory, player]);

  useEffect(() => {
    if (!currentPlayer) return;
    const fetchPrayData = async () => {
      const { data, error } = await fetchPray(currentPlayer.id);
      if (error) throw error;
      console.log(data);
      setCurrentPrayer(data?.[0]);
    };
    fetchPrayData();
  }, [currentPlayer]);

  useEffect(() => {
    if (!currentPrayer) return;

    const calculateTimeRemaining = () => {
      const creationTime = new Date(currentPrayer.created_at).getTime();
      const now = new Date().getTime();
      const waitTime = currentPrayer.core_lvl === 1 ? 30 * 60 * 1000 : currentPrayer.core_lvl === 2 ? 60 * 60 * 1000 : 120 * 60 * 1000;
      const endTime = creationTime + waitTime;
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('00:00');
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [currentPrayer]);

  const handleUseCore = async (item: Item) => {
    usingItem(item);

    if (!currentPlayer) return;
    if (!item.coreLvl) return;
    const { data, error } = await createPray(currentPlayer.id, item.coreLvl);
    if (error) throw error;
    setCurrentPrayer(data?.[0]);
    setCurrentInventory(currentInventory.filter(i => i.id !== item.id));
  };

  const randomizeRunes = () => {
    const runes = Object.values(runesList);
    const numRunes = currentPrayer?.core_lvl === 1 ? 1 : currentPrayer?.core_lvl === 2 ? 3 : 5;
    const randomRunes = runes.sort(() => Math.random() - 0.5).slice(0, numRunes);
    return randomRunes;
  }

  const handleGetBlessing = async () => {
    const runes = randomizeRunes();
    if (!currentPrayer || !currentPlayer) return;
    const { error } = await deletePrayer(currentPrayer.id);
    if (error) throw error;

    runes.forEach(async (rune) => {
      const { error } = await addRuneToPlayer(currentPlayer.id, rune.id);
      if (error) throw error;
    });
    setBlessingRunes(runes);
    setCurrentPrayer(undefined);
    setShowRunes(true);
  }

  const handleAcceptBlessing = async () => {
    setShowRunes(false);
  }

  return (
    isOpen && (
      !showRunes? (
        <div className="fixed inset-0 bg-[#000000c4] flex items-center justify-center z-50 text-[#383838]">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pray</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Current Core Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Current Core</h3>
                <div className="bg-gray-100 rounded-lg p-4 w-fit">
                  {currentPrayer ? (
                    <div className="bg-gray-200 rounded-lg p-3">
                      <div className='grid grid-cols-2 gap-2'>
                        <div className="flex items-center justify-center">
                          <Image src={currentPrayer.core_lvl === 1 ? SmallCore : currentPrayer.core_lvl === 2 ? MediumCore : LargeCore} alt={currentPrayer.core_lvl.toString()} width={100} height={100} />
                        </div>
                        <div className='flex gap-[2px] flex-col'>
                          <p className="text-gray-400 text-[10px]">Type: {currentPrayer.core_lvl === 1 ? 'Small' : currentPrayer.core_lvl === 2 ? 'Medium' : 'Large'}</p>
                          <p className="text-gray-400 text-[10px]">
                            Level: {currentPrayer.core_lvl}
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            Time Remaining: {timeRemaining}
                          </p>
                          {timeRemaining === '00:00' && !showRunes && (
                            <button 
                              onClick={handleGetBlessing}
                              className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Get Blessing
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No core equipped</span>
                  )}
                </div>
              </div>

              {/* Inventory Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Available Cores</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    {currentInventory.filter(item => item.type === 'core').map((item, index) => (
                      <div
                        key={`${item.identifier}-${index}`}
                        className="aspect-square p-3 bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{item.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={item.image?.src || ''} alt={item.name} width={100} height={100} />
                          </div>
                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {item.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Level: {item.coreLvl}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => handleUseCore(item)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-[#000000c4] flex items-center justify-center z-50 text-[#383838]">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Your Blessing</h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blessingRunes.map((rune, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg p-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 relative">
                        <Image src={rune.image.src} alt={rune.name} layout="fill" objectFit="contain" />
                      </div>
                      <div>
                        <h4 className="font-bold">{rune.name}</h4>
                        <p className="text-sm text-gray-600">{rune.description}</p>
                        <div className="mt-2">
                          {rune.effect.map((effect: string, i: number) => (
                            <p key={i} className="text-xs text-gray-500">{effect}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAcceptBlessing}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full"
              >
                Accept Blessings
              </button>
            </div>
          </div>
        </div>
      )
    )
  );
} 