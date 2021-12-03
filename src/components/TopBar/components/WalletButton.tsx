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
import { switchToUBQNetwork } from "metamask.js";
import useFarming from "hooks/useFarming";

interface WalletButtonProps {
  blockHeightButton?: object;
}

const WalletButton: React.FC<WalletButtonProps> = ({ blockHeightButton }) => {
  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false);
  const [unlockModalIsOpen, setUnlockModalIsOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<string | null>();
  const { account, status, connect } = useWallet();
  const { setConfirmModal } = useFarming();

  const ConnectedElements = useCallback(() => {
    if (status === "connected") {
      return <>{blockHeightButton}</>;
    }

    return <></>;
  }, [status, blockHeightButton]);

  const handleSwitchNetwork = useCallback(async () => {
    try {
      setConfirmModal(true, "Please allow Tentacle.Finance to switch networks.");
      await switchToUBQNetwork();

      window.location.reload();
    } catch (e) {
      console.error("caught error while trying to switch networks:", e);
    }

    setConfirmModal(false);
  }, [setConfirmModal]);

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
          <Button size="small" color="error" onClick={handleSwitchNetwork}>
            <SignalWifiStatusbarConnectedNoInternet4Icon />
          </Button>
        </Tooltip>
      );
    }

    return <></>;
  }, [status, handleSwitchNetwork]);

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
          <Tooltip title="View account details">
            <Button onClick={handleWalletClick} size="medium" variant="contained" startIcon={<AccountBalanceWalletIcon />}>
              {userAccount.substring(0, 6) + "..." + userAccount.substring(38)}
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
