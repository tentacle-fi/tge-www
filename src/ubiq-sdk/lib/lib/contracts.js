import ShinobiPoolJson from "../clean_build/contracts/ShinobiPool.json";
import { AvailableFarms } from "farms/AvailableFarms";

export class Contracts {
  constructor(provider, networkId, web3, options) {
    this.web3 = web3;
    this.pools = {};

    for (let i = 0; i < AvailableFarms.length; i++) {
      this.pools[i] = new this.web3.eth.Contract(ShinobiPoolJson.abi);
      this.pools[i].options.address = AvailableFarms[i].yieldfarm.address;
    }
  }
}
