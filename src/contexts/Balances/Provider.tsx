import React, { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { ITokenPrice, ITokenBalance } from "hooks/useBalances";
import useUbiq from "hooks/useUbiq";

import { getCoinBalanceAsBigNum, getBalanceAsBigNum, getTokenPrice, IReserves } from "utils";

import Context from "./Context";
import { AvailableFarms, Tokens, INK, UBQ } from "farms/AvailableFarms";
import useUBQPriceOracle from "hooks/useUBQPriceOracle";

const BalancesProvider: React.FC = ({ children }) => {
  const [LPBalances, setLPBalances] = useState<Array<BigNumber>>();
  const [tokenReserves, setTokenReserves] = useState<Array<IReserves>>();

  const [tokenPrices, setTokenPrices] = useState<ITokenPrice>();
  const [tokenBalances, settokenBalances] = useState<ITokenBalance>();

  const { account, ethereum } = useWallet();
  const { oracle } = useUBQPriceOracle();
  const { BlockNum } = useUbiq();

  const fetchTokenPrices = useCallback(
    async (provider: provider) => {
      if (oracle === undefined) {
        return;
      }

      let prices = {} as ITokenPrice;
      let reserves = [] as Array<IReserves>;

      // set UBQ price first
      prices[UBQ] = oracle.price.usdt;

      for (let i = 0; i < AvailableFarms.length; i++) {
        try {
          const hasUBQ = AvailableFarms[i].tokenA.address === UBQ || AvailableFarms[i].tokenB.address === UBQ;
          const hasINK = AvailableFarms[i].tokenA.address === INK || AvailableFarms[i].tokenB.address === INK;

          const inverted = AvailableFarms[i].tokenA.address !== UBQ && AvailableFarms[i].tokenA.address !== INK;
          if (inverted && AvailableFarms[i].tokenB.address !== UBQ && AvailableFarms[i].tokenB.address !== INK) {
            throw new Error("Unable to price this token pair, requires an oracle token price first");
          }

          let oraclePrice = oracle.price.usdt; // UBQ
          if (!hasUBQ && hasINK && prices[INK] !== undefined) {
            oraclePrice = prices[INK];
          }

          const token: string = inverted ? AvailableFarms[i].tokenA.address : AvailableFarms[i].tokenB.address;
          const tokenPriceInfo = await getTokenPrice(provider, oraclePrice, AvailableFarms[i].lp.address, inverted);

          prices[token] = tokenPriceInfo.price;
          reserves.push(tokenPriceInfo.reserves);
        } catch (e) {
          console.error(e);
        }
      }

      setTokenPrices(prices);
      setTokenReserves(reserves);
    },
    [oracle, setTokenPrices, setTokenReserves]
  );

  const fetchBalances = useCallback(async () => {
    if (!account || !ethereum) {
      return;
    }

    let newTokenBalances = {} as ITokenBalance;
    let newLpBalances = [];

    for (let i = 0; i < AvailableFarms.length; i++) {
      newLpBalances.push(await getBalanceAsBigNum(ethereum, AvailableFarms[i].lp.address, account));
    }

    for (let i = 0; i < Tokens.length; i++) {
      // UBQ is special again as it's a Token and the main Currency for the network. as such, we want to add both balances together.
      // otherwise, just get the erc20 token balance
      if (Tokens[i].address === UBQ) {
        newTokenBalances[Tokens[i].address] = new BigNumber(await getCoinBalanceAsBigNum(ethereum, account)).plus(
          await getBalanceAsBigNum(ethereum, UBQ, account)
        );
      } else {
        newTokenBalances[Tokens[i].address] = await getBalanceAsBigNum(ethereum, Tokens[i].address, account);
      }
    }

    settokenBalances(newTokenBalances);
    setLPBalances(newLpBalances);
  }, [settokenBalances, setLPBalances, account, ethereum]);

  useEffect(() => {
    fetchBalances();
  }, [BlockNum, fetchBalances]);

  useEffect(() => {
    if (ethereum) {
      fetchTokenPrices(ethereum);
    }
  }, [ethereum, fetchTokenPrices]);

  return (
    <Context.Provider
      value={{
        tokenBalances,
        tokenPrices,
        LPBalances,
        lpTokenReserves: tokenReserves,
        UBQoracle: oracle,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default BalancesProvider;
