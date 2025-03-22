class Entity {
    constructor(position, radius, color, emoticon) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.health = 100;
        this.maxHealth = 100;
        this.attackDamage = 10;
        this.attackRange = 50;
        this.attackCooldown = 1000; // 1 second
        this.lastAttackTime = 0;
        this.emoticon = emoticon;
    }

    draw(canvas) {
        canvas.ctx.font = '30px Arial';
        canvas.ctx.textAlign = 'center';
        canvas.ctx.fillText(this.emoticon, this.position.x, this.position.y + 10);
        
        canvas.drawHealthBar(
            this.position,
            40,  // width
            8,   // height
            this.health,
            this.maxHealth
        );
    }

    canAttack(target) {
        const now = Date.now();
        const distance = this.position.distance(target.position);
        return distance <= this.attackRange && now - this.lastAttackTime >= this.attackCooldown;
    }

    attack(target) {
        if (this.canAttack(target)) {
            target.health -= this.attackDamage;
            this.lastAttackTime = Date.now();
            return true;
        }
        return false;
    }

    isDead() {
        return this.health <= 0;
    }
} 