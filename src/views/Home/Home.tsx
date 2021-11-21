import React from "react";
import { useTheme } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";

import NightsStayIcon from "@mui/icons-material/NightsStay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import Tooltip from "@mui/material/Tooltip";

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
  const { darkMode } = useTheme();
  return (
    <Page>
      <PageHeader
        icon={darkMode ? <NightsStayIcon sx={{ fontSize: "98px" }} /> : "🌞"}
        subtitle={darkMode ? "🤫 shhh... the squids are sleeping." : "It's a great day to farm INK!"}
        title="Welcome to Tentacle.Finance"
      />
      <RoadmapTimeline />
      <TopBarElements />
    </Page>
  );
};

function RoadmapTimeline() {
  return (
    <Timeline position="alternate">
      <TimelinePhase title="Phase 1" desc="Launch INK, Launch Tentacle.Finance Site, Begin Farming" complete={true} />
      <TimelinePhase title="Phase 2" desc="Launch Additional Farms, Enhance Farm UI" />
      <TimelinePhase title="Phase 3" desc="Additional Farming Features, Secret Launch, Governance, Treasury, Bridges after voting" />
      <TimelinePhase title="Phase 4" desc="TBA" />
    </Timeline>
  );
}

function TopBarElements() {
  return (
    <Stack direction="row" spacing={2}>
      <BlockHeightChip />
    </Stack>
  );
}

function BlockHeightChip() {
  return (
    <Tooltip title="current block height">
      <Chip label="Chip Outlined" variant="outlined" color="success" />
    </Tooltip>
  );
}

export default Home;
