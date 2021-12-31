import React from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import SLink from "components/SLink";
import Typography from "@mui/material/Typography";

const BuyUBQButtons: React.FC = () => {
  return (
    <ButtonGroup>
      <Typography variant="h6" sx={{ marginTop: "10px", marginRight: "20px" }}>
        Buy UBQ at:
      </Typography>
      <SLink external href="https://bittrex.com/Market/Index?MarketName=USDT-UBQ">
        <Button variant="outlined" size="large">
          Bittrex
        </Button>
      </SLink>
      <SLink external href="https://dovewallet.com/en/trade/spot/ubq-usdt">
        <Button variant="outlined" size="large">
          Dove Wallet
        </Button>
      </SLink>
      <SLink external href="https://shinobi.ubiq.ninja/#/swap">
        <Button variant="outlined" size="large">
          Shinobi Swap
        </Button>
      </SLink>
    </ButtonGroup>
  );
};

export default BuyUBQButtons;
