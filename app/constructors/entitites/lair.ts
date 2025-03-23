import { ICanvas } from "../../models/game/engine/canvas";
import { LairModel } from "../../models/game/entities/lair-model";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { Monster } from "./monster";
import { IPosition } from "../../models/game/engine/position";

export class Lair implements LairModel {
    id: string;
    position: IPosition;
    monsterType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    radius: number;
    isActive: boolean;
    spawnTimer: number;
    maxMonsters: number;
    currentMonsters: MonsterModel[];
    rotation: number;
    wallSize: number;
    exits: { x: number; y: number }[];

    constructor(x: number, y: number, difficulty: 'easy' | 'medium' | 'hard' = 'easy', rotation: number = 0) {
        this.id = `lair-${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.monsterType = this.getMonsterTypeByDifficulty(difficulty);
        this.difficulty = difficulty;
        this.radius = this.getRadiusByDifficulty(difficulty);
        this.isActive = true;
        this.spawnTimer = 0;
        this.maxMonsters = this.getMaxMonstersByDifficulty(difficulty);
        this.currentMonsters = [];
        this.rotation = rotation % 360; // Normalize rotation to 0-359
        this.wallSize = 30;
        this.exits = this.calculateExits();
    }

    private calculateExits(): { x: number; y: number }[] {
        const exits = [];
        const centerX = this.position.x;
        const centerY = this.position.y;
        const halfSize = this.radius;

        // Calculate exits based on rotation
        switch (this.rotation) {
            case 0:
                exits.push(
                    { x: centerX + halfSize, y: centerY }, // Right
                    { x: centerX, y: centerY - halfSize }, // Top
                    { x: centerX - halfSize, y: centerY }  // Left
                );
                break;
            case 90:
                exits.push(
                    { x: centerX, y: centerY + halfSize }, // Bottom
                    { x: centerX + halfSize, y: centerY }, // Right
                    { x: centerX, y: centerY - halfSize }  // Top
                );
                break;
            case 180:
                exits.push(
                    { x: centerX - halfSize, y: centerY }, // Left
                    { x: centerX, y: centerY + halfSize }, // Bottom
                    { x: centerX + halfSize, y: centerY }  // Right
                );
                break;
            case 270:
                exits.push(
                    { x: centerX, y: centerY - halfSize }, // Top
                    { x: centerX - halfSize, y: centerY }, // Left
                    { x: centerX, y: centerY + halfSize }  // Bottom
                );
                break;
        }
        return exits;
    }

    private getMonsterTypeByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): string {
        switch (difficulty) {
            case 'easy':
                return 'goblin';
            case 'medium':
                return 'orc';
            case 'hard':
                return 'troll';
            default:
                return 'goblin';
        }
    }

    private getRadiusByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
        switch (difficulty) {
            case 'easy':
                return 100;
            case 'medium':
                return 150;
            case 'hard':
                return 200;
            default:
                return 100;
        }
    }

    private getMaxMonstersByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
        switch (difficulty) {
            case 'easy':
                return 2;
            case 'medium':
                return 3;
            case 'hard':
                return 4;
            default:
                return 2;
        }
    }

    spawnMonster(): MonsterModel {
        if (!this.canSpawnMonster()) {
            throw new Error('Cannot spawn more monsters');
        }

        // Calculate spawn position around the lair
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.radius;
        const spawnX = this.position.x + Math.cos(angle) * distance;
        const spawnY = this.position.y + Math.sin(angle) * distance;

        const monster = new Monster(spawnX, spawnY);
        monster.lairPosition = this.position;
        this.currentMonsters.push(monster);
        return monster;
    }

    update(): void {
        // Remove dead monsters
        this.currentMonsters = this.currentMonsters.filter(monster => !monster.isDead());

        // Update spawn timer
        if (this.isActive && this.currentMonsters.length < this.maxMonsters) {
            this.spawnTimer += 16; // Assuming 60 FPS
            if (this.spawnTimer >= 5000) { // Spawn every 5 seconds
                this.spawnTimer = 0;
                this.spawnMonster();
            }
        }
    }

    draw(canvas: ICanvas, camera: { x: number; y: number }): void {
        // Draw monster count
        canvas.drawText(
            `${this.currentMonsters.length}/${this.maxMonsters}`,
            screenX - 20,
            screenY - 25,
            '#ffffff',
            12,
            'Arial'
        );
    }

    isInRange(position: { x: number; y: number }): boolean {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if position is within the square bounds
        if (distance > this.radius) return false;
        
        // Check if position is in a wall
        const halfSize = this.radius;
        const isInWall = (
            (Math.abs(position.x - this.position.x) > halfSize - this.wallSize && Math.abs(position.x - this.position.x) < halfSize) ||
            (Math.abs(position.y - this.position.y) > halfSize - this.wallSize && Math.abs(position.y - this.position.y) < halfSize)
        );
        
        // Check if position is in an exit
        const isInExit = this.exits.some(exit => {
            const exitDx = position.x - exit.x;
            const exitDy = position.y - exit.y;
            return Math.sqrt(exitDx * exitDx + exitDy * exitDy) < this.wallSize;
        });
        
        return !isInWall || isInExit;
    }

    canSpawnMonster(): boolean {
        return this.isActive && this.currentMonsters.length < this.maxMonsters;
    }

    private getLairColorByDifficulty(): string {
        switch (this.difficulty) {
            case 'easy':
                return '#00ff00';
            case 'medium':
                return '#ffff00';
            case 'hard':
                return '#ff0000';
            default:
                return '#00ff00';
        }
    }
} 