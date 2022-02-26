import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Log } from "@ethersproject/abstract-provider";
// import {TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider"// for debug
import lookupMethod from "./lookupMethod";
import { ITransactionHashStub, IProcessedData, ITxDetail, ITransferCSVRow } from "./interfaces";
import Probes from "./probes";
import { formatTopic } from "./probes/tools";

// ================================================================================
//
//  TESTING ONLY!!!!!
//
import DOXXED_JSON from "./DOXXED.json";
import NFT_DOXXED from "./NFT_DOXXED.json";
// ================================================================================

export const scanStart = async (address: string, progressCb: Function) => {
  const rpcProvider = new ethers.providers.JsonRpcProvider("https://rpc.octano.dev/");

  address = address.toLowerCase();


  // Prod:
  // TODO: iterate over 12 block steps from the start of year selected block, to end of year block
  const results = await getLogs(rpcProvider, address, numToHex(1729478), numToHex(1761149)) //numToHex(1776000))

  if (results !== undefined) {
    const filtered = filterLogs(results);
    const allTxs = await getAllTxDetails(rpcProvider, filtered, progressCb);

    return Probes.explore(address, allTxs);
  }


  // console.error("missing NONCEs!", verifyNonceSequential(address, NFT_DOXXED as Array<ITxDetail>).length);
  return Probes.explore(address, NFT_DOXXED as Array<ITxDetail>);
};

const verifyNonceSequential = (walletAddress: string, list: Array<ITxDetail>): Array<number> => {
  let sorted = list
    .filter((tx) => {
      // filter out only txs originated from our walletAddress
      // so the nonce counting can be accurate
      return tx.tx.from.toLowerCase() === walletAddress;
    })
    .map((tx) => tx.tx.nonce);

  console.log("sorted", sorted.length);

  sorted.sort((a: number, b: number) => {
    if (a < b) {
      return -1;
    }
    return 1;
  });

  if (sorted.length < 2) {
    console.error("verifyNonceSequential() - not enough transactions to verify requires > 1");
    return sorted;
  }

  let start = sorted[0];
  let missing = [];
  for (let i = 1; i < sorted.length; i++) {
    if (start + 1 !== sorted[i]) {
      console.log(start + 1, sorted[i]);

      missing.push(start + 1);
    }
    start++;
  }

  return missing;
};

export const resultsToCSV = (columns: Array<string>, results: Array<ITransferCSVRow>): string => {
  let str = "";
  for (let i = 0; i < results.length; i++) {
    let row = "";
    for (const prop of columns) {
      if (row !== "") {
        row += ",";
      }
      row += results[i][prop as keyof ITransferCSVRow];
    }
    str += row + "\n";
  }

  return str;
};

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
const getLogs = async (rpcProvider: any, originatingAddress: string, fromBlockHex: string = "0x0", toBlockHex: string = "latest") => {
  // fromBlockHex = fromBlockHex === undefined ? "0x0" : fromBlockHex;
  const filterBase = {
    fromBlock: fromBlockHex,
    toBlock: toBlockHex,
    address: null, // null === any address
  };
  const filter = {
    ...filterBase,
    topics: [null, formatTopic(originatingAddress)],
  };
  const filter2 = {
    ...filterBase,
    topics: [null, null, formatTopic(originatingAddress)],
  };

  const filter3 = {
    ...filterBase,
    topics: [null, null, null, formatTopic(originatingAddress)],
  };

  try {
    return [...(await rpcProvider.getLogs(filter)), ...(await rpcProvider.getLogs(filter2)), ...(await rpcProvider.getLogs(filter3))];
  } catch (e) {
    console.error("getlogs error", e);
  }
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

  return {
    processed: false,
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
