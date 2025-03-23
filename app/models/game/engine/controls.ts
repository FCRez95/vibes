import { ICanvas } from "./canvas";
import { IPosition } from "./position";
import { Monster } from '../characters/monster';

export interface Joystick {
  position: IPosition;
  radius: number;
  isActive: boolean;
  direction: { x: number; y: number };
  
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
  range: number;
  
  // Methods
  update(): void;
  draw(canvas: ICanvas, camera: { x: number; y: number }): void;
  handleClick(): void;
  setAvailableTargets(targets: Monster[]): void;
  getSelectedTarget(): Monster | null;
  setPlayerPosition(position: IPosition): void;
}

export interface Controls {
  joystick: Joystick;
  attack: Attack;
  
  // Methods
  update(): void;
  draw(canvas: ICanvas, camera: { x: number; y: number }): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 