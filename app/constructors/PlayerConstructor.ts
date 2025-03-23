import { ICanvas } from "../models/game/engine/canvas";
import { IPosition } from "../models/game/engine/position";
import { Player } from "../models/game/characters/player";
import { IMap } from "../models/game/engine/map";

export class PlayerConstructor implements Player {
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
  inventory: string[];
  equipment: {
    weapon: string;
    armor: string;
    accessory: string;
  };

  constructor(x: number = 0, y: number = 0) {
    this.id = 'player-1';
    this.name = 'Player';
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.experience = 0;
    this.position = { x, y };
    
    // Initialize stats
    this.stats = {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10
    };

    // Initialize secondary stats
    this.secondaryStats = {
      attack: this.stats.strength * 2,
      defense: this.stats.vitality,
      speed: this.stats.dexterity,
      criticalChance: this.stats.dexterity * 0.1,
      criticalDamage: 1.5
    };

    // Initialize inventory and equipment
    this.inventory = [];
    this.equipment = {
      weapon: '',
      armor: '',
      accessory: ''
    };
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  update(direction: { x: number; y: number }, map: IMap): void {
    // Update position based on joystick direction
    const speed = this.secondaryStats.speed;
    this.position.x += direction.x * speed;
    this.position.y += direction.y * speed;

    // Keep player within map bounds
    this.position.x = Math.max(0, Math.min(this.position.x, map.width));
    this.position.y = Math.max(0, Math.min(this.position.y, map.height));
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw player
    canvas.drawCircle(
      screenX,
      screenY,
      20,
      'red'
    );

    // Draw health bar
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;

    // Background of health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 30,
      healthBarWidth,
      healthBarHeight,
      'rgba(0, 0, 0, 0.5)'
    );

    // Health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 30,
      healthBarWidth * healthPercentage,
      healthBarHeight,
      'green'
    );
  }
} 