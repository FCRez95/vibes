export interface Input {
  // Keyboard input
  isKeyPressed(key: string): boolean;
  isKeyDown(key: string): boolean;
  isKeyUp(key: string): boolean;
  
  // Mouse input
  getMousePosition(): { x: number; y: number };
  isMouseButtonPressed(button: number): boolean;
  isMouseButtonDown(button: number): boolean;
  isMouseButtonUp(button: number): boolean;
  
  // Touch input
  getTouchPosition(): { x: number; y: number }[];
  isTouchActive(): boolean;
  
  // Event listeners
  addKeyListener(callback: (event: KeyboardEvent) => void): void;
  addMouseListener(callback: (event: MouseEvent) => void): void;
  addTouchListener(callback: (event: TouchEvent) => void): void;
  
  // Cleanup
  removeAllListeners(): void;
} 