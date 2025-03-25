export interface ItemModel {
    name: string;
    type: 'helmet' | 'chestplate' | 'weapon' | 'shield' | 'legs' | 'boots';
} 

export interface HelmetModel extends ItemModel {
    name: string;
    defense: number;
}

export interface ChestplateModel extends ItemModel {
    name: string;
    defense: number;
}

export interface WeaponModel extends ItemModel {
    name: string;
    weaponType: 'axe' | 'bow' | 'club' | 'throwing' | 'staff';
    damage: number;
}

export interface ShieldModel extends ItemModel {
    name: string;
    defense: number;
}

export interface LegsModel extends ItemModel {
    name: string;
    defense: number;
}

export interface BootsModel extends ItemModel {
    name: string;
    defense: number;
}