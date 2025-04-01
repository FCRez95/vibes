import { WeaponModel } from "../models/game/entities/items-model"

//Axe
const BoneAxe: WeaponModel = {
  name: 'Bone Axe',
  type: 'weapon',
  weaponType: 'axe',
  damageMin: 2,
  damageMax: 4
}

//Club
const BoneClub: WeaponModel = {
  name: 'Bone Club',
  type: 'weapon',
  weaponType: 'club',
  damageMin: 1,
  damageMax: 4
}

//Staff
const WoodStick: WeaponModel = {
  name: 'Wooden Stick',
  type: 'weapon',
  weaponType: 'staff',
  damageMin: 1,
  damageMax: 4
}

//Throwing
const Rock: WeaponModel = {
  name: 'Rock',
  type: 'weapon',
  weaponType: 'throwing',
  damageMin: 1,
  damageMax: 2
}

//Bow
const Bow: WeaponModel = {
  name: 'Crude Bow',
  type: 'weapon',
  weaponType: 'bow',
  damageMin: 3,
  damageMax: 5
}

export const  Weapons = {
  axe: {BoneAxe},
  bow: {Bow},
  throwing: {Rock},
  club: {BoneClub},
  staff: {WoodStick}
}