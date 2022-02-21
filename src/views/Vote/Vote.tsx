import React, { useEffect, useState, useCallback } from "react";
import Page from "components/Page";
import PageHeader from "components/PageHeader";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import VotingBooth from "components/VotingBooth";
import { getDeployedVotingContracts } from "utils/voting";
import Typography from "@mui/material/Typography";

const Instructions = () => {

    return (
        <>
        <Typography variant="h4">How does it work?</Typography>

        <Typography sx={{ width: "80%", mt: "5px" }}>The ballots below are collected from the Ubiq blockchain. Each ballot is a separate smart contract and that contract contains the details of the ballot (description, summary, vote options, etc...). Those details are read from the contract and displayed on the frontend.

        Voting weight is calculated based on the "start_block" value in the ballot contract. It works similar to a snapshot in that everyone's weight is calculated from the same block, and that block is known to everyone. This way, users aren't able to manipulate their voting weight during the course of the vote.</Typography>
        </>
    )
}

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
      <Instructions />
      {Votes}
    </Page>
  );
};

export default React.memo(Vote);
