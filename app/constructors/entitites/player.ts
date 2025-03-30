import { ICanvas } from "../../models/game/engine/canvas";
import { IPosition } from "../../models/game/engine/position";
import { PlayerModel, EquippedItemsModel } from "../../models/game/entities/player-model";
import { IMap } from "../../models/game/engine/map";
import { MonsterModel } from "../../models/game/entities/monster-model";
import { SkillsModel } from "@/app/models/game/entities/skill-model";
import { WeaponModel, ItemModel, HelmetModel, ChestplateModel, ShieldModel, LegsModel, BootsModel } from "../../models/game/entities/items-model";
import { updateCharacter } from "../../lib/supabaseClient";

export class Player implements PlayerModel {
  id: number;
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
  online: boolean;
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL: number = 100; // Update database every 100ms
  private positionChanged: boolean = false;
  private targetPosition: IPosition;
  private readonly INTERPOLATION_SPEED = 0.15; // Adjust for smoothness (0.1 = smoother but slower, 0.3 = faster but jerkier)

  constructor(
    id: number,
    x: number,
    y: number, 
    name: string,
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
    lastAttackTime: number,
    online: boolean,
    skills: SkillsModel,
    inventory: ItemModel[],
    equipment: EquippedItemsModel
  ) {
    this.id = id;
    this.name = name;
    this.maxHealth = maxHealth;
    this.health = health;
    this.maxMana = maxMana;
    this.mana = mana;
    this.position = { x, y };
    this.targetPosition = { x, y }; // Initialize target position
    this.online = online;
    this.attackCooldown = 1000;
    this.lastAttackTime = lastAttackTime;
    this.lastUpdateTime = Date.now();

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
      this.gainSkillExperience(weapon.weaponType as keyof SkillsModel, 5);
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

  // Update player state in database
  private async updatePlayerState(): Promise<void> {
    const now = Date.now();
    
    // Only update if position changed and enough time has passed
    if (this.positionChanged && now - this.lastUpdateTime >= this.UPDATE_INTERVAL) {
      try {
        const characterData = {
          health: Math.round(this.health),
          max_health: Math.round(this.maxHealth),
          mana: Math.round(this.mana),
          max_mana: Math.round(this.maxMana),
          position_x: Math.round(this.position.x),
          position_y: Math.round(this.position.y),
          last_attack_time: this.lastAttackTime
        };

        const { error } = await updateCharacter(this.id, characterData);
        if (error) {
          console.error('Failed to update player state:', error);
        } else {
          this.lastUpdateTime = now;
          this.positionChanged = false;
        }
      } catch (error) {
        console.error('Error updating player state:', error);
      }
    }
  }

  // Add method to update target position for online players
  updateTargetPosition(x: number, y: number): void {
    this.targetPosition.x = x;
    this.targetPosition.y = y;
  }

  update(id: number | null, direction: { x: number; y: number }, map: IMap, monsters: MonsterModel[], selectedMonster: MonsterModel | null): void {
    // Check if this is the local player by ID instead of online status
    if (id === this.id) { // checking if the id is the same as the player id
      // Local player: Direct control with database updates
      const oldX = this.position.x;
      const oldY = this.position.y;

      // Calculate new position
      const speed = this.skills.running.level;
      const newX = this.position.x + direction.x * speed;
      const newY = this.position.y + direction.y * speed;

      // Check if new position is walkable and not colliding with monsters
      if (map.isWalkable(newX, newY) && !this.checkCollision(newX, newY, monsters)) {
        this.position.x = newX;
        this.position.y = newY;
        this.targetPosition.x = newX;
        this.targetPosition.y = newY;

        // Check if position actually changed
        if (oldX !== newX || oldY !== newY) {
          this.positionChanged = true;
          this.updatePlayerState(); // Update database with new position
        }
      }
    } else {
      // Online player: Smooth interpolation to target position
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      
      // Only interpolate if we're not already at the target
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        this.position.x += dx * this.INTERPOLATION_SPEED;
        this.position.y += dy * this.INTERPOLATION_SPEED;
      } else {
        // Snap to target if we're very close to avoid tiny movements
        this.position.x = this.targetPosition.x;
        this.position.y = this.targetPosition.y;
      }
    }

    // Keep player within map bounds
    this.position.x = Math.max(0, Math.min(this.position.x, map.width));
    this.position.y = Math.max(0, Math.min(this.position.y, map.height));

    // Attack if in range
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