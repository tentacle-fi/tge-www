import React from "react";
import { useTheme } from "react-neu";
import styled from "styled-components";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

const Help: React.FC = () => {
  const { darkMode } = useTheme();
  return (
    <Page>
      <PageHeader icon="" subtitle={"See below for farming instructions!"} title="Tentacle.Finance help" />
      <ol>
        <li>Obtain UBQ and INK</li>
        <StyledLink href="https://bittrex.com/Market/Index?MarketName=USDT-UBQ" target="_blank">
          Buy UBQ
        </StyledLink>
        <StyledLink href="https://twitter.com/ubiqsmart" target="_blank">
          Buy INK
        </StyledLink>
        <li>Provide UBQ and INK as LP on Shinobi. Note: You will need to "Approve" first on the same page.</li>
        <StyledLink href="https://shinobi-info.ubiq.ninja" target="_blank">
          Provide LP
        </StyledLink>
        <li>Stake your LP tokens on the Tentacle.Finance farm page</li>
        <StyledLink href="farm" target="_blank">
          Stake
        </StyledLink>
        <li>Every block your INK balance should now increase!</li>
      </ol>
    </Page>
  );
};

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.grey[500]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.colors.grey[600]};
  }
`;

export default Help;
