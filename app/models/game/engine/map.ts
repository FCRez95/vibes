import { ICanvas } from './canvas';
import { Player } from '../characters/player';

export interface ITerrain {
  type: string;
  color: string;
  walkable: boolean;
}

export interface ITerrainTypes {
  GRASS: ITerrain;
  WATER: ITerrain;
  DIRT: ITerrain;
  STONE: ITerrain;
}

export interface IMap {
  width: number;
  height: number;
  tileSize: number;
  monsterLairs: { x: number; y: number }[];

  isWalkable(x: number, y: number): boolean;
  getTile(x: number, y: number): { type: string; walkable: boolean };
  draw(canvas: ICanvas, camera: { x: number; y: number }): void;
  drawMinimap(canvas: ICanvas, player: Player): void;
} 