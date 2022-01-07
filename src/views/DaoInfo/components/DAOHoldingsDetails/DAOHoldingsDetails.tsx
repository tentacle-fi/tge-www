import React, { useState, useCallback, useEffect } from "react";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import styled from "styled-components";
import Box from "@mui/material/Box";
// import { bnToDec, getShortDisplayBalance } from "utils";
import Typography from "@mui/material/Typography";
// import Tooltip from "@mui/material/Tooltip";
// import useUbiq from "hooks/useUbiq";
import { getDaoHoldings, IDaoHoldings } from "utils";
import { useWallet } from "use-wallet";
import useUbiq from "hooks/useUbiq";
import { provider } from "web3-core";
import BigNumber from "bignumber.js";
import InfoIconWithTooltip from "components/InfoIconWithTooltip";

// sets up a formatter so with toFormat on big numbers, we get thousands separators
BigNumber.config({ FORMAT: { groupSeparator: ",", groupSize: 3, decimalSeparator: "." } });

const DAOHoldingsDetails: React.FC = () => {
  const [daoHoldings, setDaoHoldings] = useState<IDaoHoldings>();
  const { ethereum } = useWallet();
  const { BlockNum } = useUbiq();

  const fetchDaoHoldings = useCallback(
    async function (provider: provider) {
      const currentHoldings = await getDaoHoldings(provider);

      setDaoHoldings(currentHoldings);
    },
    [setDaoHoldings]
  );

  // Update holdings based on new block numbers
  useEffect(() => {
    if (!ethereum) {
      return;
    }
    fetchDaoHoldings(ethereum);
  }, [BlockNum, fetchDaoHoldings, ethereum]);

  if (daoHoldings === undefined) {
    return <></>;
  }

  return (
    <>
      <div style={{ clear: "both", margin: "10px" }}></div>

      <Typography variant="h5">DAO Holdings</Typography>

      <StyledBox>
        <Typography align="center" variant="h6">
          Coins/Tokens <InfoIconWithTooltip tooltipText="The DAO holds these coins and tokens" />
        </Typography>
        <br />
        <Grid container sx={{ textAlign: "center" }} spacing={1}>
          <Grid xs={4} item>
            <Chip label={"UBQ: " + daoHoldings.ubq.toFormat(0)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"INK: " + daoHoldings.ink.toFormat(0)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"ESCH: " + daoHoldings.esch.toFormat(0)} color="primary" variant="outlined" />
          </Grid>
        </Grid>

        <Typography sx={{ mt: "12px" }} align="center" variant="h6">
          LP Standing <InfoIconWithTooltip tooltipText="The DAO holds this LP" />
        </Typography>
        <br />
        <Grid container sx={{ textAlign: "center", clear: "both" }} spacing={1}>
          <Grid xs={4} item>
            <Chip label={"UBQ/INK: " + daoHoldings.lp.ubqInk.toFormat(4)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"GRANS/INK: " + daoHoldings.lp.gransInk.toFormat(4)} color="primary" variant="outlined" />
          </Grid>
          <Grid xs={4} item>
            <Chip label={"INK/ESCH: " + daoHoldings.lp.inkEsch.toFormat(4)} color="primary" variant="outlined" />
          </Grid>
        </Grid>
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box)`
  display: block;
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
  width: 60%;
  min-width: 550px;
`;

export default React.memo(DAOHoldingsDetails);
