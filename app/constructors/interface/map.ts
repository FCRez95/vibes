import { IMap, ITerrain, ITerrainTypes } from '../../models/game/engine/map';
import { ICanvas } from '../../models/game/engine/canvas';
import { PlayerModel } from '../../models/game/entities/player-model';
import grassImage from '../../../public/assets/terrain/grass.png';
import dirtImage from '../../../public/assets/terrain/dirt.png';
import stoneImage from '../../../public/assets/terrain/rocks.png';
import waterImage from '../../../public/assets/terrain/water.png';
import templeImage from '../../../public/assets/terrain/sand.png';

export class Map implements IMap {
  width: number;
  height: number;
  tileSize: number;
  grid: ITerrain[][] = [];
  gridRows: number;
  gridCols: number;
  monsterLairs: { x: number; y: number, difficulty: string }[];
  templePosition: { x: number; y: number };
  TERRAIN: ITerrainTypes;
  private seed: number = 16789; // Fixed seed for consistent map generation
  private grassImage: HTMLImageElement;
  private grassImageLoaded: boolean = false;
  private dirtImage: HTMLImageElement;
  private dirtImageLoaded: boolean = false;
  private stoneImage: HTMLImageElement;
  private stoneImageLoaded: boolean = false;
  private waterImage: HTMLImageElement;
  private waterImageLoaded: boolean = false;
  private templeImage: HTMLImageElement;
  private templeImageLoaded: boolean = false;

  constructor(width: number, height: number, monsterLairs: { x: number; y: number, difficulty: string }[]) {
    this.width = width;
    this.height = height;
    this.tileSize = 128;

    this.TERRAIN = {
      GRASS: { type: 'grass', color: '#90EE90', walkable: true },
      WATER: { type: 'water', color: '#4FA4E8', walkable: false },
      DIRT: { type: 'dirt', color: '#8B4513', walkable: true },
      STONE: { type: 'stone', color: '#808080', walkable: false },
      TEMPLE: { type: 'temple', color: '#DAA520', walkable: true } // Golden color for temple
    };

    this.gridRows = Math.floor(this.height / this.tileSize);
    this.gridCols = Math.floor(this.width / this.tileSize);
    this.monsterLairs = monsterLairs;
    
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

    // Load temple image
    this.templeImage = new Image();
    this.templeImage.src = templeImage.src;
    this.templeImageLoaded = true;

    console.log('Map initialized with monster lairs:', this.monsterLairs);
    this.generateMap();
  }

  // Seeded random number generator
  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  generateMap(): void {
    this.seed = 12345; // Reset seed at the start of map generation
    this.grid = [];
    for (let y = 0; y < this.gridRows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridCols; x++) {
        this.grid[y][x] = { ...this.TERRAIN.GRASS };
      }
    }

    this.generateLakes();
    this.generateTerrainPatches();
    
    // Generate lairs for all monster lairs
    this.monsterLairs.forEach(lair => {
      const gridX = Math.floor(lair.x / this.tileSize);
      const gridY = Math.floor(lair.y / this.tileSize);
      console.log(`Generating lair at grid coordinates: (${gridX}, ${gridY})`);
      this.generateLairPatch(gridX, gridY);
    });

    // Generate temple
    const templeGridX = Math.floor(this.templePosition.x / this.tileSize);
    const templeGridY = Math.floor(this.templePosition.y / this.tileSize);
    console.log(`Generating temple at grid coordinates: (${templeGridX}, ${templeGridY})`);
    this.generateTemplePatch(templeGridX, templeGridY);
  }

  generateLakes(): void {
    for (let i = 0; i < 12; i++) {
      const centerX = Math.floor(this.seededRandom() * (this.gridCols - 20)) + 10;
      const centerY = Math.floor(this.seededRandom() * (this.gridRows - 20)) + 10;
      const lakeSize = Math.floor(this.seededRandom() * 5) + 5; // Random size between 5 and 10

      for (let y = -lakeSize; y <= lakeSize; y++) {
        for (let x = -lakeSize; x <= lakeSize; x++) {
          // Add some randomness to the lake shape
          const distance = Math.sqrt(x * x + y * y);
          const noise = this.seededRandom() * 0.3; // 30% noise
          if (distance <= lakeSize + noise) {
            const mapX = centerX + x;
            const mapY = centerY + y;
            if (this.isInBounds(mapX, mapY)) {
              this.grid[mapY][mapX] = { ...this.TERRAIN.WATER };
            }
          }
        }
      }
    }
  }

  generateTerrainPatches(): void {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(this.seededRandom() * this.gridCols);
      const y = Math.floor(this.seededRandom() * this.gridRows);
      const radius = Math.floor(this.seededRandom() * 8) + 4; // Random size between 4 and 12
      
      // Randomly select terrain type with different probabilities
      const terrainType = this.seededRandom();
      let terrain: ITerrain;
      if (terrainType < 0.5) {
        terrain = this.TERRAIN.DIRT;
      } else {
        terrain = this.TERRAIN.STONE;
      }
      this.generatePatch(x, y, radius, terrain);
    }
  }

  generatePatch(centerX: number, centerY: number, radius: number, terrain: ITerrain): void {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        // Add some randomness to the patch shape
        const distance = Math.sqrt(x * x + y * y);
        const noise = this.seededRandom() * 0.4; // 40% noise
        if (distance <= radius + noise) {
          const mapX = centerX + x;
          const mapY = centerY + y;
          
          if (this.isInBounds(mapX, mapY)) {
            const currentTile = this.grid[mapY][mapX];
            if (currentTile && currentTile.type !== 'water') {
              this.grid[mapY][mapX] = { ...terrain };
            }
          }
        }
      }
    }
  }

  generateLairPatch(centerX: number, centerY: number): void {
    const lairSize = 7; // 5x5 tiles for the lair
    const halfSize = Math.floor(lairSize / 2);

    // Generate the dirt ground
    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        const mapX = centerX + x;
        const mapY = centerY + y;
        if (this.isInBounds(mapX, mapY)) {
          this.grid[mapY][mapX] = { ...this.TERRAIN.DIRT };
        }
      }
    }

    // Generate stone walls
    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        const mapX = centerX + x;
        const mapY = centerY + y;
        if (this.isInBounds(mapX, mapY)) {
          // Only place walls on the edges
          if (Math.abs(x) === halfSize || Math.abs(y) === halfSize) {
            // Skip the entrance positions
            if ((x >= -1 && x <= 1 && y === -halfSize) || // Top entrance
                (x === halfSize && y >= -1 && y <= 1) ||  // Right entrance
                (x >= -1 && x <= 1 && y === halfSize)) {  // Bottom entrance
              continue;
            }
            this.grid[mapY][mapX] = { ...this.TERRAIN.STONE };
          }
        }
      }
    }
  }

  generateTemplePatch(centerX: number, centerY: number): void {
    const templeSize = 10; // Same size as lairs
    const halfSize = Math.floor(templeSize / 2);

    // Generate the temple ground
    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        const mapX = centerX + x;
        const mapY = centerY + y;
        if (this.isInBounds(mapX, mapY)) {
          this.grid[mapY][mapX] = { ...this.TERRAIN.TEMPLE };
        }
      }
    }

    // Generate temple walls
    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        const mapX = centerX + x;
        const mapY = centerY + y;
        if (this.isInBounds(mapX, mapY)) {
          // Only place walls on the edges
          if (Math.abs(x) === halfSize || Math.abs(y) === halfSize) {
            // Skip the entrance positions (top and right only)
            if ((x >= -1 && x <= 1 && y === -halfSize) || // Top entrance
                (x === halfSize && y >= -1 && y <= 1)) {  // Right entrance
              continue;
            }
            this.grid[mapY][mapX] = { ...this.TERRAIN.STONE };
          }
        }
      }
    }
  }

  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.gridCols && y >= 0 && y < this.gridRows;
  }

  isWalkable(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    if (!this.isInBounds(tileX, tileY)) return false;
    return this.grid[tileY][tileX].walkable;
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
          const tile = this.grid[y][x];
          
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
          } else if (tile.type === 'temple' && this.templeImageLoaded) {
            canvas.drawImage(
              this.templeImage,
              screenX,
              screenY,
              this.tileSize,
              this.tileSize
            );
          } else {
            // Fallback to colored rectangle if image not available
            canvas.drawRect(screenX, screenY, this.tileSize, this.tileSize, tile.color);
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

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const tile = this.grid[y][x];
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
        } else {
          // Fallback to colored rectangle
          canvas.drawRect(
            screenX,
            screenY,
            tileWidth,
            tileHeight,
            tile.color
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
        3,
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
      type: this.grid[tileY][tileX].type,
      walkable: this.grid[tileY][tileX].walkable
    };
  }

  getTempleCenter(): { x: number; y: number } {

    return {
      x: this.templePosition.x + 10,
      y: this.templePosition.y + 10
    };
  }
} 