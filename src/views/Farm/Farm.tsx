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
import { TGE1 } from "constants/tokenAddresses";

const INK = TGE1.toString();

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
    </Page>
  );
};

const YieldFarm: React.FC<YieldFarmProps> = ({ farmKey }) => {
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
    <Container>
      <Spacer />
      <Split>
        <StakeCard>
          <img src={inkLogo} alt="INK Token Logo" style={{ width: "80px", height: "80px", background: "white", borderRadius: "40px" }} />
          <span style={{ fontSize: "50px", lineHeight: "80px", width: "50px", display: "block", textAlign: "center" }}>+</span>
          <img src={ubqLogo} alt="Ubiq Logo" style={{ width: "80px", height: "80px" }} />
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
        <Button full text="Get INK/UBQ LP tokens" href={"https://shinobi.ubiq.ninja/#/add/UBQ/" + INK} variant="tertiary" />
      </Split>
    </Container>
  );
};

export default Farm;
