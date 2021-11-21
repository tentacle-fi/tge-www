import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import TokenInput from "components/TokenInput";

import useFarming from "hooks/useFarming";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";

import LoadingButton from "@mui/lab/LoadingButton";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";

interface UnstakeModalProps {
  onUnstake: (contractIndex: number, amount: string) => void;
  farmKey: number;
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({ onUnstake, farmKey }) => {
  const [val, setVal] = useState("");
  const { stakedBalances } = useFarming();
  const stakedAmount = stakedBalances === undefined ? null : stakedBalances[farmKey];

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(stakedAmount || new BigNumber(0));
  }, [stakedAmount]);

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value);
    },
    [setVal]
  );

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance);
  }, [fullBalance, setVal]);

  const handleUnstakeClick = useCallback(() => {
    onUnstake(farmKey, val);
  }, [onUnstake, farmKey, val]);

  return (
    <>
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={`Unstake ${AvailableFarms[farmKey].name} LP`}
      >
        <LoadingButton
          onClick={() => {
            if (val && Number(val)) {
              handleUnstakeClick();
            }
          }}
          endIcon={<IndeterminateCheckBoxIcon />}
          loading={false}
          loadingPosition="end"
          variant="contained"
          color="warning"
          size="medium"
        >
          Unstake
        </LoadingButton>
      </TokenInput>
    </>
  );
};

export default UnstakeModal;
