import { ICanvas } from "../../models/game/engine/canvas";
import { IPosition } from "../../models/game/engine/position";
import { PlayerModel, EquippedItemsModel } from "../../models/game/entities/player-model";
import { IMap } from "../../models/game/engine/map";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { SkillsModel } from "@/app/models/game/entities/skill-model";
import { WeaponModel, ItemModel, HelmetModel, ChestplateModel, ShieldModel, LegsModel, BootsModel } from "../../models/game/entities/items-model";

export class Player implements PlayerModel {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: IPosition;
  skills: SkillsModel;
  inventory: ItemModel[];
  equipment: EquippedItemsModel;
  attackCooldown: number; // Time between attacks in milliseconds
  lastAttackTime: number; // Timestamp of last attack

  constructor(
    x: number,
    y: number, 
    name: string,
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
    lastAttackTime: number,
    skills: SkillsModel,
    inventory: ItemModel[],
    equipment: EquippedItemsModel
  ) {
    this.id = 'player-1';
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = health;
    this.maxMana = maxMana;
    this.mana = mana;
    this.position = { x, y };
    this.attackCooldown = 1000;
    this.lastAttackTime = lastAttackTime;

    // Initialize stats
    this.skills = skills;

    // Initialize inventory and equipment
    this.inventory = inventory;
    this.equipment = equipment;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  equipItem(item: ItemModel): void {
    if (this.inventory.includes(item)) {
      if (item.type === 'weapon') {
        this.equipment.weapon = item as WeaponModel;
      } else if (item.type === 'helmet') {
        this.equipment.helmet = item as HelmetModel;
      } else if (item.type === 'chestplate') {
        this.equipment.chestplate = item as ChestplateModel;
      } else if (item.type === 'shield') {
        this.equipment.shield = item as ShieldModel;
      } else if (item.type === 'legs') {
        this.equipment.legs = item as LegsModel;
      } else if (item.type === 'boots') {
        this.equipment.boots = item as BootsModel;
      }
    }
  }

  gainSkillExperience(skillType: keyof SkillsModel, amount: number): void {
    const skill = this.skills[skillType];
    if (skill) {
      skill.experience += amount;
      
      // Check for level up
      if (skill.experience >= skill.maxExperience) {
        skill.level += 1;
        skill.experience -= skill.maxExperience;
        skill.maxExperience = Math.floor(skill.maxExperience * 1.5); // Increase max experience for next level
        console.log(`${skillType} level up!`);
      }
    }
  }

  attack(monster: MonsterModel): void {
    if (!this.canAttack()) return;

    let damage = 0;
    const weapon = this.equipment.weapon;
    if (weapon) {
      damage = weapon.damage * (1 + this.skills[weapon.weaponType as keyof SkillsModel].level / 50) || 0;

      // Gain experience in the corresponding skill
      this.gainSkillExperience(weapon.weaponType as keyof SkillsModel, 1);
    } else {
      damage = this.skills.unarmed.level;

      // Gain experience in the corresponding skill
      this.gainSkillExperience('unarmed', 50);
    }

    // Apply damage to monster
    if ('health' in monster) {
      monster.health = Math.max(0, monster.health - damage);
    }

    this.lastAttackTime = Date.now();
  }

  canAttack(): boolean {
    return Date.now() - this.lastAttackTime >= this.attackCooldown;
  }

  getAttackRange(): number {
    const weapon = this.equipment.weapon;
    if (!weapon) return 100;
    switch (weapon.weaponType) {
      case 'axe':
        return 100;
      case 'club':
        return 100;
      case 'bow':
        return 100;
      case 'staff':
        return 100;
      case 'throwing':
        return 500;
    }
  }

  update(direction: { x: number; y: number }, map: IMap, monsters: MonsterModel[], selectedMonster: MonsterModel | null): void {
    // Calculate new position
    const speed = this.skills.running.level;
    const newX = this.position.x + direction.x * speed;
    const newY = this.position.y + direction.y * speed;

    // Check if new position is walkable  and not colliding with monsters
    if (map.isWalkable(newX, newY) && !this.checkCollision(newX, newY, monsters)) {
      this.position.x = newX;
      this.position.y = newY;
    }

    // Keep player within map bounds
    this.position.x = Math.max(0, Math.min(this.position.x, map.width));
    this.position.y = Math.max(0, Math.min(this.position.y, map.height));

     // Attack if in range
     // Calculate distance to monster
     if (selectedMonster) {
      const dxToMonster = selectedMonster.position.x - this.position.x;
      const dyToMonster = selectedMonster.position.y - this.position.y;
      const distanceToMonster = Math.sqrt(dxToMonster * dxToMonster + dyToMonster * dyToMonster);
      if (distanceToMonster <= this.getAttackRange()) {
        this.attack(selectedMonster);
      }
     }
  }

  private checkCollision(x: number, y: number, monsters: MonsterModel[]): boolean {
    const playerRadius = 20; // Player's collision radius
    const monsterRadius = 15; // Monster's collision radius
    const totalRadius = playerRadius + monsterRadius;

    return monsters.some(monster => {
      if (monster.isDead()) return false;
      
      const dx = x - monster.position.x;
      const dy = y - monster.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < totalRadius;
    });
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw player
    canvas.drawCircle(
      screenX,
      screenY,
      10,
      'red'
    );

    // Draw health bar
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const healthPercentage = this.health / this.maxHealth;

    // Background of health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 25,
      healthBarWidth,
      healthBarHeight,
      '#000'
    );

    // Health bar
    canvas.drawRect(
      screenX - healthBarWidth / 2,
      screenY - 25,
      healthBarWidth * healthPercentage,
      healthBarHeight,
      'green'
    );

    // Draw mana bar
    const manaBarWidth = 40;
    const manaBarHeight = 4;
    const manaPercentage = this.mana / this.maxMana;

    // Background of mana bar
    canvas.drawRect(
      screenX - manaBarWidth / 2,
      screenY - 18,
      manaBarWidth,
      manaBarHeight,
      'rgba(0, 0, 0, 0.5)'
    );

    // Mana bar
    canvas.drawRect(
      screenX - manaBarWidth / 2,
      screenY - 18,
      manaBarWidth * manaPercentage,
      manaBarHeight,
      'blue'
    );
  }
} 