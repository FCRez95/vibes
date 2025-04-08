import { LairModel } from "../../models/game/entities/lair-model";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { Monster } from "./monster";
import { IPosition } from "../../models/game/engine/position";

export class Lair implements LairModel {
  id: number;
  name: string;
  position: IPosition;
  monster_type: string;
  max_monsters: number;
  spawn_timer: number;
  monsters_alive: number;
  monsters: MonsterModel[];
  radius: number;

  constructor(
    id: number, 
    x: number, 
    y: number, 
    name: string,
    monster_type: string,
    max_monsters: number,
    monsters_alive: number,
    monsters: MonsterModel[],
    spawn_timer: number,
    radius: number,
  ) {
    this.id = id;
    this.position = { x, y };
    this.name = name;
    this.monster_type = monster_type;
    this.max_monsters = max_monsters;
    this.monsters_alive = monsters_alive; 
    this.monsters = monsters;
    this.radius = radius;
    this.spawn_timer = spawn_timer;
  }

  spawnMonster(): MonsterModel {
    if (!this.canSpawnMonster()) {
      throw new Error('Cannot spawn more monsters');
    }

    // Calculate spawn position around the lair
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * this.radius;
    const spawnX = this.position.x + Math.cos(angle) * distance;
    const spawnY = this.position.y + Math.sin(angle) * distance;
    const monster = new Monster(1, spawnX, spawnY);
    monster.lairPosition = this.position;
    this.monsters.push(monster);
    this.monsters_alive++;
    return monster;
  }

  update(): void {
    // Remove dead monsters
    this.monsters = this.monsters.filter(monster => !monster.isDead());
    this.monsters_alive = this.monsters.length;

    // Update spawn timer
    /* if (this.canSpawnMonster()) {
      this.spawnTimer += 16; // Assuming 60 FPS
      if (this.spawnTimer >= 5000) { // Spawn every 5 seconds
        this.spawnTimer = 0;
        this.spawnMonster();
      }
    } */
  }

  canSpawnMonster(): boolean {
    return this.monsters_alive < this.max_monsters;
  }
} 