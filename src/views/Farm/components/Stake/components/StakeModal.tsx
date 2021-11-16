import React, { useCallback, useMemo, useState } from "react";

import BigNumber from "bignumber.js";
import { Button, Modal, ModalActions, ModalContent, ModalProps, ModalTitle } from "react-neu";

import TokenInput from "components/TokenInput";
import useBalances from "hooks/useBalances";
import { getFullDisplayBalance } from "utils";

interface StakeModalProps extends ModalProps {
  onStake: (amount: string) => void;
}

const StakeModal: React.FC<StakeModalProps> = ({ isOpen, onDismiss, onStake }) => {
  const [val, setVal] = useState("");
  const { ESCHUBQLPBalance } = useBalances();

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(ESCHUBQLPBalance || new BigNumber(0), 0);
  }, [ESCHUBQLPBalance]);

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
    onStake(val);
  }, [onStake, val]);

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text="Stake" />
      <ModalContent>
        <TokenInput value={val} onSelectMax={handleSelectMax} onChange={handleChange} max={fullBalance} symbol="INK_UBQ_SLP" />
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
