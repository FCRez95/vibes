export interface EffectModel {
  name: string;
  description: string;
  appyToUser?: {
    damageMin: number;
    damageMax: number;
    defense: number;
    skills: {
      running: number;
      unarmed: number;
      axe: number;
      bow: number;
      club: number;
      throwing: number;
      shield: number;
      elementalMagic: number;
      natureMagic: number;
      shamanMagic: number;
      summoningMagic: number;
    }
  };
  applyToTarget?: {
    freeze: number; // percentage chance of causing freeze
    slow: number; // percentage of causing slow
    poison: number; // damage per 3 seconds
    bleed: number; // damage per 3 seconds
    stun: number; // time of stun
    confuse: number; // time of confuse
    sleep: number; // time of sleep
    paralysis: number; // time of paralysis
  };
}
