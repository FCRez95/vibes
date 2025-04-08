import { ICanvas } from "../../models/game/engine/canvas";
import { IPosition } from "../../models/game/engine/position";
import { EquippedItemsModel, OnlinePlayerModel } from "../../models/game/entities/player-model";
import { World } from "../interface/World";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { SkillsModel } from "@/app/models/game/entities/skill-model";
import charIdle from '../../../public/assets/character/char-idle.png';
import { Item } from "../items/Item";

export class OnlinePlayer implements OnlinePlayerModel {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: IPosition;
  targetPosition: IPosition | null;

  private readonly INTERPOLATION_SPEED = 0.2; // Controls how fast the interpolation happens (0-1)
  private sprite: HTMLImageElement;
  private readonly SPRITE_WIDTH = 64;  // Width of the sprite
  private readonly SPRITE_HEIGHT = 64; // Height of the sprite

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
  ) {
    this.id = id;
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = health;
    this.maxMana = maxMana;
    this.mana = mana;
    this.position = { x, y };
    this.targetPosition = { x, y };

    // Load sprite image
    this.sprite = new Image();
    this.sprite.src = charIdle.src;
  }

  isDead(): boolean {
    return this.health <= 0;
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

  // Sync with server
  updateOnlinePlayer(targetPosition: IPosition | null, health: number, mana: number): void {
    if (!targetPosition) return;

    // Update target position for interpolation
    this.targetPosition = targetPosition;

    // Interpolate position
    this.position.x += (this.targetPosition.x - this.position.x) * this.INTERPOLATION_SPEED;
    this.position.y += (this.targetPosition.y - this.position.y) * this.INTERPOLATION_SPEED;

    // Update health and mana
    this.health = health;
    this.mana = mana;
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