import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Log, TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";
import lookupMethod from "./lookupMethod";
import { ITransactionHashStub, IProcessedData, ITxDetail } from "./interfaces";

export const scanStart = async (address: string, progressCb: Function) => {
  const rpcProvider = new ethers.providers.JsonRpcProvider("https://rpc.octano.dev/");

  // Prod:
  const results = await getLogs(rpcProvider, address, numToHex(1776000))

  if (results !== undefined) {
    const filtered = filterLogs(results);
    const allTxs = getAllTxDetails(rpcProvider, filtered, progressCb);

    return allTxs;
  }
};

// const verifyNonceSequential = (list: Array<ITxDetail>)=>{
//   let verified = true
//
//   // TODO: sort the list first, by nonce
//
//   for(let i = 0; i < list.length; i++){
//
//   }
//
//   return verified
// }

const numToHex = (n: number): string => {
  return "0x" + n.toString(16);
};

export const filterLogs = (list: Array<Log> | Array<ITransactionHashStub>): Array<string> => {
  let filtered = [];

  for (let i = 0; i < list.length; i++) {
    if (filtered.indexOf(list[i].transactionHash) < 0) {
      filtered.push(list[i].transactionHash);
    }
  }

  return filtered;
};

// TODO: extend to use a custom rpc provider
const getLogs = async (rpcProvider: any, originatingAddress: string, fromBlockHex: string) => {
  fromBlockHex = fromBlockHex === undefined ? "0x0" : fromBlockHex;
  const filterBase = {
    fromBlock: fromBlockHex,
    toBlock: "latest",
  };
  const filter = {
    ...filterBase,
    topics: [null, formatTopic(originatingAddress)],
  };
  const filter2 = {
    ...filterBase,
    topics: [null, null, formatTopic(originatingAddress)],
  };

  try {
    return [...(await rpcProvider.getLogs(filter)), ...(await rpcProvider.getLogs(filter2))];
  } catch (e) {
    console.error("getlogs error", e);
  }
};

const formatTopic = (input: string): string => {
  const padChars = "0000000000000000000000000000000000000000000000000000000000000000";
  if (input.length > 0) {
    return "0x" + (padChars + input.replace("0x", "")).slice(-64);
  }

  return "0x" + padChars;
};

// TODO: time each call and slow the loop if calls are happening too rapidly (target max of 2hz)
export const getAllTxDetails = async (rpcProvider: any, txHashes: Array<string>, progressCb: Function): Promise<Array<ITxDetail>> => {
  progressCb(0, txHashes.length);
  let results = [];
  for (let i = 0; i < txHashes.length; i++) {
    // TODO: check that txhash string length is properly set with 0x + 64 more chars (66 total)
    results.push(await getTxDetails(rpcProvider, txHashes[i]));
    progressCb(i + 1, txHashes.length);
  }

  return results;
};

// process the methodid and data string from a TransactionResponse
const processInputData = (data: string | undefined): IProcessedData => {
  const results = {
    methodId: "",
    method: "",
    data: [] as Array<string>,
  } as IProcessedData;

  if (data === undefined || data.length <= 0) {
    return results;
  }

  data = data.replace("0x", "");

  // methodId as hex is prepended to the data, which is chunked as a 64 char hex string
  const MethodIdHexLen = 8;
  const DataHexLen = 64;
  results.methodId = data.substring(0, MethodIdHexLen);

  const methodName = lookupMethod(results.methodId);

  if (methodName !== null) {
    results.method = methodName.name;
  }

  if (data.length > MethodIdHexLen) {
    results.data = spliceEvery(data.substring(MethodIdHexLen), DataHexLen);
  }

  return results;
};

// splice a string into an array of strings every N chars
// NOTE: @data string is not expected to have the preceding 0x for a hex value
const spliceEvery = (data: string, nChars: number): Array<string> => {
  if (nChars <= 0) {
    throw new Error(`ERROR: spliceEvery(data:${data}, nChars:${nChars}) called with nChars <= 0`);
  }

  if (data.length < nChars) {
    return [data];
  }

  const result = data.match(new RegExp(`.{1,${nChars}}`, "g"));

  console.log("result", data.length);

  if (result === null) {
    return [data];
  }

  return result;
};

const getTxDetails = async (rpcProvider: any, txHash: string): Promise<ITxDetail> => {
  const tx = await rpcProvider.getTransaction(txHash);
  const receipt = await tx.wait(0);

  // TODO: make a 'get block' cache, to query in case of multiple txs in the same block
  const block = await rpcProvider.getBlock(tx.blockNumber);

  console.log("tx", tx);
  console.log("receipt", receipt);
  console.log("block", block);

  // const inputData = processInputData(tx.data);

  return {
    tx: {
      from: tx.from,
      to: tx.to,
      value: bnToString(tx.value._hex),
      hash: tx.hash,
      nonce: tx.nonce,
      // ...inputData,
      data: tx.data,
    },
    block: {
      timestamp: block.timestamp,
      number: tx.blockNumber,
    },
    gas: {
      paid: new BigNumber(ethers.utils.formatUnits(receipt?.effectiveGasPrice?._hex, "ether")).times(new BigNumber(receipt.gasUsed._hex)).toString(),
      baseFeePerGas: bnToString(block?.baseFeePerGas?._hex),
      effectiveGasPrice: bnToString(receipt?.effectiveGasPrice?._hex),
      gasUsed: bnToString(receipt.gasUsed._hex),
      maxPriorityFeePerGas: bnToString(tx?.maxPriorityFeePerGas?._hex),
      maxFeePerGas: bnToString(tx?.maxFeePerGas?._hex),
    },
    deployedContract: {
      deployment: !receipt.contractAddress ? false : true,
      address: !receipt.contractAddress ? "" : receipt.contractAddress,
    },
    receipt: {
      logs: receipt.logs,
    },
    // tx: tx, // entire TransactionResponse ethers object
    //receipt: receipt, // entire TransactionReceipt ethers object
  } as ITxDetail;
};

const bnToString = (input: string | undefined): string => {
  if (input === undefined) {
    return "0";
  }
  return new BigNumber(input).toString();
};
