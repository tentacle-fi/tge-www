import React from "react";
import styled from "styled-components";
import TentacleLogo from "assets/octo_purple.png";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import Button from "@mui/material/Button";
import SLink from "components/SLink";

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <SLink external href="https://charts.tentacle.finance/charts">
        <Button variant="outlined" startIcon={<img alt="Tentacle Finance logo" src={TentacleLogo} height="25" />} endIcon={<CandlestickChartIcon />}>
          Charts
        </Button>
      </SLink>

      <SLink href="/addresses">Addresses</SLink>
      <SLink href="/vote">Voting</SLink>
      <SLink external href="https://twitter.com/TentacleFinance">
        Twitter
      </SLink>
      <SLink external href="https://discord.gg/CbTa6Z2JYM">
        Discord
      </SLink>
      <SLink external href="https://medium.com/@tentaclefinance">
        Medium
      </SLink>
      <SLink external href="https://github.com/tentacle-fi/tentacle-legal/blob/main/ToS/General.md">
        ToS
      </SLink>
    </StyledNav>
  );
};

const StyledNav = styled("nav")({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  width: "100%",

  a: {
    padding: " 20px",
    color: "#888",
  },
  "a:hover": {
    color: "#555",
  },
});

export default Nav;
