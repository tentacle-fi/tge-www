import React, { useCallback, useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
import BigNumber from "bignumber.js";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
import { useWallet } from "use-wallet";
import useUbiq from "hooks/useUbiq";
import useFarming from "hooks/useFarming";
import { getCirculatingSupply } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";

// sets up a formatter so with toFormat on big numbers, we get thousands separators
BigNumber.config({ FORMAT: { groupSeparator: ",", groupSize: 3 } });

interface StatsRibbonProps {
  blockHeight?: string;
}

// Placeholders for now, until functions are written to store the appropriate values in state
const DAILYVOLUMEPLACEHOLDER = "$65,039";
const DAILYTXVOLUMEPLACEHOLDER = "400";

const StatsRibbon: React.FC<StatsRibbonProps> = ({ blockHeight }) => {
  const { currentTvl } = useFarming();
  const { ethereum } = useWallet();
  const { BlockNum } = useUbiq();
  const [circulatingSupply, setCirculatingSupply] = useState<string>();
  const [ecosystemTvl, setEcosystemTvl] = useState<string>();

  const fetchCirculatingSupply = useCallback(async () => {
    const circulatingSupply = await getCirculatingSupply(ethereum);

    setCirculatingSupply(circulatingSupply.total.toFormat(0));
  }, [ethereum, setCirculatingSupply]);

  const fetchEcosystemTvl = useCallback(async () => {
    if (currentTvl === undefined) {
      return;
    }

    let ecosystemTvlSubtotal = 0;
    // TODO: use availableFarms here instead of this slice
    console.log("currentTvl:", currentTvl);
    for (const singleTvl of currentTvl.slice(0, 2)) {
      console.log("singleTvl: $", singleTvl);
      ecosystemTvlSubtotal += singleTvl;
    }

    const ecosystemTvlTotal = new BigNumber(ecosystemTvlSubtotal).toFormat(0);

    setEcosystemTvl(ecosystemTvlTotal);
  }, [setEcosystemTvl, currentTvl]);

  // Update circulating supply based on new block numbers
  useEffect(() => {
    fetchCirculatingSupply();
    fetchEcosystemTvl();
  }, [BlockNum, fetchCirculatingSupply, fetchEcosystemTvl]);

  if (currentTvl === undefined) {
    return <></>;
  }

  return (
    <>
      <Typography variant="h5">Stats Ribbon</Typography>
      <StyledStack direction="row" spacing={10}>
        <Chip label={"Circulating INK: " + circulatingSupply} color="primary" />
        <Chip label={"Ecosystem TVL: $" + ecosystemTvl} color="secondary" />
        <Chip label={"24hr Vol: " + DAILYVOLUMEPLACEHOLDER} color="success" />
        <Chip label={"24hr TXs: " + DAILYTXVOLUMEPLACEHOLDER} color="info" />
      </StyledStack>
    </>
  );
};

const StyledStack = styled(Stack)`
  borderradius: 100px;
  background: purple;
  padding: 20px;
`;

export default React.memo(StatsRibbon);
