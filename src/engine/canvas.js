class Canvas {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        // Set canvas to full screen
        this.setFullscreen();

        // Add resize listener
        window.addEventListener('resize', () => this.setFullscreen());

        // Add some CSS to ensure no margins/padding and prevent scrolling
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
    }

    setFullscreen() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCircle(position, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawHealthBar(position, width, height, health, maxHealth) {
        const healthPercent = health / maxHealth;
        const x = position.x - width / 2;
        const y = position.y - height - 30; // Position above the entity

        // Draw background (red)
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(x, y, width, height);

        // Draw health (green)
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(x, y, width * healthPercent, height);

        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${Math.ceil(health)}/${maxHealth}`,
            position.x,
            y + height - 2
        );
    }
} 