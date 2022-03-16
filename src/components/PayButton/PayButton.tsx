import React from "react";
import Button from "@mui/material/Button";
import usePaymentProcessor from "hooks/usePaymentProcessor";
import { TxConfirmationBlocks } from "utils";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

interface ConfirmationProgressProps {
  progress: number;
}

const ConfirmationProgress: React.FC<ConfirmationProgressProps> = ({ progress }) => {
  return (
    <Stack spacing={2} direction="row">
      <CircularProgress variant="determinate" value={progress} />
    </Stack>
  );
};

interface PayButtonProps {
  paymentValue: number;
  paymentSymbol: string;
}

const PayButton: React.FC<PayButtonProps> = ({ paymentValue, paymentSymbol }) => {
  const { isConfirmed, paymentTx, handlePayment, confirmCount } = usePaymentProcessor();

  // Payment has been sent and confirmed
  if (isConfirmed) {
    return <Typography>You've paid</Typography>;
  }

  if (!handlePayment || !confirmCount) {
    return <></>;
  }

  // No payment has been sent yet
  if (!paymentTx) {
    return (
      <>
        <Button sx={{ mt: "10px" }} onClick={() => handlePayment(paymentSymbol, paymentValue)} variant="outlined">
          Pay Now
        </Button>
        <Typography sx={{ mt: "5px" }}>Click to Pay</Typography>
      </>
    );
  }

  let isNullReceipt = false;
  if (confirmCount === -1) {
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
      <ConfirmationProgress progress={isNullReceipt ? 0 : (confirmCount / TxConfirmationBlocks) * 100} />
    </>
  );
};

export default React.memo(PayButton);
