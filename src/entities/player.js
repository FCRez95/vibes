class Player extends Entity {
    constructor(x = 0, y = 0) {  // Default position values
        super(new Vector(x, y), 20, '#3498db', '🧙‍♂️');  // Pass all required parameters to Entity
        
        // Base attributes
        this.attributes = {
            strength: 10,     // Physical power, melee damage
            agility: 10,      // Movement speed, dodge chance
            dexterity: 10,    // Accuracy, ranged damage
            intelligence: 10,  // Magic power, mana pool
            constitution: 10,  // Health points, resistance
            endurance: 10,    // Stamina, physical resistance
            wisdom: 10,       // Magic resistance, mana regeneration
            luck: 10          // Critical hits, item finds
        };

        this.speed = 5;
        this.health = this.getMaxHealth(); // Set initial health based on constitution
        this.target = null;  // Currently targeted monster
    }

    update(input, map, monsters, camera) {
        const movement = new Vector();
        
        // Keyboard movement
        if (input.isKeyPressed('ArrowUp')) movement.y -= this.speed;
        if (input.isKeyPressed('ArrowDown')) movement.y += this.speed;
        if (input.isKeyPressed('ArrowLeft')) movement.x -= this.speed;
        if (input.isKeyPressed('ArrowRight')) movement.x += this.speed;

        // Joystick movement
        if (input.canvas.joystick.isActive) {
            const joystickValue = input.canvas.joystick.value;
            movement.x += joystickValue.x * this.speed;
            movement.y += joystickValue.y * this.speed;
        }

        // Calculate new position
        const newPosition = this.position.add(movement);

        // Check if new position is walkable
        if (map.isWalkable(newPosition.x, newPosition.y)) {
            this.position = newPosition;
        }

        // Keep player within map bounds
        this.position.x = Math.max(this.radius, Math.min(map.width - this.radius, this.position.x));
        this.position.y = Math.max(this.radius, Math.min(map.height - this.radius, this.position.y));

        // Handle targeting
        if (input.consumeClick()) {
            const mousePos = input.getMousePosition();
            // Convert screen coordinates to world coordinates
            const worldMousePos = new Vector(
                mousePos.x + camera.x,
                mousePos.y + camera.y
            );
            
            // Find closest monster that was clicked
            this.target = null;
            let closestDistance = 30; // Click tolerance radius
            monsters.forEach(monster => {
                if (!monster.isDead()) {
                    const distance = monster.position.distance(worldMousePos);
                    if (distance < closestDistance) {
                        this.target = monster;
                        closestDistance = distance;
                    }
                }
            });
        }

        // Attack target if it exists
        if (this.target && !this.target.isDead()) {
            this.attack(this.target);
        }
    }

    draw(canvas, x, y) {
        super.draw(canvas, x, y);

        // Draw line to target if one exists
        if (this.target && !this.target.isDead()) {
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(x, y);
            const targetScreenX = this.target.position.x - (this.position.x - x);
            const targetScreenY = this.target.position.y - (this.position.y - y);
            canvas.ctx.lineTo(targetScreenX, targetScreenY);
            canvas.ctx.strokeStyle = 'red';
            canvas.ctx.lineWidth = 2;
            canvas.ctx.stroke();
        }
    }
} 