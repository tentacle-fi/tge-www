import { useContext } from "react";

import { FarmingContext } from "contexts/Farming";

export interface IPooledTokens {
  token0: number;
  token1: number;
}

const useFarming = () => {
  return { ...useContext(FarmingContext) };
};

export default useFarming;
