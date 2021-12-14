import inkLogo from "assets/ink_black_alpha.png";
import ubqLogo from "assets/ubq.png";
import gransLogo from "assets/grans-flat.png";
import eschLogo from "assets/esch-logo.png";

export const UBQ = "0x1fa6a37c64804c0d797ba6bc1955e50068fbf362"; // UBQ Token address (wUBQ technically)

// INK Farms:
export const INK = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db"; // Token Address to distribute (INK)
export const INK_UBQ_LPAddress = "0x1ea388d8dcf980a95967228b1dfcea1692dbe25d"; // Pair address (UBQ+INK)
export const INK_UBQ_FarmContract = "0x6e142959f49d364b30f0478949effdcb58effe44"; // (UBQ+INK) Farm address

export const INK_GRANS_LPAddress = "0x2cd09d8c0484dfb32eb2f23ead45f14c7602921b";
export const INK_GRANS_FarmContract = "0xC4f628150EaDcA9864641e3BF65F8Ea4Fd75e23B";

export const ESCH = "0xcf3222b7fda7a7563b9e1e6c966bead04ac23c36";
export const INK_ESCH_LPAddress = "0x4030c26348628e1eeb11955c68e651c7027b04f9";
export const INK_ESCH_FarmContract = "0x6E59E5cd333CE71D3AFDEdae09949729dC2fe4B3";

// Community Farms:
export const GRANS = "0x0826180a4c981d5095cb5c48bb2a098a44cf6f73"; // Token Address to distribute (10 GRANS)
export const GRANS_UBQ_LPAddress = "0x6321c294f34c2cdaf61012ac4f3588a527f4d990"; // Pair address (UBQ+GRANS)
export const GRANS_UBQ_FarmContract = "0x9969A0123c7e7553dac5390221e321C05630d102"; // (UBQ+GRANS) Farm address

const UBQ_token: IToken = {
  symbol: "UBQ", // wUBQ token address
  logo: ubqLogo,
  address: UBQ,
};

const INK_token: IToken = {
  symbol: "INK",
  logo: inkLogo,
  address: INK,
};

const GRANS_token: IToken = {
  symbol: "GRANS",
  logo: gransLogo,
  address: GRANS,
};

const ESCH_token: IToken = {
  symbol: "ESCH",
  logo: eschLogo,
  address: ESCH,
};

export const AvailableFarms: Array<IFarm> = [
  // UBQ/INK
  {
    name: `${UBQ_token.symbol}/${INK_token.symbol}`,
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
    name: `${ESCH_token.symbol}/${INK_token.symbol}`,
    yieldfarm: {
      address: INK_ESCH_FarmContract,
      start_time: 1639634400 * 1000,
      reward: INK_token,
    },
    lp: {
      address: INK_ESCH_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/" + ESCH + "/" + INK,
    },
    tokenA: ESCH_token,
    tokenB: INK_token,
  },
  // COMMUNITY Pools/Farms
  // GRANS/UBQ
  {
    name: `${GRANS_token.symbol}/${UBQ_token.symbol}`,
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
];

interface IToken {
  symbol: string;
  logo: string;
  address: string;
}

export interface IFarm {
  name: string;
  yieldfarm: {
    address: string;
    start_time: number;
    reward: IToken;
  };
  lp: {
    address: string;
    url: string;
  };
  tokenA: IToken;
  tokenB: IToken;
}
