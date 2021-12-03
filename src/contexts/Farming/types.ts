import BigNumber from "bignumber.js";

import { IPooledTokens } from "hooks/useFarming";

export interface ContextValues {
  earnedBalances?: Array<BigNumber>; // rewards earned but not harvested
  stakedBalances?: Array<BigNumber>; // accounts LP staked in Farm
  totalSupplyLP?: Array<BigNumber>; // Total LP staked in Farm of All Accounts
  lpPercents?: Array<BigNumber>; // accounts LP Percent of Farm
  farmingStartTime: Array<number>; // the start time for the given Farm
  setConfirmModal: (isOpen: boolean, message?: string) => void; // display a modal and a given string message, or hide the modal

  currentApy?: Array<number>; // Farming Pool APY calculated
  currentTvl?: Array<number>; // Farming Pool TVL (total value locked/lp'd) at current prices
  PooledTokens?: Array<IPooledTokens>; // The 'estimated' tokens pooled inside of the accounts LP tokens
}
