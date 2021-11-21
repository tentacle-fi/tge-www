import React, { useMemo, useState, useCallback } from "react";

import { Button, Spacer } from "react-neu";

import Page from "components/Page";

import useFarming from "hooks/useFarming";
import HarvestCard from "./components/Harvest";
import StakeCard from "./components/Stake";
import { useWallet } from "use-wallet";
import { AvailableFarms } from "farms/AvailableFarms";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

import LoadingButton from "@mui/lab/LoadingButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { lightGreen, blue } from "@mui/material/colors";
import StakeModal from "./components/Stake/components/StakeModal";
import UnstakeModal from "./components/Stake/components/UnstakeModal";

import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";

const theme = createTheme({
  palette: {
    secondary: {
      // This is green.A700 as hex.
      main: lightGreen.A400,
    },
    info: {
      main: blue[800],
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

const Farm: React.FC = () => {
  return (
    <Page>
      <Box justifyContent="center">
        <h1>Yield Farms</h1>
        <p>Join a farming pool to start earning INK!</p>
        <Button full text="Get Started Here" to="/help" />
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

  const { status } = useWallet();

  const { isRedeeming, onRedeem, onStake, onUnstake } = useFarming();

  const [manageFarm, setManageFarm] = useState(false);

  const handleOnStake = useCallback(
    (contractIndex: number, amount: string) => {
      onStake(contractIndex, amount);
    },
    [onStake]
  );

  const handleOnUnstake = useCallback(
    (contractIndex: number, amount: string) => {
      onUnstake(contractIndex, amount);
    },
    [onUnstake]
  );

  const RedeemButton = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled text={`Harvest & Unstake ${farm.name}`} variant="secondary" />;
    }
    if (isRedeeming !== undefined && isRedeeming[farmKey] === false) {
      return (
        <Button
          onClick={() => {
            onRedeem(farmKey);
          }}
          text={`Harvest & Unstake ${farm.name}`}
          variant="secondary"
        />
      );
    }
    return <Button disabled text="Redeeming..." variant="secondary" />;
  }, [isRedeeming, onRedeem, farmKey, farm, status]);

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
              <StakeModal farmKey={farmKey} onStake={handleOnStake} />
              <UnstakeModal farmKey={farmKey} onUnstake={handleOnUnstake} />

              <LoadingButton
                onClick={() => {
                  onRedeem(farmKey);
                }}
                endIcon={<BlockIcon />}
                loading={false}
                loadingPosition="end"
                variant="contained"
                color="error"
                size="medium"
              >
                Harvest & Unstake (All LP and Unharvested rewards)
              </LoadingButton>
            </div>
          </StyledItem>
        </Grid>
      </Grid>
    </Box>
  );
};

/*

<Container>
<Spacer />
<Split>
  <StakeCard farmKey={farmKey}>
    <img
      src={farm.tokenA.logo}
      alt={`${farm.tokenA.symbol} Logo`}
      style={{ width: "80px", height: "80px", background: "white", borderRadius: "40px" }}
    />
    <span style={{ fontSize: "50px", lineHeight: "80px", width: "50px", display: "block", textAlign: "center" }}>+</span>
    <img src={farm.tokenB.logo} alt={`${farm.tokenB.symbol} Logo`} style={{ width: "80px", height: "80px" }} />
  </StakeCard>
  <HarvestCard farmKey={farmKey} />
</Split>
<Spacer />
<Box justifyContent="center">{RedeemButton}</Box>
<Spacer size="lg" />
<Separator />
<Spacer size="lg" />
<Split>
  <Button full text={`Get ${farm.name} LP tokens`} href={farm.lp.url} variant="tertiary" />
</Split>
</Container>
*/

export default Farm;
