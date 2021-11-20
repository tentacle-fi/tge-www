import React, { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { getBalance, getCurrentBlock } from "utils";

import Context from "./Context";

import { AvailableFarms } from "farms/AvailableFarms";

const Provider: React.FC = ({ children }) => {
  // TODO: edit list of tokens if multi farming is needed
  const [tokenBalances, settokenBalances] = useState<Array<BigNumber>>();
  const [LPBalances, setLPBalances] = useState<Array<BigNumber>>();

  const [CurrentBlock, setCurrentBlock] = useState("");
  const { account, ethereum } = useWallet();

  const fetchBalances = useCallback(
    async (userAddress: string, provider: provider) => {
      let tokenBalances = [];
      let lpBalances = [];

      for (let i = 0; i < AvailableFarms.length; i++) {
        tokenBalances.push(
          new BigNumber(await getBalance(provider, AvailableFarms[i].tokenA.address, userAddress)).dividedBy(new BigNumber(10).pow(18))
        );
        lpBalances.push(new BigNumber(await getBalance(provider, AvailableFarms[i].lp.address, userAddress)).dividedBy(new BigNumber(10).pow(18)));
      }

      settokenBalances(tokenBalances);
      setLPBalances(lpBalances);
    },
    [settokenBalances, setLPBalances]
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
    }
  }, [account, ethereum, fetchBalances]);

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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Provider;
