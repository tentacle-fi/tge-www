import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";

// TODO: UIP-16 will require this to be updated to 22 seconds
const AVG_BLOCK_TIME_SEC = 88;
// how many blocks to fetch in the getLogs request. eg, 60 minutes of average blocks
// this will only be wrong when a LOT of low block times are on-chain eg, the last hour of blocks are 1/2 the average block time
const BLOCK_DEPTH_LOGS = Math.ceil((60 * 60) / AVG_BLOCK_TIME_SEC);
const PROVIDER_URL = "https://rpc.octano.dev/";
const ORACLE_ADDY = "0xaefF2F7644f1C615aDb309513c4CB564F44Bb68F";

const ubq_provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

const useUBQPriceOracle = () => {
  const [oracle, setOracle] = useState<IOraclePrice | undefined>();

  const fetchOracle = useCallback(async () => {
    const data = await getUBQPriceOracle();
    if (data.length > 0 && data[0] !== undefined) {
      setOracle(data[0]);
    } else {
      setOracle(undefined);
    }
  }, [setOracle]);

  useEffect(() => {
    fetchOracle();

    let refreshInterval = setInterval(fetchOracle, 30 * 60 * 1000); // 30 mins
    return () => clearInterval(refreshInterval);
  }, [fetchOracle]);

  return { oracle };
};

async function getUBQPriceOracle(): Promise<Array<IOraclePrice | undefined>> {
  try {
    const latestBlock = await getBlock();
    const logs = await getLogs(ORACLE_ADDY, "0x" + (latestBlock.number - BLOCK_DEPTH_LOGS).toString(16));

    if (logs !== undefined) {
      let data = [];
      for (let i = 0; i < logs.length; i++) {
        const tx = logs[i];

        if (tx.removed === false) {
          const ret: IOraclePrice = {
            address: tx.address,
            blockNumber: tx.blockNumber === undefined ? 0 : tx.blockNumber,
            transactionHash: tx.transactionHash === undefined ? "" : tx.transactionHash,
            price: parseUBQPriceDataField(tx.data),
          };
          data.push(ret);
        }
      }

      const sorted = data.sort((a, b) => {
        if (a?.price?.timestamp && b?.price?.timestamp && a.price.timestamp > b.price.timestamp) {
          return -1;
        }
        return 1;
      }) || [new OraclePrice(undefined)];

      return sorted;
    }
  } catch (e) {
    console.error("getUBQPriceOracle: error with logs", e);
  }

  return [new OraclePrice(undefined)];
}

function parseUBQPriceDataField(data: string) {
  const split = splitString64(data.replace("0x", ""));

  if (split !== null) {
    const ary = split.map((x: string) => {
      return parseInt(x, 16);
    });

    return {
      raw: ary[0] + "",
      usdt: ary[0] / 1000000,
      btc: ary[1] / 100000000,
      satoshi: ary[1],
      timestamp: ary[2],
    };
  }

  return {
    raw: "000000",
    usdt: 0,
    btc: 0,
    satoshi: 0,
    timestamp: 0,
  };
}

function splitString64(str: string) {
  return str.match(/.{1,64}/g);
}

async function getLogs(addy: string, fromBlockHex: string) {
  fromBlockHex = fromBlockHex === undefined ? "0x0" : fromBlockHex;
  const filter = {
    fromBlock: fromBlockHex,
    toBlock: "latest",
    address: addy,
  };
  try {
    return await ubq_provider.getLogs(filter);
  } catch (e) {
    console.error("getlogs error", e);
  }
}

export async function getBlock(num?: number) {
  if (num === undefined) {
    return await ubq_provider.getBlock("latest");
  }

  return await ubq_provider.getBlock(num);
}

export interface IOraclePrice {
  address: string;
  blockNumber: number;
  transactionHash: string;
  price: {
    raw: string; // the 'raw' string price that was provided to the contract
    usdt: number; // the USDT price in whole units (with max decimals)
    btc: number; // the bitcoin price as a decimal if < 1BTC
    satoshi: number; // the number of bitcoin satashois, eg, 300 sats
    timestamp: number; // timestamp for this update
  };
}

class OraclePrice implements IOraclePrice {
  constructor(obj: any) {
    this.address = obj.address || "0x0000000000000000000000000000000000000000000000000000000000000000";
    this.blockNumber = obj.blockNumber || 0;
    this.transactionHash = obj.transactionHash || "0x0000000000000000000000000000000000000000000000000000000000000000";

    this.price = obj.price || {
      raw: "000000",
      usdt: 0,
      btc: 0,
      satoshi: 0,
      timestamp: 0,
    };
  }
  address = "0x0000000000000000000000000000000000000000000000000000000000000000";
  blockNumber = 0;
  transactionHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  price = {
    raw: "000000",
    usdt: 0,
    btc: 0,
    satoshi: 0,
    timestamp: 0,
  };
}
export default useUBQPriceOracle;
