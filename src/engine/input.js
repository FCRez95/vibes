class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Set();
        this.mousePosition = new Vector(0, 0);
        this.isMouseDown = false;
        this.isTouching = false;

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

        // Add touch event listeners
        canvas.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.isTouching = true;
            const touch = e.touches[0];
            const rect = canvas.canvas.getBoundingClientRect();
            this.mousePosition = new Vector(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
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
        });
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }

    getMousePosition() {
        return this.mousePosition;
    }

    consumeClick() {
        const wasClicked = this.isMouseDown || this.isTouching;
        this.isMouseDown = false;
        this.isTouching = false;
        return wasClicked;
    }
} 