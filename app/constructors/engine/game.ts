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
  public isMobile: boolean;
  private readonly MOBILE_UPDATE_RATE = 30; // Lower update rate for mobile
  private readonly DESKTOP_UPDATE_RATE = 60; // Higher update rate for desktop

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
    
    // Detect if running on mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof window !== 'undefined' ? window.navigator.userAgent : ''
    );
    
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

  // Add method to update online player data
  updateOnlinePlayer(playerId: number, x: number, y: number, health: number, mana: number): void {
    if (!this.onlinePlayers) return;
    const onlinePlayer = this.onlinePlayers.find(p => p.id === playerId);
    if (onlinePlayer) {
      onlinePlayer.targetPosition = { x, y };
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

    // Get all monsters from lairs - optimize for mobile by reducing update frequency
    if (!this.isMobile || Math.random() < 0.5) {
      this.monsters = this.lairs.flatMap(lair => lair.currentMonsters);
    }

    // Update controls
    this.controls.update();
    
    // Update player position in attack controls
    this.controls.attack.setPlayerPosition(this.player.position);

    // Update available targets for attack - optimize for mobile
    if (!this.isMobile || Math.random() < 0.3) {
      this.controls.attack.setAvailableTargets(this.monsters);
    }

    // Update player actions
    const direction = this.controls.joystick.getDirection();
    this.player.update(direction, this.map, this.monsters, this.controls.attack.getSelectedTarget());
    
    this.camera.x = this.player.position.x - this.canvas.canvas.width / 2;
    this.camera.y = this.player.position.y - this.canvas.canvas.height / 2;

    // Update all online players with interpolation
    this.onlinePlayers?.forEach(player => {
      if (player.id === this.player.id) return;
      
      // Update online player position with interpolation
      if (player.targetPosition) {
        player.updateOnlinePlayer(player.targetPosition);
      }
    });

    // Update lairs - optimize for mobile
    if (!this.isMobile || Math.random() < 0.3) {
      this.lairs.forEach(lair => {
        lair.update();
      });
    }

    // Update monsters - optimize for mobile by updating fewer monsters per frame
    const monsterUpdateLimit = this.isMobile ? 5 : this.monsters.length;
    for (let i = 0; i < Math.min(monsterUpdateLimit, this.monsters.length); i++) {
      const monster = this.monsters[i];
      if (!monster.isDead()) {
        monster.update(this.player, this.map);
      }
    }
  }

  draw(): void {
    this.canvas.clear();

    if (this.isGameOver) {
      this.drawGameOver();
      return;
    }

    // Draw map with optimizations for mobile
    this.map.draw(this.canvas, this.camera);

    // Draw lairs
    this.lairs.forEach(lair => {
      lair.draw(this.canvas);
    });

    // Draw monsters with distance-based culling
    const viewDistance = this.isMobile ? 800 : 1200;
    this.monsters.forEach(monster => {
      if (!monster.isDead()) {
        const dx = monster.position.x - this.player.position.x;
        const dy = monster.position.y - this.player.position.y;
        const distanceSquared = dx * dx + dy * dy;
        
        if (distanceSquared <= viewDistance * viewDistance) {
          monster.draw(this.canvas, this.camera);
        }
      }
    });

    // Draw player with camera offset
    this.player.draw(this.canvas, this.camera);

    // Draw online players with distance-based culling
    this.onlinePlayers?.forEach(character => {
      if (character.id !== this.player.id) {
        const dx = character.position.x - this.player.position.x;
        const dy = character.position.y - this.player.position.y;
        const distanceSquared = dx * dx + dy * dy;
        
        if (distanceSquared <= viewDistance * viewDistance) {
          character.draw(this.canvas, this.camera);
        }
      }
    });

    // Draw minimap only on desktop or when explicitly requested on mobile
    if (!this.isMobile) {
      this.map.drawMinimap(this.canvas, this.player);
    }

    // Draw controls
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