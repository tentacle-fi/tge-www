import React, { useCallback, useState, useEffect } from "react";
import { useWallet } from "use-wallet";

import UnlockWalletModal from "components/UnlockWalletModal";
import WalletModal from "components/WalletModal";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import LockOpen from "@mui/icons-material/LockOpen";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import WifiIcon from "@mui/icons-material/Wifi";
import SignalWifiStatusbarConnectedNoInternet4Icon from "@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4";
import WidgetsIcon from "@mui/icons-material/Widgets";
import useBalances from "hooks/useBalances";
import { switchToUBQNetwork } from "metamask.js";

import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface WalletButtonProps {}

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", marginLeft: "10px" }}>
      <CircularProgress size={34} variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" component="div">{`${Math.round(props.value)}s`}</Typography>
      </Box>
    </Box>
  );
}

const WalletButton: React.FC<WalletButtonProps> = () => {
  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false);
  const [unlockModalIsOpen, setUnlockModalIsOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<string | null>();
  const { account, status, connect } = useWallet();

  const { CurrentBlock } = useBalances();
  const [lastBlock, setLastBlock] = useState(CurrentBlock);

  const [blockTimeCounter, setblockTimeCounter] = useState(1);

  useEffect(() => {
    const timerId = setInterval(() => setblockTimeCounter(blockTimeCounter + 1), 1000);

    return () => clearInterval(timerId);
  }, [blockTimeCounter]);

  useEffect(() => {
    if (lastBlock !== CurrentBlock) {
      setblockTimeCounter(1);
    }
  }, [lastBlock, CurrentBlock, setLastBlock, setblockTimeCounter]);

  const ConnectedElements = useCallback(() => {
    // <Chip label={CurrentBlock} color="primary" icon={<WidgetsIcon />} />

    if (status === "connected") {
      return (
        <Tooltip title="Block height">
          <Button size="medium" variant="contained">
            <WidgetsIcon sx={{ fontSize: "14px" }} />
            {CurrentBlock}

            <CircularProgressWithLabel
              value={blockTimeCounter}
              sx={{ color: blockTimeCounter > 88 ? (blockTimeCounter > 180 ? "#ff3300" : "#f9a825") : "#b2ff59" }}
            />
          </Button>
        </Tooltip>
      );
    }

    return <></>;
  }, [status, CurrentBlock, blockTimeCounter]);

  const ConnectionStatusIndicator = useCallback(() => {
    if (status === "connected") {
      return (
        <Tooltip title="Connected to Ubiq Network!">
          <Button size="medium" variant="contained">
            <WifiIcon />
          </Button>
        </Tooltip>
      );
    }
    if (status === "error") {
      return (
        <Tooltip title="Network Error, click to switch to Ubiq Network">
          <Button size="small" color="error">
            <SignalWifiStatusbarConnectedNoInternet4Icon onClick={switchToUBQNetwork} />
          </Button>
        </Tooltip>
      );
    }

    return <></>;
  }, [status]);

  const handleDismissUnlockModal = useCallback(() => {
    setUnlockModalIsOpen(false);
  }, [setUnlockModalIsOpen]);

  const handleDismissWalletModal = useCallback(() => {
    setWalletModalIsOpen(false);
  }, [setWalletModalIsOpen]);

  const handleWalletClick = useCallback(() => {
    setWalletModalIsOpen(true);
  }, [setWalletModalIsOpen]);

  const handleUnlockWalletClick = useCallback(() => {
    setUnlockModalIsOpen(true);
  }, [setUnlockModalIsOpen]);

  const handleConnectMetamask = useCallback(() => {
    connect("injected");
  }, [connect]);

  const handleConnectWalletConnect = useCallback(() => {
    connect("walletconnect");
  }, [connect]);

  const checkLocalUserAccount = useCallback(async () => {
    if (!localStorage.getItem("account")) {
      setUserAccount(null);
    }
  }, []);

  const fetchConnection = useCallback(async () => {
    if (status === "disconnected") {
      setUserAccount(null);
      localStorage.removeItem("account");
    }
  }, [status, setUserAccount]);

  useEffect(() => {
    checkLocalUserAccount();
    const localAccount: any = (account ? account.toString() : false) || localStorage.getItem("account");
    if (account) {
      localStorage.setItem("account", localAccount);
      setUserAccount(localAccount);
    }
  }, [account, userAccount, handleDismissWalletModal, checkLocalUserAccount]);

  useEffect(() => {
    let checkConnection = setTimeout(() => {
      fetchConnection();
    }, 2000);
    return () => {
      clearTimeout(checkConnection);
    };
  }, [status, fetchConnection]);

  useEffect(() => {
    const localAccount = localStorage.getItem("account");
    const walletProvider = localStorage.getItem("walletProvider");
    if (!account && localAccount) {
      setUserAccount(localAccount);
      if (localAccount && (walletProvider === "metamask" || walletProvider === "injected")) {
        handleConnectMetamask();
      }
      if (localAccount && walletProvider === "walletconnect") {
        handleConnectWalletConnect();
      }
    }
  }, [account, handleConnectMetamask, handleConnectWalletConnect]);

  return (
    <>
      <ButtonGroup>
        <ConnectedElements />
        <ConnectionStatusIndicator />
        {!userAccount ? (
          <Tooltip title="unlock wallet">
            <Button onClick={handleUnlockWalletClick} variant="contained" startIcon={<LockOpen />}>
              Unlock Wallet
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="view Account details">
            <Button onClick={handleWalletClick} size="medium" variant="contained" startIcon={<AccountBalanceWalletIcon />}>
              Account
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
      <WalletModal isOpen={walletModalIsOpen} onDismiss={handleDismissWalletModal} />
      <UnlockWalletModal isOpen={unlockModalIsOpen} onDismiss={handleDismissUnlockModal} />
    </>
  );
};

export default WalletButton;
