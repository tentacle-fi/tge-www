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

  const formattedMyPoolTokens = useCallback(() => {
    if (PooledTokens !== undefined) {
      return ` ${PooledTokens.token0.toFixed(0)} UBQ / ${PooledTokens.token1.toFixed(0)} INK`;
    }

    return "-- UBQ / -- INK";
  }, [PooledTokens]);

  const formattedMyPoolValue = useCallback(() => {
    if (PooledTokens !== undefined && UBQoracle !== undefined) {
      // return `${(PooledTokens.token0 * UBQoracle.price.usdt).toFixed(0)} UBQ / $${(PooledTokens.token1 * inkPrice).toFixed(0)} INK`
      return `${(PooledTokens.token0 * UBQoracle.price.usdt + PooledTokens.token1 * inkPrice).toFixed(0)}`;
    }

    return "-- UBQ / -- INK";
  }, [PooledTokens, UBQoracle, inkPrice]);

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
      <div style={{ display: "flex", flexDirection: "row", gap: "10px 35px", textAlign: "left" }}>
        <Stack>
          <StyledStackItem val={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name} LP Staked` : "--"} />
          <StyledStackItem val={lpPercent > 0 ? lpPercent.toString() + " Pool %" : "--"} />

          <StyledStackItem val={`LP ${formattedMyPoolTokens()}`} />
          <StyledStackItem val={`LP Value $${formattedMyPoolValue()}`} />

          <StyledStackItem val={`${parseFloat(availableLPBalance) > 0 ? parseFloat(availableLPBalance).toFixed(6) : "--"} LP Tokens Unstaked`} />
        </Stack>
        <Stack>
          <StyledStackItem val={`UBQ $${UBQoracle?.price?.usdt.toPrecision(3) || "--"} / $${inkPrice.toPrecision(3)} INK`} />
          <StyledStackItem val={`TVL $${currentTvl.toFixed(0)}`} />
          <StyledStackItem val={`APY: ${currentApy.toFixed(0)}%`} />

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
