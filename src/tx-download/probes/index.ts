import { ITxDetail } from "../interfaces";

// import Gas from "./Gas";
import Shinobi from "./Shinobi";
import Farming from "./Farming";
import TokenGallery from "./TokenGallery";
import Unknown from "./Unknown";

const explore = (walletAddress: string, txDetails: Array<ITxDetail>) => {
  // run each probe on all txs, return all results

  //return Gas(txDetails);
  return {
    raw: txDetails,
    // swap: Shinobi(txDetails),
    // farm: Farming(txDetails),
    tg: TokenGallery(walletAddress, txDetails),
    swap: Unknown(walletAddress, txDetails),
  };
};

const Default = {
  explore,
};

export default Default;
