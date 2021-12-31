import React, { useCallback } from "react";
import { Container } from "react-neu";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import AddressButton from "components/AddressButton";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import Typography from "@mui/material/Typography";

import Box from "@mui/material/Box";
import BuyUBQButtons from "components/BuyUBQButtons";

import { UBQ, AvailableFarms, Tokens } from "farms/AvailableFarms";

const Addresses: React.FC = () => {
  //unfortunately UBQ is a special case for our AddressButton component due to the Shinobi URL link
  const TokensAddressButtons = Tokens.filter((token) => token.address !== UBQ).map((token, index) => {
    return (
      <AddressButton
        name={token.symbol}
        address={token.address}
        shinobi={true}
        shinobitext="Buy at Shinobi"
        shinobilink="https://shinobi.ubiq.ninja/#/swap?outputCurrency="
        key={index.toString()}
      />
    );
  });

  const generateFarmAddressButton = useCallback((official: boolean) => {
    return AvailableFarms.filter((farm) => farm.official === official).map((farm, index) => {
      return <AddressButton name={`${farm.name} Yield Farm`} address={farm.yieldfarm.address} shinobi={false} key={index.toString()} />;
    });
  }, []);

  const InkOfficialFarmAddresses = generateFarmAddressButton(true);
  const CommunityFarmAddresses = generateFarmAddressButton(false);

  return (
    <Page>
      <PageHeader icon={<AlternateEmailIcon sx={{ fontSize: "96px" }} />} title={"Addresses"} subtitle={"Official Addresses"} />
      <Container size="md">
        <Typography variant="h4">Token Addresses</Typography>

        <AddressButton name="UBQ" address={UBQ} shinobi={false} />
        <Box sx={{ margin: "10px 0 30px 0", textAlign: "center" }}>
          <BuyUBQButtons />
        </Box>

        {TokensAddressButtons}

        <Typography variant="h4" sx={{ marginTop: "20px" }}>
          Official INK Yield Farm Addresses
        </Typography>
        {InkOfficialFarmAddresses}

        <Typography variant="h4" sx={{ marginTop: "35px" }}>
          Community Farm Addresses
        </Typography>
        {CommunityFarmAddresses}
      </Container>
    </Page>
  );
};

export default React.memo(Addresses);
