import BigNumber from "bignumber.js";
import { IOraclePrice } from "hooks/useUBQPriceOracle";

export interface ContextValues {
  tokenBalances?: Array<BigNumber>;
  LPBalances?: Array<BigNumber>;
  INKBalance?: BigNumber;
  GRANSBalance?: BigNumber;
  UBQBalance?: BigNumber;
  CurrentBlock?: string;
  UBQoracle?: IOraclePrice;
}
