import React from "react";
import styled from "styled-components";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

import WalletButton from "components/TopBar/components/WalletButton";

import { INK } from "farms/AvailableFarms";

// opens a URL when a button is clicked.
// returns a function to make less code in the on-click assignment.
// eg: onClick={openURL('https://example.com/')}
function openURL(url: string) {
  return () => {
    window.open(url, "_blank");
  };
}

const Help: React.FC = () => {
  return (
    <Page>
      <PageHeader icon="" title="Tentacle.Finance help" />

      <div style={{ width: "60%", minWidth: "600px" }}>
        <p>
          New to defi? Need a little help to get started? Want to know where to buy INK and UBQ? Here you will find help! See below for steps to get
          started.
        </p>
        <hr />
        <h3>Getting Started Steps:</h3>
        <StyledUl>
          <ListItem legend="Step 1: Setup your wallet">
            Tentacle.Finance supports Web3 wallets such as Metamask and Sparrow.
            <Button onClick={openURL("https://ubiqsmart.com/en/wallets")} variant="outlined">
              Learn how to setup a wallet
            </Button>
          </ListItem>
          <ListItem legend="Step 2: Connect your wallet">
            Unlock your wallet by clicking this button or the one in the top right of Tentacle.Finance! <WalletButton />
          </ListItem>
          <ListItem legend="Step 3: Get some tokens">
            Obtain UBQ and INK balance in your wallet
            <ButtonGroup>
              <h3>Obtain UBQ at:</h3>
              <Button onClick={openURL("https://bittrex.com/Market/Index?MarketName=USDT-UBQ")} variant="outlined">
                Bittrex
              </Button>
              <Button onClick={openURL("https://dovewallet.com/en/trade/spot/ubq-usdt")} variant="outlined">
                Dove Wallet
              </Button>
              <Button onClick={openURL("https://shinobi.ubiq.ninja/#/swap")} variant="outlined">
                Shinobi Swap
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <h3>Obtain INK at:</h3>
              <Button onClick={openURL("https://shinobi.ubiq.ninja/#/swap?outputCurrency=" + INK)} variant="outlined">
                Shinobi Swap
              </Button>
            </ButtonGroup>
          </ListItem>
          <ListItem legend="Step 4: Add Liquidity">
            Provide UBQ and INK as LP on Shinobi. Note: You will need to "Approve" first on the same page.
            <Button onClick={openURL("https://shinobi.ubiq.ninja/#/add/UBQ/" + INK)} variant="outlined">
              Provide Liquidity with Shinobi
            </Button>
          </ListItem>
          <ListItem legend="Step 5: Stake LP tokens">
            Stake your LP tokens on the{" "}
            <Button onClick={openURL("/farm")} variant="outlined">
              Tentacle.Finance Farm
            </Button>
          </ListItem>
          <ListItem legend="Step 6: Watch your INK increase!">
            Every block your INK balance will increase proportional to the amount of LP tokens staked and your percentage of the yield farm. Relax and
            watch your INK grow!
          </ListItem>
        </StyledUl>
      </div>
    </Page>
  );
};

interface ListItemProps {
  children?: React.ReactNode;
  legend?: string;
}

const ListItem: React.FC<ListItemProps> = ({ children, legend = "" }) => {
  return (
    <li>
      <StyledFieldset>
        {legend !== "" && <legend>{legend}</legend>}
        <div className="list-item-children-container">{children}</div>
      </StyledFieldset>
    </li>
  );
};

// const StyledLink = styled.a`
//   color: ${(props) => props.theme.colors.grey[500]};
//   padding-left: ${(props) => props.theme.spacing[3]}px;
//   padding-right: ${(props) => props.theme.spacing[3]}px;
//   text-decoration: none;
//   &:hover {
//     color: ${(props) => props.theme.colors.grey[600]};
//   }
// `;

const StyledFieldset = styled.fieldset`
  border-top: 1px dashed #cecece;
  border-left: 1px dashed #32a852;
  border-right: 1px dashed #ff33cc;
  border-bottom: none;
  margin-top: 10px;

  legend {
    width: 80%;
    border: 1px solid #cecece;
    padding: 10px 5px 10px 10px;
    border-radius: 5px;
    font-size: 24px;
    font-weight: bold;
  }
`;

const StyledUl = styled.ul`
  list-style-type: none;
  min-width: 500px;

  li {
    padding: 10px 5px;
    line-height: 2em;
  }

  li .list-item-children-container {
    margin-left: 5%;
  }
`;

export default Help;
