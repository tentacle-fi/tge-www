import React, { useCallback, useState, useEffect } from "react";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useWallet } from "use-wallet";
import useUbiq from "hooks/useUbiq";
import useFarming from "hooks/useFarming";
import useBalances from "hooks/useBalances";
import { getCirculatingSupply, getDailyTransactions } from "utils";
import { AvailableFarms, INK } from "farms/AvailableFarms";
import Box from "@mui/material/Box";

// sets up a formatter so with toFormat on big numbers, we get thousands separators
BigNumber.config({ FORMAT: { groupSeparator: ",", groupSize: 3, decimalSeparator: "." } });

interface StatsRibbonProps {
  blockHeight?: string;
}

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
    if (tokenPrices === undefined || circulatingSupply === undefined) {
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

  if (currentTvl === undefined || tokenPrices === undefined) {
    return <></>;
  }

  return (
    <>
      <Typography variant="h5">Ecosystem Stats</Typography>
      <StyledBox>
        <Tooltip title="Doesn't include un-harvested farming rewards">
          <Chip label={"Circulating INK: " + circulatingSupply} color="primary" variant="outlined" />
        </Tooltip>
        <Chip label={"Ecosystem TVL: $" + ecosystemTvl} color="primary" variant="outlined" />
        <Tooltip title={"Fully Diluted: $" + new BigNumber(tokenPrices[INK]).times(88 * 1000000).toFormat(0)}>
          <Chip label={"MarketCap: $" + currentMarketcap} color="primary" variant="outlined" />
        </Tooltip>
        <Chip label={"24hr TXs: " + dailyTransactions} color="primary" variant="outlined" />
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 4%;
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
  width: 60%;
  position: relative;
  min-width: 850px;

  @media (max-width: 850px) {
    flex-direction: column;
    min-width: 600px;
  }
`;

export default React.memo(StatsRibbon);
