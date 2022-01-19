import React from "react";
import styled, { keyframes } from "styled-components";
import { NavLink } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import TentacleLogo from "assets/octo_purple.png";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import Button from "@mui/material/Button";
import SLink from "components/SLink";

interface MobileMenuProps {
  onDismiss: () => void;
  visible?: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onDismiss, visible }) => {
  if (visible) {
    return (
      <StyledMobileMenuWrapper>
        <StyledBackdrop onClick={onDismiss} />
        <StyledMobileMenu>
          <Button variant="text" size="large" sx={{ padding: "20px 40px", position: "absolute", top: "5%", right: "5%" }} onClick={onDismiss}>
            <CloseIcon />
            close
          </Button>
          <StyledRouterLink to="/" onClick={onDismiss}>
            Home
          </StyledRouterLink>
          <StyledRouterLink to="/farm" onClick={onDismiss}>
            Farm
          </StyledRouterLink>

          <SLink external href="https://charts.tentacle.finance/charts">
            <Button
              sx={{ marginTop: "15px", marginBottom: "15px" }}
              variant="outlined"
              startIcon={<img alt="Tentacle Finance logo" src={TentacleLogo} height="25" />}
              endIcon={<CandlestickChartIcon />}
            >
              Charts
            </Button>
          </SLink>
          <StyledRouterLink to="/help" onClick={onDismiss}>
            Help
          </StyledRouterLink>
          <StyledRouterLink to="/addresses" onClick={onDismiss}>
            Addresses
          </StyledRouterLink>
        </StyledMobileMenu>
      </StyledMobileMenuWrapper>
    );
  }
  return null;
};

const StyledBackdrop = styled.div`
  background-color: ${(props) => props.theme.colors.black};
  opacity: 0.75;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const StyledMobileMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
`;

const slideIn = keyframes`
  0% {
    transform: translateX(0)
  }
  100% {
    transform: translateX(-100%);
  }
`;

const StyledMobileMenu = styled.div`
  animation: ${slideIn} 0.3s forwards ease-out;
  background: ${(props) => props.theme.baseBg};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 100%;
  bottom: 0;
  text-align: center;
  max-width: 90%;
  min-width: 250px;
`;

const StyledRouterLink = styled(NavLink)`
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.grey[500]};
  font-size: 24px;
  font-weight: 700;
  padding: ${(props) => props.theme.spacing[3]}px ${(props) => props.theme.spacing[4]}px;
  text-align: center;
  text-decoration: none;
  width: 100%;
  &:hover {
    color: ${(props) => props.theme.colors.grey[600]};
  }
  &.active {
    color: ${(props) => props.theme.colors.primary.light};
  }
`;

export default MobileMenu;
