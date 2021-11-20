import React, { useCallback, useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";

import ConfirmTransactionModal from "components/ConfirmTransactionModal";
import { ESCHUBQSLPAddress } from "constants/tokenAddresses";
import useApproval from "hooks/useApproval";
import useUbiq from "hooks/useUbiq";

import { getPoolTotalSupply, getEarned, getStaked, harvest, redeem, stake, unstake } from "ubiq-sdk/utils";
import Context from "./Context";

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const ubiq = useUbiq();
  const { account } = useWallet();

  // TODO: create a class or function to generate an array of objects/properties for each farm
  const farmingStartTime = 1637006400 * 1000; // UTC for INK+UBQ Yield Farming Start time
  const [countdown, setCountdown] = useState<number>(); // countdown timer shown when farm is to start
  const [isHarvesting, setIsHarvesting] = useState(false); // harvesting available token
  const [isRedeeming, setIsRedeeming] = useState(false); // unstake and harvest all
  const [isStaking, setIsStaking] = useState(false); // staking lp
  const [isUnstaking, setIsUnstaking] = useState(false); // unstaking lp

  const [earnedBalances, setearnedBalances] = useState<Array<BigNumber>>();

  const [stakedBalanceESCHUBQ, setstakedBalanceESCHUBQ] = useState<BigNumber>();
  const [totalSupplyESCHUBQ, settotalSupplyESCHUBQ] = useState<BigNumber>();
  const [lpPercentESCHUBQ, setlpPercentESCHUBQ] = useState<BigNumber>();
  const ESCHUBQPoolAddress = ubiq ? ubiq.contracts.shinobi_pool.options.address : "";
  const { isApproved, isApproving, onApprove } = useApproval(ESCHUBQSLPAddress, ESCHUBQPoolAddress, () => setConfirmTxModalIsOpen(false));

  const fetchearnedBalances = useCallback(async () => {
    if (!account || !ubiq) return;
    const balance = await getEarned(ubiq.contracts.shinobi_pool, account);
    setearnedBalances([balance]);
  }, [account, setearnedBalances, ubiq]);

  const fetchstakedBalanceESCHUBQ = useCallback(async () => {
    if (!account || !ubiq) return;
    const balance = await getStaked(ubiq.contracts.shinobi_pool, account);
    setstakedBalanceESCHUBQ(balance);
  }, [account, setstakedBalanceESCHUBQ, ubiq]);

  const fetchTotalSupplyESCHUBQ = useCallback(async () => {
    if (!account || !ubiq) return;
    const bigTotalSupply = new BigNumber(await getPoolTotalSupply(ubiq.contracts.shinobi_pool));
    const stakedLpSupply = new BigNumber(await getStaked(ubiq.contracts.shinobi_pool, account));

    let lpPercent = new BigNumber(0);

    if (stakedLpSupply !== undefined) {
      lpPercent = stakedLpSupply.div(bigTotalSupply);
    }

    settotalSupplyESCHUBQ(bigTotalSupply);
    setlpPercentESCHUBQ(lpPercent);
  }, [ubiq, account]);

  const fetchBalances = useCallback(async () => {
    fetchearnedBalances();
    fetchstakedBalanceESCHUBQ();
    fetchTotalSupplyESCHUBQ();
  }, [fetchearnedBalances, fetchstakedBalanceESCHUBQ, fetchTotalSupplyESCHUBQ]);

  const handleApprove = useCallback(() => {
    setConfirmTxModalIsOpen(true);
    onApprove();
  }, [onApprove, setConfirmTxModalIsOpen]);

  const handleHarvestESCHUBQ = useCallback(async () => {
    if (!ubiq) return;
    setConfirmTxModalIsOpen(true);
    await harvest(ubiq, account, ubiq.contracts.shinobi_pool, () => {
      setConfirmTxModalIsOpen(false);
      setIsHarvesting(true);
    }).catch((err) => {
      if (err.code === 4001) {
        console.log("Wallet: User cancelled");
      } else {
        console.log("Error caught:", err);
      }
    });
    setIsHarvesting(false);
  }, [account, setConfirmTxModalIsOpen, setIsHarvesting, ubiq]);

  const handleRedeemESCHUBQ = useCallback(async () => {
    if (!ubiq) return;
    setConfirmTxModalIsOpen(true);
    await redeem(ubiq, account, ubiq.contracts.shinobi_pool, () => {
      setConfirmTxModalIsOpen(false);
      setIsRedeeming(true);
    }).catch((err) => {
      if (err.code === 4001) {
        console.log("Wallet: User cancelled");
      } else {
        console.log("Error caught:", err);
      }
    });
    setIsRedeeming(false);
  }, [account, setConfirmTxModalIsOpen, setIsRedeeming, ubiq]);

  const handleStakeESCHUBQ = useCallback(
    async (amount: string) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await stake(ubiq, amount, account, ubiq.contracts.shinobi_pool, () => {
        setConfirmTxModalIsOpen(false);
        setIsStaking(true);
      });
      setIsStaking(false);
    },
    [account, setConfirmTxModalIsOpen, setIsStaking, ubiq]
  );

  const handleUnstakeESCHUBQ = useCallback(
    async (amount: string) => {
      if (!ubiq) return;
      setConfirmTxModalIsOpen(true);
      await unstake(ubiq, amount, account, ubiq.contracts.shinobi_pool, () => {
        setConfirmTxModalIsOpen(false);
        setIsUnstaking(true);
      });
      setIsUnstaking(false);
    },
    [account, setConfirmTxModalIsOpen, setIsUnstaking, ubiq]
  );

  useEffect(() => {
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), 10000);
    return () => clearInterval(refreshInterval);
  }, [fetchBalances]);

  useEffect(() => {
    let refreshInterval = setInterval(() => setCountdown(farmingStartTime - Date.now()), 1000);
    return () => clearInterval(refreshInterval);
  }, [setCountdown, farmingStartTime]);

  return (
    <Context.Provider
      value={{
        farmingStartTime,
        countdown,
        isApproved,
        isApproving,
        isHarvesting,
        isRedeeming,
        isStaking,
        isUnstaking,
        onApprove: handleApprove,
        onHarvestESCHUBQ: handleHarvestESCHUBQ,
        onRedeemESCHUBQ: handleRedeemESCHUBQ,
        onStakeESCHUBQ: handleStakeESCHUBQ,
        onUnstakeESCHUBQ: handleUnstakeESCHUBQ,
        earnedBalances,
        stakedBalanceESCHUBQ,
        totalSupplyESCHUBQ,
        lpPercentESCHUBQ,
      }}
    >
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default Provider;
