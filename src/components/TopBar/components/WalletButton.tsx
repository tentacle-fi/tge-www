import React, { useCallback, useState, useEffect } from "react";
import { useWallet } from "use-wallet";

import UnlockWalletModal from "components/UnlockWalletModal";
import WalletModal from "components/WalletModal";

import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import LockOpen from "@mui/icons-material/LockOpen";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

interface WalletButtonProps {}

const WalletButton: React.FC<WalletButtonProps> = () => {
  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false);
  const [unlockModalIsOpen, setUnlockModalIsOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<string | null>();
  const { account, status, connect } = useWallet();

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
      <div>
        {!userAccount ? (
          <Tooltip title="unlock wallet">
            <Button onClick={handleUnlockWalletClick} variant="outlined" startIcon={<LockOpen />}>
              Unlock Wallet
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title="view balances">
            <Button onClick={handleWalletClick} size="small" variant="contained" startIcon={<AccountBalanceWalletIcon />}>
              View Balances
            </Button>
          </Tooltip>
        )}
      </div>
      <WalletModal isOpen={walletModalIsOpen} onDismiss={handleDismissWalletModal} />
      <UnlockWalletModal isOpen={unlockModalIsOpen} onDismiss={handleDismissUnlockModal} />
    </>
  );
};

export default WalletButton;
