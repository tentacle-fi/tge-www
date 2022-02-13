export interface IVoteDetails {
  name: string;
  options: Array<string>;
  shortDesc: string;
  fullDesc: string;
  // contractAddress: string;
}

export { default } from "./VotingBooth";
