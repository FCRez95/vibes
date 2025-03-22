class Monster extends Entity {
    constructor(x = 700, y = 300, config = {}) {
        super(new Vector(x, y), 25, '#e74c3c', '👾');
        
        // Base attributes with defaults that can be overridden by config
        this.attributes = {
            strength: config.strength || 8,
            agility: config.agility || 8,
            dexterity: config.dexterity || 8,
            intelligence: config.intelligence || 8,
            constitution: config.constitution || 8,
            endurance: config.endurance || 8,
            wisdom: config.wisdom || 8,
            luck: config.luck || 8
        };

        this.speed = 2;
        this.health = this.getMaxHealth(); // Set initial health based on constitution
        this.attackDamage = 10;
        this.aggroRange = 100;  // Distance at which monster becomes aggressive
        this.initialPosition = new Vector(x, y);  // Remember spawn position
        this.isAggressive = false;  // Track aggro state
    }

    update(player) {
        if (this.isDead()) return;

        const distanceToPlayer = this.position.distance(player.position);
        
        // Check if player is within aggro range
        if (distanceToPlayer <= this.aggroRange) {
            this.isAggressive = true;
        }

        // If aggressive, chase and attack player
        if (this.isAggressive) {
            // Simple AI: Move towards player if not in attack range
            const direction = player.position.subtract(this.position).normalize();
            if (distanceToPlayer > this.attackRange) {
                this.position = this.position.add(direction.multiply(this.speed));
            }

            // Try to attack player
            this.attack(player);
        } else {
            // If not aggressive and not at spawn point, slowly return home
            const distanceToSpawn = this.position.distance(this.initialPosition);
            if (distanceToSpawn > 5) {  // Small threshold to prevent jittering
                const direction = this.initialPosition.subtract(this.position).normalize();
                this.position = this.position.add(direction.multiply(this.speed * 0.5));  // Move slower when returning
            }
        }
    }

    draw(canvas, x, y) {
        // Draw aggro range circle (semi-transparent)
        if (!this.isAggressive) {
            canvas.ctx.beginPath();
            canvas.ctx.arc(x, y, this.aggroRange, 0, Math.PI * 2);
            canvas.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            canvas.ctx.fill();
            canvas.ctx.closePath();
        }

        // Call parent draw method
        super.draw(canvas, x, y);

        // Draw selection border if this monster is the player's target
        if (this === canvas.game.player.target) {
            canvas.drawMonsterSelection(this, x, y);
        }
    }
} 