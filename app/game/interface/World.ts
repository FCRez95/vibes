import { ICanvas } from '../../models/game/engine/canvas';
import { PlayerModel } from '../../models/game/entities/player-model';
import grassImage from '../../../public/assets/terrain/grass.png';
import dirtImage from '../../../public/assets/terrain/dirt.png';
import stoneImage from '../../../public/assets/terrain/rocks.png';
import waterImage from '../../../public/assets/terrain/water.png';
import sandImage from '../../../public/assets/terrain/sand.png';
import recoveryImage from '../../../public/assets/terrain/recover.png';
import NawariRock from '../../../public/assets/terrain/NawariRock.png';
import Crystal1 from '../../../public/assets/terrain/NawariCrystal1.png';
import Crystal2 from '../../../public/assets/terrain/NawariCrystal2.png';

export interface WorldTile {
  type: string;
  walkable: boolean;
}

export interface WorldObject {
  x: number;
  y: number;
  type: string;
  width: number;
  height: number;
  image: HTMLImageElement;
  loaded: boolean;
}

export class World {
  width: number;
  height: number;
  tileSize: number;
  tiles: WorldTile[][] = [];
  monsterLairs: { x: number; y: number }[];
  templePosition: { x: number; y: number };
  objects: WorldObject[] = [];

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
    
    // Load objects
    this.objects = [
      {
        x: 64*9,
        y: 64*189.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*10,
        y: 64*185.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*10,
        y: 64*193.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*29,
        y: 64*189.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*28,
        y: 64*185.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*28,
        y: 64*193.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*19,
        y: 64*179.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*15,
        y: 64*180.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*23,
        y: 64*180.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*19,
        y: 64*199.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*15,
        y: 64*198.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },
      {
        x: 64*23,
        y: 64*198.5,
        width: 64,
        height: 128,
        image: new Image(),
        loaded: false,
        type: 'pillar'
      },

      {
        x: 64*14,
        y: 64*184.8,
        width: 250,
        height: 250,
        image: new Image(),
        loaded: false,
        type: 'crystal1'
      },
      {
        x: 64*21.25,
        y: 64*191.6,
        width: 220,
        height: 280,
        image: new Image(),
        loaded: false,
        type: 'crystal2'
      },
    ];

    this.objects.forEach(object => {
      if (object.type === 'pillar') {
        object.image.src = NawariRock.src;
      } else if (object.type === 'crystal1') {
        object.image.src = Crystal1.src;
      } else if (object.type === 'crystal2') {
        object.image.src = Crystal2.src;
      }
      object.loaded = true;
    });

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

  checkCrystalInRange(x: number, y: number): boolean {
    return this.objects.some(object => {
      if (object.type !== 'crystal1' && object.type !== 'crystal2') return false;
      const dx = Math.abs((object.x + object.width/2) - x);
      const dy = Math.abs((object.y + object.height/2) - y);
      return Math.sqrt(dx * dx + dy * dy) < 150;
    });
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
    const minimapSizeX = 200;
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
        
        // Use simple colors for the minimap based on tile type
        if (tile.type === 'grass') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#354314'
          );
        } else if (tile.type === 'dirt') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#442c14'
          );
        } else if (tile.type === 'stone') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#17160e'
          );
        } else if (tile.type === 'water') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#1b323b'
          );
        } else if (tile.type === 'sand') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#be9034'
          );
        } else if (tile.type === 'recovery') {
          canvas.drawRect(
            Math.ceil(screenX),
            Math.ceil(screenY),
            Math.ceil(tileWidth),
            Math.ceil(tileHeight),
            '#0bcacc'
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

  drawObjects(canvas: ICanvas, camera: { x: number; y: number }): void {
    this.objects.forEach(object => {
      const screenX = Math.round(object.x - camera.x);
      const screenY = Math.round(object.y - camera.y);
      canvas.drawImage(object.image, screenX, screenY, object.width, object.height);
    });
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