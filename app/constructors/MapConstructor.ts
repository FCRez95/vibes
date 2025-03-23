import { IMap, ITerrain, ITerrainTypes } from '../models/game/engine/map';
import { ICanvas } from '../models/game/engine/canvas';
import { Player } from '../models/game/characters/player';

export class MapConstructor implements IMap {
  width: number;
  height: number;
  tileSize: number;
  grid: ITerrain[][] = [];
  gridRows: number;
  gridCols: number;
  monsterLairs: { x: number; y: number }[];
  TERRAIN: ITerrainTypes;
  tiles: any[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tileSize = 50;

    this.TERRAIN = {
      GRASS: { type: 'grass', color: '#90EE90', walkable: true },
      WATER: { type: 'water', color: '#4FA4E8', walkable: false },
      DIRT: { type: 'dirt', color: '#8B4513', walkable: true },
      STONE: { type: 'stone', color: '#808080', walkable: true }
    };

    this.gridRows = Math.floor(this.height / this.tileSize);
    this.gridCols = Math.floor(this.width / this.tileSize);
    this.monsterLairs = [];

    this.generateMap();
  }

  generateMap(): void {
    this.grid = [];
    for (let y = 0; y < this.gridRows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridCols; x++) {
        this.grid[y][x] = { ...this.TERRAIN.GRASS };
      }
    }

    this.generateLake();
    this.generateTerrainPatches();

    this.monsterLairs = [
      { x: this.width * 0.2, y: this.height * 0.2 },
      { x: this.width * 0.8, y: this.height * 0.2 },
      { x: this.width * 0.2, y: this.height * 0.8 },
      { x: this.width * 0.8, y: this.height * 0.8 }
    ];
  }

  generateLake(): void {
    const centerX = Math.floor(this.gridCols / 2);
    const centerY = Math.floor(this.gridRows / 2);
    const lakeSize = Math.min(10, Math.floor(Math.min(this.gridCols, this.gridRows) / 4));

    for (let y = -lakeSize; y <= lakeSize; y++) {
      for (let x = -lakeSize; x <= lakeSize; x++) {
        if (x * x + y * y <= lakeSize * lakeSize) {
          const mapX = centerX + x;
          const mapY = centerY + y;
          if (this.isInBounds(mapX, mapY)) {
            this.grid[mapY][mapX] = { ...this.TERRAIN.WATER };
          }
        }
      }
    }
  }

  generateTerrainPatches(): void {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * this.gridCols);
      const y = Math.floor(Math.random() * this.gridRows);
      const radius = Math.floor(Math.random() * 5) + 3;
      const terrain = Math.random() < 0.5 ? this.TERRAIN.DIRT : this.TERRAIN.STONE;

      this.generatePatch(x, y, radius, terrain);
    }
  }

  generatePatch(centerX: number, centerY: number, radius: number, terrain: ITerrain): void {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius) {
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
    const tilesX = Math.ceil(canvas.width / this.tileSize) + 1;
    const tilesY = Math.ceil(canvas.height / this.tileSize) + 1;

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

  drawMinimap(canvas: ICanvas, player: Player): void {
    const minimapSizeX = 150;
    const scale = minimapSizeX / this.width;
    const minimapSizeY = scale * this.height;
    
    canvas.drawRect(10, 10, minimapSizeX, minimapSizeY, 'rgba(0, 0, 0, 0.5)');

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

    canvas.drawCircle(
      10 + player.position.x * scale,
      10 + player.position.y * scale,
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