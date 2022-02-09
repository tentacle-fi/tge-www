import inkLogo from "assets/tokens/ink_black_alpha.png";
import ubqLogo from "assets/tokens/ubq.png";
import gransLogo from "assets/tokens/grans-flat.png";
import eschLogo from "assets/tokens/esch-logo.png";
import tge1Logo from "assets/tokens/tge1.png";
import wethLogo from "assets/tokens/weth.png";

// Token addresses:
export const Logos = {
  ink: inkLogo,
  ubq: ubqLogo,
  grans: gransLogo,
  esch: eschLogo,
  tge1: tge1Logo,
};
export const UBQ = "0x1fa6a37c64804c0d797ba6bc1955e50068fbf362"; // UBQ Token address (wUBQ technically)
export const INK = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db";
export const GRANS = "0x0826180a4c981d5095cb5c48bb2a098a44cf6f73";
export const ESCH = "0xcf3222b7fda7a7563b9e1e6c966bead04ac23c36";
export const TGE1 = "0xcf823eb6f62a30EDB005B91383e2fa364dd753Dc";
export const WETH = "0xa8cf68b59a616c260dd88fd1ea61fbb864f7e485";

// INK Farms:
export const INK_UBQ_LPAddress = "0x1ea388d8dcf980a95967228b1dfcea1692dbe25d";
export const INK_UBQ_FarmContract = "0x6e142959f49d364b30f0478949effdcb58effe44";

export const INK_GRANS_LPAddress = "0x2cd09d8c0484dfb32eb2f23ead45f14c7602921b";
export const INK_GRANS_FarmContract = "0xC4f628150EaDcA9864641e3BF65F8Ea4Fd75e23B";

export const INK_ESCH_LPAddress = "0x4030c26348628e1eeb11955c68e651c7027b04f9";
export const INK_ESCH_FarmContract = "0x6E59E5cd333CE71D3AFDEdae09949729dC2fe4B3";

// This farm uses the ESCH_UBQ_LPAddress from one of the community farms
export const INK_UBQ_ESCH_FarmContract = "0x2f161631b3622881EB7125f3243A4CF35271dE02";

export const UBQ_WETH_LPAddress = "0xd3108cfa56fdd7e8d9bd2ce28bdd500d14dcee24";
export const UBQ_WETH_FarmContract = "0xE547f1F58C2c70bff713663515f8Da8daa2A2e56";

// Community Farms:
export const GRANS_UBQ_LPAddress = "0x6321c294f34c2cdaf61012ac4f3588a527f4d990";
export const GRANS_UBQ_FarmContract = "0x9969A0123c7e7553dac5390221e321C05630d102";

export const ESCH_UBQ_LPAddress = "0xF102Ad140b26C3c6AF9E9358DA9dEAA27CB1dbEA";
export const TGE1_ESCH_UBQ_FarmContract = "0x32DEDccBf19F5AbF40dd8D2A1204bdcE4dE5aa53";

const UBQ_token: IToken = {
  symbol: "UBQ", // wUBQ token address
  logo: ubqLogo,
  publicLogo: "ubq.png",
  address: UBQ,
};

const INK_token: IToken = {
  symbol: "INK",
  logo: inkLogo,
  publicLogo: "ink.png",
  address: INK,
};

const GRANS_token: IToken = {
  symbol: "GRANS",
  logo: gransLogo,
  publicLogo: "grans.png",
  address: GRANS,
};

const ESCH_token: IToken = {
  symbol: "ESCH",
  logo: eschLogo,
  publicLogo: "esch.png",
  address: ESCH,
};

const TGE1_token: IToken = {
  symbol: "TGE1",
  logo: tge1Logo,
  publicLogo: "tge1.png",
  address: TGE1,
};

const WETH_token: IToken = {
    symbol: "wETH",
    logo: wethLogo,
    publicLogo: "weth.png",
    address: WETH,

}

export const AvailableFarms: Array<IFarm> = [
  // UBQ/INK
  {
    name: `${UBQ_token.symbol}/${INK_token.symbol}`,
    official: true,
    yieldfarm: {
      address: INK_UBQ_FarmContract,
      start_time: 1637006400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: INK_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + INK,
    },
    tokenA: UBQ_token,
    tokenB: INK_token,
  },
  // GRANS/INK
  {
    name: `${GRANS_token.symbol}/${INK_token.symbol}`,
    official: true,
    yieldfarm: {
      address: INK_GRANS_FarmContract,
      start_time: 1639634400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: INK_GRANS_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/" + GRANS + "/" + INK,
    },
    tokenA: GRANS_token,
    tokenB: INK_token,
  },
  // ESCH/INK
  {
    name: `${INK_token.symbol}/${ESCH_token.symbol}`,
    official: true,
    yieldfarm: {
      address: INK_ESCH_FarmContract,
      start_time: 1639634400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: INK_ESCH_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/" + INK + "/" + ESCH,
    },
    tokenA: INK_token,
    tokenB: ESCH_token,
  },
  // UBQ/ESCH
  {
    name: `${UBQ_token.symbol}/${ESCH_token.symbol}`,
    official: true,
    yieldfarm: {
      address: INK_UBQ_ESCH_FarmContract,
      start_time: 1642262400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: ESCH_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/" + UBQ + "/" + ESCH,
    },
    tokenA: UBQ_token,
    tokenB: ESCH_token,
  },
  // UBQ/wETH
  {
    name: `${UBQ_token.symbol}/${WETH_token.symbol}`,
    official: true,
    yieldfarm: {
      address: UBQ_WETH_FarmContract,
      start_time: 1642262400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: UBQ_WETH_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/" + UBQ + "/" + WETH,
    },
    tokenA: UBQ_token,
    tokenB: WETH_token,
  },
  // COMMUNITY Pools/Farms
  // GRANS/UBQ
  {
    name: `${GRANS_token.symbol}/${UBQ_token.symbol}`,
    official: false,
    yieldfarm: {
      address: GRANS_UBQ_FarmContract,
      start_time: 1437006400 * 1000,
      reward: GRANS_token,
    },
    lp: {
      address: GRANS_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + GRANS,
    },
    tokenA: GRANS_token,
    tokenB: UBQ_token,
  },
  // UBQ/ESCH -> reward TGE1
  {
    name: `${UBQ_token.symbol}/${ESCH_token.symbol}`,
    official: false,
    yieldfarm: {
      address: TGE1_ESCH_UBQ_FarmContract,
      start_time: 1437006400 * 1000,
      reward: TGE1_token,
    },
    lp: {
      address: ESCH_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + ESCH,
    },
    tokenA: UBQ_token,
    tokenB: ESCH_token,
  },
];

interface IFoundArray {
  [index: string]: boolean;
}

function findTokensFromFarms(): Array<IToken> {
  let list = [] as Array<IToken>;
  let found = {} as IFoundArray;

  for (let i = 0; i < AvailableFarms.length; i++) {
    if (!found[AvailableFarms[i].tokenA.address]) {
      list.push(AvailableFarms[i].tokenA);
      found[AvailableFarms[i].tokenA.address] = true;
    }

    if (!found[AvailableFarms[i].tokenB.address]) {
      list.push(AvailableFarms[i].tokenB);
      found[AvailableFarms[i].tokenB.address] = true;
    }
  }

  return list;
}

export const Tokens: Array<IToken> = findTokensFromFarms();

interface IToken {
  // symbol (usually 3 or 4 letters) for this token (capitalized)
  symbol: string;
  // location for the image, currently imported from /assets
  logo: string;
  // name of the logo file located in the /public/tokens/ folder (publicly hosted at /tokens/)
  publicLogo: string;
  // token address
  address: string;
}

export interface IFarm {
  // name of the farm, eg Token0/Token1
  name: string;
  // if true, this means it's an official INK farm. False means a Community farm
  official: boolean;
  // details about the yield farm
  yieldfarm: {
    // address for the farm contract
    address: string;
    // time the rewards start
    start_time: number;
    // the reward token given
    reward: IToken;
  };
  // details about the Liquidity Pool. LP can apply to many Yield Farms
  lp: {
    // LP address eg, the address for the pair of tokens
    address: string;
    // url where LP can be added (to the Liquidity Pool, not the Farm Contract)
    url: string;
  };
  // the Token0 token
  tokenA: IToken;
  // the Token1 token
  tokenB: IToken;
}
