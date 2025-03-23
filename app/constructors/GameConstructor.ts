import { IGame, ICamera } from '../models/game/engine/game';
import { ICanvas } from '../models/game/engine/canvas';
import { IMap } from '../models/game/engine/map';
import { MapConstructor } from './MapConstructor';
import { PlayerConstructor } from './PlayerConstructor';
import { MonsterConstructor } from './MonsterConstructor';
import { ControlsConstructor } from './ControlsConstructor';

export class GameConstructor implements IGame {
  canvas: ICanvas;
  isGameOver: boolean;
  map: IMap;
  player: PlayerConstructor;
  camera: ICamera;
  monsters: MonsterConstructor[];
  controls: ControlsConstructor;

  constructor(canvas: ICanvas) {
    this.canvas = canvas;
    this.isGameOver = false;
    this.monsters = [];
    this.camera = { x: 0, y: 0 };
    this.player = new PlayerConstructor();
    this.map = new MapConstructor(0, 0);
    this.controls = new ControlsConstructor(canvas);
    
    this.initGame();
  }

  initGame(): void {
    // Create map (4 times the canvas size)
    this.map = new MapConstructor(
      this.canvas.width * 4,
      this.canvas.height * 4
    );
    
    // Find a suitable starting position for the player
    const startPos = this.findWalkablePosition();
    this.player = new PlayerConstructor(startPos.x, startPos.y);
    
    // Camera position (top-left corner of the view)
    this.camera = {
      x: this.player.position.x - this.canvas.width / 2,
      y: this.player.position.y - this.canvas.height / 2
    };

    // Create monsters at the lairs
    this.monsters = [];
    this.map.monsterLairs.forEach((lair: { x: number; y: number; }) => {
      const monsterPos1 = this.findWalkablePosition(lair.x - 30, lair.y - 30);
      const monsterPos2 = this.findWalkablePosition(lair.x + 30, lair.y + 30);
      this.monsters.push(new MonsterConstructor(monsterPos1.x, monsterPos1.y));
      this.monsters.push(new MonsterConstructor(monsterPos2.x, monsterPos2.y));
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

    // Update controls
    this.controls.update();

    // Get player movement from joystick
    const direction = this.controls.joystick.getDirection();
    this.player.update(direction, this.map);
    
    this.camera.x = this.player.position.x - this.canvas.width / 2;
    this.camera.y = this.player.position.y - this.canvas.height / 2;

    // Update monsters
    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        monster.update(this.player);
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

    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        monster.draw(this.canvas);
      }
    });

    // Draw player with camera offset
    this.player.draw(this.canvas, this.camera);

    this.map.drawMinimap(this.canvas, this.player);

    // Draw controls
    this.controls.draw(this.canvas);
  }

  private drawGameOver(): void {
    this.canvas.drawRect(0, 0, this.canvas.width, this.canvas.height, 'rgba(0, 0, 0, 0.8)');
    this.canvas.drawText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40, '#ff0000', 64, 'Arial');
    this.canvas.drawText('Press ENTER to restart', this.canvas.width / 2, this.canvas.height / 2 + 40, '#ffffff', 24, 'Arial');
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