import React, { useCallback, useEffect, useMemo, useState } from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import Box from "@mui/material/Box";
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
import SLink from "components/SLink";

interface StakeProps {
  farmKey: number;
}

const Stake: React.FC<StakeProps> = ({ children, farmKey }) => {
  const [stakeBalance, setStakeBalance] = useState<number>(0);
  const [lpPercent, setLpPercent] = useState<number>(0);

  const { LPBalances, tokenPrices } = useBalances();

  const availableLPBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const { farmingStartTime, stakedBalances, lpPercents, currentApy, currentTvl, PooledTokens } = useFarming();

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

  // TODO: unclear if this is accurate enough or if we need to reverse the uniswap v2 algo from the stakedLP tokens for this account (LP = sqrt(token0 * token1))
  const formattedMyPoolTokens = useCallback(() => {
    if (PooledTokens !== undefined) {
      return ` ${PooledTokens[farmKey].token0.toFixed(0)} ${AvailableFarms[farmKey].tokenA.symbol} / ${PooledTokens[farmKey].token1.toFixed(0)} ${
        AvailableFarms[farmKey].tokenB.symbol
      }`;
    }

    return `-- ${AvailableFarms[farmKey].tokenA.symbol} / -- ${AvailableFarms[farmKey].tokenB.symbol}`;
  }, [PooledTokens, farmKey]);

  const formattedMyPoolValue = useCallback(() => {
    if (PooledTokens !== undefined && tokenPrices !== undefined) {
      return `${(
        PooledTokens[farmKey].token0 * tokenPrices[AvailableFarms[farmKey].tokenA.address] +
        PooledTokens[farmKey].token1 * tokenPrices[AvailableFarms[farmKey].tokenB.address]
      ).toFixed(0)}`;
    }

    return `-- ${AvailableFarms[farmKey].tokenA.symbol} / -- ${AvailableFarms[farmKey].tokenB.symbol}`;
  }, [PooledTokens, farmKey, tokenPrices]);

  const formattedTokenPrices = useCallback(() => {
    const tokenA = AvailableFarms[farmKey].tokenA;
    const tokenB = AvailableFarms[farmKey].tokenB;
    if (tokenPrices === undefined) {
      return `-- ${tokenA.symbol} / -- ${tokenB.symbol}`;
    }

    return `$${tokenPrices[tokenA.address].toFixed(3)} ${tokenA.symbol} / $${tokenPrices[tokenB.address].toFixed(3)} ${tokenB.symbol}`;
  }, [tokenPrices, farmKey]);

  const formattedTvl = useCallback(() => {
    if (currentTvl === undefined) {
      return "";
    }
    return `$ ${currentTvl[farmKey].toFixed(0)}`;
  }, [currentTvl, farmKey]);

  const formattedApy = useCallback(() => {
    if (currentApy === undefined) {
      return "";
    }
    if (currentApy[farmKey] > 1) {
      return `${currentApy[farmKey].toFixed(0)}%`;
    }

    return `${currentApy[farmKey].toFixed(3)}%`;
  }, [currentApy, farmKey]);

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
      <Box sx={{ justifyContent: "center", width: "100%" }}>
        <Typography variant="overline">{`Farming starts in ${paddedDays} days ${paddedHours}:${paddedMinutes}:${paddedSeconds}`} </Typography>
      </Box>
    );
  };

  return (
    <>
      <Grid container spacing={1}>
        {typeof farmingStartTime !== "undefined" && farmingStartTime[farmKey] > Date.now() && (
          <Grid item xs={12}>
            <Countdown date={farmingStartTime[farmKey]} renderer={renderer} />
          </Grid>
        )}
        <Box sx={{ width: "50%", marginTop: "8px"}}>
          <Grid container spacing={1}>
            <FarmInfo
              farmKey={farmKey}
              labelText="LP Staked:"
              stakeBalance={stakeBalance}
              contents={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name}` : "--"}
            />
            <FarmInfo farmKey={farmKey} labelText="LP Value:" stakeBalance={stakeBalance} contents={`$ ${formattedMyPoolValue()}`} />
            <FarmInfo
              farmKey={farmKey}
              labelText="Farm %:"
              stakeBalance={stakeBalance}
              contents={lpPercent > 0 ? lpPercent.toString() + "%" : "--"}
            />
            <FarmInfo farmKey={farmKey} labelText="Staked:" stakeBalance={stakeBalance} contents={formattedMyPoolTokens()} />
          </Grid>
        </Box>

        <Box sx={{ width: "50%", marginTop: "8px" }}>
          <Grid container spacing={1}>
            <FarmInfo farmKey={farmKey} labelText="Prices:" stakeBalance={stakeBalance} contents={formattedTokenPrices()} />
            <FarmInfo farmKey={farmKey} labelText="TVL:" stakeBalance={stakeBalance} contents={formattedTvl()} />
            <FarmInfo farmKey={farmKey} labelText="APY:" stakeBalance={stakeBalance} contents={formattedApy()} />
            <FarmInfo
              farmKey={farmKey}
              labelText="Unstaked:"
              stakeBalance={stakeBalance}
              color={parseFloat(availableLPBalance) > 0 ? "#ff6e63" : ""}
              contents={`${parseFloat(availableLPBalance) > 0 ? `${parseFloat(availableLPBalance).toFixed(6)}  LP Tokens` : "0.00  LP Tokens"}`}
            />
          </Grid>
        </Box>
      </Grid>
      <div>
        <SLink external href={AvailableFarms[farmKey].lp.url}>
          <Button sx={{ width: "100%", marginTop: "10px" }} variant="outlined">
            Add {AvailableFarms[farmKey].name} liquidity on Shinobi
            <LinkIcon />
          </Button>
        </SLink>
      </div>
    </>
  );
};

interface FarmInfoProps {
  labelText: string;
  contents: string;
  stakeBalance: number;
  farmKey: number;
  color?: string;
}

const FarmInfo: React.FC<FarmInfoProps> = ({ labelText, contents, stakeBalance, farmKey, color }) => {
  return (
    <>
      <StyledGridLabel contents={labelText} />
      <StyledGridItem variant="data" color={color} val={contents} />
    </>
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "left",
  backgroundColor: "#333339",
  height: "100%",
}));

interface StyledLabelProps {
  contents: string;
}

const StyledGridLabel: React.FC<StyledLabelProps> = ({ contents }) => {
  return (
    <StyledGridItem variant="label" val={contents}>
      <StyledPaper>
        <Typography variant="body1"></Typography>
      </StyledPaper>
    </StyledGridItem>
  );
};

interface GridItemProps {
  val: string;
  valueSize?: string;
  valueBold?: string;
  variant?: string;
  color?: string;
}

const StyledGridItem: React.FC<GridItemProps> = ({ val, variant, color }) => {
  if (variant === "label") {
    return (
      <Grid item xs={2} lg={4}>
        <StyledPaper>
          <Typography color={color} variant="body1" sx={{ textAlign: "right" }}>
            {val}
          </Typography>
        </StyledPaper>
      </Grid>
    );
  } else if (variant === "data") {
    return (
      <Grid item xs={10} lg={8}>
        <StyledPaper>
          <Typography color={color} variant="body1">
            {val}
          </Typography>
        </StyledPaper>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={12} lg={12}>
        <StyledPaper>
          <Typography color={color} variant="body1">
            {val}
          </Typography>
        </StyledPaper>
      </Grid>
    );
  }
};

export default React.memo(Stake);
