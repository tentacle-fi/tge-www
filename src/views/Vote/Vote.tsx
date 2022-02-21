import React, { useEffect, useState, useCallback } from "react";

import Page from "components/Page";
import PageHeader from "components/PageHeader";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import VotingBooth from "components/VotingBooth";
import { getDeployedVotingContracts } from "utils/voting";

const Vote: React.FC = () => {
  const [allVotes, setAllVotes] = useState<Array<string>>();

  const fetchAllVotes = useCallback(async () => {
    setAllVotes(await getDeployedVotingContracts());
  }, []);

  useEffect(() => {
    fetchAllVotes();
  }, [fetchAllVotes]);

  const Votes = allVotes?.map((v, i) => {
    return <VotingBooth key={i} voteAddress={v} />;
  });

  return (
    <Page>
      <PageHeader icon={<HowToVoteIcon sx={{ fontSize: "96px" }} />} title="Tentacle.Finance Vote" subtitle="On-chain voting via smart contracts!" />

      {Votes}
    </Page>
  );
};

export default React.memo(Vote);
