import React, { useCallback } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { sendUbq, sendTokens } from "utils";
import BigNumber from "bignumber.js";
import { INK, DAO_MULTISIG } from "farms/AvailableFarms";
import { useWallet } from "use-wallet";
import styled from "styled-components";

function easyWei(amount: number): string {
  return new BigNumber(amount).times(new BigNumber(10).pow(18)).toString();
}

const Donate: React.FC = () => {
  const { ethereum, account } = useWallet();

  const handleDonate = useCallback(
    (whatToSend: "UBQ" | "INK", amount: number) => {
      if (!ethereum || !account) return;

      try {
        const value = easyWei(amount);

        switch (whatToSend) {
          case "INK":
            sendTokens(account, DAO_MULTISIG, value, INK, ethereum);
            break;
          case "UBQ":
            sendUbq(account, DAO_MULTISIG, value, ethereum);
            break;
          default:
            throw new Error("Unknown token type to send!");
        }
      } catch (e) {
        console.error("unable to send tokens", e);
      }
    },
    [account, ethereum]
  );

  const donateINK = useCallback(
    (amount: number) => {
      handleDonate("INK", amount);
    },
    [handleDonate]
  );

  const donateUBQ = useCallback(
    (amount: number) => {
      handleDonate("UBQ", amount);
    },
    [handleDonate]
  );

  const donateValues = [1, 5, 20, 100, 1000];

  const INKDonateButtons = donateValues.map((i) => {
    return (
      <Button key={i.toString()} onClick={() => donateINK(i)}>
        {i} INK
      </Button>
    );
  });

  const UBQDonateButtons = donateValues.map((i) => {
    return (
      <Button key={i.toString()} onClick={() => donateUBQ(i)}>
        {i} UBQ
      </Button>
    );
  });

  return (
    <StyledBoxWrapper>
      <Typography variant="h4">Donate today!</Typography>
      <Typography variant="h5">Will you help Us build a better UBQ network?</Typography>
      <Typography variant="body1" style={{ textAlign: "center" }}>
        Tentacle.finance is dedicated to continual growth and development on the Ubiq network. Donate Today to help the DAO extend its tentacles into
        other networks and projects!
      </Typography>

      <StyledInnerBox>
        <ButtonGroup variant="outlined">{INKDonateButtons}</ButtonGroup>
        <ButtonGroup variant="outlined">{UBQDonateButtons}</ButtonGroup>
        <Typography variant="body2">Click the value to donate.</Typography>
      </StyledInnerBox>
    </StyledBoxWrapper>
  );
};

const StyledBoxWrapper = styled(Box)(({ theme }) => ({
  "*": {
    padding: "10px 20px",
  },
  backgroundColor: "#000",
  maxWidth: "600px",
  borderRadius: "15px",
  padding: "30px",
  textAlign: "center",
}));

const StyledInnerBox = styled(Box)(({ theme }) => ({
  "*": {
    padding: "5px 10px",
  },
  textAlign: "center",
}));

export default React.memo(Donate);
