import React, { useEffect, useState } from 'react';
import { EquippedItemsModel } from '../models/game/entities/player-model';
import { Item } from '../game/items/Item';
import Image from 'next/image';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: () => Item[] | undefined;
  equipment: () => EquippedItemsModel | undefined;
  equipItem: (item: Item) => void;
  unequipItem: (item: Item) => void;
}

export function EquipmentModal({ isOpen, onClose, inventory, equipment, equipItem, unequipItem }: EquipmentModalProps) {
  const [currentInventory, setCurrentInventory] = useState<Item[]>(inventory() || []);
  const [currentEquipment, setCurrentEquipment] = useState<EquippedItemsModel | undefined>(equipment());
  
  useEffect(() => {
    setCurrentInventory(inventory() || []);
    setCurrentEquipment(equipment());
  }, [isOpen]);

  const handleEquipItem = (item: Item) => {
    equipItem(item);

    if (currentEquipment) {
      const replacedItem = currentEquipment[item.type as keyof EquippedItemsModel];
      setCurrentEquipment({
        ...currentEquipment,
        [item.type as keyof EquippedItemsModel]: item
      });
      
      const newInventory = currentInventory.filter(i => i.id !== item.id);
      if (replacedItem) {
        newInventory.push(replacedItem);
      }
      setCurrentInventory(newInventory);
    }
  };  

  const handleUnequipItem = (item: Item | null) => {
    if (!item) return;
    unequipItem(item);
    const removedItem = currentEquipment?.[item.type as keyof EquippedItemsModel];
    if (currentEquipment) {
      const newEquipment = { ...currentEquipment };
      newEquipment[item.type as keyof EquippedItemsModel] = null;
      setCurrentEquipment(newEquipment);
    }

    if (removedItem) {
      setCurrentInventory([...currentInventory, removedItem]);
    }
  };

  return (
    isOpen && (
    <div className="fixed inset-0 bg-[#000000c4] flex items-center justify-center z-50 text-[#383838]">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Equipment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Equipped Items Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Equipped Items</h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-rows-2 gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.helmet ? (
                      <div
                        key={`${currentEquipment?.helmet?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.helmet?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.helmet?.image?.src || ''} alt={currentEquipment?.helmet?.name} width={100} height={100} />
                          </div>

                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.helmet?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Defense: {currentEquipment?.helmet?.defense}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => handleUnequipItem(currentEquipment?.helmet)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Head</span>
                    )}
                    </span>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.chestplate ? (
                      <div
                        key={`${currentEquipment?.chestplate?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.chestplate?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.chestplate?.image?.src || ''} alt={currentEquipment?.chestplate?.name} width={100} height={100} />
                          </div>

                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.chestplate?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Defense: {currentEquipment?.chestplate?.defense}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                              onClick={() => handleUnequipItem(currentEquipment?.chestplate)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full h-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Chest</span>
                    )}
                    </span>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.weapon ? (
                      <div
                        key={`${currentEquipment?.weapon?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.weapon?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.weapon?.image?.src || ''} alt={currentEquipment?.weapon?.name} width={100} height={100} />
                          </div>
                          
                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.weapon?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Damage: {currentEquipment?.weapon?.damageMin}-{currentEquipment?.weapon?.damageMax}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => handleUnequipItem(currentEquipment?.weapon)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full h-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Weapon</span>
                    )}
                    </span>
                  </div> 
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.shield ? (
                      <div
                        key={`${currentEquipment?.shield?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.shield?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.shield?.image?.src || ''} alt={currentEquipment?.shield?.name} width={100} height={100} />
                          </div>

                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.shield?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Defense: {currentEquipment?.shield?.defense}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => handleUnequipItem(currentEquipment?.shield)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full h-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Shield</span>
                    )}
                    </span>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.legs ? (
                      <div
                        key={`${currentEquipment?.legs?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.legs?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.legs?.image?.src || ''} alt={currentEquipment?.legs?.name} width={100} height={100} />
                          </div>

                          <div className='flex justify-center gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.legs?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Defense: {currentEquipment?.legs?.defense}
                            </p>
                          </div>    
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => handleUnequipItem(currentEquipment?.legs)}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full h-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Legs</span>
                    )}
                    </span>
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="p-3 w-full h-full">{currentEquipment?.boots ? (
                      <div
                        key={`${currentEquipment?.boots?.identifier}`}
                        className="aspect-square bg-gray-200 flex flex-col rounded-lg"
                      >
                        <div className='h-[15%]'>
                          <p className="font-sm">{currentEquipment?.boots?.name}</p>
                        </div>
                        <div className='h-[60%] grid grid-cols-2 gap-2'>
                          <div className="flex items-center justify-center">
                            <Image src={currentEquipment?.boots?.image?.src || ''} alt={currentEquipment?.boots?.name} width={100} height={100} />
                          </div>

                          <div className='flex gap-[2px] flex-col'>
                            <p className="text-gray-400 text-[10px]">Type: {currentEquipment?.boots?.type}</p>
                            <p className="text-gray-400 text-[10px]">
                              Defense: {currentEquipment?.boots?.defense}
                            </p>
                          </div>
                        </div>
                        <div className='h-[25%]'>
                          <button
                            onClick={() => { }}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full h-full"
                          >
                            Unequip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center justify-center h-full w-full">Boots</span>
                    )}
                    </span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Inventory</h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4">
                {currentInventory ? currentInventory.map((item, index) => (
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
                    <div className='h-[25%]'>
                      <button
                        onClick={() => handleEquipItem(item)}
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded w-full"
                      >
                        Equip
                      </button>
                    </div>
                  </div>
                )) : (
                  <span className="text-gray-400">No items</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  );
} 