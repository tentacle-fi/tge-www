import { Log } from "@ethersproject/abstract-provider";

// defi farm rewards: paid gas for reward
// swap: paid in tokenA to get out tokenB, plus gas paid (tokenC?)
// mint nft: gas paid for mint
// sell nft: incoming token value needs to be captured

export interface IDatagridResults extends ITransferCSVRow {
  id: number;
  flex?: number;
}

export interface ITransferCSVRow {
  txHash: string;
  timestamp: number;
  date: string;
  block: number;
  fee: string;
  feeSymbol: string;
  from: string; // address who sent the value
  to: string; // address who received the value
  value: string; // total number of token/coin transferred
  valueUSD: string; // historical price of token transferred
  tokenSymbol: string; // transferred value token/coin symbol
  tokenAddress: string; // transferred value token/coin address
  reason: string; // essentially a notes section, with methoid?
}

export interface ICSVRow {
  date: string; // date and time as YYYY-mm-dd HH:mm:ss Z
  action: string; // buy, sell or swap
  symbol: string; // symbol purchased or sold
  volume: string; // quantity of symbol/token purchased/(swapped/traded)
  currency: string; // string symbol of the currency/token used to purchase the `symbol` property above
  account: string; // name of account (category or contract name?)
  total: string; // total currency spent to buy/sell/swap `volume` property above
  price: string; // price per coin purchased (in currency)
  fee: string; // fee for trade (in currency)
  feeCurrency?: string; // if fee is in a different currency, set this to the symbol for the fee
  txHash: string; // transaction hash
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
