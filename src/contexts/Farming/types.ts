import BigNumber from "bignumber.js";

export interface ContextValues {
  countdown?: Array<number>;
  isHarvesting?: Array<boolean>;
  isRedeeming?: Array<boolean>;
  isStaking?: Array<boolean>;
  isUnstaking?: Array<boolean>;
  earnedBalances?: Array<BigNumber>;
  stakedBalances?: Array<BigNumber>;
  totalSupplyLP?: Array<BigNumber>;
  lpPercents?: Array<BigNumber>;
  farmingStartTime: Array<number>;
  setConfirmTxModalIsOpen: (isOpen: boolean) => void;

  onHarvest: (contractIndex: number) => void;
  onRedeem: (contractIndex: number) => void;
  onStake: (contractIndex: number, amount: string) => void;
  onUnstake: (contractIndex: number, amount: string) => void;
}
