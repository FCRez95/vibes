import { ICanvas } from "../../../models/game/engine/canvas";
import { PlayerModel } from "../../../models/game/entities/player-model";
import { MonsterModel } from "../../../models/game/entities/monster-model";
import { IPosition } from "../../../models/game/engine/position";
import { IMap } from "../../../models/game/engine/map";
import trollSprite from '../../../../public/assets/monsters/troll-gif.webp';

export class Bat implements MonsterModel {
  id: number;
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
  private sprite: HTMLImageElement;
  private spriteLoaded: boolean = false;
  private readonly SPRITE_WIDTH = 64;  // Width of the sprite
  private readonly SPRITE_HEIGHT = 64; // Height of the sprite

  constructor(id: number, x: number = 0, y: number = 0, lairX: number = 0, lairY: number = 0) {
    this.id = id;
    this.monster = "Troll";
    this.maxHealth = 75;
    this.health = this.maxHealth;
    this.position = { x, y };
    this.lairPosition = { x: lairX, y: lairY }; // Initialize lair position to monster's initial position
    this.stats = {
      combat: 5,
      running: 5,
      magic: 1,
      shield: 8
    };
    this.drops = [
      { item: "gold", chance: 0.8 },
    ];
    this.behavior = {
      type: "aggressive",
      range: 40,
      attackPattern: "melee",
      target: null,
      agroRange: 200, // Monster becomes aggressive when player is within 150 units
      attackCooldown: 1200, // 1 second between attacks
      lastAttackTime: 0
    };

    // Load sprite image
    this.sprite = new Image();
    this.sprite.src = trollSprite.src;
    this.spriteLoaded = true;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  canAttack(): boolean {
    return Date.now() - this.behavior.lastAttackTime >= this.behavior.attackCooldown;
  }

  attack(player: PlayerModel): void {
    if (!this.canAttack()) return;

    // Calculate damage based on monster's stats
    const damage = this.stats.combat * 1.3;
    
    // Apply damage to player
    if ('health' in player) {
      player.health = Math.max(0, player.health - damage);
    }

    this.behavior.lastAttackTime = Date.now();
  }

  update(player: PlayerModel, map: IMap): void {
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
        const newX = this.position.x + Math.cos(angle) * this.stats.running/3;
        const newY = this.position.y + Math.sin(angle) * this.stats.running/3;
        
        // Only move if not colliding with player and tile is walkable
        if (!this.checkCollision(newX, newY, player) && map.isWalkable(newX, newY)) {
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
        
        if (!this.checkCollision(newX, newY, player) && map.isWalkable(newX, newY)) {
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
            
            if (!this.checkCollision(testX, testY, player) && map.isWalkable(testX, testY)) {
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
              
              if (!this.checkCollision(wallX, wallY, player) && map.isWalkable(wallX, wallY)) {
                this.position.x = wallX;
                this.position.y = wallY;
                foundPath = true;
                break;
              }
            }
          }
        }

        // Attack if in range
        if (distanceToPlayer <= this.behavior.range) {
          this.attack(player);
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

    // Draw troll sprite
    canvas.drawImage(
      this.sprite,
      screenX - this.SPRITE_WIDTH / 2,
      screenY - this.SPRITE_HEIGHT / 2,
      this.SPRITE_WIDTH,
      this.SPRITE_HEIGHT
    );
    
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