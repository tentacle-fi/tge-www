import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import ConfirmTransactionModal from "components/ConfirmTransactionModal";
import { ethers } from "ethers";
import { useWallet } from "use-wallet";

export interface EvmContext {
  provider?: any;
  BlockNum: number;
  setConfirmModal: (isOpen: boolean, message?: string) => void; // display a modal and a given string message, or hide the modal
}

export const Context = createContext<EvmContext>({
  provider: undefined,
  BlockNum: 0,
  setConfirmModal: () => {},
});

const EvmProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [Provider, setProvider] = useState<any>();
  const [BlockNum, setBlockNum] = useState(0);
  const currentAccount = useRef("");

  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false);
  const [confirmTxModalMessage, setConfirmTxModalMessage] = useState("");

  const customTxModal = useCallback(async (isOpen: boolean, message?: string) => {
    if (isOpen === true) {
      setConfirmTxModalIsOpen(true);
      if (message !== undefined) {
        setConfirmTxModalMessage(message);
      }
    } else {
      // reset
      setConfirmTxModalIsOpen(false);
      setConfirmTxModalMessage("");
    }
  }, []);

  const fetchCurrentBlock = useCallback(async (web3provider: any) => {
    if (!web3provider) {
      return;
    }

    let currentBlock: number = await web3provider.getBlockNumber();

    setBlockNum(currentBlock);
  }, []);

  useEffect(() => {
    if (ethereum === undefined) {
      return;
    }

    const web3provider = new ethers.providers.Web3Provider(ethereum);

    fetchCurrentBlock(web3provider);

    web3provider.on("block", (currentBlock: number) => {
      setBlockNum(currentBlock);
    });

    setProvider(web3provider);

    return () => {
      web3provider.removeAllListeners();
    };
  }, [ethereum, fetchCurrentBlock]);

  useEffect(() => {
    if (account !== null) {
      if (account !== currentAccount.current && currentAccount.current !== "") {
        window.location.reload();
      } else {
        currentAccount.current = account;
      }
    }
  }, [account]);

  return (
    <Context.Provider value={{ provider: Provider, setConfirmModal: customTxModal, BlockNum }}>
      {children}

      <ConfirmTransactionModal message={confirmTxModalMessage} isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  );
};

export default EvmProvider;
