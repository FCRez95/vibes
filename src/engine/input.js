class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.mousePosition = new Vector(0, 0);
        this.isMouseDown = false;

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

        document.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
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
} 