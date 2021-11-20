import React, { useCallback, useEffect, useMemo, useState } from "react";

import Countdown, { CountdownRenderProps } from "react-countdown";
import { Box, Button, Card, CardActions } from "react-neu";
import { useWallet } from "use-wallet";
import styled from "styled-components";

import Label from "components/Label";
import Value from "components/Value";

import useFarming from "hooks/useFarming";

import { bnToDec, getShortDisplayBalance } from "utils";

import StakeModal from "./components/StakeModal";
import UnstakeModal from "./components/UnstakeModal";

import useApproval from "hooks/useApproval";
import { AvailableFarms } from "farms/AvailableFarms";

interface StakeProps {
  farmKey: number;
}

const Stake: React.FC<StakeProps> = ({ children, farmKey }) => {
  const [stakeModalIsOpen, setStakeModalIsOpen] = useState(false);
  const [unstakeModalIsOpen, setUnstakeModalIsOpen] = useState(false);
  const [stakeBalance, setStakeBalance] = useState<number>(0);
  const [lpPercent, setLpPercent] = useState<number>(0);

  const { isApproved, isApproving, onApprove } = useApproval(AvailableFarms[farmKey].lp.address, AvailableFarms[farmKey].yieldfarm.address, () =>
    setConfirmTxModalIsOpen(false)
  );

  const { status } = useWallet();
  const { countdown, farmingStartTime, isStaking, isUnstaking, setConfirmTxModalIsOpen, onStake, onUnstake, stakedBalances, lpPercents } =
    useFarming();

  const handleDismissStakeModal = useCallback(() => {
    setStakeModalIsOpen(false);
  }, [setStakeModalIsOpen]);

  const handleDismissUnstakeModal = useCallback(() => {
    setUnstakeModalIsOpen(false);
  }, [setUnstakeModalIsOpen]);

  const handleOnStake = useCallback(
    (contractIndex: number, amount: string) => {
      onStake(contractIndex, amount);
      handleDismissStakeModal();
    },
    [handleDismissStakeModal, onStake]
  );

  const handleOnUnstake = useCallback(
    (contractIndex: number, amount: string) => {
      onUnstake(contractIndex, amount);
      handleDismissUnstakeModal();
    },
    [handleDismissUnstakeModal, onUnstake]
  );

  const handleStakeClick = useCallback(() => {
    setStakeModalIsOpen(true);
  }, [setStakeModalIsOpen]);

  const handleUnstakeClick = useCallback(() => {
    setUnstakeModalIsOpen(true);
  }, [setUnstakeModalIsOpen]);

  const StakeButton = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled full text="Stake" variant="secondary" />;
    }
    if (isStaking !== undefined && isStaking[farmKey] === true) {
      return <Button disabled full text="Staking..." variant="secondary" />;
    }
    if (isApproved !== undefined && isApproved === false) {
      return (
        <Button
          disabled={isApproving === true}
          full
          onClick={() => {
            setConfirmTxModalIsOpen(true);
            onApprove();
          }}
          text={isApproving !== undefined && isApproving === false ? "Approve staking" : "Approving staking..."}
          variant={isApproving || status !== "connected" ? "secondary" : "default"}
        />
      );
    }
    if (isApproved !== undefined && isApproved === true) {
      return <Button full onClick={handleStakeClick} text="Stake" variant="secondary" />;
    }
  }, [handleStakeClick, isStaking, isApproved, isApproving, onApprove, status, farmKey, setConfirmTxModalIsOpen]);

  const UnstakeButton = useMemo(() => {
    const hasStaked = stakedBalances === undefined ? false : stakedBalances[farmKey] && stakedBalances[farmKey].toNumber() > 0;
    if (status !== "connected" || !hasStaked) {
      return <Button disabled full text="Unstake" variant="secondary" />;
    }
    if (isUnstaking !== undefined && isUnstaking[farmKey] === true) {
      return <Button disabled full text="Unstaking..." variant="secondary" />;
    }
    return <Button full onClick={handleUnstakeClick} text="Unstake" variant="secondary" />;
  }, [handleUnstakeClick, isUnstaking, stakedBalances, status, farmKey]);

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
      <Card>
        <StyledBox row justifyContent="center">
          {children}
        </StyledBox>
        <StyledCardContent>
          <Box alignItems="center" column>
            <Value value={stakeBalance > 0 ? `${stakeBalance.toString()} ${AvailableFarms[farmKey].name} LP` : "--"} />
            <Value valueSize="14px" valueBold="400" value={lpPercent > 0 ? lpPercent.toString() + " Pool %" : "--"} />
          </Box>
        </StyledCardContent>
        <CardActions>
          {UnstakeButton}
          {StakeButton}
        </CardActions>
        {typeof countdown !== "undefined" && countdown[farmKey] > 0 && (
          <CardActions>
            <Countdown date={farmingStartTime[farmKey]} renderer={renderer} />
          </CardActions>
        )}
      </Card>
      <StakeModal farmKey={farmKey} isOpen={stakeModalIsOpen} onDismiss={handleDismissStakeModal} onStake={handleOnStake} />
      <UnstakeModal farmKey={farmKey} isOpen={unstakeModalIsOpen} onDismiss={handleDismissUnstakeModal} onUnstake={handleOnUnstake} />
    </>
  );
};

const StyledBox = styled(Box)`
  padding-top: 20px;
  height: 100px;
`;

const StyledCardContent = styled(Box)`
  padding-top: 0px;
`;

export default Stake;
