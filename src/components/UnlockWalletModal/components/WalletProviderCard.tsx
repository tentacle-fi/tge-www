import React from "react";
import styled from "styled-components";

// TODO: change this to a regular img import
import { CardIcon } from "react-neu";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

interface WalletProviderCardProps {
  icon: React.ReactNode;
  name: string;
  onSelect: () => void;
}
const WalletProviderCard: React.FC<WalletProviderCardProps> = ({ icon, name, onSelect }) => (
  <Card sx={{ minWidth: 275 }}>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <CardIcon>{icon}</CardIcon>
      <CardContent>
        <StyledName>{name}</StyledName>
      </CardContent>
      <CardActions>
        <Button onClick={onSelect} variant="outlined">
          Select
        </Button>
      </CardActions>
    </Box>
  </Card>
);

const StyledName = styled.div`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`;

export default WalletProviderCard;
