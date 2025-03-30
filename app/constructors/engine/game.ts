import { IGame, ICamera } from '../../models/game/engine/game';
import { ICanvas } from '../../models/game/engine/canvas';
import { Map } from '../interface/map';
import { Player } from '../entitites/player';
import { Controls } from './controls';
import { Lair } from '../entitites/lair';
import { MonsterModel } from '../../models/game/entities/monster-model';
import { lairPositions } from '../interface/all-lairs';

export class GameConstructor implements IGame {
  canvas: ICanvas;
  isGameOver: boolean;
  map: Map;
  player: Player;
  onlinePlayers: Player[] | null;
  camera: ICamera;
  monsters: MonsterModel[];
  lairs: Lair[];
  controls: Controls;

  constructor(canvas: ICanvas, player: Player, onlinePlayers: Player[] | null) {
    this.canvas = canvas;
    this.isGameOver = false;
    this.monsters = [];
    this.lairs = [];
    this.camera = { x: 0, y: 0 };
    this.player = player;
    this.onlinePlayers = onlinePlayers;
    this.map = new Map(10000, 10000, lairPositions);
    this.controls = new Controls(canvas);
    
    this.initGame();
  }

  initGame(): void {   
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

  // Add method to update online player positions
  updateOnlinePlayer(playerId: number, x: number, y: number, health: number, mana: number): void {
    if (!this.onlinePlayers) return;

    const onlinePlayer = this.onlinePlayers.find(p => p.id === playerId);
    if (onlinePlayer) {
      // Use smooth movement for position updates
      onlinePlayer.updateTargetPosition(x, y);
      
      // Instant updates for health and mana
      onlinePlayer.health = health;
      onlinePlayer.mana = mana;
    }
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
    this.player.update(this.player.id, direction, this.map, this.monsters, this.controls.attack.getSelectedTarget());
    
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
      lair.draw(this.canvas);
    });

    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        monster.draw(this.canvas, this.camera);
      }
    });

    // Draw player with camera offset
    this.player.draw(this.canvas, this.camera);

    // Draw online players with camera offset
    this.onlinePlayers?.forEach(character => {
      if (character.id !== this.player.id) {
        character.draw(this.canvas, this.camera);
      }
    });

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