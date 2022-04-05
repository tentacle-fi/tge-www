import React from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import BackupIcon from "@mui/icons-material/Backup";
import CreateNewVote from "./components/CreateNewVote";

const Governance: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon={<BackupIcon sx={{ fontSize: "96px" }} />}
        title="Tentacle.Finance Voting Deployment Tool"
        subtitle="On-chain voting via smart contracts can be deployed through this utility!"
      />

      <CreateNewVote />
    </Page>
  );
};

export default React.memo(Governance);
