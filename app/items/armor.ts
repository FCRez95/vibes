import { BootsModel, ChestplateModel, HelmetModel, LegsModel } from "../models/game/entities/items-model"

const ShirtRags: ChestplateModel = {
  name: 'Shirt Rags',
  type: 'chestplate',
  defense: 1
}

const PantsRags: LegsModel = {
  name: 'Pants Rags',
  type: 'legs',
  defense: 1
}

const LeatherHood: HelmetModel = {
  name: 'Leather Hood',
  type: 'helmet',
  defense: 1
}

const LeafShoes: BootsModel = {
  name: 'Leaf Shoes',
  type: 'boots',
  defense: 1
}

export const Items = {
  chestplate: {ShirtRags},
  legs: {PantsRags},
  helmet: {LeatherHood},
  boots: {LeafShoes}
}
