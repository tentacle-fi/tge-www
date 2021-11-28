import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "use-wallet";
import useFarming from "hooks/useFarming";
import { bnToDec, getShortDisplayBalance } from "utils";
import { AvailableFarms } from "farms/AvailableFarms";
import LoadingButton from "@mui/lab/LoadingButton";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import useUbiq from "hooks/useUbiq";
import { harvest } from "ubiq-sdk/utils";

interface HarvestProps {
  farmKey: number;
}

interface UnHarvestProps extends HarvestProps {
  earnedBalance: number;
}

const Harvest: React.FC<HarvestProps> = ({ farmKey }) => {
  const { earnedBalances } = useFarming();
  const [earnedBalance, setEarnedBalance] = useState<number>(0);

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

  return (
    <>
      <div style={{ display: "block", height: "60%", padding: "10px 5px 0 5px" }}>
        <img
          src={AvailableFarms[farmKey].yieldfarm.payOutLogo}
          alt={AvailableFarms[farmKey].yieldfarm.payOut + " token logo"}
          style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
        />

        <Typography variant="h5">{earnedBalance > 0 ? earnedBalance.toString() : "--"}</Typography>
        <Typography variant="body1">{"Unharvested " + AvailableFarms[farmKey].yieldfarm.payOut}</Typography>
      </div>

      <UnHarvested farmKey={farmKey} earnedBalance={earnedBalance} />
    </>
  );
};

const UnHarvested: React.FC<UnHarvestProps> = React.memo(({ farmKey, earnedBalance }) => {
  const [isHarvesting, setisHarvesting] = useState(false);

  const { status, account } = useWallet();
  const ubiq = useUbiq();
  const { setConfirmTxModalIsOpen } = useFarming();

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
        <Tooltip title={earnedBalance > 0 ? "Harvest your rewards!" : "No rewards to harvest"}>
          <div>
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
          </div>
        </Tooltip>
      );
    }
    if (isHarvesting === true) {
      return <p>Harvesting...</p>;
    }
  }, [status, isHarvesting, earnedBalance, handleHarvest]);

  return <>{HarvestAction}</>;
});

export default React.memo(Harvest);
