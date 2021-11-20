import BigNumber from "bignumber.js";

export interface ContextValues {
  tokenBalances?: Array<BigNumber>;
  LPBalances?: Array<BigNumber>;
  CurrentBlock?: string;
}
