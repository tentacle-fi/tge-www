import React, { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import useFarming from "hooks/useFarming";

import { getCurrentBlock, getCoinBalanceAsBigNum, getBalanceAsBigNum, getCurrentAPY } from "utils";

import Context from "./Context";

import { AvailableFarms, INK, GRANS, UBQ } from "farms/AvailableFarms";

import useUBQPriceOracle from "hooks/useUBQPriceOracle";

const Provider: React.FC = ({ children }) => {
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

  const fetchBalances = useCallback(
    async (userAddress: string, provider: provider) => {
      let tokenBalances = [];
      let lpBalances = [];

      for (let i = 0; i < AvailableFarms.length; i++) {
        tokenBalances.push(await getBalanceAsBigNum(provider, AvailableFarms[i].tokenA.address, userAddress));
        lpBalances.push(await getBalanceAsBigNum(provider, AvailableFarms[i].lp.address, userAddress));
      }

      // set the shortcut balances
      setUBQBalance(new BigNumber(await getCoinBalanceAsBigNum(provider, userAddress)).plus(await getBalanceAsBigNum(provider, UBQ, userAddress)));
      setINKBalance(await getBalanceAsBigNum(provider, INK, userAddress));
      setGRANSBalance(await getBalanceAsBigNum(provider, GRANS, userAddress));

      settokenBalances(tokenBalances);
      setLPBalances(lpBalances);
    },
    [settokenBalances, setLPBalances, setUBQBalance, setINKBalance, setGRANSBalance]
  );

  const fetchCurrentBlock = useCallback(
    async (userAddress: string, provider: provider) => {
      const currentBlock = await getCurrentBlock(provider);

      setCurrentBlock(currentBlock.toString());
    },
    [setCurrentBlock]
  );

  const fetchCurrentAPY = useCallback(
    async (userAddress: string) => {
      const currentAPY = await getCurrentAPY(oracle, stakedBalances);
      console.log('currentAPY:', currentAPY)

      setCurrentAPY(currentAPY.toString());
    },
    [setCurrentAPY, oracle, stakedBalances]
  );

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum);
    }
  }, [account, ethereum, fetchBalances]);

  // shut off until issue#9 is fixed
  // useEffect(() => {
  //   if (account && ethereum) {
  //     fetchBalances(account, ethereum);
  //     fetchCurrentBlock(account, ethereum);
  //
  //     let refreshInterval = setInterval(() => {
  //       fetchCurrentBlock(account, ethereum);
  //       fetchBalances(account, ethereum);
  //     }, 10000);
  //     return () => clearInterval(refreshInterval);
  //   }
  // }, [account, ethereum, fetchBalances, fetchCurrentBlock]);

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
        CurrentAPY
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Provider;
