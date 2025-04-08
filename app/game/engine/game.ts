import { IGame, ICamera } from '../../models/game/engine/game';
import { ICanvas } from '../../models/game/engine/canvas';
import { World, WorldTile } from '../interface/World';
import { Controls } from './controls';
import { Player } from '../entitites/player';
import { MonsterModel } from '@/app/models/game/entities/monster-model';
import { Loot } from '@/app/game/items/loot';
import { OnlinePlayer } from '../entitites/online-player';

export class GameConstructor implements IGame {
  canvas: ICanvas;
  isGameOver: boolean;
  world: World;
  player: Player;
  players: Map<number, OnlinePlayer>;
  camera: ICamera;
  monsters: Map<string, MonsterModel>;
  worldItems: Map<string, Loot>;
  controls: Controls;
  public isMobile: boolean;
  private readonly MOBILE_UPDATE_RATE = 30; // Lower update rate for mobile
  private readonly DESKTOP_UPDATE_RATE = 60; // Higher update rate for desktop
  private readonly VERTICAL_OFFSET = 0.4; // Player will be 30% from the bottom

  constructor(canvas: ICanvas, player: Player, tiles: WorldTile[][], monsterLairs: { x: number; y: number }[], ws: WebSocket) {
    this.canvas = canvas;
    this.isGameOver = false;
    this.camera = { x: 0, y: 0 };
    this.player = player;
    this.players = new Map();
    this.monsters = new Map();
    this.worldItems = new Map();
    this.world = new World(14000, 14000, 128, tiles, monsterLairs, {x: 0, y: 0});
    this.controls = new Controls(canvas, player, ws);

    // Detect if running on mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof window !== 'undefined' ? window.navigator.userAgent : ''
    );
    
    this.initGame();
  }

  initGame(): void {   
    // Camera position with vertical offset (player will be 30% from the bottom)
    this.camera = {
      x: this.player.position.x - this.canvas.canvas.width / 2,
      y: this.player.position.y - this.canvas.canvas.height * (1 - this.VERTICAL_OFFSET)
    };
  }

  updatePlayerPosition(id: number, x: number, y: number): void {
    if (id === this.player.id) {
      // Calculate distance between old and new position
      const dx = x - this.player.position.x;
      const dy = y - this.player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update position if distance is greater than 5 pixel
      if (distance > 30) {
        this.player.position.x = x;
        this.player.position.y = y;
      }
    } else {
      const player = this.players.get(id);
      if (player) {
        player.targetPosition = { x, y };
      }
    }
  }

  updateMonster(monster: MonsterModel): void {
    const monsterToUpdate = this.monsters.get(monster.id);
    if (monsterToUpdate) {
      monsterToUpdate.updatedState = {
        position: monster.position,
        target: null,
        health: monster.health,
        lastAttackTime: null
      };
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

    // Update available targets for attack - optimize for mobile
    if (!this.isMobile || Math.random() < 0.3) {
      this.controls.attack.setAvailableTargets(this.monsters);
    }

    // Update player actions
    const direction = this.controls.joystick.getDirection();
    this.player.update(direction, this.world, Array.from(this.monsters.values()));
    
    // Update camera position with vertical offset
    this.camera.x = this.player.position.x - this.canvas.canvas.width / 2;
    this.camera.y = this.player.position.y - this.canvas.canvas.height * (1 - this.VERTICAL_OFFSET);

    // Update Online Players
    this.players.forEach((player) => {
      player.updateOnlinePlayer(player.targetPosition, player.health, player.mana);
    });
  }

  draw(): void {
    this.canvas.clear();

    if (this.isGameOver) {
      this.drawGameOver();
      return;
    }

    // Draw map with optimizations for mobile
    this.world.draw(this.canvas, this.camera);

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

    // Draw online players
    this.players.forEach((player) => {
      player.draw(this.canvas, this.camera);
    });

    // Draw world items
    this.worldItems.forEach((item) => {
      item.draw(this.canvas, this.camera);
    });

    // Draw minimap only on desktop or when explicitly requested on mobile
    if (!this.isMobile) {
      this.world.drawMinimap(this.canvas, this.player);
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