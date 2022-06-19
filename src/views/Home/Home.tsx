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
import Konvas from "components/Konvas";

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
      <Typography>Konva Kanvas</Typography>
      <Konvas />
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

// const StyledCanvas = styled("canvas")(({ theme }) => ({
//   background: "red",
// }));

//
// Helper Functions
//

// calculates the coordinates of the cursor in the supplied canvas
// const calculateCursorPosition = (canvas: any, event: any) => {
//   const rect = canvas.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const y = event.clientY - rect.top;
//   return [x, y];
// };

// based on the coordinates and gridSizing, this returns the column and row which was clicked
// const calculateGridSquare = (coordinates: any, gridSize: number) => {
//   let rowClicked = 0;
//   let columnClicked = 0;
//   const humanReadableGridIncrementor = 1; // Offsets the calculated grid by +1 so 0,0 is actually 1,1 which is more friendly for humans

//   columnClicked = Math.floor(coordinates[0] / gridSize) + humanReadableGridIncrementor;
//   rowClicked = Math.floor(coordinates[1] / gridSize) + humanReadableGridIncrementor;

//   console.log(`coords: ${coordinates} row: ${rowClicked} column: ${columnClicked}`);
//   return [rowClicked, columnClicked];
// };

// const drawGridLines = (context: any) => {
//   for (let x = 0; x <= canvasWidth; x += canvasGridSize) {
//     context.moveTo(canvasBorderWidth + x + canvasGridPadding, canvasGridPadding);
//     context.lineTo(canvasBorderWidth + x + canvasGridPadding, canvasHeight + canvasGridPadding);
//   }

//   for (let x = 0; x <= canvasHeight; x += canvasGridSize) {
//     context.moveTo(canvasGridPadding, canvasBorderWidth + x + canvasGridPadding);
//     context.lineTo(canvasWidth + canvasGridPadding, canvasBorderWidth + x + canvasGridPadding);
//   }
//   context.strokeStyle = "black";
//   context.stroke();
// };

// const fillSquare = (gridLocationClicked: any, context: any, color: string) => {
//   const fillParams = [
//     (gridLocationClicked[yIndex] - 1) * canvasGridSize + canvasGridPadding,
//     (gridLocationClicked[xIndex] - 1) * canvasGridSize + canvasGridPadding,
//     canvasGridSize,
//     canvasGridSize,
//   ];
//   context.fillStyle = color;
//   context.fillRect(...fillParams);
// };

// const processContractData = (context: any) => {
//   for (const events of StubbedContractEvents) {
//     // not confusing at all, self documenting code
//     for (const event of events.events) {
//       console.log(
//         `processing individual event: ${JSON.stringify(event.paint)} from: ${event.paint.address} pixel: ${event.paint.pixel} color: ${
//           event.paint.color
//         }`
//       );

//       fillSquare(event.paint.pixel, context, event.paint.color);
//     }
//   }
// };

// const paintAPixel = (pixelCoordinates: Array<number>, context: any, color: string) => {
//   console.log("preparing to paint pixel: ", pixelCoordinates, color);

//   const newTransaction = {
//     type: "event",
//     events: [
//       {
//         paint: {
//           address: "0xABCD",
//           pixel: pixelCoordinates,
//           color: color,
//         },
//       },
//     ],
//   };

//   StubbedContractEvents.push(newTransaction);
// };

export default React.memo(Home);
