import { useContext } from "react";
import { Context } from "../contexts/UbiqProvider";

const useUbiq = () => {
  return { ...useContext(Context) };
};

export default useUbiq;
