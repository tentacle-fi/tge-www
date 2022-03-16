import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import useUbiq from "hooks/useUbiq";
import { AvailableFarms } from "farms/AvailableFarms";
import { getPoolTotalSupply, getEarned, getStaked } from "ubiq-sdk/utils";
import Context from "./Context";
import { getCurrentStats, getInkTotalSupply } from "utils";
import useBalances from "hooks/useBalances";
import { IPooledTokens, IFarmingFns } from "hooks/useFarming";

const Provider: React.FC = ({ children }) => {
  const { ubiq, BlockNum } = useUbiq();
  const { account, ethereum } = useWallet();
  const { lpTokenReserves, tokenPrices } = useBalances();
  const [CurrentAPY, setCurrentAPY] = useState<Array<number>>();
  const [CurrentAPR, setCurrentAPR] = useState<Array<number>>();
  const [CurrentTVL, setCurrentTVL] = useState<Array<number>>();
  const [PooledTokens, setPooledTokens] = useState<Array<IPooledTokens>>();

  const [stakedBalances, setstakedBalances] = useState<Array<BigNumber>>();
  const [totalFarmSupplyLP, settotalFarmSupplyLP] = useState<Array<BigNumber>>();
  const [lpPercents, setlpPercents] = useState<Array<BigNumber>>();
  const [farmPoolRatios, setFarmPoolRatios] = useState<Array<BigNumber>>();
  const [earnedBalances, setearnedBalances] = useState<Array<BigNumber>>();
  const [FarmPooledTokens, setFarmPooledTokens] = useState<Array<IPooledTokens>>();
  const [farmFns, setFarmFns] = useState<IFarmingFns | undefined>();
  const [inkTotalSupply, setInkTotalSupply] = useState<number>(0);

  const fetchedEarnedBalancesThisBlock = useRef(false);
  const fetchedStakedBalancesThisBlock = useRef(false);
  const fetchedTotalSupplyLPThisBlock = useRef(false);
  const fetchedStatsThisBlock = useRef(false);
  const setupPooledTokensThisBlock = useRef(false);

  const farmingStartTimes = useMemo(() => {
    return AvailableFarms.map((x) => {
      return x.yieldfarm.start_time;
    });
  }, []);

  const fetchearnedBalances = useCallback(async () => {
    if (!account || !ubiq) return;
    if (fetchedEarnedBalancesThisBlock.current) return;
    fetchedEarnedBalancesThisBlock.current = true;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getEarned(ubiq.contracts.pools[i], account));
    }

    setearnedBalances(balances);
  }, [setearnedBalances, account, ubiq]);

  const fetchstakedBalances = useCallback(async () => {
    if (!account || !ubiq) return;
    if (fetchedStakedBalancesThisBlock.current) return;
    fetchedStakedBalancesThisBlock.current = true;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getStaked(ubiq.contracts.pools[i], account));
    }

    setstakedBalances(balances);
  }, [setstakedBalances, account, ubiq]);

  const fetchTotalSupplyLP = useCallback(async () => {
    if (!account || !ubiq) return;
    if (fetchedTotalSupplyLPThisBlock.current) return;
    fetchedTotalSupplyLPThisBlock.current = true;

    let farmToPoolLPRatios = [];
    let userLpPercents = [];
    let farmTotalSupply = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      const bigLPTotalSupply = new BigNumber(await getPoolTotalSupply(ubiq.contracts.lps[i]));

      // get the Farm Contract lP Total tokens
      const bigFarmTotalSupply = new BigNumber(await getPoolTotalSupply(ubiq.contracts.pools[i]));
      const stakedLpSupply = new BigNumber(await getStaked(ubiq.contracts.pools[i], account));

      let lpPercent = new BigNumber(0);

      if (stakedLpSupply !== undefined) {
        lpPercent = stakedLpSupply.div(bigFarmTotalSupply);
      }

      let farmLPratio = new BigNumber(0);

      if (bigLPTotalSupply !== undefined && bigFarmTotalSupply !== undefined) {
        farmLPratio = bigFarmTotalSupply.div(bigLPTotalSupply);
      }

      userLpPercents.push(lpPercent);
      farmTotalSupply.push(bigFarmTotalSupply);
      farmToPoolLPRatios.push(farmLPratio);

      // DEBUG:
      // console.log("===")
      // console.log('farm', AvailableFarms[i].name)
      // console.log("bigFarmTotalSupply", bigFarmTotalSupply.toString())
      // console.log("bigLPTotalSupply  ", bigLPTotalSupply.toString())
      // console.log('farmLPratio', farmLPratio.toNumber())
    }

    settotalFarmSupplyLP(farmTotalSupply);
    setlpPercents(userLpPercents);
    setFarmPoolRatios(farmToPoolLPRatios);
  }, [setFarmPoolRatios, settotalFarmSupplyLP, setlpPercents, account, ubiq]);

  const fetchCurrentStats = useCallback(async () => {
    if (
      lpPercents === undefined ||
      totalFarmSupplyLP === undefined ||
      lpTokenReserves === undefined ||
      tokenPrices === undefined ||
      farmPoolRatios === undefined
    ) {
      return;
    }
    if (fetchedStatsThisBlock.current) return;
    fetchedStatsThisBlock.current = true;

    let apyAry = [];
    let aprAry = [];
    let tvlAry = [];
    let pooledInFarm = [];

    for (let i = 0; i < AvailableFarms.length; i++) {
      try {
        const token0Price = tokenPrices[AvailableFarms[i].tokenA.address];
        const token1Price = tokenPrices[AvailableFarms[i].tokenB.address];
        const rewardTokenPrice = tokenPrices[AvailableFarms[i].yieldfarm.reward.address];

        const stats = await getCurrentStats(
          ethereum,
          token0Price,
          token1Price,
          rewardTokenPrice,
          lpTokenReserves[i],
          AvailableFarms[i].lp.address,
          AvailableFarms[i].yieldfarm.address,
          totalFarmSupplyLP[i], // farm contract total LP tokens supplied
          lpPercents[i], // user address percent of LP tokens staked
          farmPoolRatios[i]
        );

        apyAry.push(isNaN(stats.farmApy) ? 0 : stats.farmApy);
        aprAry.push(isNaN(stats.farmApr) ? 0 : stats.farmApr);
        tvlAry.push(stats.farmTvl);
        pooledInFarm.push(stats.accountPooledTokens);
      } catch (e) {
        console.error("fetchCurrentStats error", e);

        apyAry.push(0);
        aprAry.push(0);
        tvlAry.push(0);
        pooledInFarm.push({
          token0: 0,
          token1: 0,
        } as IPooledTokens);
      }
    }

    setCurrentAPY(apyAry);
    setCurrentAPR(aprAry);
    setCurrentTVL(tvlAry);
    setFarmPooledTokens(pooledInFarm);
  }, [ethereum, lpTokenReserves, tokenPrices, lpPercents, totalFarmSupplyLP, farmPoolRatios]);

  const setupPooledTokens = useCallback(() => {
    if (lpPercents === undefined || FarmPooledTokens === undefined) {
      return;
    }
    if (setupPooledTokensThisBlock.current) return;
    setupPooledTokensThisBlock.current = true;

    let pooledTokens: Array<IPooledTokens> = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      if (lpPercents[i].toNumber() > 0 && FarmPooledTokens[i].token0 > 0 && FarmPooledTokens[i].token1 > 0) {
        pooledTokens.push({
          token0: FarmPooledTokens[i].token0,
          token1: FarmPooledTokens[i].token1,
        });
      } else {
        pooledTokens.push({
          token0: 0,
          token1: 0,
        });
      }
    }

    setPooledTokens(pooledTokens);
  }, [lpPercents, FarmPooledTokens]);

  const fetchBalances = useCallback(async () => {
    await fetchearnedBalances();
    await fetchstakedBalances();
    await fetchTotalSupplyLP();
    await fetchCurrentStats();
    setupPooledTokens();
  }, [fetchCurrentStats, fetchTotalSupplyLP, fetchearnedBalances, fetchstakedBalances, setupPooledTokens]);

  const fetchInkTotalSupply = useCallback(
    async (provider) => {
      if (!provider) {
        return;
      }

      setInkTotalSupply(await getInkTotalSupply(provider));
    },
    [setInkTotalSupply]
  );

  useEffect(() => {
    fetchedEarnedBalancesThisBlock.current = false;
    fetchedStakedBalancesThisBlock.current = false;
    fetchedTotalSupplyLPThisBlock.current = false;
    fetchedStatsThisBlock.current = false;
    setupPooledTokensThisBlock.current = false;
  }, [BlockNum]);

  useEffect(() => {
    fetchBalances();
  }, [BlockNum, fetchBalances]);

  useEffect(() => {
    if (!ethereum) {
      return;
    }
    fetchInkTotalSupply(ethereum);
  }, [ethereum, fetchInkTotalSupply]);

  return (
    <Context.Provider
      value={{
        farmingStartTimes,
        earnedBalances,
        stakedBalances,
        totalFarmSupplyLP,
        lpPercents,
        currentApy: CurrentAPY,
        currentApr: CurrentAPR,
        currentTvl: CurrentTVL,
        PooledTokens: PooledTokens,
        farmFns,
        setFarmFns,
        inkTotalSupply,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Provider;
