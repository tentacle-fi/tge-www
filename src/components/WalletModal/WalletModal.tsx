import React, { useCallback, useState, useEffect } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";

import numeral from "numeral";
import { Box, Button, Modal, ModalActions, ModalContent, ModalProps, ModalTitle, Separator, Spacer } from "react-neu";

import FancyValue from "components/FancyValue";

import useBalances from "hooks/useBalances";

import InkTokenLogo from "assets/ink_black_alpha.png";

const WalletModal: React.FC<ModalProps> = ({ isOpen, onDismiss }) => {
  const [, setWalletModalIsOpen] = useState(false);
  const { reset } = useWallet();
  const { TGE1Balance } = useBalances();

  const INKBalance = TGE1Balance;

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(value).format("0.00a");
    } else {
      return "--";
    }
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("account");
    localStorage.removeItem("walletProvider");
    setWalletModalIsOpen(false);
    reset();
    if (onDismiss) {
      onDismiss();
    }
  }, [reset, onDismiss]);

  useEffect(() => {
    isOpen = !isOpen;
  }, [setWalletModalIsOpen]);

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text="My Wallet" />
      <ModalContent>
        <Box row>
          <FancyValue icon={inkIcon()} label="INK balance" value={getDisplayBalance(INKBalance)} />
        </Box>
        <Spacer />
      </ModalContent>
      <Separator />
      <ModalActions>
        <Button onClick={onDismiss} text="Cancel" variant="secondary" />
        <Button onClick={handleSignOut} text="Sign Out" />
      </ModalActions>
    </Modal>
  );
};

function inkIcon() {
  return (
    <img
      src={InkTokenLogo}
      alt="Tentacle Finance Logo"
      style={{ marginRight: "10px", height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
    />
  );
}

export default WalletModal;
