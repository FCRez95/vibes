class Player extends Entity {
    constructor() {
        super(new Vector(100, 300), 20, '#3498db', '🧙‍♂️');
        this.speed = 5;
        this.attackDamage = 15;
    }

    update(input, canvas) {
        const movement = new Vector();
        
        if (input.isKeyPressed('ArrowUp')) movement.y -= this.speed;
        if (input.isKeyPressed('ArrowDown')) movement.y += this.speed;
        if (input.isKeyPressed('ArrowLeft')) movement.x -= this.speed;
        if (input.isKeyPressed('ArrowRight')) movement.x += this.speed;

        // Update position with bounds checking
        this.position = this.position.add(movement);
        this.position.x = Math.max(this.radius, Math.min(canvas.canvas.width - this.radius, this.position.x));
        this.position.y = Math.max(this.radius, Math.min(canvas.canvas.height - this.radius, this.position.y));
    }
} 