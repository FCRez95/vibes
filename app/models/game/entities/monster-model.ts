import { ICanvas } from "../engine/canvas";
import { PlayerModel } from "./player-model";
import { IMap } from "../engine/map";
import { IPosition } from "../engine/position";

export interface MonsterModel {
    id: number;
    monster: string;
    health: number;
    maxHealth: number;
    position: {
        x: number;
        y: number;
    };
    stats: {
        combat: number;
        magic: number;
        shield: number;
        running: number;
    };
    drops: {
        item: string;
        chance: number;
    }[];
    behavior: {
        type: 'aggressive' | 'passive' | 'fleeing';
        range: number;
        attackPattern: string;
        target: PlayerModel | null;
        agroRange: number;
        attackCooldown: number;
        lastAttackTime: number;
    };
    updatedState: {
        position: IPosition | null;
        target: PlayerModel | null;
        health: number | null;
        lastAttackTime: number | null;
    };

    isDead(): boolean;
    updateMonster(targetPosition: IPosition | null, health: number | null, lastAttackTime: number | null, target: PlayerModel | null): void;
    update(map: IMap, onlinePlayers: PlayerModel[] | null): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 