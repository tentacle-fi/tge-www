import React from "react";
import { Container } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import { TGE1ESCHUBQYieldFarm, ESCH, TGE1 } from "constants/tokenAddresses";
import AddressButton from "components/AddressButton";

const Addresses: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={"🎖️"} title={"Addresses"} subtitle={"Official Addresses"} />
      <Container size="md">
        <h2>Token Addresses (INK, UBQ)</h2>
        <AddressButton
          name="INK"
          address={TGE1}
          shinobi={true}
          shinobitext="Buy at Shinobi"
          shinobilink="https://shinobi.ubiq.ninja/#/swap?outputCurrency="
        />

        <AddressButton name="UBQ" address={ESCH} shinobi={true} />

        <h3>INK Contract Addresses</h3>
        <AddressButton name="INK/UBQ Yield Farm" address={TGE1ESCHUBQYieldFarm} shinobi={false} />
      </Container>
    </Page>
  );
};

export default Addresses;
