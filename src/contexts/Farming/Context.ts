import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  farmingStartTime: [1],
  setConfirmModal: () => {},
});

export default Context;
