import { WorldTile } from "@/app/game/interface/World";
import { MonsterModel } from "./entities/monster-model";
import { PlayerModel } from "./entities/player-model";
import { Loot } from "@/app/game/items/loot";
import { OnlinePlayerModel } from "./entities/player-model";
import { Item } from "@/app/game/items/Item";

export enum ActionType {
  GAME_STATE = 'GAME_STATE',
  PLAYER_MOVED = 'PLAYER_MOVED',
  GAME_UPDATE = 'GAME_UPDATE',
  LEVEL_UP = 'LEVEL_UP',
  PLAYER_BLOCK = 'PLAYER_BLOCK',
  PLAYER_EVADE = 'PLAYER_EVADE',
  PLAYER_ATTACKED = 'PLAYER_ATTACKED',
  MONSTER_BLOCK = 'MONSTER_BLOCK',
  MONSTER_EVADE = 'MONSTER_EVADE',
  MONSTER_ATTACKED = 'MONSTER_ATTACKED',
  PICKUP_ITEM = 'PICKUP_ITEM',
  PICKUP_ALL_ITEMS = 'PICKUP_ALL_ITEMS',
  EQUIP_ITEM = 'EQUIP_ITEM',
  UNEQUIP_ITEM = 'UNEQUIP_ITEM',
}

export interface BaseAction {
  type: ActionType;
  playerId: number;
}

export interface GameStateAction extends BaseAction {
  type: ActionType.GAME_STATE;
  state: {
    player: PlayerModel;
    world: {
      height: number;
      width: number;
      monsterLairs: {
        position: {
          x: number;
          y: number;
        };
      }[];
      tiles: WorldTile[][];
    };
  };
}

export interface GameUpdateAction extends BaseAction {
  type: ActionType.GAME_UPDATE;
  state: {
    position: {
      x: number;
      y: number;
    };
    health: number;
    mana: number;
    inventory: Item[];
    equipment: {
      helmet: Item;
      chestplate: Item;
      weapon: Item;
      shield: Item;
      legs: Item;
      boots: Item;
    }
    relevantMonsters: MonsterModel[];
    relevantWorldItems: Loot[];
    relevantPlayers: OnlinePlayerModel[];
  };
}

export interface LevelUpAction extends BaseAction {
  type: ActionType.LEVEL_UP;
  payload: {
    playerId: number;
    skill: string;
    level: number;
  };
}

export interface PlayerAttackedAction extends BaseAction {
  type: ActionType.PLAYER_ATTACKED;
  payload: {
    playerId: number;
    skill: string;
    experience: number;
    monsterId: string;
    damage: number;
  };
}

export interface PlayerBlockedAction extends BaseAction {
  type: ActionType.PLAYER_BLOCK;
  payload: {
    playerId: number;
    monsterId: string;
  };
}

export interface PlayerEvadedAction extends BaseAction {
  type: ActionType.PLAYER_EVADE;
  payload: {
    playerId: number;
    monsterId: string;
  };
}

export interface MonsterBlockedAction extends BaseAction {
  type: ActionType.MONSTER_BLOCK;
  payload: {
    monsterId: string;
    playerId: number;
  };
}

export interface MonsterEvadedAction extends BaseAction {
  type: ActionType.MONSTER_EVADE;
  payload: {
    monsterId: string;
    playerId: number;
  };
}

export interface MonsterAttackedAction extends BaseAction {
  type: ActionType.MONSTER_ATTACKED;
  payload: {
    monsterId: string;
    playerId: number;
    damage: number;
  };
}

export interface PickupItemAction extends BaseAction {
  type: ActionType.PICKUP_ITEM;
  itemIdentifier: string;
  lootId: string;
}

export interface PickupAllItemsAction extends BaseAction {
  type: ActionType.PICKUP_ALL_ITEMS;
  lootId: string;
}

export type GameAction = 
  | GameStateAction
  | GameUpdateAction
  | LevelUpAction
  | PlayerAttackedAction
  | PlayerBlockedAction
  | PlayerEvadedAction
  | MonsterBlockedAction
  | MonsterEvadedAction
  | MonsterAttackedAction
  | PickupItemAction 
  | PickupAllItemsAction


