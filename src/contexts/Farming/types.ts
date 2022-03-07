import BigNumber from "bignumber.js";

import { IPooledTokens, IFarmingFns } from "hooks/useFarming";

export interface ContextValues {
  earnedBalances?: Array<BigNumber>; // rewards earned but not harvested
  stakedBalances?: Array<BigNumber>; // accounts LP staked in Farm
  totalFarmSupplyLP?: Array<BigNumber>; // Total LP staked in Farm of All Accounts
  lpPercents?: Array<BigNumber>; // accounts LP Percent of Farm
  farmingStartTimes: Array<number>; // the start time for the given Farm

  currentApy?: Array<number>; // Farming Pool APY calculated
  currentTvl?: Array<number>; // Farming Pool TVL (total value locked/lp'd) at current prices
  PooledTokens?: Array<IPooledTokens>; // The 'estimated' tokens pooled inside of the accounts LP tokens

  farmFns?: IFarmingFns | undefined; // contains an object with each property being a function to call from the UI
  setFarmFns?: React.Dispatch<React.SetStateAction<IFarmingFns | undefined>>; // setter function
}
