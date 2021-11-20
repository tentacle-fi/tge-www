import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import { Button, Modal, ModalActions, ModalContent, ModalProps, ModalTitle } from "react-neu";

import TokenInput from "components/TokenInput";
import useBalances from "hooks/useBalances";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";

interface StakeModalProps extends ModalProps {
  onStake: (contractIndex: number, amount: string) => void;
  farmKey: number;
}

const StakeModal: React.FC<StakeModalProps> = ({ isOpen, onDismiss, onStake, farmKey }) => {
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
    <Modal isOpen={isOpen}>
      <ModalTitle text="Stake" />
      <ModalContent>
        <TokenInput
          value={val}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol={AvailableFarms[farmKey].name + " LP"}
        />
      </ModalContent>
      <ModalActions>
        <Button onClick={onDismiss} text="Cancel" variant="secondary" />
        <Button
          disabled={!val || !Number(val) || !Number(fullBalance) || !fullBalance}
          onClick={handleStakeClick}
          text="Stake"
          variant={!val || !Number(val) || !Number(fullBalance) || !fullBalance ? "secondary" : "default"}
        />
      </ModalActions>
    </Modal>
  );
};

export default StakeModal;
