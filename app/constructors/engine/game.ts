import { IGame, ICamera } from '../../models/game/engine/game';
import { ICanvas } from '../../models/game/engine/canvas';
import { Map } from '../interface/map';
import { Controls } from './controls';
import { Lair } from '../entitites/lair';
import { MonsterModel } from '../../models/game/entities/monster-model';
import { PlayerModel } from '../../models/game/entities/player-model';
import { LairModel } from '../../models/game/entities/lair-model';
import { DBLair, DBMonster } from '../../lib/supabaseClient';
import { Bat } from '../entitites/monsters/bat';

export class GameConstructor implements IGame {
  canvas: ICanvas;
  isGameOver: boolean;
  map: Map;
  player: PlayerModel;
  onlinePlayers: PlayerModel[] | null;
  camera: ICamera;
  monsters: MonsterModel[];
  lairs: LairModel[];
  controls: Controls;
  public isMobile: boolean;
  private readonly MOBILE_UPDATE_RATE = 30; // Lower update rate for mobile
  private readonly DESKTOP_UPDATE_RATE = 60; // Higher update rate for desktop
  private readonly VERTICAL_OFFSET = 0.4; // Player will be 30% from the bottom

  constructor(canvas: ICanvas, player: PlayerModel, onlinePlayers: PlayerModel[] | null, monsters: DBMonster[], lairs: DBLair[]) {
    this.canvas = canvas;
    this.isGameOver = false;
    this.camera = { x: 0, y: 0 };
    this.player = player;
    this.onlinePlayers = onlinePlayers;
    this.monsters = [];
    this.lairs = [];
    
    const lairPositions = lairs.map(lair => ({x: lair.position_x, y: lair.position_y}));
    this.map = new Map(14000, 14000, lairPositions);
    this.controls = new Controls(canvas);
    
    // Detect if running on mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof window !== 'undefined' ? window.navigator.userAgent : ''
    );
    
    this.initGame(lairs);
  }

  initGame(lairs: DBLair[]): void {   
    // Camera position with vertical offset (player will be 30% from the bottom)
    this.camera = {
      x: this.player.position.x - this.canvas.canvas.width / 2,
      y: this.player.position.y - this.canvas.canvas.height * (1 - this.VERTICAL_OFFSET)
    };

    // Initialize lairs
    this.initializeLairs(lairs);
  }

  // Initialize lairs and monsters
  private initializeLairs(lairs: DBLair[]): void {
    // Utilize the lairs and monsters received from the database
    lairs.forEach(({id, name, position_x, position_y, monster_type, max_monsters, monsters_alive, spawn_timer, radius, monsters }) => {
      console.log('INITIALIZING LAIR: ', name, 'with', monsters.length, 'monsters');
      const initMonsters = monsters.map(monster => {
        console.log('INITIALIZING MONSTER: ', monster.id, 'at position', monster.position_x, monster.position_y);
        return new Bat(
          monster.id,
          monster.position_x,
          monster.position_y,
          monster.health,
          position_x,  // lair x position
          position_y,  // lair y position
          monster.target ? this.player : null,
        );
      });
      const lair = new Lair(id, position_x, position_y, name, monster_type, max_monsters, monsters_alive, initMonsters, spawn_timer, radius);
      this.lairs.push(lair);
    });
    console.log('Total lairs initialized:', this.lairs.length);
    console.log('Total monsters initialized:', this.lairs.reduce((acc, lair) => acc + lair.monsters.length, 0));
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

  // Add method to sync monsters with server
  syncMonsters(monster: DBMonster): void {
    const updateMonster = this.monsters.find(m => m.id === monster.id);
    if (updateMonster) {
      updateMonster.updatedState = {
        position: { x: monster.position_x, y: monster.position_y },
        target: monster.target ? this.player : null,
        health: monster.health,
        lastAttackTime: monster.last_attack_time
      }
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
      this.monsters = this.lairs.flatMap(lair => lair.monsters);
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
    
    // Update camera position with vertical offset
    this.camera.x = this.player.position.x - this.canvas.canvas.width / 2;
    this.camera.y = this.player.position.y - this.canvas.canvas.height * (1 - this.VERTICAL_OFFSET);

    // Sync online players with server with interpolation
    this.onlinePlayers?.forEach(player => {    
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
        monster.update(this.map, this.onlinePlayers);
      }
    }

    // Sync monsters with server with interpolation
    this.monsters.forEach(monster => {
      if (monster.updatedState) {
        monster.updateMonster(monster.updatedState.position, monster.updatedState.health, monster.updatedState.lastAttackTime, monster.updatedState.target);
      }
    });
  }

  draw(): void {
    this.canvas.clear();

    if (this.isGameOver) {
      this.drawGameOver();
      return;
    }

    // Draw map with optimizations for mobile
    this.map.draw(this.canvas, this.camera);

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