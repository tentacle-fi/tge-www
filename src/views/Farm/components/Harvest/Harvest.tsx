import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Box, Button, Card, CardActions, CardContent, CardIcon } from "react-neu";
import { useWallet } from "use-wallet";

import Label from "components/Label";
import Value from "components/Value";
import inkLogo from "assets/ink_black_alpha.png";

import useFarming from "hooks/useFarming";

import { bnToDec, getShortDisplayBalance } from "utils";

const Harvest: React.FC = () => {
  const [earnedBalance, setEarnedBalance] = useState<number>(0);
  const { status } = useWallet();
  const { earnedBalanceESCHUBQ, isHarvesting, onHarvestESCHUBQ } = useFarming();

  const formattedEarnedBalance = useCallback(async () => {
    if (earnedBalanceESCHUBQ && bnToDec(earnedBalanceESCHUBQ) > 0) {
      setEarnedBalance(Number(getShortDisplayBalance(earnedBalanceESCHUBQ)));
    } else {
      setEarnedBalance(0);
    }
  }, [earnedBalanceESCHUBQ]);

  useEffect(() => {
    formattedEarnedBalance();
    let refreshInterval = setInterval(formattedEarnedBalance, 10000);
    return () => clearInterval(refreshInterval);
  }, [formattedEarnedBalance]);

  const HarvestAction = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled full text="Harvest" variant="secondary" />;
    }
    if (!isHarvesting) {
      return <Button disabled={earnedBalance <= 0} full onClick={onHarvestESCHUBQ} text="Harvest" variant="secondary" />;
    }
    if (isHarvesting) {
      return <Button disabled full text="Harvesting..." variant="secondary" />;
    }
  }, [status, isHarvesting, earnedBalance, onHarvestESCHUBQ]);

  return (
    <>
      <Card>
        <CardIcon>
          {" "}
          <img src={inkLogo} alt="INK token logo" style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }} />{" "}
        </CardIcon>
        <CardContent>
          <Box alignItems="center" column>
            <Value value={earnedBalance > 0 ? earnedBalance.toString() : "--"} />
            <Label text="Unharvested INK" />
          </Box>
        </CardContent>
        <CardActions>{HarvestAction}</CardActions>
      </Card>
    </>
  );
};

export default Harvest;
