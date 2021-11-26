import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  farmingStartTime: [1600545500000],
  setConfirmTxModalIsOpen: () => {},
  currentApy: 0,
  currentTvl: 0,
  inkPrice: 0,
});

export default Context;
