import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Box } from "react-neu";
import { useWallet } from "use-wallet";
import Value from "components/Value";

import useFarming from "hooks/useFarming";

import { bnToDec, getShortDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

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
      return <p>Connect Wallet</p>;
    }
    if (isHarvesting !== undefined && isHarvesting[farmKey] === false) {
      return (
        <LoadingButton
          disabled={earnedBalance <= 0}
          onClick={() => {
            onHarvest(farmKey);
          }}
          endIcon={<AttachMoneyIcon />}
          loading={false}
          loadingPosition="end"
          variant="contained"
          color="success"
          size="small"
        >
          Harvest
        </LoadingButton>
      );
    }
    if (isHarvesting !== undefined && isHarvesting[farmKey] === true) {
      return <p>Harvesting...</p>;
    }
  }, [status, isHarvesting, earnedBalance, onHarvest, farmKey]);

  return (
    <div style={{ padding: "10px 5px 10px 5px" }}>
      <img
        src={AvailableFarms[farmKey].yieldfarm.payOutLogo}
        alt={AvailableFarms[farmKey].yieldfarm.payOut + " token logo"}
        style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
      />

      <Box alignItems="center" column>
        <Value value={earnedBalance > 0 ? earnedBalance.toString() : "--"} />
        <p>{"Unharvested " + AvailableFarms[farmKey].yieldfarm.payOut}</p>
      </Box>

      {HarvestAction}
    </div>
  );
};

export default Harvest;
