import { ICanvas } from './canvas';
import { IMap } from './map';
import { PlayerModel } from '../entities/player-model';
import { ControlsModel } from './controls';
import { MonsterModel } from '../entities/monster-model';
import { LairModel } from '../entities/lair-model';
import { DBLair, DBMonster } from '@/app/lib/supabaseClient';

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
  lairs: LairModel[];
  controls: ControlsModel;
  isGameOver: boolean;
  isMobile: boolean;

  initGame(lairs: DBLair[], monsters: DBMonster[]): void;
  update(): void;
  draw(): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
} 