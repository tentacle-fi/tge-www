import React, { useState, useEffect } from "react";
import useBalances from "hooks/useBalances";
import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import WidgetsIcon from "@mui/icons-material/Widgets";

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", marginLeft: "10px" }}>
      <CircularProgress size={34} variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" component="div">{`${Math.round(props.value)}s`}</Typography>
      </Box>
    </Box>
  );
}

const BlockHeightButton: React.FC = () => {
  const { CurrentBlock } = useBalances();
  const [lastBlock, setLastBlock] = useState(CurrentBlock);
  const [blockTimeCounter, setblockTimeCounter] = useState(1);

  useEffect(() => {
    const timerId = setInterval(() => {
      setblockTimeCounter(blockTimeCounter + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [blockTimeCounter]);

  useEffect(() => {
    if (lastBlock !== CurrentBlock) {
      setblockTimeCounter(1);
    }
  }, [lastBlock, CurrentBlock, setLastBlock, setblockTimeCounter]);

  return (
    <Tooltip title="Block height">
      <Button size="medium" variant="contained">
        <WidgetsIcon sx={{ fontSize: "14px" }} />
        {CurrentBlock}

        <CircularProgressWithLabel
          value={blockTimeCounter}
          sx={{ color: blockTimeCounter > 88 ? (blockTimeCounter > 180 ? "#ff3300" : "#f9a825") : "#b2ff59" }}
        />
      </Button>
    </Tooltip>
  );
};

export default React.memo(BlockHeightButton);
