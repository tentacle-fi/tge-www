import React, { useCallback, useEffect, useMemo, useState } from "react";

import Countdown, { CountdownRenderProps } from "react-countdown";
import { Box, Button, Card, CardActions, CardContent, CardIcon } from "react-neu";
import { useWallet } from "use-wallet";

import Label from "components/Label";
import Value from "components/Value";

import useFarming from "hooks/useFarming";

import { bnToDec, getFullDisplayBalance } from "utils";

import StakeModal from "./components/StakeModal";
import UnstakeModal from "./components/UnstakeModal";

const Stake: React.FC = () => {
  const [stakeModalIsOpen, setStakeModalIsOpen] = useState(false);
  const [unstakeModalIsOpen, setUnstakeModalIsOpen] = useState(false);
  const [stakeBalance, setStakeBalance] = useState<number>(0);

  const { status } = useWallet();
  const {
    countdown,
    farmingStartTime,
    isApproved,
    isApproving,
    isStaking,
    isUnstaking,
    onApprove,
    onStakeESCHUBQ,
    onUnstakeESCHUBQ,
    stakedBalanceESCHUBQ,
  } = useFarming();

  const handleDismissStakeModal = useCallback(() => {
    setStakeModalIsOpen(false);
  }, [setStakeModalIsOpen]);

  const handleDismissUnstakeModal = useCallback(() => {
    setUnstakeModalIsOpen(false);
  }, [setUnstakeModalIsOpen]);

  const handleOnStake = useCallback(
    (amount: string) => {
      onStakeESCHUBQ(amount);
      handleDismissStakeModal();
    },
    [handleDismissStakeModal, onStakeESCHUBQ]
  );

  const handleOnUnstake = useCallback(
    (amount: string) => {
      onUnstakeESCHUBQ(amount);
      handleDismissUnstakeModal();
    },
    [handleDismissUnstakeModal, onUnstakeESCHUBQ]
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
    if (isStaking) {
      return <Button disabled full text="Staking..." variant="secondary" />;
    }
    if (!isApproved) {
      return (
        <Button
          disabled={isApproving}
          full
          onClick={onApprove}
          text={!isApproving ? "Approve staking" : "Approving staking..."}
          variant={isApproving || status !== "connected" ? "secondary" : "default"}
        />
      );
    }
    if (isApproved) {
      return <Button full onClick={handleStakeClick} text="Stake" variant="secondary" />;
    }
  }, [countdown, handleStakeClick, isApproving, onApprove, status]);

  const UnstakeButton = useMemo(() => {
    const hasStaked = stakedBalanceESCHUBQ && stakedBalanceESCHUBQ.toNumber() > 0;
    if (status !== "connected" || !hasStaked) {
      return <Button disabled full text="Unstake" variant="secondary" />;
    }
    if (isUnstaking) {
      return <Button disabled full text="Unstaking..." variant="secondary" />;
    }
    return <Button full onClick={handleUnstakeClick} text="Unstake" variant="secondary" />;
  }, [handleUnstakeClick, isApproving, onApprove, status]);

  const formattedStakedBalance = useCallback(async () => {
    if (stakedBalanceESCHUBQ && bnToDec(stakedBalanceESCHUBQ) > 0) {
      setStakeBalance(Number(getFullDisplayBalance(stakedBalanceESCHUBQ)));
    } else {
      setStakeBalance(0);
    }
  }, [stakedBalanceESCHUBQ]);

  useEffect(() => {
    formattedStakedBalance();
    let refreshInterval = setInterval(formattedStakedBalance, 10000);
    return () => clearInterval(refreshInterval);
  }, [formattedStakedBalance]);

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    return (
      <Box row justifyContent="center">
        <Label text={`Farming starts in ${paddedHours}:${paddedMinutes}:${paddedSeconds}`} />
      </Box>
    );
  };

  return (
    <>
      <Card>
        <CardIcon>🌱</CardIcon>
        <CardContent>
          <Box alignItems="center" column>
            <Value value={stakeBalance > 0 ? stakeBalance.toString() : "--"} />
            <Label text="Staked ESCH/UBQ LP Tokens" />
          </Box>
        </CardContent>
        <CardActions>
          {UnstakeButton}
          {StakeButton}
        </CardActions>
        {typeof countdown !== "undefined" && countdown > 0 && (
          <CardActions>
            <Countdown date={farmingStartTime} renderer={renderer} />
          </CardActions>
        )}
      </Card>
      <StakeModal isOpen={stakeModalIsOpen} onDismiss={handleDismissStakeModal} onStake={handleOnStake} />
      <UnstakeModal isOpen={unstakeModalIsOpen} onDismiss={handleDismissUnstakeModal} onUnstake={handleOnUnstake} />
    </>
  );
};

export default Stake;
