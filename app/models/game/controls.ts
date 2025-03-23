import { ICanvas } from "./engine/canvas";
import { IPosition } from "./engine/position";

export interface Joystick {
  position: IPosition;
  radius: number;
  isActive: boolean;
  angle: number;
  magnitude: number;
  
  // Methods
  draw(canvas: ICanvas): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
  getDirection(): { x: number; y: number };
}

export interface Attack {
  position: IPosition;
  radius: number;
  isActive: boolean;
  cooldown: number;
  damage: number;
  range: number;
  
  // Methods
  activate(): void;
  update(): void;
  draw(canvas: ICanvas): void;
  canAttack(): boolean;
}

export interface Controls {
  joystick: Joystick;
  attack: Attack;
  
  // Methods
  update(): void;
  draw(canvas: ICanvas): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 