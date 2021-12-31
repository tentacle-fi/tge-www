import BigNumber from "bignumber.js";
import { IOraclePrice } from "hooks/useUBQPriceOracle";
import { ITokenPrice, ITokenBalance } from "hooks/useBalances";
import { IReserves } from "utils";

export interface ContextValues {
  tokenPrices?: ITokenPrice;
  tokenBalances?: ITokenBalance;

  lpTokenReserves?: Array<IReserves>;
  LPBalances?: Array<BigNumber>;

  UBQoracle?: IOraclePrice;
}
