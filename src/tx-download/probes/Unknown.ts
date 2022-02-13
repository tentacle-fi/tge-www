import { ITxDetail, ICSVRow } from "../interfaces";
import { bnToDecStr, bnTohex, tsFormat, tokenLookupSymbol, testMethodId, Transfer_Event } from "./tools";

// create a list of txs that are processed but don't fall into other categories
// may not return info for the CSV but another way to display info

const Unknown = (allTxs: Array<ITxDetail>): Array<ICSVRow> => {
  let results = [] as Array<ICSVRow>;

  for (let i = 0; i < allTxs.length; i++) {
    if (allTxs[i].processed === true) {
      continue;
    }
  }
  return results;
};

// addLiquidityETH = send in two tokens and get transferred one kind of LP token
// 1. find first Transfer Event
//    - if tx.value is not blank, then UBQ was sent in as the token (and wUBQ will be the token address)
//    - data value is total number of tokens submitted in (one of the tokens of the LP pair)
//    - address is the tokenA address
// 2. find second Transfer Event
//    - repeat all steps from step 1 above as TokenB
// 3. find third Transfer Event
//    - topics[2] === wallet address
//    - data value is total LP tokens transferred (to wallet address)
//    - address is the LP token address
// const addLiquidityETH = (tx: ITxDetail) => {
//   try {
//     testMethodId(tx, "0xf305d719");
//
//     const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);
//
//     // TODO: handle UBQ value being sent in properly
//
//     let token0Address = transferEvents[0].address;
//     let token0Value = bnToDecStr(transferEvents[0].data);
//
//     let token1Address = transferEvents[1].address;
//     let token1Value = bnToDecStr(transferEvents[1].data);
//
//     let lpTokenAddress = transferEvents[2].address;
//     let lpTokenValue = bnToDecStr(transferEvents[2].data);
//
//     // TODO: magically map the above values properly to the CSV output
//     // can we just split the lpTokenValue in half and create two records (one for each token transferred?)
//     // are these just not transactions that matter for the csv?
//     // should we extend the csv to handle edge cases like this so extra data can be included (or a separate csv?)
//     return {
//       action: "LP_ADD",
//       symbol: "UBQ",
//       volume: "",
//       currency: "",
//       total: "",
//       price: "",
//       account: "DEX_LP_ADD",
//     };
//   } catch (e: any) {
//     if (e?.message.indexOf("testMethodId()") !== 0) {
//       console.error("addLiquidityETH probe error", e?.message);
//     }
//   }
// };

export default Unknown;
