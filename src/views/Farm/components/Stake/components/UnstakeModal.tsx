import React, { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import TokenInput from "components/TokenInput";
import useFarming from "hooks/useFarming";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import useUbiq from "hooks/useUbiq";
import { useWallet } from "use-wallet";
import { unstake } from "ubiq-sdk/utils";
import { styled } from "@mui/system";
import Tooltip from "@mui/material/Tooltip";
import useEvm from "hooks/useEvmProvider";

const StyledUnstakeButton = styled(LoadingButton)(({ theme }) => ({
  backgroundColor: theme.palette.warning,
  padding: theme.spacing(1),
  borderRadius: 16,
  width: "125px",
}));

interface UnstakeModalProps {
  farmKey: number;
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({ farmKey }) => {
  const [val, setVal] = useState("");
  const { setConfirmModal } = useEvm();
  const { stakedBalances } = useFarming();
  const [isUnstaking, setisUnstaking] = useState(false);
  const stakedAmount = stakedBalances === undefined ? null : stakedBalances[farmKey];
  const { ubiq } = useUbiq();
  const { account } = useWallet();

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(stakedAmount || new BigNumber(0));
  }, [stakedAmount]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setVal(e.currentTarget.value);
    },
    [setVal]
  );

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance);
  }, [fullBalance, setVal]);

  const handleUnstake = useCallback(async () => {
    if (!ubiq) return;
    let txAmount = val;
    if (parseFloat(val) > parseFloat(fullBalance)) {
      setVal(fullBalance);
      txAmount = fullBalance;
    }

    setConfirmModal(true);
    await unstake(ubiq, txAmount, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisUnstaking(false);
      }
      setConfirmModal(false);
    });
    setVal("0");
    setConfirmModal(false);
    setisUnstaking(false);
  }, [account, setConfirmModal, setisUnstaking, ubiq, val, farmKey, fullBalance]);

  return (
    <>
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={`Unstake ${AvailableFarms[farmKey].name} LP`}
      >
        <Tooltip title="Unstake your LP tokens and stop earning rewards">
          <StyledUnstakeButton
            sx={{ marginLeft: "10px" }}
            onClick={() => {
              if (val && Number(val)) {
                handleUnstake();
              }
            }}
            endIcon={<IndeterminateCheckBoxIcon />}
            loading={isUnstaking}
            loadingPosition="end"
            variant="contained"
            color="warning"
            size="medium"
          >
            Unstake
          </StyledUnstakeButton>
        </Tooltip>
      </TokenInput>
    </>
  );
};

export default React.memo(UnstakeModal);
