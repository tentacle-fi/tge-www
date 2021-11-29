import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";

import TokenInput from "components/TokenInput";
import useBalances from "hooks/useBalances";
import useFarming from "hooks/useFarming";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import useUbiq from "hooks/useUbiq";
import { useWallet } from "use-wallet";
import { stake } from "ubiq-sdk/utils";

interface StakeModalProps {
  farmKey: number;
}

const StakeModal: React.FC<StakeModalProps> = ({ farmKey }) => {
  const [val, setVal] = useState("");
  const { LPBalances } = useBalances();
  const { setConfirmModal } = useFarming();
  const [isStaking, setisStaking] = useState(false);
  const ubiq = useUbiq();
  const { account } = useWallet();

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value);
    },
    [setVal]
  );

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance);
  }, [fullBalance, setVal]);

  const handleStake = useCallback(async () => {
    // updateStateAtIndex(isStaking, setIsStaking, true, contractIndex);
    // setTimeout(() => {
    //   updateStateAtIndex(isStaking, setIsStaking, false, contractIndex);
    // }, 4000);

    if (!ubiq) return;
    setisStaking(true);
    setConfirmModal(true);
    await stake(ubiq, val, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisStaking(false);
      }
      setConfirmModal(false);
    });
    setConfirmModal(false);
    setisStaking(false);
  }, [account, setConfirmModal, setisStaking, ubiq, farmKey, val]);

  return (
    <>
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={`Stake ${AvailableFarms[farmKey].name} LP`}
      >
        <LoadingButton
          sx={{ marginLeft: "10px" }}
          onClick={() => {
            if (val && Number(val) && Number(fullBalance) && fullBalance) {
              handleStake();
            }
          }}
          endIcon={<AddCircleOutlineIcon />}
          loading={isStaking}
          loadingPosition="end"
          variant="contained"
          color="info"
          size="medium"
        >
          Stake
        </LoadingButton>
      </TokenInput>
    </>
  );
};

export default React.memo(StakeModal);
