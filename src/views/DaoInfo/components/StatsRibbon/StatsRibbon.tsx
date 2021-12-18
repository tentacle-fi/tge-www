import React from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";

interface StatsRibbonProps {
  blockHeight?: string;
}

const CIRCULATINGINKPLACEHOLDER = "1,000,000";
const ECOSYSTEMTVLPLACEHOLDER = "$375,000";
const DAILYVOLUMEPLACEHOLDER = "$65,039";
const DAILYTXVOLUMEPLACEHOLDER = "400";

const StatsRibbon: React.FC<StatsRibbonProps> = ({ blockHeight }) => {
  console.log("blockHeight passed: ", blockHeight);

  return (
    <>
      <Typography variant="h5">Stats Ribbon</Typography>
      <StyledStack direction="row" spacing={10}>
        <Chip label={"Circulating INK: " + CIRCULATINGINKPLACEHOLDER} color="primary" />
        <Chip label={"Ecosystem TVL: " + ECOSYSTEMTVLPLACEHOLDER} color="secondary" />
        <Chip label={"24hr Vol: " + DAILYVOLUMEPLACEHOLDER} color="success" />
        <Chip label={"24hr TXs: " + DAILYTXVOLUMEPLACEHOLDER} color="info" />
      </StyledStack>
    </>
  );
};

const StyledStack = styled(Stack)`
  borderradius: 100px;
  background: purple;
  padding: 20px;
`;

export default React.memo(StatsRibbon);
