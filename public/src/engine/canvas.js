class Canvas {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        // Add some CSS to ensure no margins/padding and prevent scrolling
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';

        // Initialize joystick properties
        this.joystick = {
            baseRadius: 50,
            stickRadius: 20,
            position: { x: 0, y: 0 },
            stickPosition: { x: 0, y: 0 },
            isActive: false,
            value: { x: 0, y: 0 }
        };

        // Add touch/mouse event listeners
        this.setupJoystickControls();

        // Set canvas to full screen (this will also update joystick position)
        this.setFullscreen();

        // Add resize listener
        window.addEventListener('resize', () => this.setFullscreen());
    }

    setFullscreen() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updateJoystickPosition();
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

        // Draw Border
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x-1, y-1, width+2, height+2);

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
            y + height - 6
        );
    }

    updateJoystickPosition() {
        this.joystick.position = {
            x: this.joystick.baseRadius + 20,
            y: this.canvas.height - this.joystick.baseRadius - 20
        };
        this.joystick.stickPosition = { ...this.joystick.position };
    }

    setupJoystickControls() {
        const handleStart = (e) => {
            const touch = e.type === 'mousedown' ? e : e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const distance = Math.sqrt(
                Math.pow(x - this.joystick.position.x, 2) +
                Math.pow(y - this.joystick.position.y, 2)
            );

            if (distance <= this.joystick.baseRadius) {
                this.joystick.isActive = true;
                this.updateStickPosition(x, y);
            }
        };

        const handleMove = (e) => {
            if (!this.joystick.isActive) return;
            e.preventDefault();

            const touch = e.type === 'mousemove' ? e : e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            this.updateStickPosition(x, y);
        };

        const handleEnd = () => {
            this.joystick.isActive = false;
            this.joystick.stickPosition = { ...this.joystick.position };
            this.joystick.value = { x: 0, y: 0 };
        };

        // Mouse events
        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('mouseup', handleEnd);
        this.canvas.addEventListener('mouseleave', handleEnd);

        // Touch events
        this.canvas.addEventListener('touchstart', handleStart);
        this.canvas.addEventListener('touchmove', handleMove);
        this.canvas.addEventListener('touchend', handleEnd);
    }

    updateStickPosition(x, y) {
        const dx = x - this.joystick.position.x;
        const dy = y - this.joystick.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.joystick.baseRadius) {
            this.joystick.stickPosition = { x, y };
            this.joystick.value = {
                x: dx / this.joystick.baseRadius,
                y: dy / this.joystick.baseRadius
            };
        } else {
            const angle = Math.atan2(dy, dx);
            this.joystick.stickPosition = {
                x: this.joystick.position.x + Math.cos(angle) * this.joystick.baseRadius,
                y: this.joystick.position.y + Math.sin(angle) * this.joystick.baseRadius
            };
            this.joystick.value = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
        }
    }

    drawJoystick() {
        // Draw base
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.position.x, this.joystick.position.y, this.joystick.baseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.stroke();
        this.ctx.closePath();

        // Draw stick
        this.ctx.beginPath();
        this.ctx.arc(this.joystick.stickPosition.x, this.joystick.stickPosition.y, this.joystick.stickRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawAttackButton() {
        const buttonSize = 80;
        const buttonX = this.canvas.width - buttonSize - 20;
        const buttonY = this.canvas.height - buttonSize - 20;

        // Draw button background
        this.ctx.beginPath();
        this.ctx.arc(buttonX + buttonSize/2, buttonY + buttonSize/2, buttonSize/2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.stroke();

        // Draw sword emoji
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('⚔️', buttonX + buttonSize/2, buttonY + buttonSize/2);
    }

    drawMonsterSelection(monster, x, y) {
        if (!monster) return;

        // Draw selection border
        this.ctx.beginPath();
        this.ctx.arc(x, y, monster.radius + 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
} 