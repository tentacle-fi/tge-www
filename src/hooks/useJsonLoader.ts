import { useContext } from "react";
import { JsonLoaderContext } from "contexts/JsonLoader";

export interface IJsonMapData {
  pairs: Array<IAvailableTokenChartPair>;
}

// interface for map.json
export interface IAvailableTokenChartPair {
  name: string;
  tokenA: {
    name: string;
  };
  tokenB: {
    name: string;
  };
  address: string;
  enabled: boolean;
  keywords: string;
  uri: string;
  displayDecimals: number;
}

export interface iOCHLT {
  open: number;
  close: number;
  high: number;
  low: number;
  time: number;
}

export interface IJsonData {
  version: string;
  lastUpdated: number;
  lastBlock: number;
  previous: string;
  r0: Array<iOCHLT>;
  r1: Array<iOCHLT>;
}

export type ITimeInterval = "1w" | "1d" | "4h" | "1h" | "15m";

const useJsonLoader = () => {
  return {
    ...useContext(JsonLoaderContext),
  };
};

export default useJsonLoader;
