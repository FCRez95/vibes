export interface ICanvas {
  width: number;
  height: number;
  
  // Basic canvas operations
  clear(): void;
  resize(width: number, height: number): void;
  
  // Drawing methods
  drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void;
  drawRect(x: number, y: number, width: number, height: number, color: string): void;
  drawCircle(x: number, y: number, radius: number, color: string): void;
  
  // Text rendering
  drawText(text: string, x: number, y: number, color: string, size: number, font: string): void;
} 