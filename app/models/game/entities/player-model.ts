import { ICanvas } from "../engine/canvas";
import { IPosition } from "../engine/position";
import { World } from "../../../game/interface/World";
import { MonsterModel } from "./monster-model";
import { SkillsModel } from "./skill-model";
import { Item } from "../../../game/items/Item";
import { RuneModel } from "../Rune";

export interface EquippedItemsModel {
    helmet: Item | null;
    chestplate: Item | null;
    weapon: Item | null;
    shield: Item | null;
    legs: Item | null;
    boots: Item | null;
}

export interface OnlinePlayerModel {
    id: number;
    name: string;
    position: IPosition;
    targetPosition: IPosition | null;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    
    isDead(): boolean;
    updateOnlinePlayer(position: IPosition, health: number, mana: number): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
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
    runes: RuneModel[]
    inventory: Item[];
    equipment: EquippedItemsModel;
    lastAttackTime: number;
    websocket: WebSocket;   

    isDead(): boolean;
    update(direction: { x: number; y: number }, world: World, monsters: MonsterModel[], selectedMonster: MonsterModel | null): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 