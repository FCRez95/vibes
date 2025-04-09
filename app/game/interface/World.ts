import { ICanvas } from '../../models/game/engine/canvas';
import { PlayerModel } from '../../models/game/entities/player-model';
import grassImage from '../../../public/assets/terrain/grass.png';
import dirtImage from '../../../public/assets/terrain/dirt.png';
import stoneImage from '../../../public/assets/terrain/rocks.png';
import waterImage from '../../../public/assets/terrain/water.png';
import sandImage from '../../../public/assets/terrain/sand.png';
import recoveryImage from '../../../public/assets/terrain/recover.png';


export interface WorldTile {
  type: string;
  walkable: boolean;
}

export class World {
  width: number;
  height: number;
  tileSize: number;
  tiles: WorldTile[][] = [];
  monsterLairs: { x: number; y: number }[];
  templePosition: { x: number; y: number };

  private grassImage: HTMLImageElement;
  private grassImageLoaded: boolean = false;
  private dirtImage: HTMLImageElement;
  private dirtImageLoaded: boolean = false;
  private stoneImage: HTMLImageElement;
  private stoneImageLoaded: boolean = false;
  private waterImage: HTMLImageElement;
  private waterImageLoaded: boolean = false;
  private sandImage: HTMLImageElement;
  private sandImageLoaded: boolean = false;
  private recoveryImage: HTMLImageElement;
  private recoveryImageLoaded: boolean = false;

  constructor(width: number, height: number, tileSize: number, tiles: WorldTile[][], monsterLairs: { x: number; y: number }[], templePosition: { x: number; y: number }) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = tiles;
    this.monsterLairs = monsterLairs;
    this.templePosition = templePosition;
    // Set temple position in bottom left corner
    this.templePosition = {
      x: this.tileSize * 10, // 10 tiles from left edge
      y: this.height - (this.tileSize * 11) // 11 tiles from bottom edge
    };

    // Load grass image
    this.grassImage = new Image();
    this.grassImage.src = grassImage.src;
    this.grassImageLoaded = true;

    // Load dirt image
    this.dirtImage = new Image();
    this.dirtImage.src = dirtImage.src;
    this.dirtImageLoaded = true;

    // Load stone image
    this.stoneImage = new Image();
    this.stoneImage.src = stoneImage.src;
    this.stoneImageLoaded = true;

    // Load water image
    this.waterImage = new Image();
    this.waterImage.src = waterImage.src;
    this.waterImageLoaded = true;

    // Load sand image
    this.sandImage = new Image();
    this.sandImage.src = sandImage.src;
    this.sandImageLoaded = true;

    // Load recovery image
    this.recoveryImage = new Image();
    this.recoveryImage.src = recoveryImage.src;
    this.recoveryImageLoaded = true;
  }

  isInBounds(x: number, y: number): boolean {
    return x*this.tileSize >= 0 && x*this.tileSize < this.width && y*this.tileSize >= 0 && y*this.tileSize < this.height;
  }

  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isWalkable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false;
    return this.tiles[Math.floor(y / this.tileSize)][Math.floor(x / this.tileSize)].walkable;
  }

  draw(canvas: ICanvas, camera: { x: number; y: number }): void {
    const startX = Math.floor(camera.x / this.tileSize);
    const startY = Math.floor(camera.y / this.tileSize);
    const tilesX = Math.ceil(canvas.canvas.width / this.tileSize) + 1;
    const tilesY = Math.ceil(canvas.canvas.height / this.tileSize) + 1;

    for (let y = startY; y < startY + tilesY; y++) {
      for (let x = startX; x < startX + tilesX; x++) {
        if (this.isInBounds(x, y)) {
          const screenX = Math.round(x * this.tileSize - camera.x);
          const screenY = Math.round(y * this.tileSize - camera.y);
          const tile = this.tiles[y][x];
          
          // Use the appropriate image based on tile type
          if (tile.type === 'grass' && this.grassImageLoaded) {
            canvas.drawImage(
              this.grassImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else if (tile.type === 'dirt' && this.dirtImageLoaded) {
            canvas.drawImage(
              this.dirtImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else if (tile.type === 'stone' && this.stoneImageLoaded) {
            canvas.drawImage(
              this.stoneImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else if (tile.type === 'water' && this.waterImageLoaded) {
            canvas.drawImage(
              this.waterImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else if (tile.type === 'sand' && this.sandImageLoaded) {
            canvas.drawImage(
              this.sandImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else if (tile.type === 'recovery' && this.recoveryImageLoaded) {
            canvas.drawImage(
              this.recoveryImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          }
        }
      }
    }
  }

  drawMinimap(canvas: ICanvas, player: PlayerModel): void {
    const minimapSizeX = 100;
    const scale = minimapSizeX / this.width;
    const minimapSizeY = scale * this.height;
    
    canvas.drawRect(10, 10, minimapSizeX, minimapSizeY, 'rgba(0, 0, 0, 0.3)');

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x];
        const screenX = 10 + x * this.tileSize * scale;
        const screenY = 10 + y * this.tileSize * scale;
        const tileWidth = this.tileSize * scale;
        const tileHeight = this.tileSize * scale;
        
        // Use the appropriate image for the minimap based on tile type
        if (tile.type === 'grass' && this.grassImageLoaded) {
          canvas.drawImage(
            this.grassImage,
            Math.round(screenX),
            Math.round(screenY),
            Math.round(tileWidth),
            Math.round(tileHeight)
          );
        } else if (tile.type === 'dirt' && this.dirtImageLoaded) {
          canvas.drawImage(
            this.dirtImage,
            Math.round(screenX),
            Math.round(screenY),
            Math.round(tileWidth),
            Math.round(tileHeight)
          );
        } else if (tile.type === 'stone' && this.stoneImageLoaded) {
          canvas.drawImage(
            this.stoneImage,
            Math.round(screenX),
            Math.round(screenY),
            Math.round(tileWidth),
            Math.round(tileHeight)
          );
        } else if (tile.type === 'water' && this.waterImageLoaded) {
          canvas.drawImage(
            this.waterImage,
            Math.round(screenX),
            Math.round(screenY),
            Math.round(tileWidth),
            Math.round(tileHeight)
          );
        }
      }
    }

    // Draw monster lairs on minimap
    this.monsterLairs.forEach(lair => {
      // Convert world coordinates to grid coordinates
      const gridX = Math.floor(lair.x / this.tileSize);
      const gridY = Math.floor(lair.y / this.tileSize);
      canvas.drawCircle(
        10 + gridX * this.tileSize * scale,
        10 + gridY * this.tileSize * scale,
        2,
        'black' // Black color to match the lair color
      );
    });

    // Convert player world coordinates to grid coordinates
    const playerGridX = Math.floor(player.position.x / this.tileSize);
    const playerGridY = Math.floor(player.position.y / this.tileSize);
    canvas.drawCircle(
      10 + playerGridX * this.tileSize * scale,
      10 + playerGridY * this.tileSize * scale,
      3,
      'red'
    );
  }

  getTile(x: number, y: number): { type: string; walkable: boolean } {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    if (!this.isInBounds(tileX, tileY)) {
      return { type: 'out_of_bounds', walkable: false };
    }
    return {
      type: this.tiles[tileY][tileX].type,
      walkable: this.tiles[tileY][tileX].walkable
    };
  }

  getTempleCenter(): { x: number; y: number } {

    return {
      x: this.templePosition.x + 10,
      y: this.templePosition.y + 10
    };
  }
} 