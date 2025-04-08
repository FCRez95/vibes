import { ICanvas } from "../../../models/game/engine/canvas";
import { PlayerModel } from "../../../models/game/entities/player-model";
import { MonsterModel } from "../../../models/game/entities/monster-model";
import { IPosition } from "../../../models/game/engine/position";
import goblinSprite from '../../../../public/assets/monsters/goblin-gif.webp';

export class Goblin implements MonsterModel {
  id: string;
  monster: string;
  health: number;
  maxHealth: number;
  position: IPosition;
  lairPosition: IPosition; // Position of the monster's lair
  behavior: {
    type: 'aggressive' | 'passive' | 'fleeing';
    target: PlayerModel | null;
    agroRange: number; // Range at which monster becomes aggressive
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
  private readonly INTERPOLATION_SPEED = 0.2; // Controls how fast the interpolation happens (0-1)
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

  constructor(id: string, x: number = 0, y: number = 0, health: number = 50, lairX: number = 0, lairY: number = 0, target: PlayerModel | null = null) {
    this.id = id;
    this.monster = "Goblin";
    this.maxHealth = 50;
    this.health = health;
    this.position = { x, y };
    this.lairPosition = { x: lairX, y: lairY }; // Initialize lair position to monster's initial position
    this.behavior = {
      type: target ? "aggressive" : "passive",
      target: target,
      agroRange: 200, // Monster becomes aggressive when player is within 150 units
    };
    // Load sprite image
    this.sprite = new Image();
    this.sprite.src = goblinSprite.src;
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

  takeDamage(damage: number): void {
    this.takeDamageAnimation.active = true;
    this.takeDamageAnimation.startTime = Date.now();
    this.takeDamageAnimation.text = `${damage}`;
  }

  blockAttack(): void {
    // TODO: Implement drawBlockAttack
    this.blockAttackAnimation.active = true;
    this.blockAttackAnimation.startTime = Date.now();
  }

  evadeAttack(): void {
    // TODO: Implement evadeAttack
    this.evadeAttackAnimation.active = true;
    this.evadeAttackAnimation.startTime = Date.now();
  }

  // Sync with server
  updateMonster(targetPosition: IPosition, health: number, target: PlayerModel | null): void {
    this.health = health;
    this.behavior.target = target;

    if (!targetPosition) return;

    // Interpolate position
    this.position.x += (targetPosition.x - this.position.x) * this.INTERPOLATION_SPEED;
    this.position.y += (targetPosition.y - this.position.y) * this.INTERPOLATION_SPEED;

    this.behavior.target = target;
    this.behavior.type = target ? 'aggressive' : 'passive';
  }

  drawBlockAttack(canvas: ICanvas, screenX: number, screenY: number): void {
    // TODO: Implement drawBlockAttack
    if (!this.blockAttackAnimation.active) return;

    const elapsed = Date.now() - this.blockAttackAnimation.startTime;
    const progress = Math.min(elapsed / this.blockAttackAnimation.duration, 1);

    // Fade out effect
    const opacity = 1 - progress;
    const yOffset = -20 - (progress * 20); // Move up as it fades

    // Draw "Level Up!" text
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

  drawEvadeAttack(canvas: ICanvas, screenX: number, screenY: number): void {
    // TODO: Implement drawEvadeAttack
    if (!this.evadeAttackAnimation.active) return;

    const elapsed = Date.now() - this.evadeAttackAnimation.startTime;
    const progress = Math.min(elapsed / this.evadeAttackAnimation.duration, 1);

    // Fade out effect
    const opacity = 1 - progress;
    const yOffset = -20 - (progress * 20); // Move up as it fades

    // Draw "Evade!" text
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
    const opacity = 1 - progress;
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

    // Draw name above monster
    canvas.drawText(
      this.monster,
      screenX,
      screenY - this.SPRITE_HEIGHT - 15,
      '#ffffff',
      12,
      'Arial'
    );

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