import { useContext } from "react";
import { Context } from "../contexts/EvmProvider";

const useEvm = () => {
  return { ...useContext(Context) };
};

export default useEvm;
