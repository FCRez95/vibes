import React from 'react';
import { EquippedItemsModel } from '../models/game/entities/player-model';
import { ItemModel } from '../models/game/entities/items-model';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: () => ItemModel[] | undefined;
  equipment: () => EquippedItemsModel | undefined;
}

export function EquipmentModal({ isOpen, onClose, inventory, equipment }: EquipmentModalProps) {
  if (!isOpen) return null;

  const currentInventory = inventory();
  const currentEquipment = equipment();

  return (
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
              <div className="grid grid-cols-6 gap-4">
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.helmet ? currentEquipment.helmet.name : 'Head'}</span>
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.chestplate ? currentEquipment.chestplate.name : 'Chest'}</span>
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.weapon ? currentEquipment.weapon.name : 'Weapon'}</span>
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.shield ? currentEquipment.shield.name : 'Shield'}</span>
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.legs ? currentEquipment.legs.name : 'Legs'}</span>
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{currentEquipment?.boots ? currentEquipment.boots.name : 'Boots'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Inventory</h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="grid grid-cols-6 gap-4">
                {currentInventory? currentInventory.map((item, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <span className="text-gray-400">{item.name}</span>
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
  );
} 