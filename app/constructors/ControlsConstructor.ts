import { ICanvas } from "../models/game/engine/canvas";
import { Controls, Joystick, Attack } from "../models/game/engine/controls";
import { IPosition } from "../models/game/engine/position";
import { Monster } from "../models/game/characters/monster";

class JoystickConstructor implements Joystick {
  position: IPosition;
  radius: number;
  isActive: boolean;
  angle: number;
  magnitude: number;
  direction: { x: number; y: number };
  private knobPosition: IPosition;
  private knobRadius: number;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
    this.knobRadius = radius * 0.4;
    this.isActive = false;
    this.angle = 0;
    this.magnitude = 0;
    this.direction = { x: 0, y: 0 };
    this.knobPosition = { ...this.position };
  }

  draw(canvas: ICanvas): void {
    // Draw base
    canvas.drawCircle(this.position.x, this.position.y, this.radius, 'rgba(255, 255, 255, 0.2)');
    
    // Draw knob
    canvas.drawCircle(this.knobPosition.x, this.knobPosition.y, this.knobRadius, 'rgba(255, 255, 255, 0.5)');
  }

  handleTouchStart(x: number, y: number): void {
    const distance = Math.sqrt(
      Math.pow(x - this.position.x, 2) + 
      Math.pow(y - this.position.y, 2)
    );

    if (distance <= this.radius) {
      this.isActive = true;
      this.updateKnobPosition(x, y);
    }
  }

  handleTouchMove(x: number, y: number): void {
    if (this.isActive) {
      this.updateKnobPosition(x, y);
    }
  }

  handleTouchEnd(): void {
    this.isActive = false;
    this.magnitude = 0;
    this.direction = { x: 0, y: 0 };
    this.knobPosition = { ...this.position };
  }

  getDirection(): { x: number; y: number } {
    return {
      x: Math.cos(this.angle) * this.magnitude,
      y: Math.sin(this.angle) * this.magnitude
    };
  }

  private updateKnobPosition(x: number, y: number): void {
    const dx = x - this.position.x;
    const dy = y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius) {
      this.angle = Math.atan2(dy, dx);
      this.magnitude = 1;
      this.direction = {
        x: Math.cos(this.angle),
        y: Math.sin(this.angle)
      };
      this.knobPosition = {
        x: this.position.x + Math.cos(this.angle) * this.radius,
        y: this.position.y + Math.sin(this.angle) * this.radius
      };
    } else {
      this.angle = Math.atan2(dy, dx);
      this.magnitude = distance / this.radius;
      this.direction = {
        x: dx / this.radius,
        y: dy / this.radius
      };
      this.knobPosition = { x, y };
    }
  }
}

class AttackConstructor implements Attack {
  position: IPosition;
  radius: number;
  range: number;
  private selectedTargetIndex: number;
  private availableTargets: Monster[];
  private lastClickTime: number;
  private clickCooldown: number;
  private playerPosition: IPosition;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
    this.range = 300;
    this.selectedTargetIndex = -1;
    this.availableTargets = [];
    this.lastClickTime = 0;
    this.clickCooldown = 200; // 200ms between target changes
    this.playerPosition = { x: 0, y: 0 };
  }

  setPlayerPosition(position: IPosition): void {
    this.playerPosition = position;
  }

  setAvailableTargets(targets: Monster[]): void {
    // Filter out dead monsters and those outside attack range
    this.availableTargets = targets.filter(monster => {
      if (monster.isDead()) return false;
      
      // Calculate distance to monster from player's position
      const dx = monster.position.x - this.playerPosition.x;
      const dy = monster.position.y - this.playerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= this.range;
    });

    // Reset selected target if it's no longer available
    if (this.selectedTargetIndex >= this.availableTargets.length) {
      this.selectedTargetIndex = -1;
    }
  }

  getSelectedTarget(): Monster | null {
    if (this.selectedTargetIndex >= 0 && this.selectedTargetIndex < this.availableTargets.length) {
      return this.availableTargets[this.selectedTargetIndex];
    }
    return null;
  }

  update(): void {
    return;
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Draw attack button
    canvas.drawCircle(this.position.x, this.position.y, this.radius, 'rgba(255, 0, 0, 0.5)');

    // Draw target indicator if a target is selected
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
    }
  }
}

export class ControlsConstructor implements Controls {
  joystick: Joystick;
  attack: Attack;
  private canvas: ICanvas;

  constructor(canvas: ICanvas) {
    this.canvas = canvas;
    
    // Initialize joystick in bottom left corner
    const joystickRadius = 50;
    this.joystick = new JoystickConstructor(
      joystickRadius + 20,
      canvas.canvas.height - joystickRadius - 20,
      joystickRadius
    );

    // Initialize attack button in bottom right corner
    const attackRadius = 40;
    this.attack = new AttackConstructor(
      canvas.canvas.width - attackRadius - 20,
      canvas.canvas.height - attackRadius - 20,
      attackRadius
    );
  }

  update(): void {
    this.attack.update();
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    this.joystick.draw(canvas);
    this.attack.draw(canvas, camera);
  }

  handleTouchStart(x: number, y: number): void {
    this.joystick.handleTouchStart(x, y);
    
    // Check if attack button was pressed
    const dx = x - this.attack.position.x;
    const dy = y - this.attack.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= this.attack.radius) {
      this.attack.handleClick();
    }
  }

  handleTouchMove(x: number, y: number): void {
    this.joystick.handleTouchMove(x, y);
  }

  handleTouchEnd(): void {
    this.joystick.handleTouchEnd();
  }
} 