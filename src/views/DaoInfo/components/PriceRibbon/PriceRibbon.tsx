import React from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import styled from "styled-components";
import Typography from "@mui/material/Typography";
import useBalances from "hooks/useBalances";
import { UBQ, INK } from "farms/AvailableFarms";

const PriceRibbon: React.FC = () => {
  const { tokenPrices } = useBalances();

  if (tokenPrices === undefined) {
    return <></>;
  }

  const UBQPRICE = tokenPrices[UBQ];
  const INKPRICE = tokenPrices[INK];

  return (
    <>
      <p></p>
      <Typography variant="h5">Prices</Typography>

      <StyledBox>
        <Chip label={"UBQ: $" + UBQPRICE.toFixed(2)} color="primary" variant="outlined" />
        <Chip label={"INK: $" + INKPRICE.toFixed(4)} color="primary" variant="outlined" />
        <Chip label={"Ratio: " + (INKPRICE / UBQPRICE).toFixed(4)} color="primary" variant="outlined" />
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 8%;
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
  width: 50%;
  position: relative;
  min-width: 650px;

  @media (max-width: 850px) {
    flex-direction: column;
    min-width: 600px;
  }
`;

export default React.memo(PriceRibbon);
