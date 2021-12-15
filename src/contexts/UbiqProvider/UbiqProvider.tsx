import React, { createContext, useEffect, useState, useCallback } from "react";

import { useWallet } from "use-wallet";

import { Ubiq } from "ubiq-sdk/lib";

export interface UbiqContext {
  ubiq?: any;
  BlockNum: number;
}

export const Context = createContext<UbiqContext>({
  ubiq: undefined,
  BlockNum: 0,
});

declare global {
  interface Window {
    ubiqsauce: any;
  }
}

const UbiqProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet();
  const [ubiq, setUbiq] = useState<any>();
  const [BlockNum, setBlockNum] = useState(0);

  const fetchCurrentBlock = useCallback(async (ubiqLib: any) => {
    if (!ubiqLib) {
      return;
    }

    let currentBlock: number = await ubiqLib.web3.eth.getBlockNumber();

    setBlockNum(currentBlock);
  }, []);

  useEffect(() => {
    if (ethereum) {
      const ubiqLib = new Ubiq(ethereum, "1", false, {
        ethereumNodeTimeout: 10000,
      });

      setUbiq(ubiqLib);
      fetchCurrentBlock(ubiqLib);

      let eventEmitter = ubiqLib.web3.eth.subscribe("newBlockHeaders", (error, event) => {
        if (!error) {
          // console.log("newBlockHeaders", event.number);
          setBlockNum(event.number);
          return;
        }
        console.log(error);
      });

      return () => {
        eventEmitter.unsubscribe();
      };
    }
  }, [ethereum, fetchCurrentBlock]);

  return <Context.Provider value={{ ubiq, BlockNum }}>{children}</Context.Provider>;
};

export default UbiqProvider;
