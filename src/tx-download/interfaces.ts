import { Log } from "@ethersproject/abstract-provider";

// defi farm rewards: paid gas for reward
// swap: paid in tokenA to get out tokenB, plus gas paid (tokenC?)
// mint nft: gas paid for mint
// sell nft: incoming token value needs to be captured

export interface IDatagridResults extends ITransferCSVRow {
  id: number;
  flex?: number;
}

export interface IRawTransaction {
  nonce: number;
  txHash: string;
  timestamp: number;
  date: string;
}

export interface IRawCSVRow extends IRawTransaction {
  processed: boolean;
}

export interface ITransferCSVRow extends IRawTransaction {
  block: number;
  fee: string;
  feeSymbol: string;
  from: string; // address who sent the value
  to: string; // address who received the value
  value: string; // total number of token/coin transferred
  valueUSD: string; // historical price of token transferred * value (aka price * volume)
  tokenPrice: string; // historical price per single token
  tokenSymbol: string; // transferred value token/coin symbol
  tokenAddress: string; // transferred value token/coin address
  reason: string; // essentially a notes section, with methoid?
}

export interface ITransactionHashStub {
  transactionHash: string;
}

export interface IProcessedData {
  methodId: string;
  method: string;
  data: Array<string>;
}

export interface ITxDetail {
  processed: boolean;
  tx: ITxDetail_tx;
  block: {
    timestamp: number;
    number: number;
  };
  gas: {
    paid: string;
    gasUsed: string;
    baseFeePerGas: string;
    effectiveGasPrice: string;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
  };
  deployedContract: {
    deployment: boolean;
    address: string;
  };
  receipt: ITxDetail_receipt;
}

interface ITxDetail_tx {
  from: string;
  to: string;
  nonce: number;
  value: string;
  hash: string;
  data: string;
}

interface ITxDetail_receipt {
  logs: Array<Log>;
}
