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
import useEvm from "hooks/useEvmProvider";

interface HarvestProps {
  farmKey: number;
}

interface UnHarvestProps extends HarvestProps {
  earnedBalance: number;
}

const Harvest: React.FC<HarvestProps> = ({ farmKey }) => {
  const { earnedBalances } = useFarming();
  const [earnedBalance, setEarnedBalance] = useState<number>(0);
  const { BlockNum } = useUbiq();

  const formattedEarnedBalance = useCallback(async () => {
    if (earnedBalances && bnToDec(earnedBalances[farmKey]) > 0) {
      setEarnedBalance(Number(getShortDisplayBalance(earnedBalances[farmKey])));
    } else {
      setEarnedBalance(0);
    }
  }, [earnedBalances, farmKey]);

  useEffect(() => {
    formattedEarnedBalance();
  }, [BlockNum, formattedEarnedBalance]);

  return (
    <>
      <div style={{ display: "block", height: "60%", minHeight: "140px", padding: "10px 5px 0 5px" }}>
        <img
          src={`/tokens/${AvailableFarms[farmKey].yieldfarm.reward.logo}`}
          alt={AvailableFarms[farmKey].yieldfarm.reward.symbol + " token logo"}
          style={{ height: 64, alignSelf: "center", background: "white", borderRadius: 110 }}
        />

        <Typography variant="h5">{earnedBalance > 0 ? earnedBalance.toString() : "--"}</Typography>
        <Typography variant="body1">{"Unharvested " + AvailableFarms[farmKey].yieldfarm.reward.symbol}</Typography>
      </div>

      <UnHarvested farmKey={farmKey} earnedBalance={earnedBalance} />
    </>
  );
};

const UnHarvested: React.FC<UnHarvestProps> = React.memo(({ farmKey, earnedBalance }) => {
  const [isHarvesting, setisHarvesting] = useState(false);

  const { status, account } = useWallet();
  const { ubiq } = useUbiq();
  const { setConfirmModal } = useEvm();
  const { setFarmFns } = useFarming();

  const handleHarvest = useCallback(
    async (all: boolean = false) => {
      if (!ubiq?.contracts?.pools) return;

      setConfirmModal(true);
      setisHarvesting(true);
      await harvest(ubiq, account, ubiq.contracts.pools[farmKey], (txHash: string) => {
        if (txHash === "") {
          setisHarvesting(false);
        }

        if (!all) {
          setConfirmModal(false);
        }
      }).catch((err) => {
        if (err.code === 4001) {
          console.log("Wallet: User cancelled");
        } else {
          console.error("Error caught:", err);
        }
      });

      if (!all) {
        setConfirmModal(false);
      }

      setisHarvesting(false);
    },
    [account, setConfirmModal, setisHarvesting, ubiq, farmKey]
  );

  useEffect(() => {
    if (handleHarvest === undefined || setFarmFns === undefined) {
      return;
    }
    setFarmFns((prevState) => {
      let h = {
        ...prevState?.harvest,
      };
      h[farmKey] = handleHarvest;

      return {
        ...prevState,
        harvest: h,
      };
    });
  }, [handleHarvest, setFarmFns, farmKey]);

  const HarvestAction = useMemo(() => {
    if (status !== "connected") {
      return <Typography variant="body1">Connect Wallet</Typography>;
    }
    if (isHarvesting === false) {
      return (
        <Tooltip title={earnedBalance > 0 ? "Harvest your rewards!" : "No rewards to harvest"}>
          <div>
            <LoadingButton
              sx={{ marginTop: "10px" }}
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
