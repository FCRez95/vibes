import { ICanvas } from "../engine/canvas";
import { IPosition } from "../engine/position";
import { IMap } from "../engine/map";
import { MonsterModel } from "./monster-model";
import { SkillsModel } from "./skill-model";
import { WeaponModel, ItemModel, HelmetModel, ChestplateModel, ShieldModel, LegsModel, BootsModel } from "./items-model";

export interface EquippedItemsModel {
    helmet: HelmetModel | null;
    chestplate: ChestplateModel | null;
    weapon: WeaponModel | null;
    shield: ShieldModel | null;
    legs: LegsModel | null;
    boots: BootsModel | null;
}

export interface PlayerModel {
    id: number;
    name: string;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    position: IPosition;
    targetPosition: IPosition | null;
    skills: SkillsModel;
    inventory: ItemModel[];
    equipment: EquippedItemsModel;
    lastAttackTime: number;
    online: boolean;
    
    isDead(): boolean;
    updateOnlinePlayer(targetPosition: IPosition | null): void;
    update(direction: { x: number; y: number }, map: IMap, monsters: MonsterModel[], selectedMonster: MonsterModel | null): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 