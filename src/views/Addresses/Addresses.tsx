import React from "react";
import { Container } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import AddressButton from "components/AddressButton";

import { INK, UBQ, INK_UBQ_FarmContract } from "farms/AvailableFarms";

const Addresses: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={"🎖️"} title={"Addresses"} subtitle={"Official Addresses"} />
      <Container size="md">
        <h2>Token Addresses (INK, UBQ)</h2>
        <AddressButton
          name="INK"
          address={INK}
          shinobi={true}
          shinobitext="Buy at Shinobi"
          shinobilink="https://shinobi.ubiq.ninja/#/swap?outputCurrency="
        />

        <AddressButton name="UBQ" address={UBQ} shinobi={true} />

        <h3>INK Contract Addresses</h3>
        <AddressButton name="INK/UBQ Yield Farm" address={INK_UBQ_FarmContract} shinobi={false} />
      </Container>
    </Page>
  );
};

export default Addresses;
