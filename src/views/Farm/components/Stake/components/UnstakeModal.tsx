import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import { Button, Modal, ModalActions, ModalContent, ModalProps, ModalTitle } from "react-neu";

import TokenInput from "components/TokenInput";

import useFarming from "hooks/useFarming";
import { getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";

interface UnstakeModalProps extends ModalProps {
  onUnstake: (contractIndex: number, amount: string) => void;
  farmKey: number;
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({ isOpen, onDismiss, onUnstake, farmKey }) => {
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
    <Modal isOpen={isOpen}>
      <ModalTitle text="Unstake" />
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
          disabled={!val || !Number(val)}
          onClick={handleUnstakeClick}
          text="Unstake"
          variant={!val || !Number(val) ? "secondary" : "default"}
        />
      </ModalActions>
    </Modal>
  );
};

export default UnstakeModal;
