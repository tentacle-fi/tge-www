import React, { useState, useCallback } from "react";

import { Spacer } from "react-neu";

import Page from "components/Page";

import useFarming from "hooks/useFarming";
import HarvestCard from "./components/Harvest";
import StakeCard from "./components/Stake";
import { useWallet } from "use-wallet";
import { AvailableFarms } from "farms/AvailableFarms";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";

import LoadingButton from "@mui/lab/LoadingButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import StakeModal from "./components/Stake/components/StakeModal";
import UnstakeModal from "./components/Stake/components/UnstakeModal";

import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import useUbiq from "hooks/useUbiq";
import { redeem } from "ubiq-sdk/utils";

const theme = createTheme({
  palette: {
    primary: {
      main: "#383883", // purple
    },
    secondary: {
      dark: "#053b06", // dark green
      main: "#0b5d1e", // neutral green
      light: "#06d6a0", // light green
    },
    success: {
      main: "#3acf14", // light green
    },
    info: {
      main: "#247ba0", // blue/teal
    },
    warning: {
      main: "#bf610a", // dark orange
    },
    error: {
      main: "#bf1212", // dark red
    },
  },
});

interface YieldFarmProps {
  farmKey: number;
}

const StyledItem = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.secondary.main,
  backgroundColor: "#333",
  height: "100%",
}));

const StyledArrowIcon = styled(ArrowCircleUpIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
  rotate: "90deg",
}));

const Farm: React.FC = () => {
  return (
    <Page>
      <Box textAlign="center">
        <h1>Yield Farms</h1>
        <p>Join a farming pool to start earning rewards!</p>
        <Button color="success" startIcon={<StyledArrowIcon />}>
          <Link href="/help">Click Here for Help</Link>
        </Button>
      </Box>
      <Spacer />
      <ThemeProvider theme={theme}>
        <YieldFarm farmKey={0} />
        <YieldFarm farmKey={1} />
      </ThemeProvider>
    </Page>
  );
};

const YieldFarm: React.FC<YieldFarmProps> = ({ farmKey }) => {
  // TODO: move this to an external file

  const farm = AvailableFarms[farmKey];

  const [manageFarm, setManageFarm] = useState(false);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "block",
        flexWrap: "wrap",
        width: "100%",
        minWidth: "80%",
        maxWidth: "960px",
        margin: "10px",
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <StyledItem sx={{ paddingTop: "20px" }}>
            <img
              src={farm.tokenB.logo}
              alt={`${farm.tokenB.symbol} Logo`}
              style={{ width: "80px", height: "80px", background: "#cecece", borderRadius: "40px", marginRight: "-20px" }}
            />
            <img
              src={farm.tokenA.logo}
              alt={`${farm.tokenA.symbol} Logo`}
              style={{ width: "80px", height: "80px", background: "white", borderRadius: "40px" }}
            />
            <p>{farm.name}</p>
            <LoadingButton
              onClick={() => {
                setManageFarm(!manageFarm);
              }}
              endIcon={<SettingsIcon />}
              loading={false}
              loadingPosition="end"
              variant="contained"
              color="info"
              size="small"
            >
              Manage
            </LoadingButton>
          </StyledItem>
        </Grid>

        <Grid item xs={7}>
          <StyledItem>
            <StakeCard farmKey={farmKey}></StakeCard>
          </StyledItem>
        </Grid>

        <Grid item xs={2}>
          <StyledItem>
            <HarvestCard farmKey={farmKey} />
          </StyledItem>
        </Grid>

        <Grid item xs={3} sx={{ display: manageFarm === true ? "" : "none" }}>
          <StyledItem>
            <h3>Manage Liquidity:</h3>
            <p>Use this to stake, unstake or withdrawl all of your LP tokens and rewards from the yield farm</p>
          </StyledItem>
        </Grid>
        <Grid item xs={9} sx={{ display: manageFarm === true ? "" : "none" }}>
          <StyledItem>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px 5px" }}>
              <StakeModal farmKey={farmKey} />
              <UnstakeModal farmKey={farmKey} />
              <HarvestAll farmKey={farmKey} />
            </div>
          </StyledItem>
        </Grid>
      </Grid>
    </Box>
  );
};

interface HarvestAllProps {
  farmKey: number;
}

const HarvestAll: React.FC<HarvestAllProps> = ({ farmKey }) => {
  const [isRedeeming, setisRedeeming] = useState(false);
  const ubiq = useUbiq();
  const { setConfirmTxModalIsOpen } = useFarming();
  const { account } = useWallet();

  const handleRedeem = useCallback(async () => {
    if (!ubiq) return;
    setConfirmTxModalIsOpen(true);
    setisRedeeming(false);
    await redeem(ubiq, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisRedeeming(false);
      }
      setConfirmTxModalIsOpen(false);
    }).catch((err) => {
      if (err.code === 4001) {
        console.log("Wallet: User cancelled");
      } else {
        console.log("Error caught:", err);
      }
    });
    setConfirmTxModalIsOpen(false);
    setisRedeeming(false);
  }, [account, setConfirmTxModalIsOpen, setisRedeeming, ubiq, farmKey]);

  return (
    <LoadingButton
      onClick={() => {
        handleRedeem();
      }}
      endIcon={<BlockIcon />}
      loading={isRedeeming}
      loadingPosition="end"
      variant="contained"
      color="error"
      size="medium"
    >
      Harvest & Unstake (All LP and Unharvested rewards)
    </LoadingButton>
  );
};

export default Farm;
