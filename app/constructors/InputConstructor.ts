import { Input } from '../models/game/engine/input';

export class InputConstructor implements Input {
  private keyStates: { [key: string]: boolean } = {};
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtonStates: { [button: number]: boolean } = {};
  private touchPositions: { x: number; y: number }[] = [];
  private isTouching: boolean = false;
  private keyListeners: ((event: KeyboardEvent) => void)[] = [];
  private mouseListeners: ((event: MouseEvent) => void)[] = [];
  private touchListeners: ((event: TouchEvent) => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keyStates[e.key] = true;
      this.keyListeners.forEach(listener => listener(e));
    });

    window.addEventListener('keyup', (e) => {
      this.keyStates[e.key] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      this.mouseListeners.forEach(listener => listener(e));
    });

    window.addEventListener('mousedown', (e) => {
      this.mouseButtonStates[e.button] = true;
      this.mouseListeners.forEach(listener => listener(e));
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtonStates[e.button] = false;
    });

    window.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.touchPositions = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY
      }));
      this.touchListeners.forEach(listener => listener(e));
    });

    window.addEventListener('touchmove', (e) => {
      this.touchPositions = Array.from(e.touches).map(touch => ({
        x: touch.clientX,
        y: touch.clientY
      }));
      this.touchListeners.forEach(listener => listener(e));
    });

    window.addEventListener('touchend', () => {
      this.isTouching = false;
      this.touchPositions = [];
    });
  }

  isKeyPressed(key: string): boolean {
    return this.keyStates[key] || false;
  }

  isKeyDown(key: string): boolean {
    return this.keyStates[key] || false;
  }

  isKeyUp(key: string): boolean {
    return !this.keyStates[key];
  }

  getMousePosition(): { x: number; y: number } {
    return this.mousePosition;
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonStates[button] || false;
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtonStates[button] || false;
  }

  isMouseButtonUp(button: number): boolean {
    return !this.mouseButtonStates[button];
  }

  getTouchPosition(): { x: number; y: number }[] {
    return this.touchPositions;
  }

  isTouchActive(): boolean {
    return this.isTouching;
  }

  addKeyListener(callback: (event: KeyboardEvent) => void): void {
    this.keyListeners.push(callback);
  }

  addMouseListener(callback: (event: MouseEvent) => void): void {
    this.mouseListeners.push(callback);
  }

  addTouchListener(callback: (event: TouchEvent) => void): void {
    this.touchListeners.push(callback);
  }

  removeAllListeners(): void {
    this.keyListeners = [];
    this.mouseListeners = [];
    this.touchListeners = [];
  }
} 