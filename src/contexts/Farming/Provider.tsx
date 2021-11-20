import React, { useCallback, useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";

import ConfirmTransactionModal from "components/ConfirmTransactionModal";

import useUbiq from "hooks/useUbiq";

import { AvailableFarms } from "farms/AvailableFarms";

import { getPoolTotalSupply, getEarned, getStaked, harvest, redeem, stake, unstake } from "ubiq-sdk/utils";
import Context from "./Context";

const Provider: React.FC = ({ children }) => {
  const updateStateAtIndex = useCallback(
    (ary: Array<number | boolean | BigNumber>, setFn: Function, value: number | boolean | BigNumber, index: number) => {
      ary[index] = value;
      setFn(ary);
    },
    []
  );

  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const ubiq = useUbiq();
  const { account } = useWallet();

  // TODO: create a class or function to generate an array of objects/properties for each farm
  const farmingStartTime = AvailableFarms.map((x) => {
    return x.yieldfarm.start_time;
  }); // UTC for INK+UBQ Yield Farming Start time

  const defaultAry = new Array(AvailableFarms.length).fill(false);

  const [countdown, setCountdown] = useState<Array<number>>([]); // countdown timer shown when farm is to start
  const [isHarvesting, setIsHarvesting] = useState<Array<boolean>>(defaultAry); // harvesting available token
  const [isRedeeming, setIsRedeeming] = useState<Array<boolean>>(defaultAry); // unstake and harvest all
  const [isStaking, setIsStaking] = useState<Array<boolean>>(defaultAry); // staking lp
  const [isUnstaking, setIsUnstaking] = useState<Array<boolean>>(defaultAry); // unstaking lp
  const [earnedBalances, setearnedBalances] = useState<Array<BigNumber>>();
  const [stakedBalances, setstakedBalances] = useState<Array<BigNumber>>();
  const [totalSupplyLP, settotalSupplyLP] = useState<Array<BigNumber>>();
  const [lpPercents, setlpPercents] = useState<Array<BigNumber>>();

  const fetchearnedBalances = useCallback(async () => {
    if (!account || !ubiq) return;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getEarned(ubiq.contracts.pools[i], account));
    }

    setearnedBalances(balances);
  }, [account, setearnedBalances, ubiq]);

  const fetchstakedBalances = useCallback(async () => {
    if (!account || !ubiq) return;

    let balances = [];
    for (let i = 0; i < AvailableFarms.length; i++) {
      balances.push(await getStaked(ubiq.contracts.pools[i], account));
    }
    setstakedBalances(balances);
  }, [account, setstakedBalances, ubiq]);

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

    settotalSupplyLP(totalSupply);
    setlpPercents(percents);
  }, [ubiq, account, setlpPercents]);

  const fetchBalances = useCallback(async () => {
    fetchearnedBalances();
    fetchstakedBalances();
    fetchTotalSupplyLP();
  }, [fetchearnedBalances, fetchstakedBalances, fetchTotalSupplyLP]);

  const handleHarvest = useCallback(
    async (contractIndex) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await harvest(ubiq, account, ubiq.contracts.pools[contractIndex], () => {
        setConfirmTxModalIsOpen(false);
        // setIsHarvesting([true]);
        updateStateAtIndex(isHarvesting, setIsHarvesting, true, contractIndex);
      }).catch((err) => {
        if (err.code === 4001) {
          console.log("Wallet: User cancelled");
        } else {
          console.log("Error caught:", err);
        }
      });
      // setIsHarvesting([false]);
      updateStateAtIndex(isHarvesting, setIsHarvesting, false, contractIndex);
    },
    [account, setConfirmTxModalIsOpen, setIsHarvesting, ubiq, isHarvesting, updateStateAtIndex]
  );

  const handleRedeem = useCallback(
    async (contractIndex: number) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await redeem(ubiq, account, ubiq.contracts.pools[contractIndex], () => {
        setConfirmTxModalIsOpen(false);
        // setIsRedeeming([true]);
        updateStateAtIndex(isRedeeming, setIsRedeeming, true, contractIndex);
      }).catch((err) => {
        if (err.code === 4001) {
          console.log("Wallet: User cancelled");
        } else {
          console.log("Error caught:", err);
        }
      });
      // setIsRedeeming([false]);
      updateStateAtIndex(isRedeeming, setIsRedeeming, false, contractIndex);
    },
    [account, setConfirmTxModalIsOpen, setIsRedeeming, ubiq, isRedeeming, updateStateAtIndex]
  );

  const handleStake = useCallback(
    async (contractIndex: number, amount: string) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await stake(ubiq, amount, account, ubiq.contracts.pools[contractIndex], () => {
        setConfirmTxModalIsOpen(false);
        // setIsStaking([true]);
        updateStateAtIndex(isStaking, setIsStaking, true, contractIndex);
      });
      updateStateAtIndex(isStaking, setIsStaking, false, contractIndex);
    },
    [account, setConfirmTxModalIsOpen, setIsStaking, ubiq, isStaking, updateStateAtIndex]
  );

  const handleUnstake = useCallback(
    async (contractIndex: number, amount: string) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await unstake(ubiq, amount, account, ubiq.contracts.pools[contractIndex], () => {
        setConfirmTxModalIsOpen(false);
        // setIsUnstaking([true]);
        updateStateAtIndex(isUnstaking, setIsUnstaking, true, contractIndex);
      });
      updateStateAtIndex(isUnstaking, setIsUnstaking, false, contractIndex);
    },
    [account, setConfirmTxModalIsOpen, setIsUnstaking, ubiq, isUnstaking, updateStateAtIndex]
  );

  useEffect(() => {
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchBalances]);

  useEffect(() => {
    let refreshInterval = setInterval(() => {
      let times = [];
      for (let i = 0; i < AvailableFarms.length; i++) {
        times.push(farmingStartTime[i] - Date.now());
      }
      setCountdown(times);
    }, 1000);
    return () => clearInterval(refreshInterval);
  }, [setCountdown, farmingStartTime]);

  return (
    <Context.Provider
      value={{
        farmingStartTime,
        countdown,
        isHarvesting,
        isRedeeming,
        isStaking,
        isUnstaking,

        onHarvest: handleHarvest,
        onRedeem: handleRedeem,
        onStake: handleStake,
        onUnstake: handleUnstake,
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
