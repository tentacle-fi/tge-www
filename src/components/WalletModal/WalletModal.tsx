import React, { useCallback, useState, useMemo } from "react";
import { Box, Button, Grid, styled, Typography } from "@mui/material";
import BigNumber from "bignumber.js";
import { useWallet } from "use-wallet";
import useBalances from "hooks/useBalances";
import numeral from "numeral";
import FancyValue from "components/FancyValue";
import { addTokenToWallet } from "metamask.js";
import { Tokens } from "farms/AvailableFarms";
import CustomModal from "components/CustomModal";
import { borderBottom } from "@mui/system";

interface WalletModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onDismiss }) => {
  const [, setWalletModalIsOpen] = useState(false);
  const { reset } = useWallet();
  const { tokenBalances } = useBalances();

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("account");
    localStorage.removeItem("walletProvider");
    setWalletModalIsOpen(false);
    reset();
    if (onDismiss) {
      onDismiss();
    }
  }, [reset, onDismiss]);

  const WalletTokens = Tokens.map((token, index) => {
    const balance = tokenBalances === undefined ? undefined : tokenBalances[token.address];

    return (
      <WalletToken
        tokenName={token.symbol}
        tokenIcon={token.logo}
        tokenOnClick={() => addTokenToWallet(token.symbol, token.address, token.logo)}
        tokenBalance={balance}
        key={index.toString()}
      />
    );
  });

  const ModalContent = useMemo(() => {
    return (
      <>
        <StyledTypography align="center" variant="h4">
          My Wallet
        </StyledTypography>

        <Box>
          <Grid>{WalletTokens}</Grid>
        </Box>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button onClick={onDismiss} variant="contained">
            Close
          </Button>
          <Button onClick={handleSignOut} color="error">
            Sign Out
          </Button>
        </Box>
      </>
    );
  }, [WalletTokens, onDismiss, handleSignOut]);

  return <CustomModal isOpen={isOpen} content={ModalContent} />;
};

interface WalletTokenProps {
  tokenName: string;
  tokenIcon: string;
  tokenOnClick?: () => void;
  tokenBalance: BigNumber | undefined;
}

const WalletToken: React.FC<WalletTokenProps> = ({ tokenName, tokenIcon, tokenOnClick, tokenBalance }) => {
  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value !== undefined) {
      if (value.isLessThan(0.0001) && value.isGreaterThan(0)) {
        return value.toExponential();
      }

      if (value.isEqualTo(0)) {
        return "0";
      }
    }

    if (value) {
      return numeral(value).format("0.0000a");
    } else {
      return "--";
    }
  }, []);

  const AddTokenButton = () => {
    if (tokenOnClick !== undefined) {
      return <Button onClick={tokenOnClick}>Add {tokenName} to Wallet</Button>;
    }
    return <></>;
  };

  const TokenImg = useMemo(() => {
    return (
      <img
        src={`/tokens/${tokenIcon}`}
        alt={`${tokenName} token logo`}
        style={{ marginRight: "10px", height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
      />
    );
  }, [tokenIcon, tokenName]);

  return (
    <Box sx={{ display: "flex" }}>
      <Grid container>
        <Grid item xs={7}>
          <FancyValue icon={TokenImg} label={tokenName + " balance"} value={getDisplayBalance(tokenBalance)} />
        </Grid>
        <Grid item xs={5}>
          <AddTokenButton />
        </Grid>
      </Grid>
    </Box>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  padding: "10px",
  borderBottom: "1px solid black",
  marginBottom: "20px",
}));

export default WalletModal;
