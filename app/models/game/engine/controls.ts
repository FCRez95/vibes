import { ICanvas } from "./canvas";
import { IPosition } from "./position";
import { MonsterModel } from '../entities/monster-model';
import { PlayerModel } from '../entities/player-model';
export interface JoystickModel {
  isActive: boolean;
  angle: number;
  magnitude: number;
  direction: { x: number; y: number };

  handleTouchStart(): void;
  handleTouchMove(direction: { x: number; y: number }, magnitude: number): void;
  handleTouchEnd(): void;
  getDirection(): { x: number; y: number };
}

export interface AttackModel {
  position: IPosition;
  radius: number;
  range: number;
  selectedTargetIndex: number;
  availableTargets: MonsterModel[];
  lastClickTime: number;
  clickCooldown: number;
  player: PlayerModel;
  ws: WebSocket;

  setAvailableTargets(targets: Map<string, MonsterModel>): void;
  getSelectedTarget(): MonsterModel | null;
  draw(canvas: ICanvas, camera: { x: number; y: number }): void;
  handleClick(): void;
}

export interface ControlsModel {
  joystick: JoystickModel;
  attack: AttackModel;

  draw(canvas: ICanvas, camera: { x: number; y: number }): void;
  handleTouchStart(x: number, y: number): void;
  handleTouchMove(x: number, y: number): void;
  handleTouchEnd(): void;
  handleAttackClick(): void;
} 