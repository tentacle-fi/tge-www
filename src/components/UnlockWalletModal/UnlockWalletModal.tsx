import React, { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useWallet } from "use-wallet";
import Button from "@mui/material/Button";
import WalletProviderCard from "./components/WalletProviderCard";
import { switchToUBQNetwork } from "metamask.js";
import { Box, Typography } from "@mui/material";
import CustomModal from "components/CustomModal";

declare const window: any;

interface UnlockWalletModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const UnlockWalletModal: React.FC<UnlockWalletModalProps> = ({ isOpen, onDismiss }) => {
  const { account, connector, connect } = useWallet();

  const handleConnectMetamask = useCallback(async () => {
    try {
      await switchToUBQNetwork();
    } catch (e) {
      console.error("caught error while connecting wallet:", e);
    }

    connect("injected");
  }, [connect]);

  let injectedLogo = "metamask-fox.svg";
  let injectedName = "Metamask";

  if (window.ethereum) {
    if (window.ethereum.isSparrow) {
      injectedLogo = "sparrow.png";
      injectedName = "Sparrow";
    }
  }

  const ModalContent = useMemo(() => {
    return (
      <>
        <StyledModalTitle variant="h4" align="center">
          Select a wallet provider
        </StyledModalTitle>
        <Box>
          <StyledWalletsWrapper>
            <Box flex={1}>
              <WalletProviderCard
                icon={<img src={`/wallets/${injectedLogo}`} style={{ height: 110, margin: 20 }} alt="Wallet Logo" />}
                name={injectedName}
                onSelect={handleConnectMetamask}
              />
            </Box>
          </StyledWalletsWrapper>
        </Box>

        <StyledBox>
          <Button onClick={onDismiss} variant="contained">
            Cancel
          </Button>
        </StyledBox>
      </>
    );
  }, [injectedLogo, injectedName, handleConnectMetamask, onDismiss]);

  useEffect(() => {
    if (account) {
      onDismiss && onDismiss();
    }
    if (connector) {
      localStorage.setItem("walletProvider", connector);
    }
  }, [account, onDismiss, connector]);

  return <CustomModal isOpen={isOpen} content={ModalContent} />;
};

const StyledModalTitle = styled(Typography)(({ theme }) => ({
  paddingTop: "20px",
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end",
  margin: "20px",
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
