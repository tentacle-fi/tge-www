import React, { useState, useCallback, useEffect } from "react";
import Chip from "@mui/material/Chip";
import styled from "styled-components";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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

      <Typography variant="h5">DAO Holdings <InfoIconWithTooltip tooltipText="The DAO holds these coins and tokens" /></Typography>
      <br />
      <StyledBox>
        <Chip label={"UBQ: " + daoHoldings.ubq.toFormat(0)} color="primary" variant="outlined" />
        <Chip label={"INK: " + daoHoldings.ink.toFormat(0)} color="primary" variant="outlined" />
        <Chip label={"ESCH: " + daoHoldings.esch.toFormat(0)} color="primary" variant="outlined" />
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 8%;
  border-radius: 15px;
  background: #2c2b3d;
  padding: 20px;
  width: 50%;
  position: relative;
  min-width: 650px;

  @media (max-width: 850px) {
    flex-direction: column;
    min-width: 600px;
  }
`;

export default React.memo(DAOHoldingsDetails);
