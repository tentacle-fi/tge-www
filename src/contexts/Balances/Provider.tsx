import React, { useCallback, useEffect, useState, useRef } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { ITokenPrice } from "hooks/useBalances";

import { getCurrentBlock, getCoinBalanceAsBigNum, getBalanceAsBigNum, shouldUpdateVal, shouldUpdateAry, getTokenPrice, IReserves } from "utils";

import Context from "./Context";
import { AvailableFarms, INK, GRANS, UBQ } from "farms/AvailableFarms";
import useUBQPriceOracle from "hooks/useUBQPriceOracle";

const BalancesProvider: React.FC = ({ children }) => {
  const [tokenBalances, settokenBalances] = useState<Array<BigNumber>>();
  const [LPBalances, setLPBalances] = useState<Array<BigNumber>>();

  const [UBQBalance, setUBQBalance] = useState<BigNumber>();
  const [INKBalance, setINKBalance] = useState<BigNumber>();
  const [GRANSBalance, setGRANSBalance] = useState<BigNumber>();

  const [tokenPrices, setTokenPrices] = useState<ITokenPrice>();
  const [tokenReserves, setTokenReserves] = useState<Array<IReserves>>();

  const [CurrentBlock, setCurrentBlock] = useState("");

  const { account, ethereum } = useWallet();
  const { oracle } = useUBQPriceOracle();

  const lastUpdate = useRef(0);

  const fetchTokenPrices = useCallback(
    async (provider: provider) => {
      if (oracle === undefined) {
        return;
      }

      let prices = {} as ITokenPrice;
      let reserves = [] as Array<IReserves>;
      let update = false;

      // set UBQ price first
      prices[UBQ] = oracle.price.usdt;

      for (let i = 0; i < AvailableFarms.length; i++) {
        try {
          const inverted = AvailableFarms[i].tokenA.address !== UBQ;
          if (inverted && AvailableFarms[i].tokenB.address !== UBQ) {
            // TODO: implement price estimates for non-ubq involved pairs
            throw new Error("Unable to price this token pair, requires an oracle token price first");
          }

          const token: string = inverted ? AvailableFarms[i].tokenA.address : AvailableFarms[i].tokenB.address;
          const tokenPriceInfo = await getTokenPrice(provider, oracle.price.usdt, AvailableFarms[i].lp.address, inverted);

          prices[token] = tokenPriceInfo.price;
          reserves.push(tokenPriceInfo.reserves);

          if (tokenPrices === undefined || prices[token] !== tokenPrices[token]) {
            update = true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (update) {
        setTokenPrices(prices);
        setTokenReserves(reserves);
      }
    },
    [oracle, setTokenPrices, tokenPrices, setTokenReserves]
  );

  const fetchBalances = useCallback(
    async (userAddress: string, provider: provider) => {
      // limit how often this function can be called
      if (Date.now() - lastUpdate.current < 9 * 1000) {
        return;
      }
      lastUpdate.current = Date.now();

      let newTokenBalances = [];
      let newLpBalances = [];

      for (let i = 0; i < AvailableFarms.length; i++) {
        newTokenBalances.push(await getBalanceAsBigNum(provider, AvailableFarms[i].tokenB.address, userAddress));
        newLpBalances.push(await getBalanceAsBigNum(provider, AvailableFarms[i].lp.address, userAddress));
      }

      // set the shortcut balances
      let ubqBal = new BigNumber(await getCoinBalanceAsBigNum(provider, userAddress)).plus(await getBalanceAsBigNum(provider, UBQ, userAddress));
      let inkBal = await getBalanceAsBigNum(provider, INK, userAddress);
      let gransBal = await getBalanceAsBigNum(provider, GRANS, userAddress);

      if (shouldUpdateVal(ubqBal, UBQBalance, "BigNumber")) {
        setUBQBalance(ubqBal);
      }

      if (shouldUpdateVal(inkBal, INKBalance, "BigNumber")) {
        setINKBalance(inkBal);
      }

      if (shouldUpdateVal(gransBal, GRANSBalance, "BigNumber")) {
        setGRANSBalance(gransBal);
      }

      if (shouldUpdateAry(newTokenBalances, tokenBalances, "BigNumber")) {
        settokenBalances(newTokenBalances);
      }

      if (shouldUpdateAry(newLpBalances, LPBalances, "BigNumber")) {
        setLPBalances(newLpBalances);
      }
    },
    [tokenBalances, settokenBalances, LPBalances, setLPBalances, setUBQBalance, setINKBalance, setGRANSBalance, UBQBalance, INKBalance, GRANSBalance]
  );

  const fetchCurrentBlock = useCallback(
    async (userAddress: string, provider: provider) => {
      const currentBlock = await getCurrentBlock(provider);

      setCurrentBlock(currentBlock.toString());
    },
    [setCurrentBlock]
  );

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum);
      fetchCurrentBlock(account, ethereum);

      let refreshInterval = setInterval(() => {
        fetchCurrentBlock(account, ethereum);
        fetchBalances(account, ethereum);
      }, 10000);
      return () => clearInterval(refreshInterval);
    }
  }, [account, ethereum, fetchBalances, fetchCurrentBlock]);

  useEffect(() => {
    if (ethereum) {
      fetchTokenPrices(ethereum);

      let refreshInterval = setInterval(() => {
        fetchTokenPrices(ethereum);
      }, 10 * 60 * 1000);
      return () => clearInterval(refreshInterval);
    }
  }, [ethereum, fetchTokenPrices]);

  return (
    <Context.Provider
      value={{
        tokenBalances,
        LPBalances,
        CurrentBlock,
        UBQBalance,
        INKBalance,
        GRANSBalance,
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
