import BigNumber from "bignumber.js";

export interface ContextValues {
  earnedBalances?: Array<BigNumber>;
  stakedBalances?: Array<BigNumber>;
  totalSupplyLP?: Array<BigNumber>;
  lpPercents?: Array<BigNumber>;
  farmingStartTime: Array<number>;
  setConfirmTxModalIsOpen: (isOpen: boolean) => void;

  currentApy: number;
  currentTvl: number;
  inkPrice: number;
  PooledTokens?: {
    token0: number;
    token1: number;
  };
}
