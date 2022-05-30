import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { Button, Grid, styled } from "@mui/material";

// canvas dimensions (pixels)
const canvasHeight = 200;
const canvasWidth = 200;
const canvasGridPadding = 10;
const canvasGridSize = 40;
const canvasBorderWidth = 0.5;
const canvasOffsetDimension = canvasGridSize + canvasGridPadding + canvasBorderWidth; // used to calculate which grid square is clicked

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

const PaintingCanvas: React.FC = () => {
  const colors = ["red", "blue", "black", "orange"];
  const canvasRef = useRef(null);
  const [activeColor, setActiveColor] = useState("red");

  const handleColorPick = useCallback((e: any) => {
    console.log("picked color clicked", e.innerHTML);
    setActiveColor(e.innerHTML);
  }, []);

  const handleFillSquare = useCallback(
    (e: any) => {
      const canvas: any = canvasRef.current;
      if (canvas === null) return;
      const context = canvas.getContext("2d");

      const cursorPosition = calculateCursorPosition(canvas, e);
      const gridLocationClicked: any = calculateGridSquare(cursorPosition, canvasOffsetDimension);
      console.log(`filling square: ${gridLocationClicked}`);
      const xIndex = 0;
      const yIndex = 1;
      const fillParams = [
        (gridLocationClicked[yIndex] - 1) * canvasGridSize + canvasGridPadding,
        (gridLocationClicked[xIndex] - 1) * canvasGridSize + canvasGridPadding,
        canvasGridSize,
        canvasGridSize,
      ];
      context.fillStyle = activeColor;
      console.log("preparing to fill with params: ", fillParams, activeColor);

      context.fillRect(...fillParams);
    },
    [activeColor]
  );

  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");

    if (context) {
      console.log("got canvas", canvas);

      for (let x = 0; x <= canvasWidth; x += canvasGridSize) {
        context.moveTo(canvasBorderWidth + x + canvasGridPadding, canvasGridPadding);
        context.lineTo(canvasBorderWidth + x + canvasGridPadding, canvasHeight + canvasGridPadding);
      }

      for (let x = 0; x <= canvasHeight; x += canvasGridSize) {
        context.moveTo(canvasGridPadding, canvasBorderWidth + x + canvasGridPadding);
        context.lineTo(canvasWidth + canvasGridPadding, canvasBorderWidth + x + canvasGridPadding);
      }
      context.strokeStyle = "black";
      context.stroke();
    }
  }, []);

  const colorGrid = colors.map((item, index) => {
    return (
      <>
        <Button onClick={(e) => handleColorPick(e.target)}>
          <Grid sx={{ border: "1px solid white", width: "100px", height: "100px", backgroundColor: item }} item>
            {item}
            {activeColor === item ? "*" : ""}
          </Grid>
        </Button>
      </>
    );
  });

  return (
    <>
      <Typography>Pick a color</Typography>
      <Grid container direction="row" sx={{ width: "500px" }}>
        {colorGrid}
      </Grid>

      <Typography>HTML Canvas</Typography>
      <StyledCanvas onClick={(e) => handleFillSquare(e)} ref={canvasRef} width={canvasWidth + 20} height={canvasHeight + 20}></StyledCanvas>
    </>
  );
};

const Home: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={<NightsStayIcon sx={{ fontSize: "98px" }} />} title="Welcome to Tentacle.Finance" />
      <Introduction />
      <RoadmapTimeline />
      <Donate />
      <PaintingCanvas />
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

const StyledCanvas = styled("canvas")(({ theme }) => ({
  background: "red",
}));

//
// Helper Functions
//

// calculates the coordinates of the cursor in the supplied canvas
const calculateCursorPosition = (canvas: any, event: any) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
};

// based on the coordinates and gridSizing, this returns the column and row which was clicked
const calculateGridSquare = (coordinates: any, gridSize: number) => {
  let rowClicked = 0;
  let columnClicked = 0;

  columnClicked = Math.floor(coordinates[0] / gridSize) + 1;
  rowClicked = Math.floor(coordinates[1] / gridSize) + 1;

  console.log(`coords: ${coordinates} row: ${rowClicked} column: ${columnClicked}`);
  return [rowClicked, columnClicked];
};

export default React.memo(Home);
