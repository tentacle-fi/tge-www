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
import TimelineDot from "@mui/lab/TimelineDot";

import Tooltip from '@mui/material/Tooltip';

function TopBarElements() {
  return (
    <Stack direction="row" spacing={2}>
      <BlockHeightChip />
    </Stack>
  );
}

function BlockHeightChip(){
    return(
        <Tooltip title='current block height'>
          <Chip label="Chip Outlined" variant="outlined" color="success" />
        </Tooltip>
    );
}

function TimelinePhase1() {
    return (
      <>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
      <Tooltip title='phase 1'>
        <TimelineContent>
          <p>Phase 1</p>
          Launch INK, Launch Tentacle.Finance Site, Begin Farming
        </TimelineContent>
      </Tooltip>
      </TimelineItem>
      </>
);
}

function TimelinePhase2() {
    return (
      <>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
      <Tooltip title='phase 2'>
        <TimelineContent>
          <p>Phase 2</p>
          Launch Additional Farms, Enhance Farm UI
        </TimelineContent>
      </Tooltip>
      </TimelineItem>
      </>
    );
}

function TimelinePhase3() {
    return (
      <>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
      <Tooltip title='phase 3'>
        <TimelineContent>
          <p>Phase 3</p>
          Additional Farming Features, Secret Launch, Governance, Treasury, Bridges after voting
        </TimelineContent>
      </Tooltip>
      </TimelineItem>
      </>
    );
}

function TimelinePhase4() {
    return (
        <>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
        <Tooltip title='phase 4'>
          <TimelineContent>
            <p>Phase 4</p>
            TBA
          </TimelineContent>
        </Tooltip>
        </TimelineItem>
        </>
    )
}

const Home: React.FC = () => {
  const { darkMode } = useTheme();
  return (
    <>
      <Page>
        <PageHeader
          icon={darkMode ? "🌚" : "🌞"}
          subtitle={darkMode ? "🤫 shhh... the squids are sleeping." : "It's a great day to farm INK!"}
          title="Welcome to Tentacle.Finance"
        />
        <RoadmapTimeline />
        <TopBarElements />
      </Page>
    </>
  );
};

function RoadmapTimeline() {
  return (
    <Timeline position="alternate">
      <TimelinePhase1 />
      <TimelinePhase2 />
      <TimelinePhase3 />
      <TimelinePhase4 />
    </Timeline>
  );
}

export default Home;
