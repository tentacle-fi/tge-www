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
import { styled } from "@mui/system";

const StyledStakeButton = styled(LoadingButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  padding: theme.spacing(1),
  borderRadius: 16,
  width: "125px",
}));

interface StakeModalProps {
  farmKey: number;
}

const StakeModal: React.FC<StakeModalProps> = ({ farmKey }) => {
  const [val, setVal] = useState("");
  const { LPBalances } = useBalances();
  const { setConfirmModal } = useFarming();
  const [isStaking, setisStaking] = useState(false);
  const { ubiq } = useUbiq();
  const { account } = useWallet();

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setVal(e.currentTarget.value);
    },
    [setVal]
  );

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance);
  }, [fullBalance, setVal]);

  const handleStake = useCallback(async () => {
    if (!ubiq) return;
    let txAmount = val;
    if (parseFloat(val) > parseFloat(fullBalance)) {
      setVal(fullBalance);
      txAmount = fullBalance;
    }

    setisStaking(true);
    setConfirmModal(true);
    await stake(ubiq, txAmount, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisStaking(false);
      }
      setConfirmModal(false);
    });
    setVal("0");
    setConfirmModal(false);
    setisStaking(false);
  }, [account, setConfirmModal, setisStaking, ubiq, farmKey, val, fullBalance]);

  return (
    <>
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={`Stake ${AvailableFarms[farmKey].name} LP`}
      >
        <StyledStakeButton
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
        </StyledStakeButton>
      </TokenInput>
    </>
  );
};

export default React.memo(StakeModal);
