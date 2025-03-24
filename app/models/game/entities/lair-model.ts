import { MonsterModel } from "./monster-model";

export interface LairModel {
    id: string;
    position: {
        x: number;
        y: number;
    };
    monsterType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    radius: number;
    isActive: boolean;
    spawnTimer: number;
    maxMonsters: number;
    currentMonsters: MonsterModel[];

    // Methods
    spawnMonster(): MonsterModel;
    update(): void;
    isInRange(position: { x: number; y: number }): boolean;
    canSpawnMonster(): boolean;
} 