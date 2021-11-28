import inkLogo from "assets/ink_black_alpha.png";
import ubqLogo from "assets/ubq.png";
import gransLogo from "assets/grans-flat.png";

export const UBQ = "0x1fa6a37c64804c0d797ba6bc1955e50068fbf362"; // UBQ Token address (wUBQ technically)

export const INK = "0x7845fCbE28ac19ab7ec1C1D9674E34fdCB4917Db"; // Token Address to distribute (INK)
export const INK_UBQ_LPAddress = "0x1ea388d8dcf980a95967228b1dfcea1692dbe25d"; // Pair address (UBQ+INK)
export const INK_UBQ_FarmContract = "0x6e142959f49d364b30f0478949effdcb58effe44"; // (UBQ+INK) Farm address

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

export const AvailableFarms: Array<IFarm> = [
  {
    name: `${UBQ_token.symbol}/${INK_token.symbol}`,
    yieldfarm: {
      address: INK_UBQ_FarmContract,
      start_time: 1637006400 * 1000,
      payOut: INK_token.symbol,
      payOutLogo: inkLogo,
    },
    lp: {
      address: INK_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + INK,
    },
    tokenA: UBQ_token,
    tokenB: INK_token,
  },
  {
    name: `${GRANS_token.symbol}/${UBQ_token.symbol}`,
    yieldfarm: {
      address: GRANS_UBQ_FarmContract,
      start_time: 1437006400 * 1000,
      payOut: GRANS_token.symbol,
      payOutLogo: gransLogo,
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
    payOut: string;
    payOutLogo: string;
  };
  lp: {
    address: string;
    url: string;
  };
  tokenA: IToken;
  tokenB: IToken;
}
