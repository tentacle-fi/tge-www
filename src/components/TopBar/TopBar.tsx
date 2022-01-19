import React from "react";
import styled from "styled-components";
import Logo from "components/Logo";
import MenuIcon from "components/icons/Menu";
import Nav from "./components/Nav";
import WalletButton from "./components/WalletButton";
import BlockHeightButton from "components/BlockHeightButton";

interface TopBarProps {
  onPresentMobileMenu: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onPresentMobileMenu }) => {
  return (
    <StyledTopBar>
        <StyledTopBarInner>
          <StyledLogoWrapper>
            <Logo />
          </StyledLogoWrapper>
          <StyledNavWrapper>
            <Nav />
          </StyledNavWrapper>
          <StyledAccountButtonWrapper>
            <WalletButton blockHeightButton={<BlockHeightButton />} />
          </StyledAccountButtonWrapper>
          <StyledMenuButton onClick={onPresentMobileMenu}>
            <MenuIcon />
          </StyledMenuButton>
        </StyledTopBarInner>
    </StyledTopBar>
  );
};

const StyledLogoWrapper = styled.div`
  margin-left: 5px;
  @media (max-width: 530px) {
    margin-left: 10px;
  }

  @media (max-width: 430px) {
    display: none;
  }
`;

const StyledTopBar = styled.div`
  position: fixed;
  width: 100%;
  background-color: #0c001c;
  top: 0;
  z-index: 1000;
`;

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: 72px;
  margin-right: 5px;
  justify-content: space-between;
  max-width: ${(props) => props.theme.siteWidth}px;
  width: 100%;
`;

const StyledNavWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  @media (max-width: 830px) {
    display: none;
  }
`;

const StyledAccountButtonWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  @media (max-width: 400px) {
    justify-content: center;
    width: auto;
  }
`;

const StyledMenuButton = styled.button`
  background: none;
  border: 0;
  margin: 0 0 0 10px;
  outline: 0;
  padding: 0;
  display: none;
  @media (max-width: 830px) {
    align-items: center;
    display: flex;
    height: 44px;
    justify-content: center;
    width: 44px;
  }
`;

export default TopBar;
