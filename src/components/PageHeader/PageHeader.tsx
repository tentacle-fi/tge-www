import { Container } from "@mui/material";
import React, { useMemo } from "react";
import styled from "styled-components";

interface PageHeaderProps {
  icon: React.ReactNode;
  title?: string;
  titleSize?: number;
  titleColor?: string;
  titleWeight?: string;
  className?: string;
  subtitle?: string;
  subtitleWeight?: string;
  subtitleOpacity?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  titleSize,
  titleColor,
  titleWeight,
  className,
  subtitle,
  subtitleWeight,
  subtitleOpacity,
}) => {
  const DisplaySubtitle = useMemo(() => {
    if (subtitle) {
      return (
        <StyledSubtitle subtitleWeight={subtitleWeight} subtitleOpacity={subtitleOpacity}>
          {subtitle}
        </StyledSubtitle>
      );
    }
  }, [subtitle, subtitleOpacity, subtitleWeight]);

  return (
    <Container>
      <StyledPageHeader subtitle={subtitle}>
        <StyledIcon>{icon}</StyledIcon>
        <div className={className}>
          <StyledTitle titleSize={titleSize} titleWeight={titleWeight} titleColor={titleColor}>
            {title}
          </StyledTitle>
        </div>
        {DisplaySubtitle}
      </StyledPageHeader>
    </Container>
  );
};

interface StyledTitleProps {
  titleSize?: number;
  titleColor?: string;
  titleWeight?: string;
}

interface StyledSubtitleProps {
  subtitleWeight?: string;
  subtitleOpacity?: string;
}

interface StyledPageHeaderProps {
  subtitle?: string;
}

const StyledPageHeader = styled.div<StyledPageHeaderProps>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-bottom: ${(props) => (props.subtitle ? props.theme.spacing[6] : "20")}px;
  margin: 0 auto;
`;

const StyledIcon = styled.span.attrs({
  role: "img",
})`
  font-size: 96px;
  height: 96px;
  line-height: 96px;
  text-align: center;
  min-width: 96px;
`;

const StyledTitle = styled.h1<StyledTitleProps>`
  color: ${(props) => (props.titleColor ? props.titleColor : props.theme.textColor)};
  font-size: ${(props) => (props.titleSize ? props.titleSize.toString() : "36")}px;
  font-weight: ${(props) => (props.titleWeight ? props.titleWeight : "700")};
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StyledSubtitle = styled.h3<StyledSubtitleProps>`
  color: ${(props) => props.theme.textColor};
  font-size: 18px;
  font-weight: ${(props) => (props.subtitleWeight ? props.subtitleWeight : "400")};
  margin: 0;
  opacity: ${(props) => (props.subtitleOpacity ? props.subtitleOpacity : "0.66")};
  padding: 0;
  text-align: center;
`;

export default React.memo(PageHeader);
