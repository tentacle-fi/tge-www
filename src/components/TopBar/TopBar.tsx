import React from "react";

import { Container, Spacer } from "react-neu";
import styled from "styled-components";

import Logo from "components/Logo";
import MenuIcon from "components/icons/Menu";

import DarkModeSwitch from "../DarkModeSwitch";
import Nav from "./components/Nav";
import WalletButton from "./components/WalletButton";
import useBalances from "hooks/useBalances";

declare const window: any;

interface TopBarProps {
  onPresentMobileMenu: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu }) => {
  return (
    <StyledTopBar>
      <Container size="lg">
        <StyledTopBarInner>
          <StyledLogoWrapper>
            <Logo />
          </StyledLogoWrapper>
          <StyledNavWrapper>
            <Nav />
          </StyledNavWrapper>
          <StyledAccountButtonWrapper>
            <BlockheightHider isLoggedIn={false} />
            <StyledTopBarDarkModeSwitch>
              <DarkModeSwitch />
            </StyledTopBarDarkModeSwitch>
            <Spacer />
            <WalletButton />
          </StyledAccountButtonWrapper>
          <StyledMenuButton onClick={onPresentMobileMenu}>
            <MenuIcon />
          </StyledMenuButton>
        </StyledTopBarInner>
      </Container>
    </StyledTopBar>
  );
};

const StyledCurrentBlock = styled.div`
  display: flex;
  white-space: nowrap;
  border: 1px dotted #cecece;
  padding: 8px;
  border-radius: 50px;
  margin-right: 10px;
  @media (max-width: 400px) {
    display: none;
  }
`;

const StyledLogoWrapper = styled.div`
  width: 156px;
  @media (max-width: 400px) {
    width: auto;
  }
`;

const StyledTopBar = styled.div``;

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: 72px;
  justify-content: space-between;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
`;

const StyledNavWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  @media (max-width: 600px) {
    display: none;
  }
`;

const StyledAccountButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  width: 156px;
  @media (max-width: 400px) {
    justify-content: center;
    width: auto;
  }
`;

const StyledMenuButton = styled.button`
  background: none;
  border: 0;
  margin: 0;
  outline: 0;
  padding: 0;
  display: none;
  @media (max-width: 600px) {
    align-items: center;
    display: flex;
    height: 44px;
    justify-content: center;
    width: 44px;
  }
`;

const StyledTopBarDarkModeSwitch = styled.div`
  @media (max-width: 1130px) {
    display: none;
  }
`;

interface BlockheightHiderProps {
  isLoggedIn: boolean;
}

const BlockheightHider: React.FC<BlockheightHiderProps> = ({ children, isLoggedIn }) => {
  isLoggedIn = window.ethereum.isSparrow;
  const { CurrentBlock } = useBalances();
  if (CurrentBlock !== "0") {
    return (
      <StyledCurrentBlock>
        <span>Block #: {CurrentBlock}</span>
      </StyledCurrentBlock>
    );
  }
  return null;
};

export default TopBar;
