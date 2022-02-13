import Web3 from "web3";
import { provider } from "web3-core";
import { getBalanceAsBigNum } from "./index";
import { AbiItem } from "web3-utils";
import { IFarm, INK } from "farms/AvailableFarms";
import { GAS } from "ubiq-sdk/utils";
import VotingABI from "constants/abi/Voting.json";

// get all voting power for the wallet address, at the specified block height
export const getVotingPower = async (
  provider: provider,
  walletAddress: string,
  availableFarms: Array<IFarm>,
  voteContractAddress: string
): Promise<number> => {
  try {
    const votingBlockHeight = (await getVoteStartEndBlocks(provider, voteContractAddress)).startBlock;
    if (votingBlockHeight <= 0 || !votingBlockHeight) {
      throw new Error("votingBlockHeight not valid");
    }

    let totalVotePower = await getBalanceAsBigNum(provider, INK, walletAddress, votingBlockHeight);

    const officialFarms = availableFarms.filter((farm) => farm.official === true);
    for (const farm of officialFarms) {
      const lpBal = await getBalanceAsBigNum(provider, farm.lp.address, walletAddress, votingBlockHeight);
      const stakeBal = await getBalanceAsBigNum(provider, farm.yieldfarm.address, walletAddress, votingBlockHeight);
      totalVotePower = totalVotePower.plus(lpBal).plus(stakeBal);
    }

    return totalVotePower.toNumber();
  } catch (e) {
    return -1;
  }
};

export interface IVoteStartEnd {
  startBlock: number;
  endBlock: number;
}

export const getVoteStartEndBlocks = async (provider: provider, voteContractAddress: string): Promise<IVoteStartEnd> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    const startBlock = await contract.methods.startBlock().call();
    const endBlock = await contract.methods.endBlock().call();
    return {
      startBlock,
      endBlock,
    };
  } catch (e) {
    return {
      startBlock: 0,
      endBlock: 0,
    };
  }
};

export const getTotalVoters = async (provider: provider, voteContractAddress: string): Promise<number> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    const total = await contract.methods.votersCount().call();
    return total;
  } catch (e) {
    console.error("getTotalVoters", e);
    return -1;
  }
};

export interface IVote {
  //[key: string]: number;
  option: number;
  address: string;
}

export const getWalletVote = async (walletAddress: string, provider: provider, voteContractAddress: string): Promise<number> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    const vote = await contract.methods.votes(walletAddress).call();
    console.log("getWalletVote vote", vote);
    return vote;
  } catch (e) {
    console.error("getWalletVote", e);
    return 0;
  }
};

export const getVotes = async (provider: provider, voteContractAddress: string): Promise<Array<IVote>> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    // TODO: limit the total number of voters to retrieve (eg, paginate the calls)
    const totalVoters = await getTotalVoters(provider, voteContractAddress);

    if (totalVoters < 1) {
      throw new Error("RPC::getTotalVoters() no voters yet");
    }
    const votesObj = await contract.methods.getVoters(0, totalVoters).call();

    if (votesObj?._voters === undefined || votesObj?._candidates === undefined) {
      throw new Error("RPC::getVoters() no results returned");
    }

    let votes = votesObj._voters.map((voter: string, i: number) => {
      return {
        option: parseInt(votesObj._candidates[i]),
        address: voter,
      };
    });
    return votes;
  } catch (e) {
    console.error("getVotes", e);
    return [];
  }
};

export const submitVote = async (provider: provider, walletAddress: string, voteOption: number, voteContractAddress: string): Promise<boolean> => {
  try {
    const contract = getVoteContract(provider, voteContractAddress);

    await contract.methods
      .vote(voteOption.toString())
      .send(
        { from: walletAddress, gas: GAS.LIMIT, gasPrice: GAS.PRICE, maxFeePerGas: GAS.MAXFEEPERGAS, maxPriorityFeePerGas: GAS.MAXPRIORITYFEEPERGAS },
        async (error: any, txHash: string) => {
          console.log("submitVote callback", error, txHash);
        }
      );

    return true;
  } catch (e) {
    return false;
  }
};

export const getVoteDetails = async (provider: provider, voteContractAddress: string): Promise<IVoteDetails | undefined> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    const details = await contract.methods.getVoteDetails().call();
    console.log("getVoteDetails", details);
    return details;
  } catch (e) {
    console.error("getVoteDetails", e);
    return;
  }
}



const getVoteContract = (provider: provider, voteContractAddress: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(VotingABI as unknown as AbiItem, voteContractAddress);
  return contract;
};
