import React, { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { ITokenPrice } from "hooks/useBalances";
import useUbiq from "hooks/useUbiq";

import { getCoinBalanceAsBigNum, getBalanceAsBigNum, getTokenPrice, IReserves } from "utils";

import Context from "./Context";
import { AvailableFarms, INK, GRANS, UBQ, ESCH } from "farms/AvailableFarms";
import useUBQPriceOracle from "hooks/useUBQPriceOracle";

const BalancesProvider: React.FC = ({ children }) => {
  const [tokenBalances, settokenBalances] = useState<Array<BigNumber>>();
  const [LPBalances, setLPBalances] = useState<Array<BigNumber>>();

  const [UBQBalance, setUBQBalance] = useState<BigNumber>();
  const [INKBalance, setINKBalance] = useState<BigNumber>();
  const [GRANSBalance, setGRANSBalance] = useState<BigNumber>();
  const [ESCHBalance, setESCHBalance] = useState<BigNumber>();

  const [tokenPrices, setTokenPrices] = useState<ITokenPrice>();
  const [tokenReserves, setTokenReserves] = useState<Array<IReserves>>();

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

    let newTokenBalances = [];
    let newLpBalances = [];

    for (let i = 0; i < AvailableFarms.length; i++) {
      newTokenBalances.push(await getBalanceAsBigNum(ethereum, AvailableFarms[i].tokenB.address, account));
      newLpBalances.push(await getBalanceAsBigNum(ethereum, AvailableFarms[i].lp.address, account));
    }

    // set the shortcut balances
    let ubqBal = new BigNumber(await getCoinBalanceAsBigNum(ethereum, account)).plus(await getBalanceAsBigNum(ethereum, UBQ, account));
    let inkBal = await getBalanceAsBigNum(ethereum, INK, account);
    let gransBal = await getBalanceAsBigNum(ethereum, GRANS, account);
    let eschBal = await getBalanceAsBigNum(ethereum, ESCH, account);

    setUBQBalance(ubqBal);
    setINKBalance(inkBal);
    setGRANSBalance(gransBal);
    setESCHBalance(eschBal);
    settokenBalances(newTokenBalances);
    setLPBalances(newLpBalances);
  }, [settokenBalances, setLPBalances, setUBQBalance, setINKBalance, setGRANSBalance, account, ethereum]);

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
        LPBalances,
        UBQBalance,
        INKBalance,
        GRANSBalance,
        ESCHBalance,
        UBQoracle: oracle,
        tokenPrices,
        lpTokenReserves: tokenReserves,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default BalancesProvider;
