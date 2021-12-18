import { useContext } from "react";
import { BalancesContext } from "contexts/Balances";
import BigNumber from "bignumber.js";

export interface ITokenPrice {
  [index: string]: number;
}

export interface ITokenBalance {
  [index: string]: BigNumber;
}

const useBalances = () => {
  return {
    ...useContext(BalancesContext),
  };
};

export default useBalances;
