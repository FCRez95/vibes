class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 50; // Size of each tile
        this.generateMap();
    }

    generateMap() {
        // Create terrain types
        this.TERRAIN = {
            GRASS: { type: 'grass', color: '#90EE90', walkable: true },
            WATER: { type: 'water', color: '#4FA4E8', walkable: false },
            DIRT: { type: 'dirt', color: '#8B4513', walkable: true },
            STONE: { type: 'stone', color: '#808080', walkable: true }
        };

        // Initialize map grid
        this.grid = Array(Math.floor(this.height / this.tileSize))
            .fill()
            .map(() => Array(Math.floor(this.width / this.tileSize)).fill(this.TERRAIN.GRASS));

        // Generate lake
        this.generateLake();
        
        // Generate terrain patches
        this.generateTerrainPatches();

        // Define monster spawn points (lairs)
        this.monsterLairs = [
            { x: this.width * 0.2, y: this.height * 0.2 },
            { x: this.width * 0.8, y: this.height * 0.2 },
            { x: this.width * 0.2, y: this.height * 0.8 },
            { x: this.width * 0.8, y: this.height * 0.8 }
        ];
    }

    generateLake() {
        const centerX = Math.floor(this.width / (2 * this.tileSize));
        const centerY = Math.floor(this.height / (2 * this.tileSize));
        const lakeSize = 10;

        for (let y = -lakeSize; y <= lakeSize; y++) {
            for (let x = -lakeSize; x <= lakeSize; x++) {
                if (x * x + y * y <= lakeSize * lakeSize) {
                    const mapX = centerX + x;
                    const mapY = centerY + y;
                    if (this.isInBounds(mapX, mapY)) {
                        this.grid[mapY][mapX] = this.TERRAIN.WATER;
                    }
                }
            }
        }
    }

    generateTerrainPatches() {
        // Generate some random dirt and stone patches
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * (this.width / this.tileSize));
            const y = Math.floor(Math.random() * (this.height / this.tileSize));
            const radius = Math.floor(Math.random() * 5) + 3;
            const terrain = Math.random() < 0.5 ? this.TERRAIN.DIRT : this.TERRAIN.STONE;

            this.generatePatch(x, y, radius, terrain);
        }
    }

    generatePatch(centerX, centerY, radius, terrain) {
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= radius * radius) {
                    const mapX = centerX + x;
                    const mapY = centerY + y;
                    if (this.isInBounds(mapX, mapY) && this.grid[mapY][mapX].type !== 'water') {
                        this.grid[mapY][mapX] = terrain;
                    }
                }
            }
        }
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.width / this.tileSize && 
               y >= 0 && y < this.height / this.tileSize;
    }

    isWalkable(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        if (!this.isInBounds(tileX, tileY)) return false;
        return this.grid[tileY][tileX].walkable;
    }

    draw(canvas, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const tilesX = Math.ceil(canvas.canvas.width / this.tileSize) + 1;
        const tilesY = Math.ceil(canvas.canvas.height / this.tileSize) + 1;

        for (let y = startY; y < startY + tilesY; y++) {
            for (let x = startX; x < startX + tilesX; x++) {
                if (this.isInBounds(x, y)) {
                    const screenX = x * this.tileSize - camera.x;
                    const screenY = y * this.tileSize - camera.y;
                    canvas.ctx.fillStyle = this.grid[y][x].color;
                    canvas.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawMinimap(canvas, player) {
        const minimapSize = 150;
        const scale = minimapSize / this.width;
        
        // Draw background
        canvas.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        canvas.ctx.fillRect(10, 10, minimapSize, minimapSize);

        // Draw terrain
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                canvas.ctx.fillStyle = this.grid[y][x].color;
                canvas.ctx.fillRect(
                    10 + x * this.tileSize * scale,
                    10 + y * this.tileSize * scale,
                    this.tileSize * scale,
                    this.tileSize * scale
                );
            }
        }

        // Draw player
        canvas.ctx.fillStyle = 'red';
        canvas.ctx.beginPath();
        canvas.ctx.arc(
            10 + player.position.x * scale,
            10 + player.position.y * scale,
            3,
            0,
            Math.PI * 2
        );
        canvas.ctx.fill();
    }
} 