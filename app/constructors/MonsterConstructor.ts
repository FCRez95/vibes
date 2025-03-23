import { ICanvas } from "../models/game/engine/canvas";
import { Player } from "../models/game/characters/player";
import { Monster } from "../models/game/characters/monster";

export class MonsterConstructor implements Monster {
  id: string;
  name: string;
  type: string;
  level: number;
  health: number;
  maxHealth: number;
  position: {
    x: number;
    y: number;
  };
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
  };
  drops: {
    item: string;
    chance: number;
  }[];
  behavior: {
    type: 'aggressive' | 'passive' | 'fleeing';
    range: number;
    attackPattern: string;
  };

  constructor(x: number, y: number) {
    this.id = `monster_${Date.now()}`;
    this.name = "Monster";
    this.type = "basic";
    this.level = 1;
    this.health = 50;
    this.maxHealth = 50;
    this.position = { x, y };
    this.stats = {
      strength: 8,
      dexterity: 5,
      intelligence: 3,
      vitality: 10
    };
    this.drops = [
      { item: "gold", chance: 0.8 },
      { item: "health_potion", chance: 0.2 }
    ];
    this.behavior = {
      type: "aggressive",
      range: 100,
      attackPattern: "melee"
    };
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  update(player: Player): void {
    if (this.behavior.type === 'aggressive') {
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.behavior.range) {
        const angle = Math.atan2(dy, dx);
        this.position.x += Math.cos(angle) * this.stats.dexterity;
        this.position.y += Math.sin(angle) * this.stats.dexterity;
      }
    }
  }

  draw(canvas: ICanvas): void {
    // Draw monster
    canvas.drawCircle(this.position.x, this.position.y, 15, '#800000');
    
    // Draw health bar
    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;
    
    canvas.drawRect(
      this.position.x - healthBarWidth / 2,
      this.position.y - 25,
      healthBarWidth,
      healthBarHeight,
      '#333333'
    );
    
    canvas.drawRect(
      this.position.x - healthBarWidth / 2,
      this.position.y - 25,
      healthBarWidth * healthPercentage,
      healthBarHeight,
      '#ff0000'
    );
  }
} 