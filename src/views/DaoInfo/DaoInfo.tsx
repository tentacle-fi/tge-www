import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import BarChartIcon from "@mui/icons-material/BarChart";
import StatsRibbon from "./components/StatsRibbon";
import PriceRibbon from "./components/PriceRibbon";
import DAOHoldingsDetails from "./components/DAOHoldingsDetails";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";

const subtitleText = "Tentacle Finance is the first DAO on the Ubiq network, check out some of our stats below!";

const MissionStatement = () => {
  return (
    <>
      <Typography variant="h4">Mission Statement</Typography>
      <Typography variant="h6">
        <ol>
          <li>Grow the Ubiq network through deployment of the DAO treasury</li>
          <li>Feed revenue streams back into the DAO to accelerate and perpetuate it</li>
          <li>Embed tentacles of finance into as many projects and networks as possible</li>
        </ol>
      </Typography>
    </>
  );
};

const DaoInfo: React.FC = () => {
  const { status } = useWallet();

  if (status === "disconnected") {
    return (
      <Page>
        <PageHeader icon={<BarChartIcon sx={{ fontSize: "98px" }} />} title={"DAO Information"} subtitle={subtitleText} />
        <MissionStatement />
        <hr style={{ width: "60%" }} />
        <Typography variant="h5">Please connect your wallet to see statistics.</Typography>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader icon={<BarChartIcon sx={{ fontSize: "98px" }} />} title={"DAO Information"} subtitle={subtitleText} />
      <MissionStatement />
      <StatsRibbon />
      <PriceRibbon />
      <DAOHoldingsDetails />
    </Page>
  );
};

export default React.memo(DaoInfo);
