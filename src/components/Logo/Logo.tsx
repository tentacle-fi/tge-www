import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import octoLogo from "assets/octo_purple.png";

const Logo: React.FC = () => {
  return (
    <StyledLogo to="/">
      <img src={octoLogo} alt="Tentacle Finance Logo" style={{ width: 76 }} />

      <StyledText>Tentacle.Finance</StyledText>
    </StyledLogo>
  );
};

const StyledLogo = styled(Link)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0 0 0 55px;
  min-height: 44px;
  min-width: 76px;
  padding: 0;
  text-decoration: none;

  @media (max-width: 515px) {
    margin: 0;
  }
`;

const StyledText = styled.span`
  color: ${(props) => props.theme.textColor};
  font-size: 18px;
  font-weight: 700;
  margin-left: ${(props) => props.theme.spacing[2]}px;
  @media (max-width: 980px) {
    display: none;
  }
`;

export default Logo;
