import React, { useCallback, useState } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import numeral from "numeral";
import { Modal, ModalActions, ModalContent, ModalProps, ModalTitle, Separator, Spacer } from "react-neu";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FancyValue from "components/FancyValue";
import useBalances from "hooks/useBalances";

import InkTokenLogo from "assets/ink_black_alpha.png";
import UBQTokenLogo from "assets/ubq.png";
import GRANSTokenLogo from "assets/grans-flat.png"

const WalletModal: React.FC<ModalProps> = ({ isOpen, onDismiss }) => {
  const [, setWalletModalIsOpen] = useState(false);
  const { reset } = useWallet();
  const { INKBalance, UBQBalance, GRANSBalance } = useBalances();

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

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text="My Wallet" />
      <ModalContent>
        <Box>
          <FancyValue icon={getIcon("ubq")} label="UBQ balance" value={getDisplayBalance(UBQBalance)} />
          <FancyValue icon={getIcon("ink")} label="INK balance" value={getDisplayBalance(INKBalance)} />
          <FancyValue icon={getIcon("10grans")} label="10GRANS balance" value={getDisplayBalance(GRANSBalance)} />
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

function getIcon(logo: string) {
  let icon;
  switch (logo) {
    case "ink":
      icon = InkTokenLogo;
      break;
    case "ubq":
      icon = UBQTokenLogo;
      break;
      case "10grans":
      icon = GRANSTokenLogo
      break;
      default:
      console.warn('getIcon() logo does not exist', logo)
  }

  return (
    <img
      src={icon}
      alt={`${logo} token logo`}
      style={{ marginRight: "10px", height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
    />
  );
}

export default WalletModal;
