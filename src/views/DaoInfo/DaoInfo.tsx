import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import BarChartIcon from "@mui/icons-material/BarChart";
import StatsRibbon from "./components/StatsRibbon";

const subtitleText = "Various DAO stats to more easily analyze the Tentacle Finance ecosystem at a glance.";

const DaoInfo: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={<BarChartIcon sx={{ fontSize: "98px" }} />} title={"DAO Infoformation"} subtitle={subtitleText} />
      <StatsRibbon />
    </Page>
  );
};

export default React.memo(DaoInfo);
