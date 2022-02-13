import React from "react";

import Page from "components/Page";
import PageHeader from "components/PageHeader";

import VotingBooth, { IVoteDetails } from "components/VotingBooth";

const allVotes = ["0x9ADBf4bE59b32254B2cfB05802396DDC305D7130"];
//
// const allVotes = [
//   {
//     contractAddress: "0x9ADBf4bE59b32254B2cfB05802396DDC305D7130",
//   },
// {
//   name: "a second cool vote!",
//   shortDesc: "a little text to describe this vote.",
//   fullDesc:
//     "a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote. a lot of text to describe this vote.",
//   options: ["answer 0", "answer 1", "answer 2", "answer 3"],
//   contractAddress: "0x293e27B404B0FeD5EE857CF5551cf105f8DD9d7d",
// },
// ] as Array<IVoteDetails>;

const Vote: React.FC = () => {
  const Votes = allVotes.map((v, i) => {
    return <VotingBooth key={i} vote={v} />;
  });

  return (
    <Page>
      <PageHeader icon="" title="Tentacle.Finance Vote" />

      {Votes}
    </Page>
  );
};

export default React.memo(Vote);
