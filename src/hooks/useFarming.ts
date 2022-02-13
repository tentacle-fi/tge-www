import { useContext } from "react";

import { FarmingContext } from "contexts/Farming";

export interface IPooledTokens {
  token0: number;
  token1: number;
}

// Example object structure:
// {
//   "harvest":{
//      "0": Function <- "0" is the farmKey, Function points to the 'harvest' function
//   }
// }
export interface IFarmingFns {
  [key: string]: {
    [key: string]: Function | undefined;
  };
}

const useFarming = () => {
  return { ...useContext(FarmingContext) };
};

export default useFarming;
