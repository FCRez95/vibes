import { ICanvas } from "../engine/canvas";
import { IPosition } from "../engine/position";
import { IMap } from "../engine/map";
import { Monster } from "./monster";

export interface Player {
    id: string;
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    position: IPosition;
    stats: {
        strength: number;
        dexterity: number;
        intelligence: number;
        vitality: number;
    };
    secondaryStats: {
        attack: number;
        defense: number;
        speed: number;
        criticalChance: number;
        criticalDamage: number;
    };
    inventory: any[];
    equipment: {
        weapon: any;
        armor: any;
        accessory: any;
    };

    isDead(): boolean;
    update(direction: { x: number; y: number }, map: IMap, monsters: Monster[], camera: { x: number; y: number }): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 