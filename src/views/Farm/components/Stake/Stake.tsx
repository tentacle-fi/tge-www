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

interface StakeProps {
  farmKey: number;
}

const Stake: React.FC<StakeProps> = ({ children, farmKey }) => {
  const [stakeBalance, setStakeBalance] = useState<number>(0);
  const [lpPercent, setLpPercent] = useState<number>(0);

  const { LPBalances } = useBalances();

  const availableLPBalance = useMemo(() => {
    return getFullDisplayBalance(LPBalances !== undefined ? LPBalances[farmKey] : new BigNumber(0), 0);
  }, [LPBalances, farmKey]);

  const { countdown, farmingStartTime, stakedBalances, lpPercents } = useFarming();

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
        <Value value={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name} LP Staked` : "--"} />
        <Value valueSize="16px" valueBold="400" value={lpPercent > 0 ? lpPercent.toString() + " Pool %" : "--"} />
        <Value valueSize="16px" valueBold="400" value={`${parseFloat(availableLPBalance).toFixed(6)} LP Tokens Unstaked`} />

        <Value valueSize="16px" valueBold="400" value={`TVL`} />
        <Value valueSize="16px" valueBold="400" value={`my token balances in LP`} />
        <Value valueSize="16px" valueBold="400" value={`my pool value $`} />
        <Value valueSize="16px" valueBold="400" value={`current APR / APY`} />

        <Link href={AvailableFarms[farmKey].lp.url} target="_blank" rel="noopener" underline="always">
          Manage {AvailableFarms[farmKey].name} liquidity <LinkIcon />
        </Link>
      </div>

      {typeof countdown !== "undefined" && countdown[farmKey] > 0 && <Countdown date={farmingStartTime[farmKey]} renderer={renderer} />}
    </>
  );
};

export default Stake;
