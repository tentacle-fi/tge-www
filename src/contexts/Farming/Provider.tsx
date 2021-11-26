import React, { useCallback, useEffect, useState, useMemo } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import ConfirmTransactionModal from "components/ConfirmTransactionModal";
import useUbiq from "hooks/useUbiq";
import { AvailableFarms } from "farms/AvailableFarms";
import { getPoolTotalSupply, getEarned, getStaked } from "ubiq-sdk/utils";
import Context from "./Context";
import { shouldUpdateAry, getCurrentStats } from "utils";
import useBalances from "hooks/useBalances";

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const ubiq = useUbiq();
  const { account, ethereum } = useWallet();
  const { UBQoracle } = useBalances();
  const [CurrentAPY, setCurrentAPY] = useState(0);
  const [CurrentTVL, setCurrentTVL] = useState(0);
  const [INKoracle, setINKoracle] = useState(0);
  const [PooledTokens, setPooledTokens] = useState({ token0: 0, token1: 0 });

  // TODO: create a class or function to generate an array of objects/properties for each farm
  const farmingStartTime = useMemo(() => {
    return AvailableFarms.map((x) => {
      return x.yieldfarm.start_time;
    });
  }, []); // UTC for INK+UBQ Yield Farming Start time

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

  const fetchCurrentStats = useCallback(async () => {
    if (UBQoracle === undefined || totalSupplyLP === undefined) {
      return;
    }
    if (CurrentAPY !== 0) {
      return;
    }
    try {
      // TODO: make generic to calc for all pools in AvailableFarms
      const stats = await getCurrentStats(ethereum, UBQoracle, totalSupplyLP[0]);

      setCurrentAPY(stats.apy);
      setCurrentTVL(stats.tvl);
      setINKoracle(stats.inkPrice);

      if (lpPercents !== undefined) {
        const myPoolTokens = {
          token0: lpPercents[0].toNumber() * stats.reserves.token0,
          token1: lpPercents[0].toNumber() * stats.reserves.token1,
        };

        if (PooledTokens.token0 !== myPoolTokens.token0 || PooledTokens.token1 !== myPoolTokens.token1) {
          setPooledTokens(myPoolTokens);
        }
      }
    } catch (e) {
      console.error("fetchCurrentStats");
    }
  }, [setCurrentAPY, UBQoracle, totalSupplyLP, CurrentAPY, ethereum, lpPercents, PooledTokens, setPooledTokens]);

  const fetchBalances = useCallback(async () => {
    fetchearnedBalances();
    fetchstakedBalances();
    fetchTotalSupplyLP();
    fetchCurrentStats();
  }, [fetchearnedBalances, fetchstakedBalances, fetchTotalSupplyLP, fetchCurrentStats]);

  useEffect(() => {
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchBalances]);

  return (
    <Context.Provider
      value={{
        farmingStartTime,
        setConfirmTxModalIsOpen: setConfirmTxModalIsOpen,
        earnedBalances,
        stakedBalances,
        totalSupplyLP,
        lpPercents,
        currentApy: CurrentAPY,
        currentTvl: CurrentTVL,
        inkPrice: INKoracle,
        PooledTokens: PooledTokens,
      }}
    >
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default Provider;
