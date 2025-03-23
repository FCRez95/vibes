import { ICanvas } from "../models/game/engine/canvas";
import { Player } from "../models/game/characters/player";
import { Monster } from "../models/game/characters/monster";
import { IPosition } from "../models/game/engine/position";

export class MonsterConstructor implements Monster {
  id: string;
  name: string;
  type: string;
  level: number;
  health: number;
  maxHealth: number;
  position: IPosition;
  lairPosition: IPosition; // Position of the monster's lair
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
    agroRange: number; // Range at which monster becomes aggressive
    attackCooldown: number; // Time between attacks in milliseconds
    lastAttackTime: number; // Timestamp of last attack
  };

  constructor(x: number = 0, y: number = 0) {
    this.id = `monster-${Math.random().toString(36).substr(2, 9)}`;
    this.name = 'Monster';
    this.type = "basic";
    this.level = 1;
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.position = { x, y };
    this.lairPosition = { x, y }; // Initialize lair position to monster's initial position
    this.stats = {
      strength: 8,
      dexterity: 5,
      intelligence: 3,
      vitality: 10
    };
    this.drops = [
      { item: "gold", chance: 0.8 },
      { item: "health_potion", chance: 0.2 }
    ];
    this.behavior = {
      type: "aggressive",
      range: 50,
      attackPattern: "melee",
      agroRange: 200, // Monster becomes aggressive when player is within 150 units
      attackCooldown: 1000, // 1 second between attacks
      lastAttackTime: 0
    };
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  canAttack(): boolean {
    return Date.now() - this.behavior.lastAttackTime >= this.behavior.attackCooldown;
  }

  attack(player: Player): void {
    if (!this.canAttack()) return;

    // Calculate damage based on monster's stats
    const damage = this.stats.strength * 2;
    
    // Apply damage to player
    if ('health' in player) {
      player.health = Math.max(0, player.health - damage);
    }

    this.behavior.lastAttackTime = Date.now();
  }

  update(player: Player): void {
    if (this.behavior.type === 'aggressive') {
      // Calculate distance to player
      const dxToPlayer = player.position.x - this.position.x;
      const dyToPlayer = player.position.y - this.position.y;
      const distanceToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);

      // Calculate distance to lair
      const dxToLair = this.lairPosition.x - this.position.x;
      const dyToLair = this.lairPosition.y - this.position.y;
      const distanceToLair = Math.sqrt(dxToLair * dxToLair + dyToLair * dyToLair);

      // If monster is too far from lair, return to it
      if (distanceToLair > 500) {
        const angle = Math.atan2(dyToLair, dxToLair);
        const newX = this.position.x + Math.cos(angle) * this.stats.dexterity;
        const newY = this.position.y + Math.sin(angle) * this.stats.dexterity;
        
        // Only move if not colliding with player
        if (!this.checkCollision(newX, newY, player)) {
          this.position.x = newX;
          this.position.y = newY;
        }
      }
      // If player is in agro range, chase and attack them
      else if (distanceToPlayer <= this.behavior.agroRange) {
        const angle = Math.atan2(dyToPlayer, dxToPlayer);
        const newX = this.position.x + Math.cos(angle) * this.stats.dexterity;
        const newY = this.position.y + Math.sin(angle) * this.stats.dexterity;
        
        // Only move if not colliding with player
        if (!this.checkCollision(newX, newY, player)) {
          this.position.x = newX;
          this.position.y = newY;
        }

        // Attack if in range
        if (distanceToPlayer <= this.behavior.range) {
          this.attack(player);
        }
      }
    }
  }

  private checkCollision(x: number, y: number, player: Player): boolean {
    const playerRadius = 20; // Player's collision radius
    const monsterRadius = 15; // Monster's collision radius
    const totalRadius = playerRadius + monsterRadius;

    const dx = x - player.position.x;
    const dy = y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < totalRadius;
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw agro range indicator only when not aggressive
    if (this.behavior.type !== 'aggressive') {
      canvas.drawCircle(
        screenX,
        screenY,
        this.behavior.agroRange,
        'rgba(255, 0, 0, 0.1)'
      );
    }

    // Draw monster with different colors based on state
    const monsterColor = this.behavior.type === 'aggressive' ? '#ff0000' : '#800000';
    canvas.drawCircle(screenX, screenY, 15, monsterColor);
    
    // Draw health bar
    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;
    
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 25,
      healthBarWidth,
      healthBarHeight,
      '#333333'
    );
    
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 25,
      healthBarWidth * healthPercentage,
      healthBarHeight,
      '#ff0000'
    );
  }
} 