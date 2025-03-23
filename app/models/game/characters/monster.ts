import { ICanvas } from "../engine/canvas";
import { Player } from "./player";

export interface Monster {
    id: string;
    name: string;
    type: string;
    level: number;
    health: number;
    maxHealth: number;
    position: {
        x: number;
        y: number;
    };
    stats: {
        strength: number;
        dexterity: number;
        intelligence: number;
        vitality: number;
    };
    drops: {
        item: string;
        chance: number;
    }[];
    behavior: {
        type: 'aggressive' | 'passive' | 'fleeing';
        range: number;
        attackPattern: string;
    };

    isDead(): boolean;
    update(player: Player): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 