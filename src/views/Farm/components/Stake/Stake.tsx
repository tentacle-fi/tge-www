import React, { useCallback, useEffect, useMemo, useState } from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { Box } from "react-neu";
import Label from "components/Label";
import Value from "components/Value";
import useFarming from "hooks/useFarming";
import { bnToDec, getShortDisplayBalance, getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import useBalances from "hooks/useBalances";
import BigNumber from "bignumber.js";
import LinkIcon from "@mui/icons-material/Link";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

interface StakeProps {
  farmKey: number;
}

const Stake: React.FC<StakeProps> = ({ children, farmKey }) => {
  const [stakeBalance, setStakeBalance] = useState<number>(0);
  const [lpPercent, setLpPercent] = useState<number>(0);

  const { LPBalances, CurrentAPY, UBQoracle } = useBalances();

  const availableLPBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const { farmingStartTime, stakedBalances, lpPercents } = useFarming();

  const formattedStakedBalance = useCallback(async () => {
    if (stakedBalances !== undefined && stakedBalances[farmKey] && bnToDec(stakedBalances[farmKey]) > 0) {

        // Have to put this if statement here to satisfy typescript
        if(UBQoracle === undefined){
            console.log('no UBQoracle defined')
            return
        }

        const midprice = 1.38; // INK/UBQ midprice
        const inkPrice = 0.14; // ink price in USD
        const dailyINKEmissions = 138618.7397260273972224; // Qty of INK released per day based on epoch and rewardRate contract call

        // Set lp token balances based on midprice and current stake
        const lpTokenBalances = { token0: 0, token1: 0 };
        lpTokenBalances['token0'] = bnToDec(stakedBalances[farmKey]) * midprice;
        lpTokenBalances['token1'] = bnToDec(stakedBalances[farmKey]) * ( 1 / midprice );

        // Use current staked balance and percentage to derive total supply
        // of SLPT in the farm
        let totalSLPTSupply = 0;
        totalSLPTSupply = bnToDec(stakedBalances[farmKey]) / (lpPercent / 100)
        const tvl = totalSLPTSupply * UBQoracle.price.usdt;

        // debug everything so far
        console.log('totalSLPTSupply:', totalSLPTSupply, 'stakedbalances:', bnToDec(stakedBalances[farmKey]), 'token0:', lpTokenBalances['token0'], 'token1:', lpTokenBalances['token1'], 'tvl:', tvl)

        // Build the APY
        let apy = tvl / ((inkPrice * dailyINKEmissions * 365) / (totalSLPTSupply * UBQoracle.price.usdt))

        console.log('current APY:', apy.toFixed(0), '%')

      setStakeBalance(Number(getShortDisplayBalance(stakedBalances[farmKey])));
    } else {
      setStakeBalance(0);
    }
  }, [stakedBalances, farmKey, UBQoracle, lpPercent]);

  const formattedLpPercent = useCallback(async () => {
    if (lpPercents !== undefined && bnToDec(lpPercents[farmKey]) > 0) {
      setLpPercent(Number(lpPercents[farmKey].shiftedBy(2).toPrecision(6)));
    } else {
      setLpPercent(0);
    }
  }, [lpPercents, farmKey]);

  useEffect(() => {
    formattedStakedBalance();
    formattedLpPercent();
    let refreshInterval = setInterval(formattedStakedBalance, 10000);
    return () => clearInterval(refreshInterval);
  }, [formattedStakedBalance, formattedLpPercent]);

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { days, hours, minutes, seconds } = countdownProps;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedDays = days < 10 ? `0${days}` : days;

    return (
      <Box row justifyContent="center">
        <Label text={`Farming starts in ${paddedDays} days ${paddedHours}:${paddedMinutes}:${paddedSeconds}`} />
      </Box>
    );
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px 5px", textAlign: "left" }}>
        <Stack>
          <StyledStackItem val={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name} LP Staked` : "--"} />
          <StyledStackItem val={lpPercent > 0 ? lpPercent.toString() + " Pool %" : "--"} />
          <StyledStackItem val={`${parseFloat(availableLPBalance).toFixed(6)} LP Tokens Unstaked`} />

          <StyledStackItem val={`UBQ = $ ${UBQoracle?.price?.usdt || "--"}`} />

          <StyledStackItem val={`TVL`} />
          <StyledStackItem val={`my token balances in LP`} />
          <StyledStackItem val={`my pool value $`} />
          <StyledStackItem val={`${CurrentAPY} APR / APY`} />

          <Link href={AvailableFarms[farmKey].lp.url} target="_blank" rel="noopener" underline="always">
            Manage {AvailableFarms[farmKey].name} liquidity <LinkIcon />
          </Link>
        </Stack>
      </div>

      {typeof farmingStartTime !== "undefined" && farmingStartTime[farmKey] > Date.now() && (
        <Countdown date={farmingStartTime[farmKey]} renderer={renderer} />
      )}
    </>
  );
};

interface StackItemProps {
  val: string;
  valueSize?: string;
  valueBold?: string;
}

const StyledStackItem: React.FC<StackItemProps> = ({ val }) => {
  return <Value valueSize={val || "16px"} valueBold={val || "400"} value={val} />;
};

export default React.memo(Stake);
