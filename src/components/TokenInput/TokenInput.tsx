import React from "react";
import styled from "styled-components";

import { Button, Input, InputProps } from "react-neu";

interface TokenInputProps extends InputProps {
  max: number | string;
  symbol: string;
  onSelectMax?: () => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ max, symbol, onChange, onSelectMax, value, children }) => {
  return (
    <StyledTokenInput>
      <Input
        endAdornment={
          <StyledTokenAdornmentWrapper>
            <StyledTokenSymbol>{symbol}</StyledTokenSymbol>
            <StyledSpacer />
            <div>
              <Button onClick={onSelectMax} size="sm" text="Max" variant="secondary" />
            </div>
          </StyledTokenAdornmentWrapper>
        }
        onChange={onChange}
        placeholder="0"
        value={value}
      />
      {children}
    </StyledTokenInput>
  );
};

const StyledTokenInput = styled.div`
  display: flex;
`;

const StyledSpacer = styled.div`
  width: ${(props) => props.theme.spacing[3]}px;
`;

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledTokenSymbol = styled.span`
  color: ${(props) => props.theme.colors.grey[200]};
  font-weight: 700;
`;

export default TokenInput;
