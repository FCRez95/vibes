class Monster extends Entity {
    constructor() {
        super(new Vector(700, 300), 25, '#e74c3c', '👾');
        this.speed = 2;
        this.attackDamage = 10;
    }

    update(player) {
        if (this.isDead()) return;

        // Simple AI: Move towards player if not in attack range
        const direction = player.position.subtract(this.position).normalize();
        if (this.position.distance(player.position) > this.attackRange) {
            this.position = this.position.add(direction.multiply(this.speed));
        }

        // Try to attack player
        this.attack(player);
    }
} 