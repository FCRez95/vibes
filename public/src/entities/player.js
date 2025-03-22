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
        this.targetIndex = 0; // Index of current target in nearby monsters array
        this.maxTargetDistance = 200; // Maximum distance to consider monsters for targeting
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

        // Handle attack button click
        if (input.consumeAttackButtonClick()) {
            this.cycleTarget(monsters);
        }

        // Check if current target is too far or dead
        if (this.target && (this.target.isDead() || this.position.distance(this.target.position) > this.maxTargetDistance)) {
            this.target = null;
            this.targetIndex = 0;
        }

        // Attack target if it exists and is in range
        if (this.target && !this.target.isDead() && this.position.distance(this.target.position) <= this.attackRange) {
            this.attack(this.target);
        }
    }

    cycleTarget(monsters) {
        // Get all alive monsters within range
        const nearbyMonsters = monsters.filter(monster => 
            !monster.isDead() && 
            this.position.distance(monster.position) <= this.maxTargetDistance
        );

        if (nearbyMonsters.length === 0) {
            this.target = null;
            this.targetIndex = 0;
            return;
        }

        // Cycle to next target
        this.targetIndex = (this.targetIndex + 1) % nearbyMonsters.length;
        this.target = nearbyMonsters[this.targetIndex];
    }

    draw(canvas, x, y) {
        super.draw(canvas, x, y);
    }
} 