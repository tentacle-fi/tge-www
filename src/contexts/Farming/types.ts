import BigNumber from "bignumber.js";

import { IPooledTokens } from "hooks/useFarming";

export interface ContextValues {
  earnedBalances?: Array<BigNumber>;
  stakedBalances?: Array<BigNumber>;
  totalSupplyLP?: Array<BigNumber>;
  lpPercents?: Array<BigNumber>;
  farmingStartTime: Array<number>;
  setConfirmModal: (isOpen: boolean, message?: string) => void;

  currentApy?: Array<number>;
  currentTvl?: Array<number>;
  PooledTokens?: Array<IPooledTokens>;
}
