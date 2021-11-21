import React from "react";
import styled from "styled-components";

// TODO: change this to a regular img import
import { CardIcon } from "react-neu";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

interface WalletProviderCardProps {
  icon: React.ReactNode;
  name: string;
  onSelect: () => void;
}
const WalletProviderCard: React.FC<WalletProviderCardProps> = ({ icon, name, onSelect }) => (
  <Box sx={{ display: "flex", flexDirection: "column" }}>
    <Button onClick={onSelect} variant="contained">
      <CardIcon>{icon}</CardIcon>
      <StyledName>{name}</StyledName>
    </Button>
  </Box>
);

const StyledName = styled.div`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`;

export default WalletProviderCard;
