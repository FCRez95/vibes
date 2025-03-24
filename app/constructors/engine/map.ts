import { IMap, ITerrain, ITerrainTypes } from '../../models/game/engine/map';
import { ICanvas } from '../../models/game/engine/canvas';
import { PlayerModel } from '../../models/game/entities/player-model';

export class Map implements IMap {
  width: number;
  height: number;
  tileSize: number;
  grid: ITerrain[][] = [];
  gridRows: number;
  gridCols: number;
  monsterLairs: { x: number; y: number, difficulty: string }[];
  TERRAIN: ITerrainTypes;
  private seed: number = 16789; // Fixed seed for consistent map generation

  constructor(width: number, height: number, monsterLairs: { x: number; y: number, difficulty: string }[]) {
    this.width = width;
    this.height = height;
    this.tileSize = 15;

    this.TERRAIN = {
      GRASS: { type: 'grass', color: '#90EE90', walkable: true },
      WATER: { type: 'water', color: '#4FA4E8', walkable: false },
      DIRT: { type: 'dirt', color: '#8B4513', walkable: true },
      STONE: { type: 'stone', color: '#808080', walkable: false },
      FOREST: { type: 'forest', color: '#006400', walkable: true }
    };

    this.gridRows = Math.floor(this.height / this.tileSize);
    this.gridCols = Math.floor(this.width / this.tileSize);
    this.monsterLairs = monsterLairs;

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
      // Convert world coordinates to grid coordinates
      const gridX = Math.floor(lair.x / this.tileSize);
      const gridY = Math.floor(lair.y / this.tileSize);
      console.log(`Generating lair at grid coordinates: (${gridX}, ${gridY})`);
      this.generateLairPatch(gridX, gridY);
    });
  }

  generateLakes(): void {
    for (let i = 0; i < 7; i++) {
      const centerX = Math.floor(this.seededRandom() * (this.gridCols - 20)) + 10;
      const centerY = Math.floor(this.seededRandom() * (this.gridRows - 20)) + 10;
      const lakeSize = Math.floor(this.seededRandom() * 5) + 15; // Random size between 5 and 10

      for (let y = -lakeSize; y <= lakeSize; y++) {
        for (let x = -lakeSize; x <= lakeSize; x++) {
          // Add some randomness to the lake shape
          const distance = Math.sqrt(x * x + y * y);
          const noise = this.seededRandom() * 0.4; // 30% noise
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
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(this.seededRandom() * this.gridCols);
      const y = Math.floor(this.seededRandom() * this.gridRows);
      const radius = Math.floor(this.seededRandom() * 8) + 8; // Random size between 4 and 12
      
      // Randomly select terrain type with different probabilities
      const terrainType = this.seededRandom();
      let terrain: ITerrain;
      if (terrainType < 0.3) {
        terrain = this.TERRAIN.DIRT;
      } else if (terrainType < 0.5) {
        terrain = this.TERRAIN.STONE;
      } else {
        terrain = this.TERRAIN.FOREST;
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
    const lairSize = 20; // 5x5 tiles for the lair
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
          const screenX = x * this.tileSize - camera.x;
          const screenY = y * this.tileSize - camera.y;
          canvas.drawRect(screenX, screenY, this.tileSize, this.tileSize, this.grid[y][x].color);
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
        canvas.drawRect(
          10 + x * this.tileSize * scale,
          10 + y * this.tileSize * scale,
          this.tileSize * scale,
          this.tileSize * scale,
          this.grid[y][x].color
        );
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
} 