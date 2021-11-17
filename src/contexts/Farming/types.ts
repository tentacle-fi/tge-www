import BigNumber from "bignumber.js";

export interface ContextValues {
  countdown?: number;
  earnedBalance?: BigNumber;
  isApproved?: boolean;
  isApproving?: boolean;
  isHarvesting?: boolean;
  isRedeeming?: boolean;
  isStaking?: boolean;
  isUnstaking?: boolean;

  earnedBalanceESCHUBQ?: BigNumber;
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
