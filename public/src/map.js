class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 50; // Size of each tile

        // Define terrain types first
        this.TERRAIN = {
            GRASS: { type: 'grass', color: '#90EE90', walkable: true },
            WATER: { type: 'water', color: '#4FA4E8', walkable: false },
            DIRT: { type: 'dirt', color: '#8B4513', walkable: true },
            STONE: { type: 'stone', color: '#808080', walkable: true }
        };

        // Calculate grid dimensions
        this.gridRows = Math.floor(this.height / this.tileSize);
        this.gridCols = Math.floor(this.width / this.tileSize);
        
        console.log('Grid dimensions:', this.gridRows, 'x', this.gridCols);

        // Then initialize the map
        this.generateMap();
    }

    generateMap() {
        // Initialize map grid with grass terrain
        this.grid = [];
        for (let y = 0; y < this.gridRows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridCols; x++) {
                this.grid[y][x] = {...this.TERRAIN.GRASS}; // Create a new object copy
            }
        }

        console.log('Grid initialized with size:', this.grid.length, 'x', this.grid[0].length);

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
        const centerX = Math.floor(this.gridCols / 2);
        const centerY = Math.floor(this.gridRows / 2);
        const lakeSize = Math.min(10, Math.floor(Math.min(this.gridCols, this.gridRows) / 4));

        for (let y = -lakeSize; y <= lakeSize; y++) {
            for (let x = -lakeSize; x <= lakeSize; x++) {
                if (x * x + y * y <= lakeSize * lakeSize) {
                    const mapX = centerX + x;
                    const mapY = centerY + y;
                    if (this.isInBounds(mapX, mapY)) {
                        this.grid[mapY][mapX] = {...this.TERRAIN.WATER}; // Create a new object copy
                    }
                }
            }
        }
    }

    generateTerrainPatches() {
        // Generate some random dirt and stone patches
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * this.gridCols);
            const y = Math.floor(Math.random() * this.gridRows);
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
                    
                    // Add bounds checking and debug logging
                    if (this.isInBounds(mapX, mapY)) {
                        const currentTile = this.grid[mapY][mapX];
                        if (!currentTile) {
                            console.error('Invalid tile at:', mapX, mapY);
                            continue;
                        }
                        
                        if (currentTile.type !== 'water') {
                            this.grid[mapY][mapX] = {...terrain}; // Create a new object copy
                        }
                    }
                }
            }
        }
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.gridCols && 
               y >= 0 && y < this.gridRows;
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
        const minimapSizeX = 150;
        const scale = minimapSizeX / this.width;
        const minimapSizeY = scale * this.height;
        
        // Draw background
        canvas.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        canvas.ctx.fillRect(10, 10, minimapSizeX, minimapSizeY);

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