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
import useBalances from "hooks/useBalances";
import { getCirculatingSupply, getDailyTransactions } from "utils";
import { AvailableFarms, INK } from "farms/AvailableFarms";

// sets up a formatter so with toFormat on big numbers, we get thousands separators
BigNumber.config({ FORMAT: { groupSeparator: ",", groupSize: 3 } });

interface StatsRibbonProps {
  blockHeight?: string;
}

// Placeholders for now, until functions are written to store the appropriate values in state
// const DAILYVOLUMEPLACEHOLDER = "$65,039";

const StatsRibbon: React.FC<StatsRibbonProps> = ({ blockHeight }) => {
  const { currentTvl } = useFarming();
  const { ethereum } = useWallet();
  const { BlockNum } = useUbiq();
  const { tokenPrices } = useBalances();
  const [circulatingSupply, setCirculatingSupply] = useState<string>();
  const [ecosystemTvl, setEcosystemTvl] = useState<string>();
  const [dailyTransactions, setDailyTransactions] = useState<number>();
  const [currentMarketcap, setCurrentMarketcap] = useState<string>();

  const fetchDailyTransactions = useCallback(async () => {
    const dailyTransactions = await getDailyTransactions(ethereum);

    setDailyTransactions(dailyTransactions.count);
  }, [ethereum, setDailyTransactions]);

  const fetchCirculatingSupply = useCallback(async () => {
    const circulatingSupply = await getCirculatingSupply(ethereum);

    setCirculatingSupply(circulatingSupply.total.toFormat(0));
  }, [ethereum, setCirculatingSupply]);

  const fetchCurrentMarketcap = useCallback(async () => {
    if (tokenPrices === undefined) {
      return;
    }

    if (circulatingSupply === undefined) {
      return;
    }

    // circulatingSupply comes with commas, strip them out so we can parseInt
    const parsedCirculatingSupply = parseInt(circulatingSupply.replace(/,/g, ""));
    const mc = new BigNumber(tokenPrices[INK] * parsedCirculatingSupply).toFormat(0);

    setCurrentMarketcap(mc);
  }, [circulatingSupply, tokenPrices, setCurrentMarketcap]);

  const fetchEcosystemTvl = useCallback(async () => {
    if (currentTvl === undefined) {
      return;
    }

    let ecosystemTvlSubtotal = 0;
    for (let i = 0; i < currentTvl.length; i++) {
      // We only want to total official pools, other pools aren't owned by
      // the Tentacle DAO so they don't count toward our TVL
      if (AvailableFarms[i].official) {
        ecosystemTvlSubtotal += currentTvl[i];
      }
    }

    const ecosystemTvlTotal = new BigNumber(ecosystemTvlSubtotal).toFormat(0);

    setEcosystemTvl(ecosystemTvlTotal);
  }, [setEcosystemTvl, currentTvl]);

  // Update circulating supply based on new block numbers
  useEffect(() => {
    fetchCirculatingSupply();
    fetchEcosystemTvl();
  }, [BlockNum, fetchCirculatingSupply, fetchEcosystemTvl]);

  // Update daily transactions based on new block numbers
  useEffect(() => {
    fetchDailyTransactions();
  }, [BlockNum, fetchDailyTransactions]);

  // Update market cap based on new block numbers
  useEffect(() => {
    fetchCurrentMarketcap();
  }, [BlockNum, fetchCurrentMarketcap]);

  if (currentTvl === undefined) {
    return <></>;
  }

  return (
    <>
      <Typography variant="h5">Ecosystem Stats</Typography>
      <StyledStack direction="row" spacing={10}>
        <Chip label={"Circulating INK: " + circulatingSupply} color="primary" variant="outlined" />
        <Chip label={"Ecosystem TVL: $" + ecosystemTvl} color="primary" variant="outlined" />
        <Chip label={"MarketCap: $" + currentMarketcap} color="primary" variant="outlined" />
        <Chip label={"24hr TXs: " + dailyTransactions} color="primary" variant="outlined" />
      </StyledStack>
    </>
  );
};

const StyledStack = styled(Stack)`
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
`;

export default React.memo(StatsRibbon);
