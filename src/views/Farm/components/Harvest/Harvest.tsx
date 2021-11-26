import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Box } from "react-neu";
import { useWallet } from "use-wallet";
import Value from "components/Value";

import useFarming from "hooks/useFarming";

import { bnToDec, getShortDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Typography from '@mui/material/Typography';

import useUbiq from "hooks/useUbiq";
import { harvest } from "ubiq-sdk/utils";

interface HarvestProps {
  farmKey: number;
}

const Harvest: React.FC<HarvestProps> = ({ farmKey }) => {
  // const {setConfirmTxModalIsOpen } = useFarming();

  // console.log('test earnedBalances', earnedBalance, earnedBalances)

  return (
    <div style={{ padding: "10px 5px 10px 5px" }}>
      <img
        src={AvailableFarms[farmKey].yieldfarm.payOutLogo}
        alt={AvailableFarms[farmKey].yieldfarm.payOut + " token logo"}
        style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
      />

      <UnHarvested farmKey={farmKey} />
    </div>
  );
};

const UnHarvested: React.FC<HarvestProps> = React.memo(({ farmKey }) => {
  const [isHarvesting, setisHarvesting] = useState(false);

  const { status, account } = useWallet();
  const ubiq = useUbiq();
  const { earnedBalances, setConfirmTxModalIsOpen } = useFarming();
  const [earnedBalance, setEarnedBalance] = useState<number>(0);

  const formattedEarnedBalance = useCallback(async () => {
    if (earnedBalances && bnToDec(earnedBalances[farmKey]) > 0) {
      setEarnedBalance(Number(getShortDisplayBalance(earnedBalances[farmKey])));
    } else {
      setEarnedBalance(0);
    }
  }, [earnedBalances, farmKey]);

  const handleHarvest = useCallback(async () => {
    if (!ubiq) return;
    setConfirmTxModalIsOpen(true);
    setisHarvesting(true);
    await harvest(ubiq, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
      if (txHash === "") {
        setisHarvesting(false);
      }

      setConfirmTxModalIsOpen(false);
    }).catch((err) => {
      if (err.code === 4001) {
        console.log("Wallet: User cancelled");
      } else {
        console.log("Error caught:", err);
      }
    });

    setConfirmTxModalIsOpen(false);
    setisHarvesting(false);
  }, [account, setConfirmTxModalIsOpen, setisHarvesting, ubiq, farmKey]);

  const HarvestAction = useMemo(() => {
    if (status !== "connected") {
      return <p>Connect Wallet</p>;
    }
    if (isHarvesting === false) {
      return (
        <LoadingButton
          disabled={earnedBalance <= 0}
          onClick={() => {
            handleHarvest();
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
    if (isHarvesting === true) {
      return <p>Harvesting...</p>;
    }
  }, [status, isHarvesting, earnedBalance, handleHarvest]);

  useEffect(() => {
    formattedEarnedBalance();
    let refreshInterval = setInterval(formattedEarnedBalance, 10000);
    return () => clearInterval(refreshInterval);
  }, [formattedEarnedBalance]);

  return (
    <>
      <Box alignItems="center" column>
        <Value value={earnedBalance > 0 ? earnedBalance.toString() : "--"} />
        <Typography variant="body1">{"Unharvested " + AvailableFarms[farmKey].yieldfarm.payOut}</Typography>
      </Box>

      {HarvestAction}
    </>
  );
});

export default React.memo(Harvest);
