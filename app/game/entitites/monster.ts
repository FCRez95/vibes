import { ICanvas } from "../../models/game/engine/canvas";
import { PlayerModel } from "../../models/game/entities/player-model";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { IPosition } from "../../models/game/engine/position";
import { World } from "../interface/World";

export class Monster implements MonsterModel {
  id: string;
  monster: string;
  health: number;
  maxHealth: number;
  position: IPosition;
  lairPosition: IPosition; // Position of the monster's lair
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
    agroRange: number; // Range at which monster becomes aggressive
    attackCooldown: number; // Time between attacks in milliseconds
    lastAttackTime: number; // Timestamp of last attack
  };
  updatedState: {
    position: IPosition | null;
    target: PlayerModel | null;
    health: number | null;
    lastAttackTime: number | null;
  };

  private readonly INTERPOLATION_SPEED = 0.2; // Controls how fast the interpolation happens (0-1)

  constructor(id: string, x: number = 0, y: number = 0) {
    this.id = id;
    this.monster = "basic";
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.position = { x, y };
    this.lairPosition = { x, y }; // Initialize lair position to monster's initial position
    this.stats = {
      combat: 8,
      running: 5,
      magic: 3,
      shield: 10
    };
    this.drops = [
      { item: "gold", chance: 0.8 },
      { item: "health_potion", chance: 0.2 }
    ];
    this.behavior = {
      type: "aggressive",
      range: 50,
      attackPattern: "melee",
      target: null,
      agroRange: 200, // Monster becomes aggressive when player is within 150 units
      attackCooldown: 1000, // 1 second between attacks
      lastAttackTime: 0,
    };
    this.updatedState = {
      position: null,
      target: null,
      health: null,
      lastAttackTime: null
    };
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  // Sync with server
  updateMonster(targetPosition: IPosition, health: number, lastAttackTime: number, target: PlayerModel | null): void {
    this.health = health;
    this.behavior.lastAttackTime = lastAttackTime;
    this.behavior.target = target;

    if (!targetPosition) return;

    // Interpolate position
    this.position.x += (targetPosition.x - this.position.x) * this.INTERPOLATION_SPEED;
    this.position.y += (targetPosition.y - this.position.y) * this.INTERPOLATION_SPEED;

    this.behavior.lastAttackTime = lastAttackTime;
    this.behavior.target = target;
    this.behavior.type = target ? 'aggressive' : 'passive';
  }
  

  update(player: PlayerModel, map: World): void {
    if (this.behavior.target) {
      // Calculate distance to player
      const dxToPlayer = this.behavior.target.position.x - this.position.x;
      const dyToPlayer = this.behavior.target.position.y - this.position.y;
      const distanceToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);

      // Calculate distance to lair
      const dxToLair = this.lairPosition.x - this.position.x;
      const dyToLair = this.lairPosition.y - this.position.y;
      const distanceToLair = Math.sqrt(dxToLair * dxToLair + dyToLair * dyToLair);

      // If monster is too far from lair, return to it
      if (distanceToLair > 500) {
        const angle = Math.atan2(dyToLair, dxToLair);
        const newX = this.position.x + Math.cos(angle) * this.stats.running/3;
        const newY = this.position.y + Math.sin(angle) * this.stats.running/3;
        
        // Only move if not colliding with player and tile is walkable
        if (!this.checkCollision(newX, newY, this.behavior.target) && map.isWalkable(newX, newY)) {
          this.position.x = newX;
          this.position.y = newY;
        }
      }
      // If player is in agro range, chase and attack them
      else if (distanceToPlayer <= this.behavior.agroRange) {
        // Try direct path first
        const angle = Math.atan2(dyToPlayer, dxToPlayer);
        const newX = this.position.x + Math.cos(angle) * this.stats.running/3;
        const newY = this.position.y + Math.sin(angle) * this.stats.running/3;
        
        if (!this.checkCollision(newX, newY, this.behavior.target) && map.isWalkable(newX, newY)) {
          // Direct path is clear, move towards player
          this.position.x = newX;
          this.position.y = newY;
        } else {
          // Direct path is blocked, try to find a path around obstacles
          const possibleAngles = [
            angle + Math.PI/2,  // 90 degrees right
            angle - Math.PI/2   // 90 degrees left
          ];

          let foundPath = false;
          for (const testAngle of possibleAngles) {
            const testX = this.position.x + Math.cos(testAngle) * this.stats.running/3;
            const testY = this.position.y + Math.sin(testAngle) * this.stats.running/3;
            
            if (!this.checkCollision(testX, testY, this.behavior.target) && map.isWalkable(testX, testY)) {
              // Found a valid path
              this.position.x = testX;
              this.position.y = testY;
              foundPath = true;
              break;
            }
          }

          // If no path found, try to move along walls
          if (!foundPath) {
            // Try to slide along walls by checking perpendicular directions
            const wallAngles = [
              angle + Math.PI/2,  // 90 degrees right
              angle - Math.PI/2   // 90 degrees left
            ];

            for (const wallAngle of wallAngles) {
              const wallX = this.position.x + Math.cos(wallAngle) * this.stats.running/3;
              const wallY = this.position.y + Math.sin(wallAngle) * this.stats.running/3;
              
              if (!this.checkCollision(wallX, wallY, this.behavior.target) && map.isWalkable(wallX, wallY)) {
                this.position.x = wallX;
                this.position.y = wallY;
                foundPath = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  private checkCollision(x: number, y: number, player: PlayerModel): boolean {
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
    canvas.drawCircle(screenX, screenY, 10, monsterColor);
    
    // Draw health bar
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;
    
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 25,
      healthBarWidth,
      healthBarHeight,
      '#000'
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