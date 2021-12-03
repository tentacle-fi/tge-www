import React, { useCallback, useState } from "react";

import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import numeral from "numeral";

import { Modal, ModalActions, ModalContent, ModalProps, ModalTitle, Separator } from "react-neu";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import FancyValue from "components/FancyValue";
import useBalances from "hooks/useBalances";
import { addInkToWallet, addGransToWallet, addwUbqToWallet } from "metamask.js";

import InkTokenLogo from "assets/ink_black_alpha.png";
import UBQTokenLogo from "assets/ubq.png";
import GRANSTokenLogo from "assets/grans-flat.png";

const WalletModal: React.FC<ModalProps> = ({ isOpen, onDismiss }) => {
  const [, setWalletModalIsOpen] = useState(false);
  const { reset } = useWallet();
  const { INKBalance, UBQBalance, GRANSBalance } = useBalances();

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
          <Grid>
            <WalletToken tokenName={"wUBQ"} tokenOnClick={addwUbqToWallet} tokenBalance={UBQBalance} />
            <WalletToken tokenName={"INK"} tokenOnClick={addInkToWallet} tokenBalance={INKBalance} />
            <WalletToken tokenName={"GRANS"} tokenOnClick={addGransToWallet} tokenBalance={GRANSBalance} />
          </Grid>
        </Box>
      </ModalContent>
      <Separator />
      <ModalActions>
        <Button onClick={onDismiss} variant="contained">
          Cancel
        </Button>
        <Button onClick={handleSignOut} color="error">
          Sign Out
        </Button>
      </ModalActions>
    </Modal>
  );
};

interface WalletTokenProps {
  tokenName: string;
  tokenOnClick?: () => void;
  tokenBalance: BigNumber | undefined;
}

const WalletToken: React.FC<WalletTokenProps> = ({ tokenName, tokenOnClick, tokenBalance }) => {
  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(value).format("0.0000a");
    } else {
      return "--";
    }
  }, []);

  const AddTokenButton = function () {
    if (tokenOnClick !== undefined) {
      return <Button onClick={tokenOnClick}>Add {tokenName} to Wallet</Button>;
    }
    return <></>;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Grid container>
        <Grid item xs={7}>
          <FancyValue icon={getIcon(tokenName)} label={tokenName + " balance"} value={getDisplayBalance(tokenBalance)} />
        </Grid>
        <Grid item xs={5}>
          <AddTokenButton />
        </Grid>
      </Grid>
    </Box>
  );
};

function getIcon(logo: string) {
  let icon;
  switch (logo) {
    case "INK":
      icon = InkTokenLogo;
      break;
    case "wUBQ":
      icon = UBQTokenLogo;
      break;
    case "GRANS":
      icon = GRANSTokenLogo;
      break;
    default:
      console.warn("getIcon() logo does not exist", logo);
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
