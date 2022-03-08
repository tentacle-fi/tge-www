import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  farmingStartTimes: [1],
  inkTotalSupply: 0,
});

export default Context;
