class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.input = new InputHandler(canvas);
        
        this.isGameOver = false;
        this.initGame();
    }

    initGame() {
        // Create map (4 times the canvas size)
        this.map = new Map(this.canvas.canvas.width * 4, this.canvas.canvas.height * 4);
        
        // Find a suitable starting position for the player
        const startPos = this.findWalkablePosition();
        this.player = new Player(startPos.x, startPos.y);
        
        // Camera position (top-left corner of the view)
        this.camera = {
            x: this.player.position.x - this.canvas.canvas.width / 2,
            y: this.player.position.y - this.canvas.canvas.height / 2
        };

        // Create monsters at the lairs
        this.monsters = [];
        this.map.monsterLairs.forEach(lair => {
            const monsterPos1 = this.findWalkablePosition(lair.x - 30, lair.y - 30);
            const monsterPos2 = this.findWalkablePosition(lair.x + 30, lair.y + 30);
            this.monsters.push(new Monster(monsterPos1.x, monsterPos1.y));
            this.monsters.push(new Monster(monsterPos2.x, monsterPos2.y));
        });
    }

    // Helper method to find a walkable position
    findWalkablePosition(preferredX, preferredY) {
        // If preferred position is provided and walkable, use it
        if (preferredX !== undefined && preferredY !== undefined) {
            if (this.map.isWalkable(preferredX, preferredY)) {
                return { x: preferredX, y: preferredY };
            }
        }

        // Start from the center if no preference given
        let x = preferredX || this.map.width / 2;
        let y = preferredY || this.map.height / 2;
        
        // Search in expanding spiral until walkable position is found
        let radius = 0;
        const maxRadius = Math.max(this.map.width, this.map.height);
        
        while (radius < maxRadius) {
            radius += this.map.tileSize;
            
            // Try positions in a circle at current radius
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const testX = x + radius * Math.cos(angle);
                const testY = y + radius * Math.sin(angle);
                
                if (this.map.isWalkable(testX, testY)) {
                    return { x: testX, y: testY };
                }
            }
        }
        
        // Fallback to map center if no position found
        return { x: this.map.width / 2, y: this.map.height / 2 };
    }

    update() {
        if (this.isGameOver) {
            // Check for restart
            if (this.input.isKeyPressed('Enter')) {
                this.isGameOver = false;
                this.initGame();
            }
            return;
        }

        // Check for player death
        if (this.player.isDead()) {
            this.isGameOver = true;
            return;
        }

        // Update player with monsters array and camera
        this.player.update(this.input, this.map, this.monsters, this.camera);
        
        // Update camera to center on player
        this.camera.x = this.player.position.x - this.canvas.canvas.width / 2;
        this.camera.y = this.player.position.y - this.canvas.canvas.height / 2;

        // Update monsters
        this.monsters.forEach(monster => {
            if (!monster.isDead()) {
                monster.update(this.player);
            }
        });
    }

    draw() {
        // Clear canvas
        this.canvas.clear();

        if (this.isGameOver) {
            this.drawGameOver();
            return;
        }

        // Draw map
        this.map.draw(this.canvas, this.camera);

        // Draw entities with camera offset
        this.monsters.forEach(monster => {
            if (!monster.isDead()) {
                const screenX = monster.position.x - this.camera.x;
                const screenY = monster.position.y - this.camera.y;
                monster.draw(this.canvas, screenX, screenY);
            }
        });

        // Draw player at center
        const screenX = this.player.position.x - this.camera.x;
        const screenY = this.player.position.y - this.camera.y;
        this.player.draw(this.canvas, screenX, screenY);

        // Draw minimap
        this.map.drawMinimap(this.canvas, this.player);

        // Draw joystick
        this.canvas.drawJoystick();
    }

    drawGameOver() {
        const ctx = this.canvas.ctx;
        const canvasWidth = this.canvas.canvas.width;
        const canvasHeight = this.canvas.canvas.height;

        // Draw semi-transparent black background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw game over text
        ctx.fillStyle = '#ff0000';
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 40);

        // Draw restart instruction
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText('Press ENTER to restart', canvasWidth / 2, canvasHeight / 2 + 40);
    }
}

// Initialize the game with a canvas instance
window.onload = () => {
    const canvas = new Canvas();
    const game = new Game(canvas);
    
    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}; 