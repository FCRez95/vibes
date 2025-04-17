import { RuneModel } from "@/app/models/game/Rune"
import fireRuneImage from '../../../public/assets/runes/fire.png'
import waterRuneImage from '../../../public/assets/runes/water.png'
import earthRuneImage from '../../../public/assets/runes/earth.png'
import airRuneImage from '../../../public/assets/runes/air.png'
import selfRuneImage from '../../../public/assets/runes/self.png'
import healRuneImage from '../../../public/assets/runes/heal.png'

const createFireRune = (): RuneModel => {
  return {
    id: 'fire',
    name: 'Kara',
    description: 'Kara was carved in the ashes of the First Warcallers pyre. It is the rage of injustice, the hunger of the hunt, and the scream of the dying sun. It remembers every fire lit by the Ezkeri to protect or avenge.',
    effect: ['Attack Spells: Burn enemies with ancestral flame', 'Buff Spells: Surge with the wild rhythm of war'],
    image: fireRuneImage as HTMLImageElement,
  }
}

const createWaterRune = (): RuneModel => {
  return {
    id: 'water',
    name: 'Tulu',
    description: 'Talu flows from the sacred spring at the center of the world, where the first Ezkeri cried into the river and made it remember. It is the rhythm of life and the echo of every sorrow turned into strength.',
    effect: ['Attack Spells: Douse enemies, slow their fury', 'Buff Spells: Heal and soothe with the memory of waters'],
    image: waterRuneImage as HTMLImageElement,
  }
}

const createEarthRune = (): RuneModel => {
  return {
    id: 'earth',
    name: 'Noru',
    description: 'Noru is the stone beneath every ancestors grave. It waits. It watches. It holds the line. Those who carry Noru stand unbroken, even when the world itself cracks and falls.',
    effect: ['Attack Spells: Root enemies with ancestral weight', 'Buff Spells: Fortify the body with earths quiet strength'],
    image: earthRuneImage as HTMLImageElement,
  }
}

const createAirRune = (): RuneModel => {
  return {
    id: 'air',
    name: 'Aera',
    description: 'Aera is the last breath before death, the whisper between trees, the name of the fallen carried to the sky. It does not strike—it dances, glides, and leaves its mark like a ghost.',
    effect: ['Attack Spells: Push foes around with the fury of air', 'Buff Spells: Move as the ancestors once did—swift and free'],
    image: airRuneImage as HTMLImageElement,
  }
}

// Form Runes
const createSelfRune = (): RuneModel => {
  return {
    id: 'self',
    name: 'Oku',
    description: 'Oku is the inward gaze, the root of awareness. It was first drawn in the sand by a wounded elder who healed not through medicine, but through stillness. To cast Oku is to face oneself—to restore, to endure, or to awaken.',
    effect: ['Directs the spell inward, targeting only the caster'],
    image: selfRuneImage as HTMLImageElement
  }
}

// Effect Runes
const createHealRune = (): RuneModel => {
  return {
    id: 'heal',
    name: 'Firu',
    description: 'When the first Ezkeri fell in battle, her sister held her beneath the Ancestor Tree and wept. From that soil, nourished by grief and hope, bloomed the first healing light. Firu is that light—the breath between death and recovery, a promise that not all pain is forever',
    effect: ['Restores HP'],
    image: healRuneImage as HTMLImageElement
  }
}

export const runesList = {
  // Essence Runes
  'fire': createFireRune(),
  'water': createWaterRune(),
  'earth': createEarthRune(),
  'air': createAirRune(),

  // Form Runes
  'self': createSelfRune(),

  // Effect Runes
  'heal': createHealRune(),
}