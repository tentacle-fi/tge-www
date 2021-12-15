import React from "react";
import styled from "styled-components";
import Nav from "./components/Nav";

const Footer: React.FC = () => (
  <StyledFooter>
    <StyledFooterInner>
      <Nav />
    </StyledFooterInner>
    <br />
  </StyledFooter>
);

const StyledFooter = styled.footer`
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const StyledFooterInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: 72px;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
  @media (max-width: 980px) {
    display: -webkit-box;
    overflow-x: scroll;
  }
`;

export default Footer;
