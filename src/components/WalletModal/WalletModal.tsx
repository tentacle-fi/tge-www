import React, { useCallback, useState, useEffect } from "react";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import numeral from "numeral";
import { Modal, ModalActions, ModalContent, ModalProps, ModalTitle, Separator, Spacer } from "react-neu";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FancyValue from "components/FancyValue";
import useBalances from "hooks/useBalances";
import { AvailableFarms } from "farms/AvailableFarms";

import InkTokenLogo from "assets/ink_black_alpha.png";

const WalletModal: React.FC<ModalProps> = ({ isOpen, onDismiss }) => {
  const [, setWalletModalIsOpen] = useState(false);
  const { reset } = useWallet();
  const { tokenBalances } = useBalances();

  const INKBalance = tokenBalances !== undefined && AvailableFarms[0].tokenA.symbol === "INK" ? tokenBalances[0] : undefined;
  const GRANSBalance = tokenBalances !== undefined && AvailableFarms[1].tokenA.symbol === "GRANS" ? tokenBalances[1] : undefined;

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
        <Box sx={{}}>
          <FancyValue icon={inkIcon()} label="INK balance" value={getDisplayBalance(INKBalance)} />
          <FancyValue icon={inkIcon()} label="GRANS balance" value={getDisplayBalance(GRANSBalance)} />
        </Box>
        <Spacer />
      </ModalContent>
      <Separator />
      <ModalActions>
        <Button onClick={onDismiss} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSignOut} color="error">
          Sign Out
        </Button>
      </ModalActions>
    </Modal>
  );
};

function inkIcon() {
  return (
    <img
      src={InkTokenLogo}
      alt="Token Logo"
      style={{ marginRight: "10px", height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
    />
  );
}

export default WalletModal;
