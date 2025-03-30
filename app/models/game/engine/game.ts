import { ICanvas } from './canvas';
import { IMap } from './map';
import { PlayerModel } from '../entities/player-model';
import { MonsterModel } from '../entities/monster-model';
import { ControlsModel } from './controls';


export interface ICamera {
  x: number;
  y: number;
}

export interface IGame {
  canvas: ICanvas;
  map: IMap;
  player: PlayerModel;
  onlinePlayers: PlayerModel[] | null;
  camera: ICamera;
  monsters: MonsterModel[];
  controls: ControlsModel;
  isGameOver: boolean;
  
  initGame(): void;
  update(): void;
  draw(): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 