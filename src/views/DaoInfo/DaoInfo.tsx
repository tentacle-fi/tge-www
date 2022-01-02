import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import BarChartIcon from "@mui/icons-material/BarChart";
import StatsRibbon from "./components/StatsRibbon";
import PriceRibbon from "./components/PriceRibbon";
import DAOHoldingsDetails from "./components/DAOHoldingsDetails";
import Typography from "@mui/material/Typography";

const subtitleText = "Various DAO stats to more easily analyze the Tentacle Finance ecosystem at a glance.";

const DaoInfo: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={<BarChartIcon sx={{ fontSize: "98px" }} />} title={"DAO Infoformation"} subtitle={subtitleText} />
      <Typography variant="h4">Mission Statement</Typography>
      <Typography variant="h6">
        <ol>
          <li>Grow the Ubiq network through deployment of the DAO treasury</li>
          <li>Feed revenue streams back into the DAO to accelerate and perpetuate it</li>
          <li>Embed tentacles of finance into as many projects and networks as possible</li>
        </ol>
      </Typography>
      <StatsRibbon />
      <PriceRibbon />
      <DAOHoldingsDetails />
    </Page>
  );
};

export default React.memo(DaoInfo);
