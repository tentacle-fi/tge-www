import React from "react";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import styled from "styled-components";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";
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
        <Grid container sx={{ textAlign: "center" }} spacing={10}>
          <Grid xs={4} item>
            <Chip label={"UBQ: $" + UBQPRICE.toFixed(2)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"INK: $" + INKPRICE.toFixed(4)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"Ratio: " + (INKPRICE / UBQPRICE).toFixed(4)} color="primary" variant="outlined" />
          </Grid>
        </Grid>
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box)`
  border-radius: 15px;
  padding: 20px;
  background: #2c2b3d;
  text-align: center;
`;

export default React.memo(PriceRibbon);
