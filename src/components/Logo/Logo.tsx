import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import octoLogo from "assets/octo_purple.png";

const Logo: React.FC = () => {
  return (
    <StyledLogo to="/">
      <img src={octoLogo} alt="Tentacle Finance Logo" style={{ width: "auto", height: 68 }} />

      <StyledText>
        Tentacle
        <br />
        Finance
      </StyledText>
    </StyledLogo>
  );
};

const StyledLogo = styled(Link)`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin: 0 0 0 15px;
  min-height: 72px;
  min-width: 72px;
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
  margin-left: 0px;
  @media (max-width: 980px) {
    display: none;
  }
`;

export default Logo;
