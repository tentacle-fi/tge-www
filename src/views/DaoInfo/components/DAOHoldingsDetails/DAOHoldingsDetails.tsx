import React from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
import Box from "@mui/material/Box";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";

interface DAOHoldingsDetailsProps {
  ubqPrice?: string;
}

// Coin/Token placeholders
const UBQHELDPLACEHOLDER = "1,000";
const INKHELDPLACEHOLDER = "100,000";
const GRANSHELDPLACEHOLDER = "2.5";
const ESCHHELDPLACEHOLDER = "75,000";

// LP Placeholders
const UBQINKLPPLACEHOLDER = "100";
const GRANSINKLPPLACEHOLDER = "25";
const ESCHINKLPPLACEHOLDER = "33.2";

const DAOHoldingsDetails: React.FC<DAOHoldingsDetailsProps> = ({ ubqPrice }) => {
  console.log("ubqPrice passed: ", ubqPrice);

  return (
    <>
      <p></p>
      <Typography variant="h5">DAO Holdings Details</Typography>

      <Box sx={{ border: 1, padding: "20px" }}>
        <Typography align="center" variant="h6">
          Coins/Tokens
        </Typography>
        <StyledStack direction="row" spacing={10}>
          <Chip label={"UBQ: " + UBQHELDPLACEHOLDER} color="primary" />
          <Chip label={"INK: " + INKHELDPLACEHOLDER} color="secondary" />
          <Chip label={"GRANS: " + GRANSHELDPLACEHOLDER} color="success" />
          <Chip label={"ESCH: " + ESCHHELDPLACEHOLDER} color="success" />
        </StyledStack>

        <Typography align="center" variant="h6">
          LP Standing
        </Typography>
        <StyledStack direction="row" spacing={15}>
          <Chip label={"UBQ/INK: " + UBQINKLPPLACEHOLDER} color="primary" />
          <Chip label={"GRANS/INK: " + GRANSINKLPPLACEHOLDER} color="secondary" />
          <Chip label={"ESCH/INK: " + ESCHINKLPPLACEHOLDER} color="success" />
        </StyledStack>
      </Box>
    </>
  );
};

const StyledStack = styled(Stack)`
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
`;

export default React.memo(DAOHoldingsDetails);
