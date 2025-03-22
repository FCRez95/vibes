class Entity {
    constructor(position, radius, color, sprite) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.sprite = sprite;
        this.health = 100;  // Base health
        this.attackRange = 50;
        this.attackCooldown = 0;
        this.maxAttackCooldown = 1000; // Base cooldown in milliseconds
    }

    // Calculate actual health based on constitution
    getMaxHealth() {
        return 100 + (this.attributes.constitution - 10) * 10; // Each point above 10 adds 10 health
    }

    // Calculate attack damage based on strength
    getAttackDamage() {
        return 10 + (this.attributes.strength - 10) * 2; // Each point above 10 adds 2 damage
    }

    // Calculate attack cooldown based on agility
    getAttackCooldownTime() {
        return this.maxAttackCooldown * (1 - (this.attributes.agility - 10) * 0.05); // Each point above 10 reduces cooldown by 5%
    }

    draw(canvas, x = this.position.x, y = this.position.y) {
        // Draw circle background
        canvas.ctx.beginPath();
        canvas.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        canvas.ctx.fillStyle = this.color;
        canvas.ctx.fill();
        canvas.ctx.closePath();

        // Draw health bar
        canvas.drawHealthBar(
            new Vector(x, y),
            40,  // width
            8,   // height
            this.health,
            this.getMaxHealth()
        );

        // Draw sprite/emoji on top
        canvas.ctx.font = '30px Arial';
        canvas.ctx.textAlign = 'center';
        canvas.ctx.textBaseline = 'middle';  // Center vertically
        canvas.ctx.fillStyle = 'black';  // Text color
        canvas.ctx.fillText(this.sprite, x, y);
    }

    attack(target) {
        if (this.isDead()) return;
        
        const now = Date.now();
        if (this.attackCooldown > now) return;

        const distance = this.position.distance(target.position);
        if (distance <= this.attackRange) {
            target.health -= this.getAttackDamage();
            this.attackCooldown = now + this.getAttackCooldownTime();
        }
    }

    isDead() {
        return this.health <= 0;
    }
} 