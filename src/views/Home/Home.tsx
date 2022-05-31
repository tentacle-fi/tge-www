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
import useUbiq from "hooks/useUbiq";

const xIndex = 0;
const yIndex = 1;

const colorPalette = ["red", "blue", "black", "orange", "purple", "pink", "teal", "gray"];

const defaultActiveColor = colorPalette[0];

const StubbedContractEvents = [
  {
    type: "event",
    events: [
      {
        paint: {
          address: "0x000",
          pixel: [0, 1],
          color: "red",
        },
      },
    ],
  },
  {
    type: "event",
    events: [
      {
        paint: {
          address: "0x111",
          pixel: [3, 3],
          color: "blue",
        },
      },
    ],
  },
  {
    type: "event",
    events: [
      {
        paint: {
          address: "0x222",
          pixel: [5, 1],
          color: "orange",
        },
      },
    ],
  },
];

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
  const colors = colorPalette;
  const canvasRef = useRef(null);
  const [activeColor, setActiveColor] = useState(defaultActiveColor);
  const [selectedGridCoordinates, setSelectedGridCoordinates] = useState<Array<number> | undefined>();
  const { BlockNum } = useUbiq();

  const handleColorPick = useCallback((e: any) => {
    setActiveColor(e.innerHTML);
  }, []);

  const handleSquareSelection = useCallback((e: any) => {
    const canvas: any = canvasRef.current;
    if (canvas === null) return;
    const cursorPosition = calculateCursorPosition(canvas, e);
    const gridLocationClicked: any = calculateGridSquare(cursorPosition, canvasOffsetDimension);
    console.log(`setting selected square: ${gridLocationClicked}`);
    setSelectedGridCoordinates(gridLocationClicked);
  }, []);

  const handleUserPaintAPixel = useCallback(() => {
    if (selectedGridCoordinates === undefined) return;
    paintAPixel(selectedGridCoordinates, canvasRef.current, activeColor);
  }, [activeColor, selectedGridCoordinates]);

  // Processes the smart contract events on each block update and paints the canvas accordingly
  useEffect(() => {
    const canvas: any = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");

    if (context) {
      console.log("got canvas", canvas);
      drawGridLines(context);
      processContractData(context);
    }
  }, [BlockNum]);

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
      <StyledCanvas onClick={(e) => handleSquareSelection(e)} ref={canvasRef} width={canvasWidth + 20} height={canvasHeight + 20}></StyledCanvas>
      <Button onClick={handleUserPaintAPixel} disabled={selectedGridCoordinates === undefined ? true : false} variant="contained">
        Paint!
      </Button>
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

const drawGridLines = (context: any) => {
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
};

const fillSquare = (gridLocationClicked: any, context: any, color: string) => {
  const fillParams = [
    (gridLocationClicked[yIndex] - 1) * canvasGridSize + canvasGridPadding,
    (gridLocationClicked[xIndex] - 1) * canvasGridSize + canvasGridPadding,
    canvasGridSize,
    canvasGridSize,
  ];
  context.fillStyle = color;
  context.fillRect(...fillParams);
};

const processContractData = (context: any) => {
  for (const events of StubbedContractEvents) {
    // not confusing at all, self documenting code
    for (const event of events.events) {
      console.log(
        `processing individual event: ${JSON.stringify(event.paint)} from: ${event.paint.address} pixel: ${event.paint.pixel} color: ${
          event.paint.color
        }`
      );

      fillSquare(event.paint.pixel, context, event.paint.color);
    }
  }
};

const paintAPixel = (pixelCoordinates: Array<number>, context: any, color: string) => {
  console.log("preparing to paint pixel: ", pixelCoordinates, color);

  const newTransaction = {
    type: "event",
    events: [
      {
        paint: {
          address: "0xABCD",
          pixel: pixelCoordinates,
          color: color,
        },
      },
    ],
  };

  StubbedContractEvents.push(newTransaction);
};

export default React.memo(Home);
