class Game {
    constructor() {
        this.canvas = new Canvas();
        this.input = new InputHandler();
        this.player = new Player();
        this.monster = new Monster();
        this.gameLoop();
    }

    update() {
        if (!this.player.isDead() && !this.monster.isDead()) {
            this.player.update(this.input, this.canvas);
            this.monster.update(this.player);
            this.player.attack(this.monster);
        }
    }

    draw() {
        this.canvas.clear();
        this.player.draw(this.canvas);
        this.monster.draw(this.canvas);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when all scripts are loaded
const game = new Game(); 