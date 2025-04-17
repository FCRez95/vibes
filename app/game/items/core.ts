import { ItemModel } from "@/app/models/game/entities/items-model";
import smallCore from "../../../public/assets/items/core-1.png";
import mediumCore from "../../../public/assets/items/core-2.png";
import bigCore from "../../../public/assets/items/core-3.png";

const createSmallCore = (): ItemModel => {
    return {
      identifier: "small-core",
      name: "Small Core",
      type: "core",
      coreLvl: 1,
      image: smallCore as HTMLImageElement
    };
  };
  
  const createMediumCore = (): ItemModel => {
    return {
      identifier: "medium-core",
      name: "Medium Core",
      type: "core",
      coreLvl: 2,
      image: mediumCore as HTMLImageElement
    };
  };
  
  const createBigCore = (): ItemModel => {
    return {
      identifier: "big-core",
      name: "Big Core",
      type: "core",
      coreLvl: 3,
      image: bigCore as HTMLImageElement
    };
  };
  
  
  
  export const coreList = {
    "small-core": createSmallCore(), //ok
    "medium-core": createMediumCore(), //ok
    "big-core": createBigCore() //ok
  } 