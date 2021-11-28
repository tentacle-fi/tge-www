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
import { IPooledTokens } from "hooks/useFarming";

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const ubiq = useUbiq();
  const { account, ethereum } = useWallet();
  const { UBQoracle, lpTokenReserves, tokenPrices } = useBalances();
  const [CurrentAPY, setCurrentAPY] = useState<Array<number>>();
  const [CurrentTVL, setCurrentTVL] = useState<Array<number>>();
  const [PooledTokens, setPooledTokens] = useState<Array<IPooledTokens>>();

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
    console.log("fetchCurrentStats");
    if (
      UBQoracle === undefined ||
      totalSupplyLP === undefined ||
      tokenPrices === undefined ||
      lpTokenReserves === undefined ||
      lpPercents === undefined
    ) {
      return;
    }

    let apyAry = [];
    let tvlAry = [];
    let pooledTokens: Array<IPooledTokens> = [];
    try {
      for (let i = 0; i < AvailableFarms.length; i++) {
        try {
          const token0Price = tokenPrices[AvailableFarms[i].tokenA.address];
          const token1Price = tokenPrices[AvailableFarms[i].tokenB.address];

          const stats = await getCurrentStats(
            ethereum,
            token0Price,
            token1Price,
            lpTokenReserves[i],
            AvailableFarms[i].lp.address,
            AvailableFarms[i].yieldfarm.address,
            totalSupplyLP[i]
          );

          apyAry.push(stats.farmApy);
          tvlAry.push(stats.farmTvl);

          pooledTokens.push({
            token0: lpPercents[i].toNumber() * lpTokenReserves[i].token0,
            token1: lpPercents[i].toNumber() * lpTokenReserves[i].token1,
          });
        } catch (e) {
          console.error("fetchCurrentStats error", e);
        }
      }

      setPooledTokens(pooledTokens);
      setCurrentAPY(apyAry);
      setCurrentTVL(tvlAry);
    } catch (e) {
      console.error("fetchCurrentStats");
    }
  }, [setCurrentAPY, UBQoracle, totalSupplyLP, ethereum, lpPercents, setPooledTokens, tokenPrices, lpTokenReserves]);

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

  useEffect(() => {
    fetchCurrentStats();
    let refreshInterval = setInterval(() => fetchCurrentStats(), 1 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchCurrentStats]);

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
        PooledTokens: PooledTokens,
      }}
    >
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default Provider;
