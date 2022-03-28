import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Tooltip from "@mui/material/Tooltip";
import Donate from "components/Donate";

interface TimelinePhaseProps {
  title: string;
  desc: string;
  complete?: boolean;
}

const TimelinePhase: React.FC<TimelinePhaseProps> = ({ title, desc, complete = false }) => {
  let TimelineIcon = complete === true ? <CheckCircleIcon sx={{ color: "lightgreen" }} /> : <FiberManualRecordIcon sx={{ color: "lightblue" }} />;
  let tooltipText = title;

  if (complete === true) {
    tooltipText += ", complete!";
  }

  return (
    <TimelineItem>
      <TimelineSeparator>
        {TimelineIcon}
        <TimelineConnector />
      </TimelineSeparator>
      <Tooltip title={tooltipText}>
        <TimelineContent>
          <h4>{title}</h4>
          {desc}
        </TimelineContent>
      </Tooltip>
    </TimelineItem>
  );
};

const Home: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={<NightsStayIcon sx={{ fontSize: "98px" }} />} title="Welcome to Tentacle.Finance" />
      <Introduction />
      <RoadmapTimeline />
      <Donate />
    </Page>
  );
};

function Introduction() {
  return (
    <Box sx={{ textAlign: "center", maxWidth: "800px" }}>
      <p>
        Tentacle Finance is a collection of Decentralized Finance (DeFi) apps and traditional Smart Contract Decentralized Apps (dApps), currently
        running on the Ubiq blockchain. These are produced and maintained by the Tentacle Finance Decentralized Autonomous Organization (DAO) which is
        open for participation to everyone. Join the Discord now to learn how you can contribute.
      </p>
    </Box>
  );
}

function RoadmapTimeline() {
  return (
    <>
      <hr style={{ color: "#0c001c", borderWidth: "5px", width: "80%" }} />
      <Typography variant="h4">Phases</Typography>
      <Timeline position="alternate">
        <TimelinePhase title="Phase 1" desc="Launch INK, Launch Tentacle.Finance Site, Begin Farming" complete={true} />
        <TimelinePhase title="Phase 2" desc="Launch Additional Farms, Enhance Farm UI" complete={true} />
        <TimelinePhase title="Phase 3" desc="Additional Farming Features, Secret Launch, DAO Info Page" complete={true} />
        <TimelinePhase title="Phase 4" desc="Governance, and More!" complete={true} />
      </Timeline>
      <hr style={{ color: "#0c001c", borderWidth: "5px", width: "80%" }} />
    </>
  );
}

export default React.memo(Home);
