import React, { useMemo } from "react";

import { Box, Button, Container, Separator, Spacer } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import Split from "components/Split";
import useFarming from "hooks/useFarming";
import HarvestCard from "./components/Harvest";
import StakeCard from "./components/Stake";
import { useWallet } from "use-wallet";
import { AvailableFarms } from "farms/AvailableFarms";

interface YieldFarmProps {
  farmKey: number;
}

const Farm: React.FC = () => {
  return (
    <Page>
      <Box row justifyContent="center">
        <Button full text="Get Started Here" to="/help" />
      </Box>
      <Spacer />
      <PageHeader icon="" subtitle="Stake INK/UBQ Shinobi LP tokens and farm INK" title="Farm" />
      <YieldFarm farmKey={0} />
      <YieldFarm farmKey={1} />
    </Page>
  );
};

const YieldFarm: React.FC<YieldFarmProps> = ({ farmKey }) => {
  // TODO: move this to an external file

  const farm = AvailableFarms[farmKey];

  const { status } = useWallet();

  const { isRedeeming, onRedeem } = useFarming();

  const RedeemButton = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled text={`Harvest &amp; Unstake ${farm.name}`} variant="secondary" />;
    }
    if (isRedeeming !== undefined && isRedeeming[farmKey] === false) {
      return (
        <Button
          onClick={() => {
            onRedeem(farmKey);
          }}
          text={`Harvest & Unstake ${farm.name}`}
          variant="secondary"
        />
      );
    }
    return <Button disabled text="Redeeming..." variant="secondary" />;
  }, [isRedeeming, onRedeem, farmKey, farm, status]);

  return (
    <Container>
      <Spacer />
      <Split>
        <StakeCard farmKey={farmKey}>
          <img
            src={farm.tokenA.logo}
            alt={`${farm.tokenA.symbol} Logo`}
            style={{ width: "80px", height: "80px", background: "white", borderRadius: "40px" }}
          />
          <span style={{ fontSize: "50px", lineHeight: "80px", width: "50px", display: "block", textAlign: "center" }}>+</span>
          <img src={farm.tokenB.logo} alt={`${farm.tokenB.symbol} Logo`} style={{ width: "80px", height: "80px" }} />
        </StakeCard>
        <HarvestCard farmKey={farmKey} />
      </Split>
      <Spacer />
      <Box row justifyContent="center">
        {RedeemButton}
      </Box>
      <Spacer size="lg" />
      <Separator />
      <Spacer size="lg" />
      <Split>
        <Button full text="Addresses" to="/addresses" variant="secondary" />
        <Button full text={`Get ${farm.name} LP tokens`} href={farm.lp.url} variant="tertiary" />
      </Split>
    </Container>
  );
};

export default Farm;
