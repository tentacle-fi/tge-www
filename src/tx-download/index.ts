import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Log } from "@ethersproject/abstract-provider";
// import {TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider"// for debug
import { ITransactionHashStub, ITxDetail, ITransferCSVRow, IRawCSVRow } from "./interfaces";
import Probes from "./probes";
import { formatTopic } from "./probes/tools";

import { lookupBlocksForYear } from "./blockchain";

// DEV ONLY
// import DOXXED from "./DOXXED.json";

export const scanStart = async (address: string, year: number, progress1Cb: Function, progress2Cb: Function, priceLookupFn: Function) => {
  const rpcProvider = new ethers.providers.JsonRpcProvider("https://rpc.octano.dev/");

  address = address.toLowerCase();

  // Prod:
  const blocks = lookupBlocksForYear(year, "Ubiq");
  if (blocks !== undefined) {
    let results = [] as Array<Log>;
    const paginateGetLogs = 12;
    const totalBlocks = blocks.end - blocks.start;

    progress1Cb(0, paginateGetLogs);
    for (let i = 0; i < paginateGetLogs; i++) {
      let plusOne = i > 0 ? 1 : 0;
      let currentFromBlock = Math.floor(blocks.start + (i * totalBlocks) / paginateGetLogs) + plusOne;
      let currentEndBlock = Math.floor(blocks.start + ((i + 1) * totalBlocks) / paginateGetLogs);

      let logs = await getLogs(rpcProvider, address, numToHex(currentFromBlock), numToHex(currentEndBlock));

      progress1Cb(i, paginateGetLogs);

      if (logs !== undefined) {
        results = [...results, ...logs];
      }
    }

    if (results !== undefined) {
      const filtered = filterLogs(results);
      const allTxs = await getAllTxDetails(rpcProvider, filtered, progress2Cb);
      let probeData = Probes.explore(address, allTxs);
      probeData.results = await updatePrices(probeData.results, priceLookupFn);

      // DEBUG: missing none count
      // console.error("missing NONCEs!", verifyNonceSequential(address, allTxs).length);

      return probeData;
    }
  }

  // DEV ONLY
  // const allTxs = DOXXED as Array<ITxDetail>;
  // let probeData = Probes.explore(address, allTxs);
  // probeData.results = await updatePrices(probeData.results, priceLookupFn);
  // console.error("missing NONCEs!", verifyNonceSequential(address, allTxs).length);
  // return probeData;
};

const updatePrices = async (data: Array<ITransferCSVRow>, priceLookupFn: Function): Promise<Array<ITransferCSVRow>> => {
  for (let i = 0; i < data.length; i++) {
    // if (data[i].tokenAddress === undefined) {
    //   console.log("looking up for ", data[i]);
    // }

    let unitPrice = new BigNumber(await priceLookupFn(data[i].tokenAddress, data[i].timestamp));
    data[i].valueUSD = new BigNumber(data[i].value).times(unitPrice).toFixed(2);

    data[i].tokenPrice = unitPrice.toFixed(6); // arbitrarily set to 6 decimals
  }

  return data;
};

// const verifyNonceSequential = (walletAddress: string, list: Array<ITxDetail>): Array<number> => {
//   let sorted = list
//     .filter((tx) => {
//       // filter out only txs originated from our walletAddress
//       // so the nonce counting can be accurate
//       return tx.tx.from.toLowerCase() === walletAddress;
//     })
//     .map((tx) => tx.tx.nonce);
//
//   // console.log("sorted", sorted.length);
//
//   sorted.sort((a: number, b: number) => {
//     if (a < b) {
//       return -1;
//     }
//     return 1;
//   });
//
//   if (sorted.length < 2) {
//     console.error("verifyNonceSequential() - not enough transactions to verify requires > 1");
//     return sorted;
//   }
//
//   let start = sorted[0];
//   let missing = [];
//   for (let i = 1; i < sorted.length; i++) {
//     if (start + 1 !== sorted[i]) {
//       missing.push(start + 1);
//       start = sorted[i];
//     } else {
//       start++;
//     }
//   }
//
//   return missing;
// };

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

export const rawToCSV = (columns: Array<string>, results: Array<IRawCSVRow>): string => {
  let str = "";
  for (let i = 0; i < results.length; i++) {
    let row = "";
    for (const prop of columns) {
      if (row !== "") {
        row += ",";
      }
      row += results[i][prop as keyof IRawCSVRow];
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
const getLogs = async (
  rpcProvider: any,
  originatingAddress: string,
  fromBlockHex: string = "0x0",
  toBlockHex: string = "latest"
): Promise<Array<Log> | undefined> => {
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

  if (txHashes.length > 0) {
    progressCb(txHashes.length, txHashes.length);
  } else {
    progressCb(1, 1); // default progress so the UI reflects some logical status
  }

  return results;
};

const getTxDetails = async (rpcProvider: any, txHash: string): Promise<ITxDetail> => {
  const tx = await rpcProvider.getTransaction(txHash);
  const receipt = await tx.wait(0);

  // TODO: make a 'get block' cache, to query in case of multiple txs in the same block
  const block = await rpcProvider.getBlock(tx.blockNumber);

  // DEBUG: for dev debugging - it's quite verbose when on
  // console.log("tx", tx);
  // console.log("receipt", receipt);
  // console.log("block", block);

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
