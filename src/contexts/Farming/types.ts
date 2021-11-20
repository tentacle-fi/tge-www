import BigNumber from "bignumber.js";

export interface ContextValues {
  countdown?: number;
  isApproved?: boolean;
  isApproving?: boolean;
  isHarvesting?: boolean;
  isRedeeming?: boolean;
  isStaking?: boolean;
  isUnstaking?: boolean;

  earnedBalances?: Array<BigNumber>;

  stakedBalanceESCHUBQ?: BigNumber;
  totalSupplyESCHUBQ?: BigNumber;
  lpPercentESCHUBQ?: BigNumber;

  farmingStartTime: number;
  onApprove: () => void;
  onHarvestESCHUBQ: () => void;
  onRedeemESCHUBQ: () => void;
  onStakeESCHUBQ: (amount: string) => void;
  onUnstakeESCHUBQ: (amount: string) => void;
}
