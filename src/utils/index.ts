import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import Web3 from "web3";
import { provider, TransactionReceipt } from "web3-core";
import { AbiItem } from "web3-utils";
import { IOraclePrice } from "hooks/useUBQPriceOracle";

import ERC20ABI from "constants/abi/ERC20.json";
import ShinobiPoolERC20 from "ubiq-sdk/lib/clean_build/contracts/ShinobiPool.json";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitTransaction = async (provider: provider, txHash: string) => {
  const web3 = new Web3(provider);
  let txReceipt: TransactionReceipt | null = null;
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash);
    txReceipt = r;
    await sleep(2000);
  }
  return txReceipt.status;
};

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);
    return tokenContract.methods
      .approve(spenderAddress, ethers.constants.MaxUint256)
      .send({ from: userAddress, gas: 80000 }, async (error: any, txHash: string) => {
        if (error) {
          console.log("ERC20 could not be approved", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Approval transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const getAllowance = async (userAddress: string, spenderAddress: string, tokenAddress: string, provider: provider): Promise<string> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);
    const allowance: string = await tokenContract.methods.allowance(userAddress, spenderAddress).call();
    return allowance;
  } catch (e) {
    return "0";
  }
};

export const getBalance = async (provider: provider, tokenAddress: string, userAddress: string): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  try {
    const balance: string = await tokenContract.methods.balanceOf(userAddress).call();
    return balance;
  } catch (e) {
    return "0";
  }
};

export const getBalanceAsBigNum = async (provider: provider, tokenAddress: string, userAddress: string): Promise<BigNumber> => {
  return new BigNumber(await getBalance(provider, tokenAddress, userAddress)).dividedBy(new BigNumber(10).pow(18));
};

export const getCoinBalance = async (provider: provider, userAddress: string): Promise<string> => {
  try {
    const web3 = new Web3(provider);
    const balance: string = await web3.eth.getBalance(userAddress);

    return balance;
  } catch (e) {
    return "0";
  }
};

export const getCoinBalanceAsBigNum = async (provider: provider, userAddress: string): Promise<BigNumber> => {
  return new BigNumber(await getCoinBalance(provider, userAddress)).dividedBy(new BigNumber(10).pow(18));
};

export const getERC20Contract = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(ERC20ABI.abi as unknown as AbiItem, address);
  return contract;
};

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber();
};

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals));
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18): string => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};

export const getShortDisplayBalance = (balance: BigNumber, fixedDec = 4, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed(fixedDec);
};

export const getNearestBlock = (from: Array<any>, target: number) => {
  return from.reduce(function (prev: any, curr: any) {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });
};

export const getAMPM = (date: any) => {
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  return ampm;
};

export const getTimestampDate = (obj: { ts: number; ap?: boolean }) => {
  const d = new Date(obj.ts * 1000);
  const s = ".";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear().toString().substring(0, 2) + (obj.ap ? " " + getAMPM(d) : "");
  return (day < 9 ? "0" + day : day) + s + (month <= 9 ? "0" + month : month) + s + year;
};

export const getCurrentBlock = async (provider: provider): Promise<string> => {
  try {
    const web3 = new Web3(provider);
    const blockNumber: string = (await web3.eth.getBlockNumber()).toString();
    return blockNumber;
  } catch (e) {
    return "0";
  }
};

interface IReserves {
  token0: number;
  token1: number;
  ratio0over1: number;
  timestamp: number;
}

export const getReserves = async (provider: provider, tokenAddress: string): Promise<IReserves> => {
  try {
    const web3 = new Web3(provider);
    const tokenContract = new web3.eth.Contract(ShinobiPoolERC20.abi as unknown as AbiItem, tokenAddress);
    const { _reserve0, _reserve1, _blockTimestampLast } = await tokenContract.methods.getReserves().call();

    const ret = {
      token0: bnToDec(new BigNumber(_reserve0)),
      token1: bnToDec(new BigNumber(_reserve1)),
      timestamp: parseInt(_blockTimestampLast),
      ratio0over1: new BigNumber(_reserve0).dividedBy(new BigNumber(_reserve1)).toNumber(),
    };
    return ret;
  } catch (e) {
    console.error("getReserves error", e);
    throw new Error("unable to getReserves");
  }
};

export const getDailyRewardRate = async (provider: provider, tokenAddress: string): Promise<number> => {
  try {
    const web3 = new Web3(provider);
    const tokenContract = new web3.eth.Contract(ShinobiPoolERC20.abi as unknown as AbiItem, tokenAddress);
    const rewards = bnToDec(new BigNumber(await tokenContract.methods.rewardRate().call()));
    const rate: number = rewards * 60 * 60 * 24;
    return rate;
  } catch (e) {
    console.error("getDailyRewardRate error", e);
    return -1;
  }
};

export interface ICurrentStats {
  poolTvl: number;
  farmApy: number;
  farmTvl: number;
  inkPrice: number;
  reserves: IReserves;
}

export const getCurrentStats = async (provider: provider, UBQoracle: IOraclePrice | undefined, totalSupplyLP: BigNumber): Promise<ICurrentStats> => {
  try {
    if (UBQoracle === undefined) {
      throw new Error("unable to process until UBQoracle price is defined");
    }

    // TODO: make the hard coded values generic via the AvailableFarms and farmKey
    const reserves = await getReserves(provider, "0x1eA388d8dcF980a95967228B1dFCEA1692dbE25d");
    const ubqPrice = UBQoracle?.price?.usdt || 0;

    // TODO: pull out the price into separate function call
    const inkPrice = ubqPrice * reserves.ratio0over1; // ink price in USDt
    const dailyINKEmissions = await getDailyRewardRate(provider, "0x6e142959f49d364b30f0478949effdcb58effe44"); // Qty of INK released per day based on epoch and rewardRate contract call
    const poolTvl = reserves.token1 * inkPrice + reserves.token0 * ubqPrice;
    // const poolApy = ((inkPrice * dailyINKEmissions * 365) / poolTvl) * 100;

    const poolLpCalcRatio = 1 + (1 - bnToDec(totalSupplyLP) / Math.sqrt(reserves.token0 * reserves.token1));
    const farm_token0 = (bnToDec(totalSupplyLP) * poolLpCalcRatio) / Math.sqrt(1 / reserves.ratio0over1);
    const farm_token1 = (bnToDec(totalSupplyLP) * poolLpCalcRatio) / Math.sqrt(reserves.ratio0over1);
    const farmTvl = farm_token0 * ubqPrice + farm_token1 * inkPrice;
    const farmApy = ((inkPrice * dailyINKEmissions * 365) / farmTvl) * 100;

    // DEBUG: all the log statements for debug that make sense to have
    // console.log("ubq price", ubqPrice);
    // console.log("ink price", inkPrice);
    // console.log("token0", reserves.token0);
    // console.log("token1", reserves.token1);
    // console.log('token0 / token1', reserves.ratio0over1)
    // console.log("totalSupplylp", bnToDec(totalSupplyLP));
    // console.log("est lp supply", Math.sqrt(reserves.token0 * reserves.token1));
    // console.log("lp ratio", poolLpCalcRatio);
    // console.log("pool tvl", poolTvl);
    // console.log("");
    // console.log("farm token0", farm_token0);
    // console.log("farm token1", farm_token1);
    // console.log("farm tvl", farmTvl);
    // console.log("farm apy", farmApy);

    return {
      poolTvl: poolTvl,
      farmApy: farmApy,
      farmTvl: farmTvl,
      inkPrice: inkPrice,
      reserves: reserves,
    } as ICurrentStats;
  } catch (e) {
    console.error("getCurrentStats error", e);
    throw e;
  }
};
export const shouldUpdateAry = function shouldUpdateAry(
  old_val: Array<BigNumber> | undefined,
  new_val: Array<BigNumber> | undefined,
  elemType: string
): boolean {
  if (old_val === undefined || new_val === undefined) {
    return true;
  }
  if (old_val instanceof Array) {
    for (let i = 0; i < old_val.length; i++) {
      if (old_val !== undefined) {
        switch (elemType) {
          case "BigNumber":
            if (old_val[i] instanceof BigNumber && new_val[i] instanceof BigNumber) {
              if (!new BigNumber(old_val[i]).isEqualTo(new_val[i])) {
                return true;
              }
            }
            break;
        }
      }
    }
  }
  return false;
};

export const shouldUpdateVal = function shouldUpdateVal(old_val: BigNumber | undefined, new_val: BigNumber | undefined, elemType: string): boolean {
  if (old_val === undefined || new_val === undefined) {
    return true;
  }

  if (old_val instanceof BigNumber && new_val instanceof BigNumber) {
    if (!new BigNumber(old_val).isEqualTo(new BigNumber(new_val))) {
      return true;
    }
  }
  return false;
};
