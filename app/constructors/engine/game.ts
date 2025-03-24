import { IGame, ICamera } from '../../models/game/engine/game';
import { ICanvas } from '../../models/game/engine/canvas';
import { Map } from './map';
import { Player } from '../entitites/player';
import { Monster } from '../entitites/monster';
import { Controls } from './controls';
import { Lair } from '../entitites/lair';
import { MonsterModel } from '../../models/game/entities/monster-model';
import { lairPositions } from '../entitites/all-lairs';

export class GameConstructor implements IGame {
  canvas: ICanvas;
  isGameOver: boolean;
  map: Map;
  player: Player;
  camera: ICamera;
  monsters: MonsterModel[];
  lairs: Lair[];
  controls: Controls;

  constructor(canvas: ICanvas, player: Player) {
    this.canvas = canvas;
    this.isGameOver = false;
    this.monsters = [];
    this.lairs = [];
    this.camera = { x: 0, y: 0 };
    this.player = player;
    this.map = new Map(6000, 6000, lairPositions);
    this.controls = new Controls(canvas);
    
    this.initGame();
  }

  initGame(): void {
    // Find a suitable starting position for the player
    const startPos = this.findWalkablePosition();
    this.player = new Player(startPos.x, startPos.y, this.player.skills);
    
    // Camera position (top-left corner of the view)
    this.camera = {
      x: this.player.position.x - this.canvas.canvas.width / 2,
      y: this.player.position.y - this.canvas.canvas.height / 2
    };

    // Initialize lairs
    this.initializeLairs();
  }

  private initializeLairs(): void {
    this.lairs = [];
    this.monsters = [];

    lairPositions.forEach(({ x, y, difficulty }) => {
      const lair = new Lair(x, y, difficulty);
      this.lairs.push(lair);

      // Spawn initial monsters for each lair
      for (let i = 0; i < lair.maxMonsters; i++) {
        try {
          lair.spawnMonster();
        } catch (error) {
          console.error('Failed to spawn monster:', error);
        }
      }
    });
  }

  findWalkablePosition(preferredX?: number, preferredY?: number): { x: number; y: number } {
    if (preferredX !== undefined && preferredY !== undefined) {
      if (this.map.isWalkable(preferredX, preferredY)) {
        return { x: preferredX, y: preferredY };
      }
    }

    const x = preferredX || this.map.width / 2;
    const y = preferredY || this.map.height / 2;
    
    let radius = 0;
    const maxRadius = Math.max(this.map.width, this.map.height);
    
    while (radius < maxRadius) {
      radius += this.map.tileSize;
      
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const testX = x + radius * Math.cos(angle);
        const testY = y + radius * Math.sin(angle);
        
        if (this.map.isWalkable(testX, testY)) {
          return { x: testX, y: testY };
        }
      }
    }
    
    return { x: this.map.width / 2, y: this.map.height / 2 };
  }

  update(): void {
    if (this.isGameOver) {
      return;
    }

    if (this.player.isDead()) {
      this.isGameOver = true;
      return;
    }

    // Get all monsters from lairs
    this.monsters = this.lairs.flatMap(lair => lair.currentMonsters);

    // Update controls
    this.controls.update();
    
    // Update player position in attack controls
    this.controls.attack.setPlayerPosition(this.player.position);

    // Update available targets for attack
    this.controls.attack.setAvailableTargets(this.monsters);

    // Update player actions
    const direction = this.controls.joystick.getDirection();
    this.player.update(direction, this.map, this.monsters, this.controls.attack.getSelectedTarget());
    
    this.camera.x = this.player.position.x - this.canvas.canvas.width / 2;
    this.camera.y = this.player.position.y - this.canvas.canvas.height / 2;

    // Update lairs
    this.lairs.forEach(lair => {
      lair.update();
    });

    // Update monsters
    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        monster.update(this.player, this.map);
      }
    });
  }

  draw(): void {
    this.canvas.clear();

    if (this.isGameOver) {
      this.drawGameOver();
      return;
    }

    this.map.draw(this.canvas, this.camera);

    // Draw lairs
    this.lairs.forEach(lair => {
      lair.draw(this.canvas, this.camera);
    });

    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        monster.draw(this.canvas, this.camera);
      }
    });

    // Draw player with camera offset
    this.player.draw(this.canvas, this.camera);

    this.map.drawMinimap(this.canvas, this.player);

    // Draw controls with camera
    this.controls.draw(this.canvas, this.camera);
  }

  private drawGameOver(): void {
    this.canvas.drawRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height, 'rgba(0, 0, 0, 0.8)');
    this.canvas.drawText('GAME OVER', this.canvas.canvas.width / 2, this.canvas.canvas.height / 2 - 40, '#ff0000', 64, 'Arial');
    this.canvas.drawText('Press ENTER to restart', this.canvas.canvas.width / 2, this.canvas.canvas.height / 2 + 40, '#ffffff', 24, 'Arial');
  }

  handleTouchStart(x: number, y: number): void {
    this.controls.handleTouchStart(x, y);
  }

  handleTouchMove(x: number, y: number): void {
    this.controls.handleTouchMove(x, y);
  }

  handleTouchEnd(): void {
    this.controls.handleTouchEnd();
  }
} 