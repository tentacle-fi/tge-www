import React from "react";
import styled from "styled-components";
import SLink from "components/SLink";

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <SLink href="/addresses">Addresses</SLink>
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

const StyledNav = styled.nav`
  align-items: center;
  display: flex;

  * {
    padding: 20px;
  }
`;

export default Nav;
