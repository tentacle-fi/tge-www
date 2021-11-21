import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";

import TokenInput from "components/TokenInput";
import useBalances from "hooks/useBalances";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface StakeModalProps {
  onStake: (contractIndex: number, amount: string) => void;
  farmKey: number;
}

const StakeModal: React.FC<StakeModalProps> = ({ onStake, farmKey }) => {
  const [val, setVal] = useState("");
  const { LPBalances } = useBalances();

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

  const handleStakeClick = useCallback(() => {
    onStake(farmKey, val);
  }, [onStake, val, farmKey]);

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
          onClick={() => {
            if (val && Number(val) && Number(fullBalance) && fullBalance) {
              handleStakeClick();
            }
          }}
          endIcon={<AddCircleOutlineIcon />}
          loading={false}
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

export default StakeModal;
