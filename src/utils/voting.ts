import BigNumber from "bignumber.js";
import Web3 from "web3";
import { provider } from "web3-core";
import { getBalanceAsBigNum, getReserves, getERC20Contract } from "./index";
import { AbiItem } from "web3-utils";
import { IFarm, INK } from "farms/AvailableFarms";
import { GAS } from "ubiq-sdk/utils";
import { ethers } from "ethers";
import VotingABI from "constants/abi/Voting.json";

export interface IVoteDetails {
  title: string;
  options: Array<string>;
  desc: string;
  startBlock: number;
  endBlock: number;
  contractAddress: string;
}

const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

gas.gas = 80000; // set custom low gas fee for this operation (approve)

export const getDeployedVotingContracts = async () => {
  const votingBlock = 2000000; // arbitrary vote start block to avoid excessive rpc use

  const jsonProvider = new ethers.providers.JsonRpcProvider("https://rpc.octano.dev/");

  const filter = {
    fromBlock: "0x" + votingBlock.toString(16),
    toBlock: "latest",
    topics: [
      "0x72f75ba1650fa7ceb2c124d613d20013e0d38a4dc90e9f6557dcaf313b6eae4f", // onNewBallot() event
    ],
  };
  let logs;
  try {
    logs = await jsonProvider.getLogs(filter);
  } catch (e) {
    console.error("getDeployedVotingContracts error", e);
  }

  if (logs === undefined) {
    return [];
  }

  return logs.map((log) => log.address).reverse();
};

// get all voting power for the wallet address, at the specified block height
export const getVotingPower = async (
  provider: provider,
  walletAddress: string,
  availableFarms: Array<IFarm>,
  voteDetails: IVoteDetails
): Promise<number> => {
  try {
    let totalVotePower = await getBalanceAsBigNum(provider, INK, walletAddress, voteDetails.startBlock);

    const officialFarms = availableFarms.filter((farm) => farm.tokenA.address === INK || farm.tokenB.address === INK);

    for (const farm of officialFarms) {
      totalVotePower = totalVotePower.plus(await getInkFromLP(provider, farm, walletAddress, voteDetails.startBlock));
    }

    return totalVotePower.toNumber();
  } catch (e) {
    return 0;
  }
};

// get the INK from lp at a given block height, return the total as a number
const getInkFromLP = async (provider: provider, farm: IFarm, walletAddress: string, atBlockHeight: number): Promise<number> => {
  const unstakedLPBal = await getBalanceAsBigNum(provider, farm.lp.address, walletAddress, atBlockHeight);
  const stakeLPBal = await getBalanceAsBigNum(provider, farm.yieldfarm.address, walletAddress, atBlockHeight);

  if (unstakedLPBal.isEqualTo(0) && stakeLPBal.isEqualTo(0)) {
    return 0;
  }

  const reserves = await getReserves(provider, farm.lp.address, atBlockHeight);
  const lpTotalSupply = await getTotalSupply(provider, farm.lp.address, atBlockHeight);

  let reserveValue = 0;
  if (farm.tokenA.address === INK) {
    reserveValue = reserves.token0;
  } else if (farm.tokenB.address === INK) {
    reserveValue = reserves.token1;
  } else {
    return 0;
  }

  let totalInk = 0;

  if (!unstakedLPBal.isEqualTo(0)) {
    totalInk += unstakedLPBal.div(lpTotalSupply).times(reserveValue).toNumber();
  }

  if (!stakeLPBal.isEqualTo(0)) {
    totalInk += stakeLPBal.div(lpTotalSupply).times(reserveValue).toNumber();
  }

  return totalInk;
};

const getTotalSupply = async (provider: provider, contractAddress: string, atBlockHeight: number): Promise<BigNumber> => {
  const contract = getERC20Contract(provider, contractAddress);

  try {
    let totalSupply = new BigNumber(await contract.methods.totalSupply().call(null, atBlockHeight)).dividedBy(new BigNumber(10).pow(18));
    return totalSupply;
  } catch (e) {
    console.error("getInkTotalSupply", e);
    return new BigNumber(0);
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
  option: number;
  address: string;
}

export const getWalletVote = async (walletAddress: string, provider: provider, voteContractAddress: string): Promise<number> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    const vote = await contract.methods.votes(walletAddress).call();
    // console.log("getWalletVote vote", vote);
    return vote;
  } catch (e) {
    console.error("getWalletVote", e);
    return 0;
  }
};

interface IGetVotersResult {
  sender: string;
  candidate: string;
}

export const getVotes = async (provider: provider, voteContractAddress: string): Promise<Array<IVote>> => {
  const contract = getVoteContract(provider, voteContractAddress);
  try {
    // TODO: limit the total number of voters to retrieve (eg, paginate the calls)
    const totalVoters = await getTotalVoters(provider, voteContractAddress);

    if (totalVoters < 1) {
      throw new Error("RPC::getTotalVoters() no voters yet");
    }
    const votes = await contract.methods.getVoters(0, totalVoters).call();

    if (!votes) {
      throw new Error("RPC:getVoters() no results returned");
    }

    return votes.map((v: IGetVotersResult) => {
      return {
        option: parseInt(v.candidate),
        address: v.sender,
      };
    });
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
        { from: walletAddress, ...gas },
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
    // console.log("getVoteDetails", details);
    return details;
  } catch (e) {
    console.error("getVoteDetails", e);
    return;
  }
};

const getVoteContract = (provider: provider, voteContractAddress: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(VotingABI as unknown as AbiItem, voteContractAddress);
  return contract;
};
