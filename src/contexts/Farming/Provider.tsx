import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import ConfirmTransactionModal from "components/ConfirmTransactionModal";
import useUbiq from "hooks/useUbiq";
import { AvailableFarms } from "farms/AvailableFarms";
import { getPoolTotalSupply, getEarned, getStaked } from "ubiq-sdk/utils";
import Context from "./Context";
import { getCurrentStats } from "utils";
import useBalances from "hooks/useBalances";
import { IPooledTokens } from "hooks/useFarming";

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const [confirmTxModalMessage, setConfirmTxModalMessage] = useState("");
  const { ubiq, BlockNum } = useUbiq();
  const { account, ethereum } = useWallet();
  const { lpTokenReserves, tokenPrices } = useBalances();
  const [CurrentAPY, setCurrentAPY] = useState<Array<number>>();
  const [CurrentTVL, setCurrentTVL] = useState<Array<number>>();
  const [PooledTokens, setPooledTokens] = useState<Array<IPooledTokens>>();

  const farmingStartTimes = useMemo(() => {
    return AvailableFarms.map((x) => {
      return x.yieldfarm.start_time;
    });
  }, []);

  const [stakedBalances, setstakedBalances] = useState<Array<BigNumber>>();
  const [totalSupplyLP, settotalSupplyLP] = useState<Array<BigNumber>>();
  const [lpPercents, setlpPercents] = useState<Array<BigNumber>>();
  const [earnedBalances, setearnedBalances] = useState<Array<BigNumber>>();

  const fetchedEarnedBalancesThisBlock = useRef(false);
  const fetchedStakedBalancesThisBlock = useRef(false);
  const fetchedTotalSupplyLPThisBlock = useRef(false);
  const fetchedStatsThisBlock = useRef(false);
  const setupPooledTokensThisBlock = useRef(false);

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

    settotalSupplyLP(totalSupply);

    setlpPercents(percents);
  }, [settotalSupplyLP, setlpPercents, account, ubiq]);

  const fetchCurrentStats = useCallback(async () => {
    if (totalSupplyLP === undefined || lpTokenReserves === undefined || tokenPrices === undefined) {
      return;
    }
    if (fetchedStatsThisBlock.current) return;
    fetchedStatsThisBlock.current = true;

    let apyAry = [];
    let tvlAry = [];

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
          totalSupplyLP[i]
        );

        apyAry.push(isNaN(stats.farmApy) ? 0 : stats.farmApy);
        tvlAry.push(stats.farmTvl);
      } catch (e) {
        console.error("fetchCurrentStats error", e);

        apyAry.push(0);
        tvlAry.push(0);
      }
    }

    setCurrentAPY(apyAry);
    setCurrentTVL(tvlAry);
  }, [ethereum, lpTokenReserves, tokenPrices, totalSupplyLP]);

  const setupPooledTokens = useCallback(() => {
    if (lpPercents === undefined || lpTokenReserves === undefined) {
      return;
    }
    if (setupPooledTokensThisBlock.current) return;
    setupPooledTokensThisBlock.current = true;

    let pooledTokens: Array<IPooledTokens> = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      if (lpPercents[i].toNumber() > 0 && lpTokenReserves[i].token0 > 0 && lpTokenReserves[i].token1 > 0) {
        pooledTokens.push({
          token0: lpPercents[i].toNumber() * lpTokenReserves[i].token0,
          token1: lpPercents[i].toNumber() * lpTokenReserves[i].token1,
        });
      } else {
        pooledTokens.push({
          token0: 0,
          token1: 0,
        });
      }
    }

    setPooledTokens(pooledTokens);
  }, [lpPercents, lpTokenReserves]);

  const fetchBalances = useCallback(async () => {
    await fetchearnedBalances();
    await fetchstakedBalances();
    await fetchTotalSupplyLP();
    await fetchCurrentStats();
    setupPooledTokens();
  }, [fetchCurrentStats, fetchTotalSupplyLP, fetchearnedBalances, fetchstakedBalances, setupPooledTokens]);

  const customTxModal = useCallback(async (isOpen: boolean, message?: string) => {
    if (isOpen === true) {
      setConfirmTxModalIsOpen(true);
      if (message !== undefined) {
        setConfirmTxModalMessage(message);
      }
    } else {
      // reset
      setConfirmTxModalIsOpen(false);
      setConfirmTxModalMessage("");
    }
  }, []);

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

  return (
    <Context.Provider
      value={{
        farmingStartTimes,
        setConfirmModal: customTxModal,
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
      <ConfirmTransactionModal message={confirmTxModalMessage} isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default Provider;
