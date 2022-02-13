import React from "react";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

import VotingBooth from "components/VotingBooth";

// TODO: pull the contract addresses from github or on-chain...
const allVotes = ["0x9ADBf4bE59b32254B2cfB05802396DDC305D7130"];

const Vote: React.FC = () => {
  const Votes = allVotes.map((v, i) => {
    return <VotingBooth key={i} voteAddress={v} />;
  });

  return (
    <Page>
      <PageHeader icon="" title="Tentacle.Finance Vote" subtitle="On-chain voting via smart contracts!" />

      {Votes}
    </Page>
  );
};

export default React.memo(Vote);
