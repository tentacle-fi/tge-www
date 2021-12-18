import React from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";

interface PriceRibbonProps {
  ubqPrice?: string;
}

const UBQPRICEPLACEHOLDER = "$0.20";
const INKPRICEPLACEHOLDER = "$0.02";
const RATIOPLACEHOLDER = "10";

const PriceRibbon: React.FC<PriceRibbonProps> = ({ ubqPrice }) => {
  console.log("ubqPrice passed: ", ubqPrice);

  return (
    <>
      <Typography variant="h4">Price Ribbon Example</Typography>
      <StyledStack direction="row" spacing={10}>
        <Chip label={"UBQ: " + UBQPRICEPLACEHOLDER} color="primary" />
        <Chip label={"INK: " + INKPRICEPLACEHOLDER} color="secondary" />
        <Chip label={"Ratio: " + RATIOPLACEHOLDER} color="success" />
      </StyledStack>
    </>
  );
};

const StyledStack = styled(Stack)`
  borderradius: 100px;
  background: purple;
  padding: 20px;
`;

export default React.memo(PriceRibbon);
