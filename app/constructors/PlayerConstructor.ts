import { ICanvas } from "../models/game/engine/canvas";
import { IPosition } from "../models/game/engine/position";
import { Player } from "../models/game/characters/player";
import { IMap } from "../models/game/engine/map";
import { Monster } from "../models/game/characters/monster";

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
  attackCooldown: number; // Time between attacks in milliseconds
  lastAttackTime: number; // Timestamp of last attack

  constructor(x: number = 0, y: number = 0) {
    this.id = 'player-1';
    this.name = 'Player';
    this.level = 1;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.experience = 0;
    this.position = { x, y };
    this.attackCooldown = 1000;
    this.lastAttackTime = 0;

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
  
  canAttack(): boolean {
    return Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  attack(monster: Monster): void {
    if (!this.canAttack()) return;

    // Calculate damage based on player's stats
    const damage = this.secondaryStats.attack;
    
    // Apply damage to monster
    if ('health' in monster) {
      monster.health = Math.max(0, monster.health - damage);
    }

    this.lastAttackTime = Date.now();
  }

  getAttackRange(): number {
    return 300;
  }

  update(direction: { x: number; y: number }, map: IMap, monsters: Monster[], selectedMonster: Monster | null): void {
    // Calculate new position
    const speed = this.secondaryStats.speed;
    const newX = this.position.x + direction.x * speed;
    const newY = this.position.y + direction.y * speed;

    // Check if new position is walkable and not colliding with monsters
    if (map.isWalkable(newX, newY) && !this.checkCollision(newX, newY, monsters)) {
      this.position.x = newX;
      this.position.y = newY;
    }

    // Keep player within map bounds
    this.position.x = Math.max(0, Math.min(this.position.x, map.width));
    this.position.y = Math.max(0, Math.min(this.position.y, map.height));

     // Attack if in range
     // Calculate distance to monster
     if (selectedMonster) {
      const dxToMonster = selectedMonster.position.x - this.position.x;
      const dyToMonster = selectedMonster.position.y - this.position.y;
      const distanceToMonster = Math.sqrt(dxToMonster * dxToMonster + dyToMonster * dyToMonster);
      if (distanceToMonster <= this.getAttackRange()) {
        this.attack(selectedMonster);
      }
     }
  }

  private checkCollision(x: number, y: number, monsters: Monster[]): boolean {
    const playerRadius = 20; // Player's collision radius
    const monsterRadius = 15; // Monster's collision radius
    const totalRadius = playerRadius + monsterRadius;

    return monsters.some(monster => {
      if (monster.isDead()) return false;
      
      const dx = x - monster.position.x;
      const dy = y - monster.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < totalRadius;
    });
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