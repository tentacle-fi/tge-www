import React, { useCallback, useEffect, useState, useMemo } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import ConfirmTransactionModal from "components/ConfirmTransactionModal";
import useUbiq from "hooks/useUbiq";
import { AvailableFarms } from "farms/AvailableFarms";
import { getPoolTotalSupply, getEarned, getStaked } from "ubiq-sdk/utils";
import Context from "./Context";
import { shouldUpdateAry } from "utils";

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const ubiq = useUbiq();
  const { account } = useWallet();

  // TODO: create a class or function to generate an array of objects/properties for each farm
  const farmingStartTime = useMemo(() => {
    return AvailableFarms.map((x) => {
      return x.yieldfarm.start_time;
    });
  }, []); // UTC for INK+UBQ Yield Farming Start time

  const [countdown, setCountdown] = useState<Array<number>>([]); // countdown timer shown when farm is to start

  const [stakedBalances, setstakedBalances] = useState<Array<BigNumber>>();
  const [totalSupplyLP, settotalSupplyLP] = useState<Array<BigNumber>>();
  const [lpPercents, setlpPercents] = useState<Array<BigNumber>>();
  const [earnedBalances, setearnedBalances] = useState<Array<BigNumber>>();

  const fetchearnedBalances = useCallback(async () => {
    if (!account || !ubiq) return;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getEarned(ubiq.contracts.pools[i], account));
    }

    if (shouldUpdateAry(balances, earnedBalances, "BigNumber")) {
      setearnedBalances(balances);
    }
  }, [account, earnedBalances, setearnedBalances, ubiq]);

  const fetchstakedBalances = useCallback(async () => {
    if (!account || !ubiq) return;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getStaked(ubiq.contracts.pools[i], account));
    }

    if (shouldUpdateAry(balances, stakedBalances, "BigNumber")) {
      setstakedBalances(balances);
    }
  }, [account, stakedBalances, setstakedBalances, ubiq]);

  const fetchTotalSupplyLP = useCallback(async () => {
    if (!account || !ubiq) return;

    let percents = [];
    let totalSupply = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      const bigTotalSupply = new BigNumber(await getPoolTotalSupply(ubiq.contracts.pools[i]));
      const stakedLpSupply = new BigNumber(await getStaked(ubiq.contracts.pools[i], account));

      let lpPercent = new BigNumber(0);

      if (stakedLpSupply !== undefined) {
        lpPercent = stakedLpSupply.div(bigTotalSupply);
      }

      percents.push(lpPercent);
      totalSupply.push(bigTotalSupply);
    }

    if (shouldUpdateAry(totalSupply, totalSupplyLP, "BigNumber")) {
      settotalSupplyLP(totalSupply);
    }

    if (shouldUpdateAry(percents, lpPercents, "BigNumber")) {
      setlpPercents(percents);
    }
  }, [ubiq, account, totalSupplyLP, lpPercents, setlpPercents]);

  const fetchBalances = useCallback(async () => {
    fetchearnedBalances();
    fetchstakedBalances();
    fetchTotalSupplyLP();
  }, [fetchearnedBalances, fetchstakedBalances, fetchTotalSupplyLP]);

  useEffect(() => {
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchBalances]);

  // shut off until issue#9 is fixed
  // useEffect(() => {
  //   let refreshInterval = setInterval(() => {
  //     let times = [];
  //     for (let i = 0; i < AvailableFarms.length; i++) {
  //       times.push(farmingStartTime[i] - Date.now());
  //     }
  //     setCountdown(times);
  //   }, 1000);
  //   return () => clearInterval(refreshInterval);
  // }, [setCountdown, farmingStartTime]);

  return (
    <Context.Provider
      value={{
        farmingStartTime,
        countdown,
        setConfirmTxModalIsOpen: setConfirmTxModalIsOpen,
        earnedBalances,
        stakedBalances,
        totalSupplyLP,
        lpPercents,
      }}
    >
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default Provider;
