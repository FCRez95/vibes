import { EffectModel } from "./effect-model";

export interface DropModel {
  item: ItemModel;
  amount: number;
  chance: number;
}

export interface ItemModel {
  identifier: string;
  name: string;
  type: 'helmet' | 'chestplate' | 'axe' | 'bow' | 'club' | 'throwing' | 'shield' | 'legs' | 'boots' | 'core';
  damageMin?: number;
  damageMax?: number;
  defense?: number;
  effect?: EffectModel;
  image?: HTMLImageElement;
  coreLvl?: number;
}