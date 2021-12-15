import { useContext } from "react";

import { BalancesContext } from "contexts/Balances";

export interface ITokenPrice {
  [index: string]: number;
}

const useBalances = () => {
  return {
    ...useContext(BalancesContext),
  };
};

export default useBalances;
