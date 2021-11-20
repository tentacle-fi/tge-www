import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Button, Card, CardActions, CardContent, CardIcon } from "react-neu";
import { useWallet } from "use-wallet";

import Label from "components/Label";
import Value from "components/Value";

import useFarming from "hooks/useFarming";

import { bnToDec, getShortDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";

interface HarvestProps {
  farmKey: number;
}

const Harvest: React.FC<HarvestProps> = ({ farmKey }) => {
  const [earnedBalance, setEarnedBalance] = useState<number>(0);
  const { status } = useWallet();
  const { earnedBalances, isHarvesting, onHarvest } = useFarming();

  const formattedEarnedBalance = useCallback(async () => {
    if (earnedBalances && bnToDec(earnedBalances[farmKey]) > 0) {
      setEarnedBalance(Number(getShortDisplayBalance(earnedBalances[farmKey])));
    } else {
      setEarnedBalance(0);
    }
  }, [earnedBalances, farmKey]);

  useEffect(() => {
    formattedEarnedBalance();
    let refreshInterval = setInterval(formattedEarnedBalance, 10000);
    return () => clearInterval(refreshInterval);
  }, [formattedEarnedBalance]);

  const HarvestAction = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled full text="Harvest" variant="secondary" />;
    }
    if (isHarvesting !== undefined && isHarvesting[farmKey] === false) {
      return (
        <Button
          disabled={earnedBalance <= 0}
          full
          onClick={() => {
            onHarvest(farmKey);
          }}
          text="Harvest"
          variant="secondary"
        />
      );
    }
    if (isHarvesting !== undefined && isHarvesting[farmKey] === true) {
      return <Button disabled full text="Harvesting..." variant="secondary" />;
    }
  }, [status, isHarvesting, earnedBalance, onHarvest, farmKey]);

  return (
    <>
      <Card>
        <CardIcon>
          {" "}
          <img
            src={AvailableFarms[farmKey].yieldfarm.payOutLogo}
            alt={AvailableFarms[farmKey].yieldfarm.payOut + " token logo"}
            style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
          />{" "}
        </CardIcon>
        <CardContent>
          <Box alignItems="center" column>
            <Value value={earnedBalance > 0 ? earnedBalance.toString() : "--"} />
            <Label text={"Unharvested " + AvailableFarms[farmKey].yieldfarm.payOut} />
          </Box>
        </CardContent>
        <CardActions>{HarvestAction}</CardActions>
      </Card>
    </>
  );
};

export default Harvest;
