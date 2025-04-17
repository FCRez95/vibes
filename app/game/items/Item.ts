import { EffectModel } from "../../models/game/entities/effect-model";
import { ItemModel } from "../../models/game/entities/items-model";
import { ICanvas } from "../../models/game/engine/canvas";
import { IPosition } from "../../models/game/engine/position";

export class Item {
  id: string;
  identifier: string;
  name: string;
  type: "helmet" | "chestplate" | "axe" | "bow" | "club" | "throwing" | "shield" | "legs" | "boots" | "core";
  damageMin?: number;
  damageMax?: number;
  defense?: number;
  effect?: EffectModel;
  position?: IPosition;
  image?: HTMLImageElement;
  coreLvl?: number;
  private readonly SPRITE_WIDTH: number = 32;
  private readonly SPRITE_HEIGHT: number = 32;

  constructor(id: string,item: ItemModel, position?: IPosition) {
    this.id = id;
    this.identifier = item.identifier;
    this.name = item.name;
    this.type = item.type;
    this.damageMin = item.damageMin;
    this.damageMax = item.damageMax;
    this.defense = item.defense;
    this.effect = item.effect;
    this.position = position;
    this.image = item.image;
    this.coreLvl = item.coreLvl;
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    if (!this.position || !this.image) return;
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw player sprite
    canvas.drawImage(
      this.image,
      screenX - this.SPRITE_WIDTH / 2,
      screenY - this.SPRITE_HEIGHT / 2,
      this.SPRITE_WIDTH,
      this.SPRITE_HEIGHT
    );

  }
}
