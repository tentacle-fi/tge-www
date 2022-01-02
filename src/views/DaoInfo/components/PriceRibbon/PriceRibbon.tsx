import React from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";
import useBalances from "hooks/useBalances";
import { UBQ, INK } from "farms/AvailableFarms";

interface PriceRibbonProps {
  ubqPrice?: string;
}

const PriceRibbon: React.FC<PriceRibbonProps> = ({ ubqPrice }) => {
  console.log("ubqPrice passed: ", ubqPrice);
  const { tokenPrices } = useBalances();

  if (tokenPrices === undefined) {
    console.log("no tokenPrices available yet...");
    return <></>;
  }

  const UBQPRICE = tokenPrices[UBQ];
  const INKPRICE = tokenPrices[INK];

  return (
    <>
      <p></p>
      <Typography variant="h5">Price Ribbon</Typography>
      <StyledStack direction="row" spacing={10}>
        <Chip label={"UBQ: $" + UBQPRICE.toFixed(2)} color="primary" />
        <Chip label={"INK: $" + INKPRICE.toFixed(4)} color="secondary" />
        <Chip label={"Ratio: " + (INKPRICE / UBQPRICE).toFixed(4) + " UBQ per INK"} color="success" />
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
