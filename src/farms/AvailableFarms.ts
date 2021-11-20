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

const UBQ_token = {
  symbol: "UBQ", // wUBQ token address
  logo: ubqLogo,
  address: UBQ,
};

export const AvailableFarms = [
  {
    name: "INK/UBQ",
    yieldfarm: {
      address: INK_UBQ_FarmContract,
      start_time: 1637006400 * 1000,
      payOut: "INK",
      payOutLogo: inkLogo,
    },
    lp: {
      address: INK_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + INK,
    },
    tokenA: {
      symbol: "INK",
      logo: inkLogo,
      address: INK,
    },
    tokenB: UBQ_token,
  },
  {
    name: "UBQ/GRANS",
    yieldfarm: {
      address: GRANS_UBQ_FarmContract,
      start_time: 1437006400 * 1000,
      payOut: "GRANS",
      payOutLogo: gransLogo,
    },
    lp: {
      address: GRANS_UBQ_LPAddress,
      url: "https://shinobi.ubiq.ninja/#/add/UBQ/" + GRANS,
    },
    tokenA: {
      symbol: "GRANS",
      logo: gransLogo,
      address: GRANS,
    },
    tokenB: UBQ_token,
  },
];
