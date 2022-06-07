import React from "react";
import { useTheme } from "@mui/material";
import styled from "styled-components";

interface CloseProps {
  color?: string;
}

const Menu: React.FC<CloseProps> = ({ color }) => {
  const { typography } = useTheme();

  return (
    <StyledSVG color={color ? color : (typography.body1.color as string)}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </StyledSVG>
  );
};

interface StyledSVGProps {
  color: string;
}

const StyledSVG = styled.svg.attrs(() => ({
  height: "24",
  viewBox: "0 0 24 24",
  width: "24",
}))<StyledSVGProps>`
  fill: ${(props) => props.color};
`;

export default React.memo(Menu);
