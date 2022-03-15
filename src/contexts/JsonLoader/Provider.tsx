//
// Load data from charts-data repo. this is used for price lookups
//
//
import { useCallback, useRef } from "react";
import JsonLoaderContext from "./Context";
import { IJsonData } from "hooks/useJsonLoader";

type IJsonMap = Map<string, IJsonData>;

// PROD:
const GITHUB_URL = "https://raw.githubusercontent.com/tentacle-fi/chart-data/master/";

// DEBUG ONLY
// const GITHUB_URL = "http://localhost:3000/data/";

const useJsonLoader: React.FC = ({ children }) => {
  const Cache = useRef<IJsonMap>(new Map() as IJsonMap);

  const loadJson = useCallback(async (tokenName: string) => {
    // load the 15m candles for a given token and add to cache
    const selectedTimeIntervalName = "15m";
    const tokenSelection = tokenName;

    const root_token_url = `${GITHUB_URL}${tokenSelection}/${selectedTimeIntervalName}/`;

    let tmpCache = {} as IJsonData;

    if (Cache.current !== undefined) {
      const currentCacheForToken = Cache.current.get(tokenName);

      if (currentCacheForToken !== undefined) {
        tmpCache = currentCacheForToken;
      }
    }

    let error = false;
    let done = false;
    let currentJsonName = "latest";

    while (error === false && done === false) {
      const data = await fetchData(root_token_url + currentJsonName + ".json");

      if (data === undefined) {
        error = true;
        break;
      }

      if (tmpCache?.r0 !== undefined) {
        const combinedData = {
          previous: data.previous,
          // lastUpdated: candleDataRef.current.lastUpdated,
          // lastBlock: candleDataRef.current.lastBlock,
          r0: data.r0.concat(tmpCache.r0),
          r1: data.r1.concat(tmpCache.r1),
        } as IJsonData;

        tmpCache = combinedData;
      } else {
        tmpCache = data;
      }

      currentJsonName = data.previous;

      if (data.previous === "") {
        done = true;
      }
    }

    Cache.current.set(tokenName, tmpCache);
  }, []);

  async function fetchData(url: string) {
    // console.log("getting ", url);
    return await fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          // TODO: try/catch the following code
          if (!Array.isArray(result.r0)) {
            console.error("loadData() json data invalid, `data` not an array");
            return;
          }

          return result;
        },
        (error) => {
          // TODO: set a state var that shows the user some error info about this, give option to retry?
          // console.error("loadData() error loading json", "SyntaxError:", url, error instanceof SyntaxError);
          // setUiMsg("Candle Data failed to load", "error");

          // error = true;
        }
      );
  }

  const lookupPriceForTime = useCallback(
    async (tokenAddress: string, time: number) => {
      // console.log("lookupPriceForTime", tokenAddress, time);

      if (loadJson === undefined || tokenAddress === undefined) {
        return 0;
      }
      // lookinto cache, if not in cache, start downloading

      const tokenUrl = `${tokenAddress.toLowerCase()}_USDT`; //lookupTokenFromMap(tokenAddress);

      // console.log("tokenUrl", tokenUrl);

      if (tokenUrl === "") {
        return 0;
      }

      if (Cache.current !== undefined) {
        const found = Cache.current.get(tokenUrl);
        if (found === undefined) {
          // not in cache, load it
          await loadJson(tokenUrl);
        }
      }

      // lookup price
      if (Cache.current !== undefined) {
        let lookup = Cache.current.get(tokenUrl);
        if (lookup !== undefined && lookup?.r0?.length > 1) {
          // console.log("lookup", lookup.r0[0]);
          for (let i = 1; i < lookup.r0.length; i++) {
            if (lookup.r0[i].time >= time) {
              return lookup.r0[i - 1].open;
            }
          }
        }
      }

      return 0;
    },
    [loadJson]
  );

  return (
    <JsonLoaderContext.Provider
      value={{
        lookupPriceForTime,
      }}
    >
      {children}
    </JsonLoaderContext.Provider>
  );
};

export default useJsonLoader;
