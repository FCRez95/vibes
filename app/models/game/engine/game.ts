import { ICanvas } from './canvas';
import { IMap } from './map';
import { Player } from '../characters/player';
import { Monster } from '../characters/monster';
import { Controls } from './controls';

export interface ICamera {
  x: number;
  y: number;
}

export interface IGame {
  canvas: ICanvas;
  map: IMap;
  player: Player;
  camera: ICamera;
  monsters: Monster[];
  controls: Controls;
  isGameOver: boolean;
  
  initGame(): void;
  update(): void;
  draw(): void;
  findWalkablePosition(preferredX?: number, preferredY?: number): { x: number; y: number };
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 