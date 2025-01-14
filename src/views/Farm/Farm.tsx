import React, { useState, useCallback, useMemo } from "react";
import Page from "components/Page";
import useFarming from "hooks/useFarming";
import HarvestCard from "./components/Harvest";
import StakeCard from "./components/Stake";
import { useWallet } from "use-wallet";
import { AvailableFarms } from "farms/AvailableFarms";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import LoadingButton from "@mui/lab/LoadingButton";
import StakeModal from "./components/Stake/components/StakeModal";
import UnstakeModal from "./components/Stake/components/UnstakeModal";
import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import useUbiq from "hooks/useUbiq";
import { redeem } from "ubiq-sdk/utils";
import useApproval from "hooks/useApproval";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import SLink from "components/SLink";
import InfoIconWithTooltip from "components/InfoIconWithTooltip";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import LabelIcon from "@mui/icons-material/Label";
import useEvm from "hooks/useEvmProvider";

interface YieldFarmProps {
  farmKey: number;
}

const StyledItem = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.secondary.main,
  backgroundColor: "#333333",
  height: "100%",
}));

const StyledArrowIcon = styled(ArrowCircleUpIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
  rotate: "90deg",
}));

const Farm: React.FC = () => {
  const generateFarms = useCallback((official: boolean) => {
    let farms = [] as Array<React.ReactNode>;
    let index = 0;

    AvailableFarms.forEach((farm) => {
      if (farm.official === official) {
        farms.push(<YieldFarm farmKey={index} key={index.toString()} />);
      }
      index++;
    });

    return farms;
  }, []);

  const OfficialFarms = generateFarms(true);
  const CommunityFarms = generateFarms(false);

  const { earnedBalances, farmFns } = useFarming();

  const harvestAllShortcut = useCallback(async () => {
    if (!farmFns || !earnedBalances) return;

    const farmIndexesWithBalances = [] as number[];

    earnedBalances.forEach((balance, index) => {
      if (balance.isGreaterThan(0)) {
        farmIndexesWithBalances.push(index);
      }
    });

    let promises = [];
    for (let i = 0; i < farmIndexesWithBalances.length; i++) {
      const harvestFn = farmFns?.harvest[farmIndexesWithBalances[i]];
      if (harvestFn === undefined || typeof harvestFn !== "function") {
        continue;
      }

      promises.push(harvestFn(i + 1 < farmIndexesWithBalances.length));
    }

    Promise.all(promises);
  }, [farmFns, earnedBalances]);

  return (
    <Page>
      <Box textAlign="center">
        <h1>Yield Farms</h1>
        <p>Join a farming pool to start earning rewards!</p>
        <SLink href="/help">
          <Button color="success" variant="outlined" startIcon={<StyledArrowIcon />}>
            Click Here for Help
          </Button>
        </SLink>
      </Box>
      <>
        <Typography variant="h4" sx={{ left: "20px", marginTop: "20px" }}>
          Tentacle.Finance Farms <InfoIconWithTooltip tooltipText="Farms owned & operated by the Tentacle Finance DAO" />
        </Typography>

        <Box sx={{ width: "100%", textAlign: "right", marginRight: "10%" }}>
          <Tooltip title="Click to harvest all available rewards!">
            <Button variant="contained" size="large" onClick={harvestAllShortcut}>
              Harvest All
            </Button>
          </Tooltip>
        </Box>

        {OfficialFarms}

        <hr style={{ width: "80%", border: "1px solid #555", margin: "20px 0" }} />
        <Typography variant="h4">
          Community Farms <InfoIconWithTooltip tooltipText="Additional Ubiq farms provided for convenience" />
        </Typography>
        <Typography variant="body1">Note: Community farms are not managed or maintained by the Tentacle.Finance DAO.</Typography>
        {CommunityFarms}
      </>
    </Page>
  );
};

const YieldFarm: React.FC<YieldFarmProps> = React.memo(({ farmKey }) => {
  // TODO: move this to an external file
  const farm = AvailableFarms[farmKey];
  const [manageFarm, setManageFarm] = useState(false);
  const { setConfirmModal } = useEvm();
  const { isApproved, isApproving, onApprove } = useApproval(AvailableFarms[farmKey].lp.address, AvailableFarms[farmKey].yieldfarm.address, () =>
    setConfirmModal(false)
  );

  const showMobileGrid = useMediaQuery("(max-width:900px)");

  const ApproveOrStakeControls = useMemo(() => {
    if (!isApproved) {
      return (
        <>
          <LoadingButton
            sx={{ marginLeft: "10px" }}
            onClick={() => {
              setConfirmModal(true, "Please approve the staking request in your wallet");
              onApprove();
            }}
            endIcon={<AddCircleOutlineIcon />}
            loading={isApproving}
            loadingPosition="end"
            variant="contained"
            color="warning"
            size="medium"
          >
            Approve Staking
          </LoadingButton>

          {!isApproving && <Alert severity="warning">Approval must be given before staking can take place.</Alert>}
          {isApproving && <Alert severity="info">Approval pending, please wait.</Alert>}
        </>
      );
    }

    return (
      <>
        <StakeModal farmKey={farmKey} />
        <UnstakeModal farmKey={farmKey} />
        <HarvestAll farmKey={farmKey} />
      </>
    );
  }, [farmKey, isApproving, isApproved, onApprove, setConfirmModal]);

  const FarmLogosAndManageButton = useMemo(() => {
    const PhaseComponent = () => {
      if (farm.phase === "") {
        return <></>;
      }
      return (
        <Tooltip title='Farm "Tier", see Medium introduction article for more info.'>
          <div style={{ height: "20px", position: "absolute", left: "-15px" }}>
            <LabelIcon sx={{ position: "absolute", left: "0px", fontSize: "38px" }} />
            <Typography sx={{ position: "absolute", left: "8px", top: "9px", fontSize: "14px" }}>{farm.phase}</Typography>
          </div>
        </Tooltip>
      );
    };

    return (
      <Grid item xs={6} md={2}>
        <StyledItem sx={{ paddingTop: "20px", position: "relative" }}>
          <PhaseComponent />

          <div style={{ height: "60%", minHeight: "130px" }}>
            <img
              src={farm.tokenA.logo}
              alt={`${farm.tokenA.symbol} Logo`}
              style={{ width: "50px", height: "50px", background: "white", borderRadius: "40px" }}
            />
            <img
              src={farm.tokenB.logo}
              alt={`${farm.tokenB.symbol} Logo`}
              style={{ width: "50px", height: "50px", background: "white", borderRadius: "40px", marginRight: "-20px" }}
            />

            <Typography sx={{ marginTop: "10px" }}>{farm.name}</Typography>
          </div>
          <LoadingButton
            sx={{ marginTop: "10px" }}
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
    );
  }, [farm, manageFarm]);

  const FarmStats = useMemo(() => {
    return (
      <Grid item xs={12} md={8}>
        <StyledItem>
          <StakeCard farmKey={farmKey} />
        </StyledItem>
      </Grid>
    );
  }, [farmKey]);

  const HarvestRewards = useMemo(() => {
    return (
      <Grid item xs={6} md={2}>
        <StyledItem>
          <HarvestCard farmKey={farmKey} />
        </StyledItem>
      </Grid>
    );
  }, [farmKey]);

  const ManageFarm = useMemo(() => {
    return (
      <>
        <Grid item xs={3} sx={{ display: manageFarm === true ? "" : "none" }}>
          <StyledItem>
            <Typography sx={{ marginTop: "5px" }} variant="h4">
              Manage Liquidity
            </Typography>
            <Typography sx={{ margin: "20px" }} variant="body1">
              Use this to stake, unstake or withdraw all of your LP tokens and rewards from the yield farm
            </Typography>
          </StyledItem>
        </Grid>
        <Grid item xs={9} sx={{ display: manageFarm === true ? "" : "none" }}>
          <StyledItem>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px 5px" }}>{ApproveOrStakeControls}</div>
          </StyledItem>
        </Grid>
      </>
    );
  }, [manageFarm, ApproveOrStakeControls]);

  const GridComponents = useMemo(() => {
    if (showMobileGrid) {
      return (
        <>
          {FarmLogosAndManageButton}
          {HarvestRewards}
          {ManageFarm}
          {FarmStats}
        </>
      );
    }

    return (
      <>
        {FarmLogosAndManageButton}
        {FarmStats}
        {HarvestRewards}
        {ManageFarm}
      </>
    );
  }, [showMobileGrid, FarmLogosAndManageButton, FarmStats, HarvestRewards, ManageFarm]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "block",
        flexWrap: "wrap",
        width: "100%",
        minWidth: "90%",
        maxWidth: "1000px",
        margin: "10px",
      }}
    >
      <Grid container spacing={1}>
        {GridComponents}
      </Grid>
    </Box>
  );
});

interface HarvestAllProps {
  farmKey: number;
}

const HarvestAll: React.FC<HarvestAllProps> = React.memo(({ farmKey }) => {
  const [isRedeeming, setisRedeeming] = useState(false);
  const { ubiq } = useUbiq();
  const { setConfirmModal } = useEvm();
  const { account } = useWallet();

  const handleRedeem = useCallback(async () => {
    if (!ubiq?.contracts) return;
    console.log("handleRedeem");
    setConfirmModal(true);
    setisRedeeming(false);
    await redeem(ubiq, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisRedeeming(false);
      }
      setConfirmModal(false);
    }).catch((err) => {
      if (err.code === 4001) {
        console.log("Wallet: User cancelled");
      } else {
        console.error("Error caught:", err);
      }
    });
    setConfirmModal(false);
    setisRedeeming(false);
  }, [account, setConfirmModal, setisRedeeming, ubiq, farmKey]);

  return (
    <LoadingButton
      onClick={handleRedeem}
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
});

export default React.memo(Farm);
