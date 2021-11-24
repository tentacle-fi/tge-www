import React, { useCallback, useEffect, useState, useRef } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import useFarming from "hooks/useFarming";

import { getCurrentBlock, getCoinBalanceAsBigNum, getBalanceAsBigNum, getCurrentAPY, shouldUpdateVal, shouldUpdateAry } from "utils";

import Context from "./Context";
import { AvailableFarms, INK, GRANS, UBQ } from "farms/AvailableFarms";
import useUBQPriceOracle from "hooks/useUBQPriceOracle";

const BalancesProvider: React.FC = ({ children }) => {
  const [tokenBalances, settokenBalances] = useState<Array<BigNumber>>();
  const [LPBalances, setLPBalances] = useState<Array<BigNumber>>();

  const [UBQBalance, setUBQBalance] = useState<BigNumber>();
  const [INKBalance, setINKBalance] = useState<BigNumber>();
  const [GRANSBalance, setGRANSBalance] = useState<BigNumber>();

  const [CurrentBlock, setCurrentBlock] = useState("");
  const [CurrentAPY, setCurrentAPY] = useState("");
  const { account, ethereum } = useWallet();
  const { stakedBalances } = useFarming();

  const { oracle } = useUBQPriceOracle();

  const lastUpdate = useRef(0);

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
        newTokenBalances.push(await getBalanceAsBigNum(provider, AvailableFarms[i].tokenA.address, userAddress));
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
  //
  // useEffect(() => {
  //   if (account && ethereum) {
  //     fetchBalances(account, ethereum);
  //   }
  // }, [account, ethereum, fetchBalances]);

  const fetchCurrentAPY = useCallback(
    async (userAddress: string) => {
      const currentAPY = await getCurrentAPY(oracle, stakedBalances);
      console.log("currentAPY:", currentAPY);

      setCurrentAPY(currentAPY.toString());
    },
    [setCurrentAPY, oracle, stakedBalances]
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
        CurrentAPY,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default BalancesProvider;
