import { ItemModel } from "../../models/game/entities/items-model";
import leatherVest from "../../../public/assets/items/leather-vest.gif";
import batBoots from "../../../public/assets/items/bat-boots.gif";
import batWingsPants from "../../../public/assets/items/bat-wings-pants.gif";
import goblinMask from "../../../public/assets/items/goblin-mask.gif";
import wolfSkinHood from "../../../public/assets/items/wolf-skin-hood.gif";
import tribesShirt from "../../../public/assets/items/tribes-shirt.gif";
import ratFurArmor from "../../../public/assets/items/ratfur-armor.gif";
import trollChestpiece from "../../../public/assets/items/troll-chestpiece.gif";
import orcLeaderVest from "../../../public/assets/items/orc-leader-vest.gif";
import shammanOrcCoat from "../../../public/assets/items/shamman-orc-coat.gif";
import trollSandals from "../../../public/assets/items/troll-sandals.gif";
import furBoots from "../../../public/assets/items/fur-boots.gif";
import leatherBoots from "../../../public/assets/items/leather-boots.gif";
import orcWarriorBoots from "../../../public/assets/items/orc-warrior-boots.gif";
import leafLoinCloth from "../../../public/assets/items/leaf-loincloth.gif";
import goblinShorts from "../../../public/assets/items/goblin-shorts.gif";
import leatherPants from "../../../public/assets/items/leather-pants.gif";
import trollPants from "../../../public/assets/items/troll-pants.gif";
import ratBoneBoots from "../../../public/assets/items/rat-bone-boots.gif";

// Head
const createCaciqueHood = (): ItemModel => {
  return {
    identifier: "cacique-hood",
    name: "Cacique Hood",
    defense: 1,
    type: "helmet",
  };
};
const createGoblinMask = (): ItemModel => {
  return {
    identifier: "goblin-mask",
    name: "Goblin Mask",
    defense: 2,
    type: "helmet",
    image: goblinMask as HTMLImageElement
  };
};

const createWolfSkinHood = (): ItemModel => {
  return {
    identifier: "wolf-skin-hood",
    name: "Wolf Skin Hood",
    defense: 4,
    type: "helmet",
    image: wolfSkinHood as HTMLImageElement
  };
};

// Chest
const createTribesShirt = (): ItemModel => {
  return {
    identifier: "tribes-shirt",
    name: "Tribes Shirt",
    defense: 1,
    type: "chestplate",
    image: tribesShirt as HTMLImageElement
  };
};

const createRatFurArmor = (): ItemModel => {
  return {
    identifier: "rat-fur-armor",
    name: "Rat Fur Armor",
    defense: 2,
    type: "chestplate",
    image: ratFurArmor as HTMLImageElement
  };
};

const createLeatherVest = (): ItemModel => {
  return {
    identifier: "leather-vest",
    name: "Leather Vest",
    defense: 3,
    type: "chestplate",
    image: leatherVest as HTMLImageElement
  };
};

const createTrollChestpiece = (): ItemModel => {
  return {
    identifier: "troll-chestpiece",
    name: "Troll Chestpiece",
    defense: 4,
    type: "chestplate",
    image: trollChestpiece as HTMLImageElement
  };
};

const createOrcLeaderVest = (): ItemModel => {
  return {
    identifier: "orc-leader-vest",
    name: "Orc Leader Vest",
    defense: 6,
    type: "chestplate",
    image: orcLeaderVest as HTMLImageElement
  };
};

const createOrcShammanCoat = (): ItemModel => {
  return {
    identifier: "orc-shamman-coat",
    name: "Orc Shamman Coat",
    defense: 5,
    type: "chestplate",
    image: shammanOrcCoat as HTMLImageElement
  };
};


// Boots
const createBatBoots = (): ItemModel => {
  return {
    identifier: "bat-boots",
    name: "Bat Boots",
    defense: 1,
    type: "boots",
    image: batBoots as HTMLImageElement
  };
};

const createRatBoneBoots = (): ItemModel => {
  return {
    identifier: "rat-bone-boots",
    name: "Rat Bone Boots",
    defense: 2,
    type: "boots",
    image: ratBoneBoots as HTMLImageElement
  };
};

const createTrollSandals = (): ItemModel => {
  return {
    identifier: "troll-sandals",
    name: "Troll Sandals",
    defense: 3,
    type: "boots",
    image: trollSandals as HTMLImageElement
  };
};
const createFurBoots = (): ItemModel => {
  return {
    identifier: "fur-boots",
    name: "Fur Boots",
    defense: 3,
    type: "boots",
    image: furBoots as HTMLImageElement
  };
};

const createLeatherBoots = (): ItemModel => {
  return {
    identifier: "leather-boots",
    name: "Leather Boots",
    defense: 4,
    type: "boots",
    image: leatherBoots as HTMLImageElement
  };
};

const createOrcWarriorBoots = (): ItemModel => {
  return {
    identifier: "orc-warrior-boots",
    name: "Orc Warrior Boots",
    defense: 5,
    type: "boots",
    image: orcWarriorBoots as HTMLImageElement
  };
};

// Legs
const createLeafLoinCloth = (): ItemModel => {
  return {
    identifier: "leaf-loin-cloth",
    name: "Leaf Loin Cloth",
    defense: 1,
    type: "legs",
    image: leafLoinCloth as HTMLImageElement
  };
};

const createBatWingsPants = (): ItemModel => {
  return {
    identifier: "bat-wings-pants",
    name: "Bat Wings Pants",
    defense: 1,
    type: "legs",
    image: batWingsPants as HTMLImageElement
  };
};

const createGoblinShorts = (): ItemModel => {
  return {
    identifier: "goblin-shorts",
    name: "Goblin Shorts",
    defense: 2,
    type: "legs",
    image: goblinShorts as HTMLImageElement
  };
};

const createLeatherPants = (): ItemModel => {
  return {
    identifier: "leather-pants",
    name: "Leather Pants",
    defense: 3,
    type: "legs",
    image: leatherPants as HTMLImageElement
  };
};

const createTrollPants = (): ItemModel => {
  return {
    identifier: "troll-pants",
    name: "Troll Pants",
    defense: 4,
    type: "legs",
    image: trollPants as HTMLImageElement
  };
};



export const armorList = {
  // Head
  "cacique-hood": createCaciqueHood(), // init item
  "goblin-mask": createGoblinMask(), //ok
  "wolf-skin-hood": createWolfSkinHood(),
  // Chest
  "tribes-shirt": createTribesShirt(), //ok
  "rat-fur-armor": createRatFurArmor(), //ok
  "leather-vest": createLeatherVest(), //ok
  "troll-chestpiece": createTrollChestpiece(), //ok
  "orc-leader-vest": createOrcLeaderVest(), //ok
  "orc-shamman-coat": createOrcShammanCoat(), //ok
  // Boots
  "bat-boots": createBatBoots(), //ok
  "rat-bone-boots": createRatBoneBoots(), //ok
  "troll-sandals": createTrollSandals(), //ok
  "fur-boots": createFurBoots(), //ok
  "leather-boots": createLeatherBoots(), //ok
  "orc-warrior-boots": createOrcWarriorBoots(), //ok
  // Legs
  "leaf-loin-cloth": createLeafLoinCloth(), // init item
  "bat-wings-pants": createBatWingsPants(), //ok
  "goblin-shorts": createGoblinShorts(), //ok
  "leather-pants": createLeatherPants(), //ok
  "troll-pants": createTrollPants() //ok
} 