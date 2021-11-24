import { useCallback, useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { getAllowance, shouldUpdateVal } from "utils";

const useAllowance = (tokenAddress?: string, spenderAddress?: string) => {
  const [allowance, setAllowance] = useState<BigNumber>();
  const { account, ethereum }: { account: string | null; ethereum?: provider } = useWallet();

  const fetchAllowance = useCallback(
    async (userAddress: string, provider: provider) => {
      if (!spenderAddress || !tokenAddress) {
        return;
      }
      const newAllowance = new BigNumber(await getAllowance(userAddress, spenderAddress, tokenAddress, provider));

      if (shouldUpdateVal(allowance, newAllowance, "BigNumber")) {
        setAllowance(newAllowance);
      }
    },
    [allowance, setAllowance, spenderAddress, tokenAddress]
  );

  useEffect(() => {
    if (account && ethereum && spenderAddress && tokenAddress) {
      fetchAllowance(account, ethereum);
    }
    let refreshInterval = setInterval(fetchAllowance, 10000);
    return () => clearInterval(refreshInterval);
  }, [account, ethereum, spenderAddress, tokenAddress, fetchAllowance]);

  return allowance;
};

export default useAllowance;
