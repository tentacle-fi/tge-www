import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import { List, ListItem, Typography } from "@mui/material";
import SLink from "../../components/SLink";

const Custom404: React.FC = () => {
  return (
    <Page>
      <PageHeader icon={<FindInPageIcon sx={{ fontSize: "98px" }} />} title="Error 404, page not found" />

      <Typography variant="body1">
        The page you're looking for isn't available. Here is a list of some of the resources Tentacle.Finance has to offer:
      </Typography>

      <List>
        <ListItem>
          <SLink href="/">Home Page</SLink>
        </ListItem>
        <ListItem>
          <SLink href="/farm">Defi Farming</SLink>
        </ListItem>
        <ListItem>
          <SLink href="/daoinfo">DAO Information</SLink>
        </ListItem>
        <ListItem>
          <SLink href="/tx-download">Download Your Transactions</SLink>
        </ListItem>
        <ListItem>
          <SLink href="/governance">DAO Governance</SLink>
        </ListItem>
        <ListItem>
          <SLink external href="https://discord.gg/CbTa6Z2JYM">
            Discord Channel
          </SLink>
        </ListItem>
      </List>
    </Page>
  );
};

export default React.memo(Custom404);
