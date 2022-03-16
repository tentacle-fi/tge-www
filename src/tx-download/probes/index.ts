import { ITxDetail } from "../interfaces";

// import Farming from "./Farming";
import TokenGallery from "./TokenGallery";
import Transfers from "./Transfers";

const explore = (walletAddress: string, txDetails: Array<ITxDetail>) => {
  // run each probe on all txs, return all results

  return {
    raw: txDetails,
    results: [...TokenGallery(walletAddress, txDetails), ...Transfers(walletAddress, txDetails)],
  };
};

const Default = {
  explore,
};

export default Default;
