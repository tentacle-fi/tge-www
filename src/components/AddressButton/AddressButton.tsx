import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import copy from "assets/copy.svg";
import confirm from "assets/copy_confirm.svg";

interface AddressButtonProps {
  name?: string;
  address?: string;
  shinobi?: boolean;
  shinobitext?: string;
  shinobilink?: string;
  to?: string;
}

const AddressButton: React.FC<AddressButtonProps> = ({ name, address, shinobi, shinobitext, shinobilink }) => {
  const DisplayShinobi = useMemo(() => {
    if (shinobi) {
      return (
        <>
          <StyledLink
            href={shinobilink ? shinobilink + address : "https://shinobi.ubiq.ninja/swap?inputCurrency=" + address}
            target="_blank"
            color="white"
          >
            <StyledShinobiButton>
              <StyledSpan>
                <span>{shinobitext ? shinobitext : "Buy at Shinobi"}</span>
              </StyledSpan>
            </StyledShinobiButton>
          </StyledLink>
        </>
      );
    }
  }, [shinobi, address, shinobilink, shinobitext]);

  const DisplayAddress = useMemo(() => {
    if (shinobi) {
      return (
        <>
          <span className="address">
            <AddressStart>{address}</AddressStart>
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className="address">{address}</span>
        </>
      );
    }
  }, [shinobi, address]);

  return (
    <>
      <Box sx={{ borderRadius: "10px" }}>
        <StyledButton shinobi={shinobi}>
          <StyledSpan>
            <StyledName shinobi={shinobi}>{name ? name + " " : ""}</StyledName>
            <StyledLink color="hsl(339deg 89% 49% / 100%)" href={"https://ubiqscan.io/address/" + address} target="_blank">
              {DisplayAddress}
            </StyledLink>
            <StyledCopy
              shinobi={shinobi}
              onClick={() => {
                navigator.clipboard.writeText(address ? address : "");
              }}
            ></StyledCopy>
          </StyledSpan>
        </StyledButton>
        {DisplayShinobi}
      </Box>
    </>
  );
};

interface StyledButtonProps {
  to?: string;
  shinobi?: boolean;
}

interface StyledSpanProps {
  shinobi?: boolean;
}

interface StyledLinkProps {
  color?: string;
  overflow?: boolean;
}

interface StyledCopyProps {
  shinobi?: boolean;
}

const StyledButton = styled("div")<StyledButtonProps>(({ shinobi }) => ({
  background: "radial-gradient(circle at top, hsl(339deg 17% 15% / 100%), hsl(339deg 20% 10% / 100%))",
  boxShadow: "-8px 8px 16px 0 hsl(339deg 20% 5% / 100%), 8px -8px 16px 0px hsl(339deg 100% 100% / 2.5%)",

  "-webkit-align-items": "center",
  "-webkit-box-align": "center",
  "-ms-flex-align": "center",
  alignItems: "center",
  border: 0,
  borderRadius: "28px",
  boxSizing: "border-box",
  color: "hsl(339deg 89% 49% / 100%)",
  display: "flex",
  fontSize: "16px",
  fontWeight: 700,
  height: "48px",
  "-webkit-box-pack": "center",
  "-webkit-justify-content": "center",
  "-ms-flex-pack": "center",
  justifyContent: "center",
  margin: 0,
  outline: "none",
  paddingLeft: "24px",
  paddingRight: "24px",
  whiteSpace: "nowrap",
  lineHeight: "50px",
  minWidth: "48px",
  width: !shinobi ? "-webkit-fill-available" : "",
}));

const StyledShinobiButton = styled(StyledButton)({
  borderRadius: "9px",
  color: "#ffffff",
  background: "radial-gradient(174.47% 188.91% at 1.84% 10%, rgb(255, 0, 122) 0%, rgb(6 44 97) 80%), rgb(237, 238, 242)",
  minWidth: "152px",
  paddingLeft: "10px",
  paddingRight: "10px",
});

const StyledName = styled("div")<StyledSpanProps>(({ theme, shinobi }) => ({
  color: theme.palette.grey[100],
  margin: "0px 5px 0px 0px",
  minWidth: `${!shinobi ? "85" : "45"}px`,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const StyledLink = styled("a")<StyledLinkProps>(({ theme, color, overflow }) => ({
  cursor: "pointer",
  color: color ? color : "white",
  overflow: overflow ? "inherit" : "hidden",
  textDecoration: "none",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  margin: "0px 5px",
  "&:hover": {
    color: color ? theme.palette.grey[400] : "white",
  },
}));

const StyledSpan = styled("span")({
  display: "flex",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const StyledCopy = styled("span")<StyledCopyProps>(({ shinobi }) => ({
  cursor: "pointer",
  maskImage: `url(${copy})`,
  "-webkit-mask-image": `url(${copy})`,
  "-webkit-mask-repeat": "no-repeat",
  "-webkit-mask-size": "12px",
  backgroundColor: "#fff",
  width: `${!shinobi ? "32" : "50"}px`,
  margin: "20px 0px 16px 5px",
  "&:hover": {
    opacity: 0.6,
  },
  "&:active": {
    "-webkit-mask-image": `url(${confirm})`,
    maskImage: `url(${confirm})`,
    opacity: 1,
  },
}));

const AddressStart = styled("span")({
  display: "inline-block",
  width: "calc(50% + 22px)",
  textOverflow: "ellipsis",
});

export default React.memo(AddressButton);
