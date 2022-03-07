//
// Tools, like utils, allows for DRY code
//
import BigNumber from "bignumber.js";
import { ITxDetail, IProcessedData } from "../interfaces";
import Tokens from "../TOKENS.json";
import lookupMethod from "../lookupMethod";

export const Transfer_Event = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
export const Withdrawl_Event = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65";

// test a transaction against a methodid hex value (eg, 0xfb3bdb41 NOTE the short hex value)
export const testMethodId = (tx: ITxDetail, methodID: string) => {
  if (tx.tx?.data.length < 10 || tx.tx.data?.toLowerCase().substring(0, 10) !== methodID) {
    // methodid not found
    throw new Error("testMethodId() - methodID not found in this tx. " + tx.tx?.data.length + " " + tx.tx.data?.toLowerCase().substring(0, 10));
  }
};

// takes in a number or string, constructs a bignumber and then returns it as a string
// shifted by decimals (default 18), which places the decimal in the string at the proper position
export const bnToDecStr = (n: number | string | BigNumber, decimals: number = 18): string => {
  return new BigNumber(n).shiftedBy(-decimals).toString();
};

// takes in a number or string, constructs a bignumber and then returns it as a hexadecimal string
export const bnTohex = (n: number | string | BigNumber): string => {
  return "0x" + new BigNumber(n).toString(16);
};

// format a unix timestamp to ISO 8601 string format
export const tsFormat = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

// splice a string into an array of strings every N chars
// NOTE: @data string is not expected to have the preceding 0x for a hex value
export const spliceEvery = (data: string, nChars: number): Array<string> => {
  if (nChars <= 0) {
    throw new Error(`ERROR: spliceEvery(data:${data}, nChars:${nChars}) called with nChars <= 0`);
  }

  if (data.length < nChars) {
    return [data];
  }

  const result = data.match(new RegExp(`.{1,${nChars}}`, "g"));

  // console.log("result", data.length);

  if (result === null) {
    return [data];
  }

  return result;
};

// returns a token SYMBOL given a token address
// optional notFound string will be added in parens preceeding the address if not found
export const tokenLookupSymbol = (tokenAddress: string, notFound: string = "unknown"): string => {
  tokenAddress = tokenAddress.toLowerCase();
  let result = Tokens.list.filter((token) => token.id.toLowerCase() === tokenAddress);

  if (result.length === 1) {
    return result[0].symbol;
  }

  return `(${notFound}):${tokenAddress}`;
};

export const formatTopic = (input: string): string => {
  const padChars = "0000000000000000000000000000000000000000000000000000000000000000";
  if (input.length > 0) {
    return "0x" + (padChars + input.replace("0x", "")).slice(-64);
  }

  return "0x" + padChars;
};

// process the methodid and data string from a TransactionResponse
export const processInputData = (data: string | undefined): IProcessedData => {
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
