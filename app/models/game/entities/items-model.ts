export interface ItemModel {
    name: string;
    type: 'weapon' | 'armor' | 'accessory';
} 

export interface WeaponModel extends ItemModel {
    name: string;
    weaponType: 'axe' | 'bow' | 'club' | 'throwing' | 'staff';
    damage: number;
}

export interface ArmorModel extends ItemModel {
    name: string;
    defense: number;
}

export interface AccessoryModel extends ItemModel {
    name: string;
    effect: string;
}