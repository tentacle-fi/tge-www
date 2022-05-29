import React from "react";
import styled from "styled-components";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import { InputProps } from "@mui/material";

interface TokenInputProps extends InputProps {
  max: number | string;
  symbol: string;
  onSelectMax?: () => void;
  children?: React.ReactElement;
}

const TokenInput: React.FC<TokenInputProps> = ({ max, symbol, onChange, onSelectMax, value, children }) => {
  return (
    <StyledTokenInput>
      <TextField
        label={symbol}
        value={value}
        onChange={onChange}
        placeholder="0"
        variant="filled"
        sx={{ input: { width: "200px", color: "white", backgroundColor: "#111", borderRadius: "15px" }, marginRight: "20px" }}
      />

      <div style={{ marginTop: "10px" }}>
        <ButtonGroup>
          <Button onClick={onSelectMax} size="medium" variant="contained" sx={{ borderRadius: "20px" }}>
            Max
          </Button>
          {children}
        </ButtonGroup>
      </div>
    </StyledTokenInput>
  );
};

const StyledTokenInput = styled.div`
  display: flex;
`;

export default React.memo(TokenInput);
