import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  lookupPriceForTime: () => {},
});

export default Context;
