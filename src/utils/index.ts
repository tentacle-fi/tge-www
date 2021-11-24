import BigNumber from "bignumber.js";
import { getDefaultProvider } from "@ethersproject/providers";
import { ethers } from 'ethers';
import Web3 from "web3";
import { provider, TransactionReceipt } from "web3-core";
import { AbiItem } from "web3-utils";
import { WETH, ChainId, Fetcher, Route, Token } from "shinobi-sdk";
import { IOraclePrice } from "hooks/useUBQPriceOracle"

import ERC20ABI from "constants/abi/ERC20.json";
const RPCURL = "https://rpc.octano.dev";
const INKADDRESS = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db";
const INKDECIMALS = 18;
const INKNAME = "INK";
const INKSYMBOL = "INK";

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

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
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

export const getCurrentAPY = async (UBQoracle: IOraclePrice | undefined, balances: any): Promise<string> => {


    console.log('balances debug:', balances)

    // const placeholderUbiqPrice = 0.21;
    try{

        if(UBQoracle === undefined){
          return "--"
        }

        const INK = new Token( ChainId.UBIQ, INKADDRESS, INKDECIMALS, INKNAME, INKSYMBOL)

        // setup ethers.js for Fetcher
        const ethersProvider = getDefaultProvider(RPCURL);

        const pair = await Fetcher.fetchPairData(INK, WETH[INK.chainId], ethersProvider);
        const route = new Route([pair], WETH[INK.chainId]);

        const midPrice = parseFloat(route.midPrice.toSignificant(6));
        const inkPrice = UBQoracle.price.usdt / midPrice;
        console.log('midprice:', midPrice, 'inkPrice:', inkPrice)

        return midPrice.toString();
    }catch(e){
        return "0";
    }
}
