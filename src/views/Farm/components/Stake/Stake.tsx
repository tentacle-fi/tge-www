import React, { useCallback, useEffect, useMemo, useState } from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { Box } from "react-neu";
import Label from "components/Label";
import useFarming from "hooks/useFarming";
import { bnToDec, getShortDisplayBalance, getFullDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import useBalances from "hooks/useBalances";
import BigNumber from "bignumber.js";
import LinkIcon from "@mui/icons-material/Link";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

interface StakeProps {
  farmKey: number;
}

const Stake: React.FC<StakeProps> = ({ children, farmKey }) => {
  const [stakeBalance, setStakeBalance] = useState<number>(0);
  const [lpPercent, setLpPercent] = useState<number>(0);

  const { LPBalances, UBQoracle } = useBalances();

  const availableLPBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const { farmingStartTime, stakedBalances, lpPercents, currentApy, currentTvl, inkPrice, PooledTokens } = useFarming();

  const formattedStakedBalance = useCallback(async () => {
    if (stakedBalances !== undefined && stakedBalances[farmKey] && bnToDec(stakedBalances[farmKey]) > 0) {
      setStakeBalance(Number(getShortDisplayBalance(stakedBalances[farmKey])));
    } else {
      setStakeBalance(0);
    }
  }, [stakedBalances, farmKey]);

  const formattedLpPercent = useCallback(async () => {
    if (lpPercents !== undefined && bnToDec(lpPercents[farmKey]) > 0) {
      setLpPercent(Number(lpPercents[farmKey].shiftedBy(2).toPrecision(6)));
    } else {
      setLpPercent(0);
    }
  }, [lpPercents, farmKey]);

  // TODO: unclear if this is accurate enough or if we need to reverse the uniswap v2 algo from the stakedLP tokens for this account
  const formattedMyPoolTokens = useCallback(() => {
    if (PooledTokens !== undefined) {
      return ` ${PooledTokens.token0.toFixed(0)} ${AvailableFarms[farmKey].tokenA.symbol}/ ${PooledTokens.token1.toFixed(0)} ${
        AvailableFarms[farmKey].tokenB.symbol
      }`;
    }

    return `-- ${AvailableFarms[farmKey].tokenA.symbol} / -- ${AvailableFarms[farmKey].tokenB.symbol}`;
  }, [PooledTokens, farmKey]);

  const formattedMyPoolValue = useCallback(() => {
    if (PooledTokens !== undefined && UBQoracle !== undefined) {
      // return `${(PooledTokens.token0 * UBQoracle.price.usdt).toFixed(0)} UBQ / $${(PooledTokens.token1 * inkPrice).toFixed(0)} INK`
      return `${(PooledTokens.token0 * UBQoracle.price.usdt + PooledTokens.token1 * inkPrice).toFixed(0)}`;
    }

    return `-- ${AvailableFarms[farmKey].tokenA.symbol} / -- ${AvailableFarms[farmKey].tokenB.symbol}`;
  }, [PooledTokens, UBQoracle, inkPrice, farmKey]);

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
      <Grid container spacing={2}>
        <StyledGridItem variant="wide" val={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name} LP Staked` : "--"} />
        <StyledGridItem
          val={`${AvailableFarms[farmKey].tokenA.symbol} $${UBQoracle?.price?.usdt.toPrecision(3) || "--"} / $${inkPrice.toPrecision(3)} ${
            AvailableFarms[farmKey].tokenB.symbol
          }`}
        />
        <StyledGridItem variant="wide" val={`LP Value $${formattedMyPoolValue()}`} />
        <StyledGridItem val={`TVL $${currentTvl.toFixed(0)}`} />
        <StyledGridItem variant="wide" val={lpPercent > 0 ? lpPercent.toString() + " Pool %" : "--"} />
        <StyledGridItem val={`APY: ${currentApy.toFixed(0)}%`} />
        <StyledGridItem variant="wide" val={`LP ${formattedMyPoolTokens()}`} />
        <StyledGridItem val={`${parseFloat(availableLPBalance) > 0 ? parseFloat(availableLPBalance).toFixed(6) : "0.00"} LP Tokens Unstaked`} />
      </Grid>
      <div>
        <Button sx={{ width: "100%" }} href={AvailableFarms[farmKey].lp.url} variant="outlined">
          Manage {AvailableFarms[farmKey].name} liquidity <LinkIcon />
        </Button>
      </div>

      {typeof farmingStartTime !== "undefined" && farmingStartTime[farmKey] > Date.now() && (
        <Countdown date={farmingStartTime[farmKey]} renderer={renderer} />
      )}
    </>
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "left",
  backgroundColor: "#333339",
  height: "100%",
}));

interface GridItemProps {
  val: string;
  valueSize?: string;
  valueBold?: string;
  variant?: string;
}

const StyledGridItem: React.FC<GridItemProps> = ({ val, variant }) => {
  if (variant === "wide") {
    return (
      <Grid item xs={6} xl={6}>
        <StyledPaper>
          <Typography variant="body1">{val}</Typography>
        </StyledPaper>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={6} xl={6}>
        <StyledPaper>
          <Typography variant="body1">{val}</Typography>
        </StyledPaper>
      </Grid>
    );
  }
};

export default React.memo(Stake);
