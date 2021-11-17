import React, { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";

import { TGE1, ESCHUBQSLPAddress } from "constants/tokenAddresses";
import { getBalance, getCurrentBlock, getCoinBalance } from "utils";

import Context from "./Context";

const Provider: React.FC = ({ children }) => {
  const [UBQBalance, setUBQBalance] = useState<BigNumber>();
  const [TGE1Balance, setTGE1Balance] = useState<BigNumber>();
  const [ESCHUBQLPBalance, setESCHUBQLPBalance] = useState<BigNumber>();
  const [CurrentBlock, setCurrentBlock] = useState("");

  const { account, ethereum }: { account: string | null; ethereum: provider } = useWallet();

  const fetchBalances = useCallback(
    async (userAddress: string, provider: provider) => {
      const balances = await Promise.all([
        await getBalance(provider, TGE1, userAddress),
        await getBalance(provider, ESCHUBQSLPAddress, userAddress),
        await getCoinBalance(provider, userAddress),
        // await getBalance(provider, "0x1FA6A37c64804C0D797bA6bC1955E50068FbF362", userAddress)
      ]);
      setTGE1Balance(new BigNumber(balances[0]).dividedBy(new BigNumber(10).pow(18)));
      setESCHUBQLPBalance(new BigNumber(balances[1]).dividedBy(new BigNumber(10).pow(18)));
      setUBQBalance(new BigNumber(balances[2]).dividedBy(new BigNumber(10).pow(18)));
    },
    [setTGE1Balance, setESCHUBQLPBalance, setUBQBalance]
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
        TGE1Balance,
        ESCHUBQLPBalance,
        UBQBalance,
        CurrentBlock,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Provider;
