import { ICanvas } from './canvas';
import { PlayerModel } from '../entities/player-model';
import { ControlsModel } from './controls';
import { Player } from '@/app/game/entitites/player';
import { World } from '@/app/game/interface/World';
import { MonsterModel } from '../entities/monster-model';
import { OnlinePlayer } from '@/app/game/entitites/online-player';
export interface ICamera {
  x: number;
  y: number;
}

export interface OnlinePlayers {
  [key: number]: PlayerModel;
}


export interface IGame {
  canvas: ICanvas;
  player: Player;
  monsters: Map<string, MonsterModel>;
  players: Map<number, OnlinePlayer>;
  world: World;
  camera: ICamera;
  controls: ControlsModel;
  isGameOver: boolean;
  isMobile: boolean;

  initGame(): void;
  update(): void;
  draw(): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 