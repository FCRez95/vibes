import { ICanvas } from "../engine/canvas";
import { PlayerModel } from "./player-model";
import { IPosition } from "../engine/position";
import { World } from "../../../game/interface/World";

export interface MonsterModel {
    id: string;
    monster: string;
    health: number;
    maxHealth: number;
    position: {
        x: number;
        y: number;
    };
    behavior: {
        type: 'aggressive' | 'passive' | 'fleeing';
        target: PlayerModel | null;
        agroRange: number;
    };
    updatedState: {
        position: IPosition | null;
        target: PlayerModel | null;
        health: number | null;
        lastAttackTime: number | null;
    };

    isDead(): boolean;
    updateMonster(targetPosition: IPosition | null, health: number | null, target: PlayerModel | null): void;
    takeDamage(damage: number): void;
    blockAttack(): void;
    evadeAttack(): void;
    drawBlockAttack(canvas: ICanvas, screenX: number, screenY: number): void;
    drawEvadeAttack(canvas: ICanvas, screenX: number, screenY: number): void;
    draw(canvas: ICanvas, camera: { x: number; y: number }): void;
} 