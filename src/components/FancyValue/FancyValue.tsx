import React, { useMemo } from "react";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import Value from "components/Value";
import { Box, Stack, useTheme } from "@mui/material";
import Label from "components/Label";

interface FancyValueProps {
  icon?: React.ReactNode;
  label?: string;
  value: string;
  valueSize?: string;
  valueColor?: string;
  valueBold?: string;
  wrap?: boolean;
  hint?: string;
  tooltip?: string;
}

const FancyValue: React.FC<FancyValueProps> = ({ icon, label, value, valueSize, valueColor, valueBold, wrap, hint, tooltip }) => {
  const { palette } = useTheme();

  const labelColor = palette.grey[600];
  const borderColor = palette.grey[600];
  const backgroundColor = palette.grey[400];

  const DisplayHint = useMemo(() => {
    if (hint) {
      return (
        <>
          <ValueHint data-tip={tooltip}>
            <div>{hint}</div>
          </ValueHint>
          <ReactTooltip
            place="top"
            type="light"
            effect="solid"
            className="tooltip"
            textColor={labelColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            border={true}
          />
        </>
      );
    }
  }, [hint, backgroundColor, borderColor, labelColor, tooltip]);

  const FancyLabelDisplay = useMemo(() => {
    if (wrap) {
      return (
        <>
          {DisplayHint}
          <LabelWrapDisplay>
            <Label text={label} labelPosition={!icon ? "center" : "left"} />
          </LabelWrapDisplay>
        </>
      );
    } else {
      return (
        <>
          {DisplayHint}
          <Label text={label} labelPosition={!icon ? "center" : "left"} />
        </>
      );
    }
  }, [wrap, DisplayHint, label, icon]);

  const IconDisplay = useMemo(() => {
    if (icon) {
      return (
        <>
          <StyledBox justifyContent="center">
            <StyledIcon>{icon}</StyledIcon>
          </StyledBox>
        </>
      );
    }
  }, [icon]);

  return (
    <>
      <DisplayFancyValue>
        <Stack direction="row">
          {IconDisplay}
          <Stack direction="column">
            <Value value={value} valuePosition={!icon ? "center" : "left"} valueSize={valueSize} valueColor={valueColor} valueBold={valueBold} />
            {FancyLabelDisplay}
          </Stack>
        </Stack>
      </DisplayFancyValue>
    </>
  );
};

interface ValueHintProps {
  darkMode?: boolean;
}

const StyledBox = styled(Box)(({ theme }) => ({
  minWidth: "48px",
}));

const DisplayFancyValue = styled.div`
  position: relative;
`;

const StyledIcon = styled.span.attrs({ role: "img" })`
  font-size: 32px;
  padding-right: 10px;
`;

const LabelWrapDisplay = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const ValueHint = styled.span<ValueHintProps>`
  cursor: default;
  display: block;
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ae0e463b;
  color: ${(props) => props.theme.colors.primary.main};
  line-height: 16px;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid ${(props) => props.theme.colors.primary.main};
  border-radius: 100px;
  padding: 0px 5px 1px 5px;
  opacity: 0.4;

  &:hover {
    opacity: 1;
    z-index: 10;
  }
`;

export default React.memo(FancyValue);
