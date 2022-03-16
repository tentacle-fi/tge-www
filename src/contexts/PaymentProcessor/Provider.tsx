import React, { useState, useEffect, useCallback, useRef } from "react";
import Context from "./Context";
import { useWallet } from "use-wallet";
import useEvm from "hooks/useEvmProvider";
import { sendUbqEthers, waitForTransaction, checkReceipt, TxConfirmationBlocks } from "utils";
import { DAO_MULTISIG } from "farms/AvailableFarms";

const PaymentProcessor: React.FC = ({ children }) => {
  const [paymentTx, setPaymentTx] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { BlockNum, provider, setConfirmModal } = useEvm();
  const { account } = useWallet();
  const [confirmCount, setConfirmCount] = useState(-1);
  const waitingForConfirmations = useRef(false);

  const handleReset = useCallback(() => {
    // reset all state
    setIsConfirmed(false);
    setPaymentTx("");
    setConfirmCount(-1);
    waitingForConfirmations.current = false;
  }, []);

  const fetchTxReciept = useCallback(
    async (txHash: string, provider: any) => {
      let receiptConfirmations;
      try {
        receiptConfirmations = await checkReceipt(provider, txHash);

        if (receiptConfirmations >= TxConfirmationBlocks) {
          setIsConfirmed(true);
          waitingForConfirmations.current = false; //reset
        }
        setConfirmCount(receiptConfirmations >= TxConfirmationBlocks ? TxConfirmationBlocks : receiptConfirmations);
        // console.log("confirm count:", receiptConfirmations, "TxConfirmationBlocks:", TxConfirmationBlocks);
      } catch (e) {
        console.error("fetchTxReciept() threw error:", e);
      }
    },
    [setConfirmCount]
  );

  const handlePayment = useCallback(
    async (whatToSend: string, amount: number) => {
      if (!account || !provider) {
        console.log("missing provider or account");
        console.log("account:", account, "provider:", provider, BlockNum);
        return;
      }

      try {
        setConfirmModal(true);
        setConfirmCount(0);
        // console.log("preparing to send", amount, "UBQ");
        let sendTxHash;
        switch (whatToSend) {
          case "INK":
            // sendTokens(account, DAO_MULTISIG, value, INK);
            console.log("need to implement INK payments still...");
            break;
          case "UBQ":
            // generate and broadcast the transaction
            sendTxHash = await sendUbqEthers(account, DAO_MULTISIG, amount, provider);

            if (sendTxHash === undefined) {
              throw new Error("payment rejected or did not succeed");
            }

            setConfirmModal(false);
            waitingForConfirmations.current = true;
            // set the hash into state so we can separately check it's confirms
            // console.log("setting paymentTx:", sendTxHash);
            setPaymentTx(sendTxHash);

            // wait for the tx to get mined
            await waitForTransaction(provider, sendTxHash);
            break;
          default:
            throw new Error("Unknown token type to send!");
        }
      } catch (e) {
        console.error("unable to send tokens", e);
        setConfirmCount(-1);
      }

      setConfirmModal(false);
    },
    [account, provider, BlockNum, setConfirmModal, setConfirmCount]
  );

  useEffect(() => {
    if (!paymentTx || provider === undefined || waitingForConfirmations.current === false) {
      return;
    }

    fetchTxReciept(paymentTx, provider);
  }, [BlockNum, paymentTx, provider, fetchTxReciept]);

  return (
    <Context.Provider
      value={{
        paymentTx,
        isConfirmed,
        handlePayment,
        confirmCount,
        handleReset,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default PaymentProcessor;
