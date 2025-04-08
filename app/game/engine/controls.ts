import { PlayerModel } from "@/app/models/game/entities/player-model";
import { ICanvas } from "../../models/game/engine/canvas";
import { ControlsModel, JoystickModel, AttackModel } from "../../models/game/engine/controls";
import { IPosition } from "../../models/game/engine/position";
import { MonsterModel } from "../../models/game/entities/monster-model";

class JoystickControl implements JoystickModel {
  isActive: boolean;
  angle: number;
  magnitude: number;
  direction: { x: number; y: number };

  constructor() {
    this.isActive = false;
    this.angle = 0;
    this.magnitude = 0;
    this.direction = { x: 0, y: 0 };
  }

  handleTouchStart(): void {
    this.isActive = true;
  }

  handleTouchMove(direction: { x: number; y: number }, magnitude: number): void {
    if (!this.isActive) return;
    
    this.direction = direction;
    this.magnitude = magnitude;
    this.angle = Math.atan2(direction.y, direction.x);
  }

  handleTouchEnd(): void {
    this.isActive = false;
    this.magnitude = 0;
    this.direction = { x: 0, y: 0 };
  }

  getDirection(): { x: number; y: number } {
    return {
      x: Math.cos(this.angle) * this.magnitude,
      y: Math.sin(this.angle) * this.magnitude
    };
  }
}

class AttackControls implements AttackModel {
  position: IPosition;
  radius: number;
  range: number;
  selectedTargetIndex: number;
  availableTargets: MonsterModel[];
  lastClickTime: number;
  clickCooldown: number;
  player: PlayerModel;
  ws: WebSocket;

  constructor(x: number, y: number, radius: number, player: PlayerModel, ws: WebSocket) {
    this.position = { x, y };
    this.radius = radius;
    this.range = 500;
    this.selectedTargetIndex = -1;
    this.availableTargets = [];
    this.lastClickTime = 0;
    this.clickCooldown = 200; // 200ms between target changes
    this.player = player;
    this.ws = ws;
  }

  setAvailableTargets(targets: Map<string, MonsterModel>): void {
    // Filter out dead monsters and those outside attack range
    this.availableTargets = Array.from(targets.values()).filter(monster => {
      if (monster.isDead()) return false;
      
      // Calculate distance to monster from player's position
      const dx = monster.position.x - this.player.position.x;
      const dy = monster.position.y - this.player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= this.range;
    });

    // Reset selected target if it's no longer available
    if (this.selectedTargetIndex >= this.availableTargets.length) {
      this.selectedTargetIndex = -1;
    }
  }

  getSelectedTarget(): MonsterModel | null {
    if (this.selectedTargetIndex >= 0 && this.selectedTargetIndex < this.availableTargets.length) {
      return this.availableTargets[this.selectedTargetIndex];
    }
    return null;
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Only draw the target indicator
    const selectedTarget = this.getSelectedTarget();
    if (selectedTarget) {
      const screenX = selectedTarget.position.x - camera.x;
      const screenY = selectedTarget.position.y - camera.y;
      
      // Draw targeting circle
      canvas.drawCircle(
        screenX,
        screenY,
        25,
        'rgba(255, 0, 0, 0.3)'
      );
    }
  }

  handleClick(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime < this.clickCooldown) return;
    
    this.lastClickTime = currentTime;
    
    // Cycle through available targets
    if (this.availableTargets.length > 0) {
      this.selectedTargetIndex = (this.selectedTargetIndex + 1) % this.availableTargets.length;
      this.ws.send(JSON.stringify({
        type: 'TARGET_MONSTER',
        payload: {
          playerId: this.player.id,
          monsterId: this.availableTargets[this.selectedTargetIndex].id
        }
      }));
    }
  }
}

export class Controls implements ControlsModel {
  joystick: JoystickModel;
  attack: AttackModel;
  private canvas: ICanvas;

  constructor(canvas: ICanvas, player: PlayerModel, ws: WebSocket) {
    this.canvas = canvas;
    this.joystick = new JoystickControl();
    
    // Initialize attack controls
    const attackRadius = 40;
    this.attack = new AttackControls(
      canvas.canvas.width - attackRadius - 20,
      canvas.canvas.height - attackRadius - 20,
      attackRadius,
      player,
      ws
    );
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    this.attack.draw(canvas, camera);
  }

  handleTouchStart(x: number, y: number): void {
    // Convert canvas coordinates to normalized direction
    const centerX = 50 + 20; // joystick position
    const centerY = this.canvas.canvas.height - 50 - 20;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 50) { // joystick radius
      this.joystick.handleTouchStart();
      this.handleTouchMove(x, y);
    }
  }

  handleTouchMove(x: number, y: number): void {
    if (!this.joystick.isActive) return;
    
    const centerX = 50 + 20;
    const centerY = this.canvas.canvas.height - 50 - 20;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 50) {
      this.joystick.handleTouchMove(
        { x: dx / 50, y: dy / 50 },
        distance / 50
      );
    } else {
      const angle = Math.atan2(dy, dx);
      this.joystick.handleTouchMove(
        { x: Math.cos(angle), y: Math.sin(angle) },
        1
      );
    }
  }

  handleTouchEnd(): void {
    this.joystick.handleTouchEnd();
  }

  handleAttackClick(): void {
    this.attack.handleClick();
  }

  // New methods to handle joystick events from the UI component
  handleJoystickStart(): void {
    this.joystick.handleTouchStart();
  }

  handleJoystickMove(direction: { x: number; y: number }): void {
    if (!this.joystick.isActive) return;
    this.joystick.handleTouchMove(direction, Math.sqrt(direction.x * direction.x + direction.y * direction.y));
  }

  handleJoystickEnd(): void {
    this.joystick.handleTouchEnd();
  }
}