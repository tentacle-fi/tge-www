import React from "react";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import { styled } from "@mui/material/styles";

const StyledFloatingHelp = styled(InfoIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
  padding: theme.spacing(0),
}));

interface InfoIconWithTooltipProps {
  tooltipText: string;
}

const InfoIconWithTooltip: React.FC<InfoIconWithTooltipProps> = ({ tooltipText }) => {
  return (
    <Tooltip title={tooltipText}>
      <sup>
        <StyledFloatingHelp />
      </sup>
    </Tooltip>
  );
};

export default React.memo(InfoIconWithTooltip);
