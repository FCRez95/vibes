import { ItemModel } from "../../models/game/entities/items-model";
import boneAxe from "../../../public/assets/items/bone-axe.gif";
import boneClub from "../../../public/assets/items/bone-club.gif";
import rock from "../../../public/assets/items/rock.gif";
import vineBow from "../../../public/assets/items/vine-bow.gif";
import bow from "../../../public/assets/items/bow.gif";
import elvishBow from "../../../public/assets/items/elvish-bow.gif";
import orcHunterBow from "../../../public/assets/items/orc-hunter-bow.gif";
import spear from "../../../public/assets/items/spear.gif";
import throwingAxe from "../../../public/assets/items/throwing-axe.gif";
import trollWarAxe from "../../../public/assets/items/troll-war-axe.gif";
import orcAxe from "../../../public/assets/items/orc-axe.gif";
import natureAxe from "../../../public/assets/items/nature-axe.gif";
import club from "../../../public/assets/items/club.gif";
import branchClub from "../../../public/assets/items/branch-club.gif";
import orcClub from "../../../public/assets/items/orc-club.gif";
import arrow from "../../../public/assets/items/arrow.gif";
// Axe
const createBoneAxe = (): ItemModel => {
  return {
    identifier: "bone-axe",
    name: "Bone Axe",
    damageMin: 1,
    damageMax: 5,
    type: "axe",
    image: boneAxe as HTMLImageElement
  };
};

const createTrollWarAxe = (): ItemModel => {
  return {
    identifier: "troll-war-axe",
    name: "Troll War Axe",
    damageMin: 3,
    damageMax: 5,
    type: "axe",
    image: trollWarAxe as HTMLImageElement
  };
};

const createOrcAxe = (): ItemModel => {
  return {
    identifier: "orc-axe",
    name: "Orc Axe",
    damageMin: 4,
    damageMax: 7,
    type: "axe",
    image: orcAxe as HTMLImageElement
  };
};

const createNatureAxe = (): ItemModel => {
  return {
    identifier: "nature-axe",
    name: "Nature Axe",
    damageMin: 6,
    damageMax: 9,
    type: "axe",
    image: natureAxe as HTMLImageElement
  };
};

// Club
const createBoneClub = (): ItemModel => {
  return {
    identifier: "bone-club",
    name: "Bone Club",
    damageMin: 2,
    damageMax: 4,
    type: "club",
    image: boneClub as HTMLImageElement
  };
};

const createClub = (): ItemModel => {
  return {
    identifier: "club",
    name: "Club",
    damageMin: 2,
    damageMax: 4,
    type: "club",
    image: club as HTMLImageElement
  };
};

const createBranchClub = (): ItemModel => {
  return {
    identifier: "branch-club",
    name: "Branch Club",
    damageMin: 3,
    damageMax: 5,
    type: "club",
    image: branchClub as HTMLImageElement
  };
};

const createOrcClub = (): ItemModel => {
  return {
    identifier: "orc-club",
    name: "Orc Club",
    damageMin: 4,
    damageMax: 8,
    type: "club",
    image: orcClub as HTMLImageElement
  };
};

// Bow
const createVineBow = (): ItemModel => {
  return {
    identifier: "vine-bow",
    name: "Vine Bow",
    damageMin: 1,
    damageMax: 3,
    type: "bow",
    image: vineBow as HTMLImageElement
  };
};

const createBow = (): ItemModel => {
  return {
    identifier: "bow",
    name: "Bow",
    damageMin: 2,
    damageMax: 4,
    type: "bow",
    image: bow as HTMLImageElement
  };
};

const createElvishBow = (): ItemModel => {
  return {
    identifier: "elvish-bow",
    name: "Elvish Bow",
    damageMin: 3,
    damageMax: 6,
    type: "bow",
    image: elvishBow as HTMLImageElement
  };
};

const createOrcHunterBow = (): ItemModel => {
  return {
    identifier: "orc-hunter-bow",
    name: "Orc Hunter Bow",
    damageMin: 5,
    damageMax: 9,
    type: "bow",
    image: orcHunterBow as HTMLImageElement
  };
};

const createArrow = (): ItemModel => {
  return {
    identifier: "arrow",
    name: "Arrow",
    damageMin: 1,
    damageMax: 3,
    type: "bow",
    image: arrow as HTMLImageElement
  };
};

// Throwing
const createRock = (): ItemModel => {
  return {
    identifier: "rock",
    name: "Rock",
    damageMin: 1,
    damageMax: 3,
    type: "throwing",
    image: rock as HTMLImageElement
  };
};

const createSpear = (): ItemModel => {
  return {
    identifier: "spear",
    name: "Spear",
    damageMin: 5,
    damageMax: 9,
    type: "throwing",
    image: spear as HTMLImageElement
  };
};

const createThrowingAxe = (): ItemModel => {
  return {
    identifier: "throwing-axe",
    name: "Throwing Axe",
    damageMin: 3,
    damageMax: 6,
    type: "throwing",
    image: throwingAxe as HTMLImageElement
  };
};
export const weaponList = {
  // Axe
  "bone-axe": createBoneAxe(), // init item
  "troll-war-axe": createTrollWarAxe(), // ok
  "orc-axe": createOrcAxe(), // ok
  "nature-axe": createNatureAxe(), // QUEST?
  // Club
  "bone-club": createBoneClub(), // init item
  "club": createClub(), // ok
  "branch-club": createBranchClub(), // ok
  "orc-club": createOrcClub(), // ok
  // Bow
  "vine-bow": createVineBow(), // init item
  "bow": createBow(), // ok
  "elvish-bow": createElvishBow(), // ok
  "orc-hunter-bow": createOrcHunterBow(), // ok
  "arrow": createArrow(), // init item
  // Throwing
  "rock": createRock(), // init item
  "spear": createSpear(), // ok
  "throwing-axe": createThrowingAxe() // ok
};