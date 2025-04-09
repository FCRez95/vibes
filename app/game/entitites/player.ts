import { ICanvas } from "../../models/game/engine/canvas";
import { IPosition } from "../../models/game/engine/position";
import { PlayerModel, EquippedItemsModel } from "../../models/game/entities/player-model";
import { World } from "../interface/World";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { SkillsModel } from "@/app/models/game/entities/skill-model";
import charIdle from '../../../public/assets/character/char-idle.png';
import { Item } from "../items/Item";

export class Player implements PlayerModel {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: IPosition;
  targetPosition: IPosition | null;
  skills: SkillsModel;
  inventory: Item[];
  equipment: EquippedItemsModel;
  attackCooldown: number; // Time between attacks in milliseconds
  lastAttackTime: number; // Timestamp of last attack
  websocket: WebSocket;

  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL: number = 50; // Increase update interval to 500ms
  private readonly INTERPOLATION_SPEED = 0.2; // Controls how fast the interpolation happens (0-1)
  private isLocalPlayer: boolean;
  private sprite: HTMLImageElement;
  private readonly SPRITE_WIDTH = 64;  // Width of the sprite
  private readonly SPRITE_HEIGHT = 64; // Height of the sprite
  private levelUpAnimation: {
    active: boolean;
    startTime: number;
    duration: number;
  } = {
    active: false,
    startTime: 0,
    duration: 2000 // 2 seconds duration
  };
  private blockAttackAnimation: {
    active: boolean;
    startTime: number;
    duration: number;
  } = {
    active: false,
    startTime: 0,
    duration: 2000 // 2 seconds duration
  };
  private evadeAttackAnimation: {
    active: boolean;
    startTime: number;
    duration: number;
  } = {
    active: false,
    startTime: 0,
    duration: 2000 // 2 seconds duration
  };
  private takeDamageAnimation: {
    active: boolean;
    startTime: number;
    duration: number;
    text: string;
  } = {
    active: false,
    startTime: 0,
    duration: 2000, // 2 seconds duration
    text: "Take Damage!"
  };

  constructor(
    id: number,
    x: number,
    y: number, 
    name: string,
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
    lastAttackTime: number,
    skills: SkillsModel,
    inventory: Item[],
    equipment: EquippedItemsModel,
    isLocalPlayer: boolean = true,
    websocket: WebSocket
  ) {
    this.id = id;
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = health;
    this.maxMana = maxMana;
    this.mana = mana;
    this.position = { x, y };
    this.targetPosition = { x, y };
    this.attackCooldown = 1000;
    this.lastAttackTime = lastAttackTime;
    this.lastUpdateTime = Date.now();
    this.isLocalPlayer = isLocalPlayer;
    this.websocket = websocket;
    this.skills = skills;

    // Initialize inventory and equipment
    this.inventory = inventory;
    this.equipment = equipment;

    // Load sprite image
    this.sprite = new Image();
    this.sprite.src = charIdle.src;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  levelUp(skill: keyof SkillsModel): void {
    this.skills[skill].level++;
    this.skills[skill].experience = 0;
    this.levelUpAnimation.active = true;
    this.levelUpAnimation.startTime = Date.now();
  }
  
  blockAttack(): void {
    this.blockAttackAnimation.active = true;
    this.blockAttackAnimation.startTime = Date.now();
  }

  evadeAttack(): void {
    this.evadeAttackAnimation.active = true;
    this.evadeAttackAnimation.startTime = Date.now();
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    this.takeDamageAnimation.active = true;
    this.takeDamageAnimation.startTime = Date.now();
    this.takeDamageAnimation.text = `${damage}`;
  }

  getAttackRange(): number {
    const weapon = this.equipment.weapon;
    if (!weapon) return 100;
    switch (weapon.type) {
      case 'axe':
        return 100;
      case 'club':
        return 100;
      case 'bow':
        return 400;
      case 'throwing':
        return 200;
      default:
        return 100;
    }
  }

  // Sync player state with game server
  private async syncPlayerPosition(): Promise<void> {
    const now = Date.now();
    if (now - this.lastUpdateTime > this.UPDATE_INTERVAL) {
      const action = {
        type: 'MOVE',
        playerId: this.id,
        payload: {
          dx: Math.floor(this.position.x),
          dy: Math.floor(this.position.y)
        }
      }
      this.websocket.send(JSON.stringify(action));
      this.lastUpdateTime = now;
    }
  }
  
  // All user actions are handled here
  update(direction: { x: number; y: number }, world: World, monsters: MonsterModel[]): void {
    const oldX = this.position.x;
    const oldY = this.position.y;

    // Calculate new position
    const speed = this.skills.running.level;
    const newX = this.position.x + direction.x * speed;
    const newY = this.position.y + direction.y * speed;

    // Check if new position is walkable and not colliding with monsters
    if (world.isWalkable(newX, newY) && !this.checkCollision(newX, newY, monsters)) {
      this.position.x = newX;
      this.position.y = newY;

      // Check if position actually changed
      if (oldX !== newX || oldY !== newY) {
        this.syncPlayerPosition(); // Update game server with new position
      }
    }

    // Keep player within map bounds
    this.position.x = Math.max(0, Math.min(this.position.x, world.width));
    this.position.y = Math.max(0, Math.min(this.position.y, world.height));
  }

  private checkCollision(x: number, y: number, monsters: MonsterModel[]): boolean {
    const playerRadius = 20;
    const monsterRadius = 15;
    const totalRadius = playerRadius + monsterRadius;
    const totalRadiusSquared = totalRadius * totalRadius;

    // Quick distance check using squared distance (avoiding square root)
    return monsters.some(monster => {
      if (monster.isDead()) return false;
      
      const dx = x - monster.position.x;
      const dy = y - monster.position.y;
      const distanceSquared = dx * dx + dy * dy;
      
      return distanceSquared < totalRadiusSquared;
    });
  }

  private drawLevelUp(canvas: ICanvas, screenX: number, screenY: number): void {
    if (!this.levelUpAnimation.active) return;

    const elapsed = Date.now() - this.levelUpAnimation.startTime;
    const progress = Math.min(elapsed / this.levelUpAnimation.duration, 1);

    // Fade out effect
    const opacity = 1 - progress;
    const yOffset = -20 - (progress * 20); // Move up as it fades

    // Draw "Level Up!" text
    canvas.drawText(
      "Level Up!",
      screenX,
      screenY - this.SPRITE_HEIGHT + yOffset,
      `rgba(255, 215, 0, ${opacity})`,
      14,
      'Arial'
    );

    // End animation when complete
    if (progress >= 1) {
      this.levelUpAnimation.active = false;
    }
  }

  private drawBlockAttack(canvas: ICanvas, screenX: number, screenY: number): void {
    if (!this.blockAttackAnimation.active) return;

    const elapsed = Date.now() - this.blockAttackAnimation.startTime;
    const progress = Math.min(elapsed / this.blockAttackAnimation.duration, 1);

    // Fade out effect
    const opacity = 1 - progress;
    const yOffset = -20 - (progress * 20); // Move up as it fades

     // Draw "Block!" text
     canvas.drawText(
      "Block!",
      screenX,
      screenY - this.SPRITE_HEIGHT + yOffset,
      `rgba(255, 215, 0, ${opacity})`,
      14,
      'Arial'
    );

    // End animation when complete
    if (progress >= 1) {
      this.blockAttackAnimation.active = false;
    }
  }

  private drawEvadeAttack(canvas: ICanvas, screenX: number, screenY: number): void {
    if (!this.evadeAttackAnimation.active) return;

    const elapsed = Date.now() - this.evadeAttackAnimation.startTime;
    const progress = Math.min(elapsed / this.evadeAttackAnimation.duration, 1);

    // Fade out effect
    const opacity = 1 - progress;
    const yOffset = -20 - (progress * 20); // Move up as it fades

     // Draw "Block!" text
     canvas.drawText(
      "Evade!",
      screenX,
      screenY - this.SPRITE_HEIGHT + yOffset,
      `rgba(255, 215, 0, ${opacity})`,
      14,
      'Arial'
    );

    // End animation when complete
    if (progress >= 1) {
      this.evadeAttackAnimation.active = false;
    }
  }

  drawTakeDamage(canvas: ICanvas, screenX: number, screenY: number): void {
    // TODO: Implement drawTakeDamage
    if (!this.takeDamageAnimation.active) return;

    const elapsed = Date.now() - this.takeDamageAnimation.startTime;
    const progress = Math.min(elapsed / this.takeDamageAnimation.duration, 1);

    // Fade out effec t
    const yOffset = -20 - (progress * 20); // Move up as it fades

    // Draw "Take Damage!" text
    canvas.drawText(
      this.takeDamageAnimation.text,
      screenX,
      screenY - this.SPRITE_HEIGHT + yOffset,
      `red`,
      14,
      'Arial'
    );

    // End animation when complete
    if (progress >= 1) {
      this.takeDamageAnimation.active = false;
    }
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw player sprite
    canvas.drawImage(
      this.sprite,
      screenX - this.SPRITE_WIDTH / 2,
      screenY - this.SPRITE_HEIGHT / 2,
      this.SPRITE_WIDTH,
      this.SPRITE_HEIGHT
    );

    // Draw name above player
    canvas.drawText(
      this.name,
      screenX,
      screenY - this.SPRITE_HEIGHT - 10,
      '#ffffff',
      12,
      'Arial'
    );

    // Draw level up animation
    this.drawLevelUp(canvas, screenX, screenY);

    // Draw block attack animation
    this.drawBlockAttack(canvas, screenX, screenY);

    // Draw evade attack animation
    this.drawEvadeAttack(canvas, screenX, screenY);

    // Draw take damage animation
    this.drawTakeDamage(canvas, screenX, screenY);

    // Draw health bar
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;
    //console.log('healthPercentage: ', this.health, this.maxHealth, healthPercentage);
    // Background of health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - this.SPRITE_HEIGHT - 5,
      healthBarWidth,
      healthBarHeight,
      '#000'
    );

    // Health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - this.SPRITE_HEIGHT - 5,
      healthBarWidth * healthPercentage,
      healthBarHeight,
      'green'
    );

    // Draw mana bar
    const manaBarWidth = 40;
    const manaBarHeight = 4;
    const manaPercentage = this.mana / this.maxMana;

    // Background of mana bar
    canvas.drawRect(
      screenX - manaBarWidth / 2,
      screenY - this.SPRITE_HEIGHT + 1,
      manaBarWidth,
      manaBarHeight,
      'rgba(0, 0, 0, 0.5)'
    );

    // Mana bar
    canvas.drawRect(
      screenX - manaBarWidth / 2,
      screenY - this.SPRITE_HEIGHT + 1,
      manaBarWidth * manaPercentage,
      manaBarHeight,
      'blue'
    );
  }
} 