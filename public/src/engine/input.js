class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.mousePosition = new Vector(0, 0);
        this.isMouseDown = false;
        this.isTouching = false;
        this.lastTouchPosition = null;
        this.isAttackButtonClicked = false;

        document.addEventListener('keydown', (e) => this.keys.add(e.key));
        document.addEventListener('keyup', (e) => this.keys.delete(e.key));
        
        // Add mouse event listeners
        document.addEventListener('mousemove', (e) => {
            const rect = canvas.canvas.getBoundingClientRect();
            this.mousePosition = new Vector(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
        });

        document.addEventListener('mousedown', (e) => {
            const rect = canvas.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is on attack button
            if (this.isAttackButtonClick(x, y)) {
                this.isAttackButtonClicked = true;
            } else {
                this.isMouseDown = true;
            }
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Add touch event listeners
        canvas.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.isTouching = true;
            const touch = e.touches[0];
            const rect = canvas.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Check if touch is on attack button
            if (this.isAttackButtonClick(x, y)) {
                this.isAttackButtonClicked = true;
            }
            
            this.lastTouchPosition = new Vector(x, y);
            this.mousePosition = this.lastTouchPosition;
        });

        canvas.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            const rect = canvas.canvas.getBoundingClientRect();
            this.mousePosition = new Vector(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
        });

        canvas.canvas.addEventListener('touchend', () => {
            this.isTouching = false;
            this.lastTouchPosition = null;
        });
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }

    getMousePosition() {
        return this.mousePosition;
    }

    consumeClick() {
        const wasClicked = this.isMouseDown;
        this.isMouseDown = false;
        return wasClicked;
    }

    consumeAttackButtonClick() {
        const wasClicked = this.isAttackButtonClicked;
        this.isAttackButtonClicked = false;
        return wasClicked;
    }

    consumeTouchTarget() {
        if (this.isTouching && this.lastTouchPosition) {
            const position = this.lastTouchPosition;
            this.lastTouchPosition = null;
            return position;
        }
        return null;
    }

    isAttackButtonClick(x, y) {
        const buttonSize = 60;
        const buttonX = this.canvas.canvas.width - buttonSize - 20;
        const buttonY = this.canvas.canvas.height - buttonSize - 20;
        
        return x >= buttonX && x <= buttonX + buttonSize &&
               y >= buttonY && y <= buttonY + buttonSize;
    }
} 