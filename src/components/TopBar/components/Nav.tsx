import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import TentacleLogo from "assets/octo_purple.png";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import Button from "@mui/material/Button";
import SLink from "components/SLink";
import ResourceLinks from "components/ResourceLinks";

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <SLink external href="https://charts.tentacle.finance/charts">
        <Button
          sx={{ marginRight: "15px" }}
          variant="outlined"
          startIcon={<img alt="Tentacle Finance logo" src={TentacleLogo} height="25" />}
          endIcon={<CandlestickChartIcon />}
        >
          Charts
        </Button>
      </SLink>
      <StyledRouterLink to="/farm">Farm</StyledRouterLink>
      <StyledRouterLink to="/daoinfo">DAO</StyledRouterLink>
      <ResourceLinks />
    </StyledNav>
  );
};

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`;

const StyledRouterLink = styled(NavLink)`
  color: ${(props) => props.theme.colors.grey[200]};
  font-weight: 700;
  font-size: 30px;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.colors.grey[600]};
  }
  &.active {
    color: ${(props) => props.theme.colors.primary.light};
  }
`;

export default Nav;
