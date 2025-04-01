import { ICanvas } from "../../../models/game/engine/canvas";
import { PlayerModel } from "../../../models/game/entities/player-model";
import { MonsterModel } from "../../../models/game/entities/monster-model";
import { IPosition } from "../../../models/game/engine/position";
import { IMap } from "../../../models/game/engine/map";
import batSprite from '../../../../public/assets/monsters/bat-gif.webp';
import { updateMonster } from "../../../lib/supabaseClient";

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
  updatedState: {
    position: IPosition | null;
    target: PlayerModel | null;
    health: number | null;
    lastAttackTime: number | null;
  };

  private sprite: HTMLImageElement;
  private spriteLoaded: boolean = false;
  private readonly SPRITE_WIDTH = 64;  // Width of the sprite
  private readonly SPRITE_HEIGHT = 64; // Height of the sprite
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL: number = 50; // Increase update interval to 500ms
  private readonly INTERPOLATION_SPEED = 0.2; // Controls how fast the interpolation happens (0-1)

  constructor(id: number, x: number = 0, y: number = 0, health: number = 25, lairX: number = 0, lairY: number = 0, target: PlayerModel | null = null) {
    this.id = id;
    this.monster = "Bat";
    this.maxHealth = 25;
    this.health = health;
    this.position = { x, y };
    this.lairPosition = { x: lairX, y: lairY }; // Initialize lair position to monster's initial position
    this.stats = {
      combat: 10,
      running: 10,
      magic: 1,
      shield: 1
    };
    this.drops = [
      { item: "gold", chance: 0.8 },
    ];
    this.behavior = {
      type: target ? "aggressive" : "passive",
      range: 30,
      target: target,
      attackPattern: "melee",
      agroRange: 200, // Monster becomes aggressive when player is within 150 units
      attackCooldown: 500, // 1 second between attacks
      lastAttackTime: 0
    };
    // Load sprite image
    this.sprite = new Image();
    this.sprite.src = batSprite.src;
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
    this.updatedState = {
      position: {x, y},
      target: null,
      health: health,
      lastAttackTime: 0
    };
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

  checkAggro(onlinePlayers: PlayerModel[] | null): PlayerModel | null {
    if (!onlinePlayers) return null;
    let i = 0
    let playerToAttack: PlayerModel | null = null;

    while (i < onlinePlayers.length && playerToAttack === null) {
      const player = onlinePlayers[i];
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.behavior.agroRange) {
        playerToAttack = player;
      }
      i++;
    }
    return playerToAttack;
  }
  // Update player state in database
  private async updateBatState(): Promise<void> {
    const now = Date.now();
    console.log('Time now: ', Date());
    
    // Only update if position changed significantly and enough time has passed
    if (now - this.lastUpdateTime >= this.UPDATE_INTERVAL) {
      try {
        const batData = {
          id: this.id,
          health: Math.round(this.health),
          position_x: Math.round(this.position.x),
          position_y: Math.round(this.position.y),
          last_attack_time: this.behavior.lastAttackTime,
          target: this.behavior.target?.id
        };

        const { error } = await updateMonster(this.id, batData);
        if (error) {
          console.error('Failed to update bat state:', error);
        } else {
          this.lastUpdateTime = now;
        }
      } catch (error) {
        console.error('Error updating player state:', error);
      }
    }
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

  update(map: IMap, onlinePlayers: PlayerModel[] | null): void {
    if (this.behavior.type === 'passive') {
      const playerToAttack = this.checkAggro(onlinePlayers);
      if (playerToAttack) {
        this.behavior.target = playerToAttack;
        this.behavior.type = 'aggressive';
        this.updateBatState();
      }
    } else if (this.behavior.type === 'aggressive' && this.behavior.target) {
      // Calculate distance to player
      const dxToPlayer = this.behavior.target.position.x - this.position.x;
      const dyToPlayer = this.behavior.target.position.y - this.position.y;
      const distanceToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);

      // Calculate distance to lair
      const dxToLair = this.lairPosition.x - this.position.x;
      const dyToLair = this.lairPosition.y - this.position.y;
      const distanceToLair = Math.sqrt(dxToLair * dxToLair + dyToLair * dyToLair);

      // If monster is too far from lair, return to it
      if (distanceToLair > 1000) {
        const angle = Math.atan2(dyToLair, dxToLair);
        const newX = this.position.x + Math.cos(angle) * this.stats.running/3;
        const newY = this.position.y + Math.sin(angle) * this.stats.running/3;
        
        // Only move if not colliding with player and tile is walkable
        if (!this.checkCollision(newX, newY, this.behavior.target) && map.isWalkable(newX, newY)) {
          this.position.x = newX;
          this.position.y = newY;
          this.behavior.target = null;
          this.behavior.type = 'passive';
          this.updateBatState();
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
          this.updateBatState();
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
              this.updateBatState();
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
                this.updateBatState();
                break;
              }
            }
          }
        }

        // Attack if in range
        if (distanceToPlayer <= this.behavior.range) {
          this.attack(this.behavior.target);
        }
      // If player is not in agro range, return original state
      } else {
        console.log('Returning to lair 1:', this.behavior.target?.name);
        this.behavior.type = 'passive';
        this.behavior.target = null;
        this.updateBatState();
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

    // Draw bat sprite or fallback circle
    if (this.spriteLoaded) {
      canvas.drawImage(
        this.sprite,
        screenX - this.SPRITE_WIDTH / 2,
        screenY - this.SPRITE_HEIGHT / 2,
        this.SPRITE_WIDTH,
        this.SPRITE_HEIGHT
      );
    } else {
      // Draw a circle as fallback while sprite is loading
      canvas.drawCircle(screenX, screenY, 15, '#800000');
    }

    // Draw name above player
    canvas.drawText(
      this.monster,
      screenX,
      screenY - this.SPRITE_HEIGHT - 15,
      '#ffffff',
      12,
      'Arial'
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