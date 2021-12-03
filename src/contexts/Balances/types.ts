import BigNumber from "bignumber.js";
import { IOraclePrice } from "hooks/useUBQPriceOracle";
import { ITokenPrice } from "hooks/useBalances";
import { IReserves } from "utils";

export interface ContextValues {
  tokenBalances?: Array<BigNumber>;
  LPBalances?: Array<BigNumber>;
  INKBalance?: BigNumber;
  GRANSBalance?: BigNumber;
  UBQBalance?: BigNumber;
  CurrentBlock?: string;
  UBQoracle?: IOraclePrice;
  tokenPrices?: ITokenPrice;
  lpTokenReserves?: Array<IReserves>;
  CurrentBlockTimestamp?: number;
}
