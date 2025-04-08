import React from 'react';
import { Item } from '../game/items/Item';

interface LootModalProps {
  isOpen: boolean;
  onClose: () => void;
  lootItems: Item[];
  onPickupItem: (item: Item) => void;
  onPickupAll: () => void;
}

export function LootModal({
  isOpen,
  onClose,
  lootItems,
  onPickupItem,
  onPickupAll
}: LootModalProps) {
  if (!isOpen) return null;
  console.log('lootItems', lootItems);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 text-[#383838]">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 w-[90%] max-h-[80vh] overflow-y-auto relative z-10">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Loot:</h3>
        <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        {lootItems.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No items to pick up</p>
        ) : (
          <>
            <div className='bg-gray-100 rounded-lg p-4 mb-[10px]'>
              <div className="grid grid-cols-4 gap-4">
                {lootItems.map((item, index) => (
                <div 
                  key={`${item.identifier}-${index}`}
                  className="aspect-square bg-gray-200 grid grid-rows-3 p-3 rounded-lg"
                >
                  <div className='row-span-1 flex items-end'>
                    <p className="font-sm">{item.name}</p>
                  </div>
                  <div className='row-span-2 grid grid-cols-2 gap-2'>
                    <div>
                      {/* image */}
                    </div>

                    <div className='flex justify-center gap-[2px] flex-col'>
                      <p className="text-gray-400 text-[10px]">Type: {item.type}</p>
                      {item.damageMin && item.damageMax && (
                        <p className="text-gray-400 text-[10px]">
                          Damage: {item.damageMin}-{item.damageMax}
                        </p>
                      )}
                      {item.defense && (
                        <p className="text-gray-400 text-[10px]">
                          Defense: {item.defense}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='row-span-1 flex justify-center items-center'>
                    <button
                      onClick={() => onPickupItem(item)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full"
                  >
                      Pick Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </div>
            <div>
              <button
                onClick={onPickupAll}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Pick Up All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 