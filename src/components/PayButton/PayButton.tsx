import React, { useCallback, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { useWallet } from "use-wallet";
import useEvm from "hooks/useEvmProvider";
import { sendUbqEthers, waitForTransaction, checkReceipt } from "utils";
import { TxConfirmationBlocks } from "utils";
import Typography from "@mui/material/Typography";
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

// const INK = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db";
const DAO = "0xCC7D76005bf1616e55cfDFF4cbfB5C29199C2808"; // DAO Multisig address

interface ConfirmationProgressProps {
    progress: number
}

const ConfirmationProgress: React.FC<ConfirmationProgressProps> = ({progress}) => {

  return (
    <Stack spacing={2} direction="row">
      <CircularProgress variant="determinate" value={progress} />
    </Stack>
  );
}


interface PayButtonProps {
  paymentValue: number;
  paymentSymbol: string;
}

const PayButton: React.FC<PayButtonProps> = ({ paymentValue, paymentSymbol }) => {
  const { ethereum, account } = useWallet();
  const { provider } = useEvm();
  const [paymentTx, setPaymentTx] = useState("");
  const [confirmCount, setConfirmCount] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { BlockNum } = useEvm();

  const handlePayment = useCallback(
    async (whatToSend: string, amount: number) => {
      if (!ethereum || !account) {
        console.log("missing ethereum or account");
        return;
      }

      try {
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
            console.log(finalSendResult);
            break;
          default:
            throw new Error("Unknown token type to send!");
        }
      } catch (e) {
        console.error("unable to send tokens", e);
      }
    },
    [account, ethereum, provider]
  );

  const fetchTxReciept = useCallback(
    async (txHash: string, provider: any) => {
      let receiptConfirmations;
      try {
        receiptConfirmations = await checkReceipt(provider, txHash);

        if (receiptConfirmations >= TxConfirmationBlocks) {
          setIsConfirmed(true);
        }
        setConfirmCount(receiptConfirmations);
        console.log("confirm count:", receiptConfirmations, "TxConfirmationBlocks:", TxConfirmationBlocks)
      } catch (e) {
        console.error("fetchTxReciept() threw error:", e);
      }
    },
    [setConfirmCount]
  );

  useEffect(() => {
    if (!paymentTx || provider === undefined) {
      return;
    }

    fetchTxReciept(paymentTx, provider);
  }, [BlockNum, paymentTx, provider, fetchTxReciept]);

  // Payment has been sent and confirmed
  if (isConfirmed) {
    return <Typography>You've paid</Typography>;
  }

  // No payment has been sent yet
  if (!paymentTx) {
    return (
      <>
        <Button sx={{mt:"10px"}} onClick={() => handlePayment(paymentSymbol, paymentValue)} variant="outlined">
          Pay Now
        </Button>
        <Typography sx={{mt:"5px"}}>Click to Pay</Typography>
      </>
    );
  }

  let isNullReceipt = false;
  if(confirmCount === -1){
      isNullReceipt = true;
  }

  // Payment sent, awaiting confirmations
  // if confirmCount is -1 then there was not a reciept yet, so we'll force 0 confirmations to be shown
  return (
    <>
      <Typography>Thank you for submitting your payment</Typography>
      <Typography>
        Confirms: {isNullReceipt ? 0 : confirmCount} of {TxConfirmationBlocks}
      </Typography>
      <ConfirmationProgress progress={isNullReceipt ? 0 : confirmCount / TxConfirmationBlocks * 100} />
    </>
  );
};

export default React.memo(PayButton);
