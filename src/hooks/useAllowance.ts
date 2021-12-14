import { useCallback, useEffect, useState, useRef } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import { provider } from "web3-core";
import { getAllowance } from "utils";
import useUbiq from "hooks/useUbiq";

const useAllowance = (tokenAddress?: string, spenderAddress?: string) => {
  const [allowance, setAllowance] = useState<BigNumber>();
  const { account, ethereum }: { account: string | null; ethereum?: provider } = useWallet();

  const { BlockNum } = useUbiq();
  const alreadyAllowed = useRef(false);

  const fetchAllowance = useCallback(async () => {
    if (!spenderAddress || !tokenAddress || !ethereum || !account) {
      return;
    }
    if (alreadyAllowed.current) return;

    const newAllowance = new BigNumber(await getAllowance(account, spenderAddress, tokenAddress, ethereum));

    if (newAllowance.toNumber() > 0) {
      alreadyAllowed.current = true;
    }
    setAllowance(newAllowance);
  }, [setAllowance, spenderAddress, tokenAddress, account, ethereum]);

  useEffect(() => {
    fetchAllowance();
  }, [BlockNum, fetchAllowance]);

  return allowance;
};

export default useAllowance;
