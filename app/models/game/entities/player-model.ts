import { ICanvas } from "../engine/canvas";
import { IPosition } from "../engine/position";
import { IMap } from "../engine/map";
import { MonsterModel } from "./monster-model";
import { SkillsModel } from "./skill-model";
import { WeaponModel, ArmorModel, ItemModel, AccessoryModel } from "./items-model";

export interface PlayerModel {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    experience: number;
    position: IPosition;
    skills: SkillsModel;
    inventory: ItemModel[];
    equipment: {
        weapon: WeaponModel | null;
        armor: ArmorModel | null;
        accessory: AccessoryModel | null;
    };

    isDead(): boolean;
    update(direction: { x: number; y: number }, map: IMap, monsters: MonsterModel[], selectedMonster: MonsterModel): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 