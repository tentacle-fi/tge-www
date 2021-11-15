import React, { useMemo } from "react";

import { Box, Button, Container, Separator, Spacer } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import Split from "components/Split";
import useFarming from "hooks/useFarming";
import HarvestCard from "./components/Harvest";
import StakeCard from "./components/Stake";
import { useWallet } from "use-wallet";
import inkLogo from "assets/ink_black_alpha.png";
import ubqLogo from "assets/ubq.png";

const Farm: React.FC = () => {
  const { status } = useWallet();

  const { isRedeeming, onRedeemESCHUBQ } = useFarming();

  const RedeemButton = useMemo(() => {
    if (status !== "connected") {
      return <Button disabled text="Harvest &amp; Unstake INK/UBQ" variant="secondary" />;
    }
    if (!isRedeeming) {
      return <Button onClick={onRedeemESCHUBQ} text="Harvest &amp; Unstake INK/UBQ" variant="secondary" />;
    }
    return <Button disabled text="Redeeming..." variant="secondary" />;
  }, [isRedeeming, onRedeemESCHUBQ, status]);

  return (
    <Page>
      <Box row justifyContent="center">
        <Button full text="Get Started Here" to="/help" />
      </Box>
      <Spacer />
      <PageHeader icon="" subtitle="Stake INK/UBQ Shinobi LP tokens and farm INK" title="Farm" />
      <Container>
        <Spacer />
        <Split>
          <StakeCard>
            <img src={inkLogo} alt="Tentacle Finance Logo" style={{ width: "80px", height: "80px", background: "white", borderRadius: "40px" }} />
            <span style={{ fontSize: "50px", lineHeight: "80px", width: "50px", display: "block", textAlign: "center" }}>+</span>
            <img src={ubqLogo} alt="Ubiq Logo" style={{ width: "80px", height: "80px" }} />
          </StakeCard>
          <HarvestCard />
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
          <Button full text="Get INK/UBQ LP tokens" href="https://shinobi-info.ubiq.ninja/pair/" variant="tertiary" />
        </Split>
      </Container>
    </Page>
  );
};

export default Farm;
