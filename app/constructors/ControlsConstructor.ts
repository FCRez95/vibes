import { ICanvas } from "../models/game/engine/canvas";
import { Controls, Joystick, Attack } from "../models/game/controls";
import { IPosition } from "../models/game/engine/position";
class JoystickConstructor implements Joystick {
  position: IPosition;
  radius: number;
  isActive: boolean;
  angle: number;
  magnitude: number;
  private knobPosition: IPosition;
  private knobRadius: number;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
    this.knobRadius = radius * 0.4;
    this.isActive = false;
    this.angle = 0;
    this.magnitude = 0;
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
      this.knobPosition = {
        x: this.position.x + Math.cos(this.angle) * this.radius,
        y: this.position.y + Math.sin(this.angle) * this.radius
      };
    } else {
      this.angle = Math.atan2(dy, dx);
      this.magnitude = distance / this.radius;
      this.knobPosition = { x, y };
    }
  }
}

class AttackConstructor implements Attack {
  position: IPosition;
  radius: number;
  isActive: boolean;
  cooldown: number;
  damage: number;
  range: number;
  private currentCooldown: number;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
    this.isActive = false;
    this.cooldown = 1000; // 1 second cooldown
    this.currentCooldown = 0;
    this.damage = 20;
    this.range = 100;
  }

  activate(): void {
    if (this.canAttack()) {
      this.isActive = true;
      this.currentCooldown = this.cooldown;
    }
  }

  update(): void {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= 16; // Assuming 60fps
    }
    if (this.currentCooldown <= 0) {
      this.isActive = false;
    }
  }

  draw(canvas: ICanvas): void {
    // Draw attack button
    canvas.drawCircle(this.position.x, this.position.y, this.radius, 'rgba(255, 0, 0, 0.5)');
    
    // Draw cooldown indicator
    if (this.currentCooldown > 0) {
      const cooldownPercentage = this.currentCooldown / this.cooldown;
      canvas.drawCircle(
        this.position.x,
        this.position.y,
        this.radius * cooldownPercentage,
        'rgba(0, 0, 0, 0.3)'
      );
    }
  }

  canAttack(): boolean {
    return this.currentCooldown <= 0;
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
      canvas.height - joystickRadius - 20,
      joystickRadius
    );

    // Initialize attack button in bottom right corner
    const attackRadius = 40;
    this.attack = new AttackConstructor(
      canvas.width - attackRadius - 20,
      canvas.height - attackRadius - 20,
      attackRadius
    );
  }

  update(): void {
    this.attack.update();
  }

  draw(canvas: ICanvas): void {
    this.joystick.draw(canvas);
    this.attack.draw(canvas);
  }

  handleTouchStart(x: number, y: number): void {
    this.joystick.handleTouchStart(x, y);
    
    // Check if attack button was pressed
    const dx = x - this.attack.position.x;
    const dy = y - this.attack.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= this.attack.radius) {
      this.attack.activate();
    }
  }

  handleTouchMove(x: number, y: number): void {
    this.joystick.handleTouchMove(x, y);
  }

  handleTouchEnd(): void {
    this.joystick.handleTouchEnd();
  }
} 