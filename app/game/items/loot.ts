import { Item } from "./Item";
import { IPosition } from "../../models/game/engine/position";
import { ICanvas } from "../../models/game/engine/canvas";

export class Loot {
  id: string;
  items: Item[];
  position: IPosition;

  constructor(id: string, items: Item[], position: IPosition) {
    this.id = id;
    this.items = items;
    this.position = position;
  }
  
  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    // Calculate screen position
    const screenX = this.position.x - camera.x;
    const screenY = this.position.y - camera.y;

    // Draw player sprite
    canvas.drawText(
      '🎒',
      screenX,
      screenY,
      '#ffffff',
      32,
      'Arial'
    );
  }
}