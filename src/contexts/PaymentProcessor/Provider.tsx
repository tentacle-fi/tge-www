import React, { useState, useEffect, useCallback } from "react";
import Context from "./Context";
import { useWallet } from "use-wallet";
import useEvm from "hooks/useEvmProvider";
import { sendUbqEthers, waitForTransaction, checkReceipt, TxConfirmationBlocks } from "utils";

// const INK = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db";
const DAO = "0xCC7D76005bf1616e55cfDFF4cbfB5C29199C2808"; // DAO Multisig address

const PaymentProcessor: React.FC = ({ children }) => {
  const [paymentTx, setPaymentTx] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { BlockNum, provider, setConfirmModal } = useEvm();
  const { account } = useWallet();
  const [confirmCount, setConfirmCount] = useState(-1);

  const fetchTxReciept = useCallback(
    async (txHash: string, provider: any) => {
      let receiptConfirmations;
      try {
        receiptConfirmations = await checkReceipt(provider, txHash);

        if (receiptConfirmations >= TxConfirmationBlocks) {
          setIsConfirmed(true);
        }
        setConfirmCount(receiptConfirmations);
        console.log("confirm count:", receiptConfirmations, "TxConfirmationBlocks:", TxConfirmationBlocks);
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
        console.log("preparing to send", amount, "UBQ");
        let sendTxHash;
        let finalSendResult;
        switch (whatToSend) {
          case "INK":
            // sendTokens(account, DAO, value, INK);
            console.log("need to implement INK payments still...");
            break;
          case "UBQ":
            // generate and broadcast the transaction
            sendTxHash = await sendUbqEthers(account, DAO, amount, provider);
            // set the hash into state so we can separately check it's confirms
            console.log("setting paymentTx:", sendTxHash);
            setPaymentTx(sendTxHash);
            // wait for the tx to get mined
            finalSendResult = await waitForTransaction(provider, sendTxHash);
            console.log("finaleSendResult:", finalSendResult);
            break;
          default:
            throw new Error("Unknown token type to send!");
        }
      } catch (e) {
        console.error("unable to send tokens", e);
      }

      setConfirmModal(false);
    },
    [account, provider, BlockNum, setConfirmModal]
  );

  useEffect(() => {
    if (!paymentTx || provider === undefined) {
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default PaymentProcessor;
