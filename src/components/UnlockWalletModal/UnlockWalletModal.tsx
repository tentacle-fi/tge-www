import React, { useCallback, useEffect } from "react";
import { Modal, ModalActions, ModalContent, ModalProps } from "react-neu";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import metamaskLogo from "assets/metamask-fox.svg";
import sparrowLogo from "assets/sparrow.png";
import Button from "@mui/material/Button";
import WalletProviderCard from "./components/WalletProviderCard";
import { switchToUBQNetwork } from "metamask.js";
import { Box, Typography } from "@mui/material";

declare const window: any;

const UnlockWalletModal: React.FC<ModalProps> = ({ isOpen, onDismiss }) => {
  const { account, connector, connect } = useWallet();

  const handleConnectMetamask = useCallback(async () => {
    try {
      await switchToUBQNetwork();
    } catch (e) {
      console.error("caught error while connecting wallet:", e);
    }

    connect("injected");
  }, [connect]);

  let injectedLogo = metamaskLogo;
  let injectedName = "Metamask";

  if (window.ethereum) {
    if (window.ethereum.isSparrow) {
      injectedLogo = sparrowLogo;
      injectedName = "Sparrow";
    }
  }

  useEffect(() => {
    if (account) {
      onDismiss && onDismiss();
    }
    if (connector) {
      localStorage.setItem("walletProvider", connector);
    }
  }, [account, onDismiss, connector]);

  return (
    <Modal isOpen={isOpen}>
      {/* <ModalTitle text="Select a wallet provider." /> */}
      <StyledModalTitle variant="h4" align="center">
        Select a wallet provider
      </StyledModalTitle>
      <ModalContent>
        <StyledWalletsWrapper>
          <Box flex={1}>
            <WalletProviderCard
              icon={<img src={injectedLogo} style={{ height: 32 }} alt="Wallet Logo" />}
              name={injectedName}
              onSelect={handleConnectMetamask}
            />
          </Box>
        </StyledWalletsWrapper>
      </ModalContent>
      <ModalActions>
        <StyledBox>
          <Button onClick={onDismiss} variant="contained">
            Cancel
          </Button>
        </StyledBox>
      </ModalActions>
    </Modal>
  );
};

const StyledModalTitle = styled(Typography)(({ theme }) => ({
  paddingTop: "20px",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  justifyContent: "center",
  alignContent: "center",
}));

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 600px) {
    flex-direction: column;
    flex-wrap: none;
  }
`;

export default UnlockWalletModal;
