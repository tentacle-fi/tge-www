import BigNumber from "bignumber.js";

export interface ContextValues {
  tokenBalances?: Array<BigNumber>;
  LPBalances?: Array<BigNumber>;
  INKBalance?: BigNumber;
  GRANSBalance?: BigNumber;
  UBQBalance?: BigNumber;
  CurrentBlock?: string;
}
