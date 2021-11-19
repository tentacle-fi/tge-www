import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledRouterLink to="/addresses">Addresses</StyledRouterLink>
      <StyledLink href="https://twitter.com/TentacleFinance" target="_blank">
        Twitter
      </StyledLink>
      <StyledLink href="https://discord.gg/CbTa6Z2JYM" target="_blank">
        Discord
      </StyledLink>
      <StyledLink href="https://medium.com/@tentaclefinance" target="_blank">
        Medium
      </StyledLink>
    </StyledNav>
  );
};

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`;

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.grey[500]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.colors.grey[600]};
  }
`;

const StyledRouterLink = styled(NavLink)`
  color: ${(props) => props.theme.colors.grey[500]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.colors.grey[600]};
  }
`;

export default Nav;
