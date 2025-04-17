export interface RuneModel {
  id: string;
  name: string;
  level?: number;
  amount?: number;
  description: string;
  effect: string[];
  image: HTMLImageElement;
  battle_canvas?: number | null;
}
