import { Button, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";

const colorPalette = ["red", "blue", "black", "orange", "purple", "pink", "teal", "gray"];

const defaultActiveColor = colorPalette[0];

// TODO: add screen resize events to resize the canvas
// TODO: add ability to paint a cell the selected color

// canvas details
const Canvas = {
  theme: {
    background: "#ff3300",
    stroke: "#000",
    selectionStroke: "#fff",
  },
  width: 10,
  height: 6,
  cell: {
    width: 40,
    height: 40,
    strokeWidth: 1,
  },
  border: {
    padding: 10,
  },
};

// Old structure for fake contract events (hasn't been refactored to work with Konvas yet)
//
// const StubbedContractEvents = [
//   {
//     type: "event",
//     events: [
//       {
//         paint: {
//           address: "0x000",
//           pixel: [0, 1],
//           color: "red",
//         },
//       },
//     ],
//   },
//   {
//     type: "event",
//     events: [
//       {
//         paint: {
//           address: "0x111",
//           pixel: [3, 3],
//           color: "blue",
//         },
//       },
//     ],
//   },
//   {
//     type: "event",
//     events: [
//       {
//         paint: {
//           address: "0x222",
//           pixel: [5, 1],
//           color: "orange",
//         },
//       },
//     ],
//   },
// ];

const ColorPicker: React.FC = () => {
  const colors = colorPalette;
  const [activeColor, setActiveColor] = useState(defaultActiveColor);
  // const { BlockNum } = useUbiq();

  const handleColorPick = useCallback((e: any) => {
    setActiveColor(e.innerHTML);
  }, []);

  // Processes the smart contract events on each block update and paints the canvas accordingly (not refactored for Konvas yet)
  // useEffect(() => {
  //   const canvas: any = canvasRef.current;
  //   if (canvas === null) return;
  //   const context = canvas.getContext("2d");

  //   if (context) {
  //     console.log("got canvas", canvas);
  //     drawGridLines(context);
  //     processContractData(context);
  //   }
  // }, [BlockNum]);

  const ColorGrid = useMemo(() => {
    return colors.map((item, index) => {
      return (
        <>
          <Button key={`${item}-${index}`} onClick={(e) => handleColorPick(e.target)}>
            <Grid sx={{ border: "1px solid white", width: "100px", height: "100px", backgroundColor: item }} item>
              {item}
              {activeColor === item ? "*" : ""}
            </Grid>
          </Button>
        </>
      );
    });
  }, [activeColor, colors, handleColorPick]);

  return (
    <>
      <Typography>Pick a color</Typography>
      <Grid container direction="row" sx={{ width: "500px" }}>
        {ColorGrid}
      </Grid>

      <Button
        onClick={() => console.log("need to implement painting...", activeColor)}
        disabled={true === undefined ? true : false}
        variant="contained"
      >
        Paint!
      </Button>
    </>
  );
};

const Konvas: React.FC = () => {
  const handleTouchMove = useCallback((e: any) => {
    e.evt.preventDefault();
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    // additional panning code which might be possible to stitch in
    // if (touch1 && touch2) {
    //   // if the stage was under Konva's drag&drop
    //   // we need to stop it, and implement our own pan logic with two pointers
    //   if (stage.isDragging()) {
    //     stage.stopDrag();
    //   }

    //   var p1 = {
    //     x: touch1.clientX,
    //     y: touch1.clientY,
    //   };
    //   var p2 = {
    //     x: touch2.clientX,
    //     y: touch2.clientY,
    //   };

    //   if (!lastCenter) {
    //     lastCenter = getCenter(p1, p2);
    //     return;
    //   }
    //   var newCenter = getCenter(p1, p2);

    //   var dist = getDistance(p1, p2);

    //   if (!lastDist) {
    //     lastDist = dist;
    //   }

    //   // local coordinates of center point
    //   var pointTo = {
    //     x: (newCenter.x - stage.x()) / stage.scaleX(),
    //     y: (newCenter.y - stage.y()) / stage.scaleX(),
    //   };

    //   var scale = stage.scaleX() * (dist / lastDist);

    //   stage.scaleX(scale);
    //   stage.scaleY(scale);

    //   // calculate new position of the stage
    //   var dx = newCenter.x - lastCenter.x;
    //   var dy = newCenter.y - lastCenter.y;

    //   var newPos = {
    //     x: newCenter.x - pointTo.x * scale + dx,
    //     y: newCenter.y - pointTo.y * scale + dy,
    //   };

    //   stage.position(newPos);

    //   lastDist = dist;
    //   lastCenter = newCenter;
    // }

    console.log("got touched:", touch1, touch2);
  }, []);

  const handleTouchStart = useCallback((e: any) => {
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];
    console.log("touched", touch1, touch2);
  }, []);

  const BackgroundMemo = useMemo(() => {
    return (
      <Rect
        x={0}
        y={0}
        width={Canvas.width * Canvas.cell.width + 2 * Canvas.border.padding}
        height={Canvas.height * Canvas.cell.height + 2 * Canvas.border.padding}
        fill={Canvas.theme.background}
      />
    );
  }, []);

  return (
    <>
      <ColorPicker />
      <Stage
        width={Canvas.width * Canvas.cell.width + 200}
        height={Canvas.height * Canvas.cell.height + 200}
        draggable
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
      >
        <Layer>
          {BackgroundMemo}
          <GridRows />
        </Layer>
      </Stage>
    </>
  );
};

interface IPos {
  x: number;
  y: number;
}

const GridRows: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<IPos>();

  const handleCellClick = useCallback((cellX: number, cellY: number) => {
    console.log("you clicked a cell", cellX, cellY);
    setSelectedCell({ x: cellX, y: cellY });
  }, []);

  const Grids = useMemo(() => {
    return [...Array(Canvas.height)].map((grid, rowId) => {
      const rowY = rowId * Canvas.cell.height;

      return [...Array(Canvas.width)].map((grid, col) => {
        const cellSelected = selectedCell?.x === col && selectedCell?.y === rowId;

        return (
          <React.Fragment key={`col-${col}`}>
            <Text x={Canvas.border.padding + col * Canvas.cell.width} y={Canvas.border.padding + rowY} text={`${col},${rowId}`} />

            <Rect
              x={Canvas.border.padding + col * Canvas.cell.width}
              y={Canvas.border.padding + rowY}
              width={Canvas.cell.width}
              height={Canvas.cell.height}
              stroke={cellSelected === true ? Canvas.theme.selectionStroke : Canvas.theme.stroke}
              strokeWidth={Canvas.cell.strokeWidth}
              onClick={() => handleCellClick(col, rowId)}
            />
          </React.Fragment>
        );
      });
    });
  }, [handleCellClick, selectedCell]);

  useEffect(() => {
    console.log("selected cell:", selectedCell);
  }, [selectedCell]);

  return <>{Grids}</>;
};

export default Konvas;
