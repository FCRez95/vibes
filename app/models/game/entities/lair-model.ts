import { MonsterModel } from "./monster-model";

export interface LairModel {
    id: number;
    name: string;
    position: {
        x: number;
        y: number;
    };
    monster_type: string;
    max_monsters: number;
    monsters_alive: number;
    monsters: MonsterModel[];
    radius: number;
    spawn_timer: number;
    
    // Methods
    spawnMonster(): MonsterModel;
    update(): void;
    canSpawnMonster(): boolean;
} 