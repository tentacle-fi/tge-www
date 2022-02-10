//
// Find swaps on Ubiq. Named Shinobi after the Shinobi Uniswap V2 deployment on Ubiq
//
//

import { ITxDetail } from "../interfaces";
import { bnToDecStr, bnTohex, tokenLookupSymbol, tsFormat, testMethodId, Transfer_Event, Withdrawl_Event } from "./tools";

const Shinobi = (allTxs: Array<ITxDetail>) => {
  let results = [];

  for (let i = 0; i < allTxs.length; i++) {
    if (allTxs[i].processed === true) {
      continue;
    }

    const details = {
      txHash: allTxs[i].tx.hash,
      fee: allTxs[i].gas.paid,
      feeCurrency: "UBQ",
      date: tsFormat(allTxs[i].block.timestamp),
    };

    let swap1 = swapETHForExactTokens(allTxs[i]);
    if (swap1) {
      allTxs[i].processed = true;
      results.push({
        ...swap1,
        ...details,
      });
    }

    let swap2 = swapTokensForExactETH(allTxs[i]);
    if (swap2) {
      allTxs[i].processed = true;
      results.push({
        ...swap2,
        ...details,
      });
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
const addLiquidityETH = (tx: ITxDetail) => {
  try {
    testMethodId(tx, "0xf305d719");

    const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    // TODO: handle UBQ value being sent in properly

    let token0Address = transferEvents[0].address;
    let token0Value = bnToDecStr(transferEvents[0].data);

    let token1Address = transferEvents[1].address;
    let token1Value = bnToDecStr(transferEvents[1].data);

    let lpTokenAddress = transferEvents[2].address;
    let lpTokenValue = bnToDecStr(transferEvents[2].data);

    // TODO: magically map the above values properly to the CSV output
    // can we just split the lpTokenValue in half and create two records (one for each token transferred?)
    // are these just not transactions that matter for the csv?
    // should we extend the csv to handle edge cases like this so extra data can be included (or a separate csv?)
    return {
      action: "LP_ADD",
      symbol: "UBQ",
      volume: "",
      currency: "",
      total: "",
      price: "",
      account: "DEX_LP_ADD",
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("addLiquidityETH probe error", e?.message);
    }
  }
};

// swapTokensForExactETH = swap(trade) token(s) for UBQ(ETH)
// 1. find Withdrawl event within receipt.logs where topics[0] === (Withdrawl Event methodId)
//    - data value of this is the value of tokens sent to the out address
// 2. find first Transfer event within receipt.logs where topics[0] === (Transfer Event methodId)
//    - the 'address' field is the token address sent
//    - topics[1] === address transferring tokens to
//    - data value is the amount of tokens sent in for this swap
const swapTokensForExactETH = (tx: ITxDetail) => {
  try {
    testMethodId(tx, "0x4a25d94a");

    const withdrawlEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Withdrawl_Event);

    let tokenOutValue = bnToDecStr(withdrawlEvents[0].data);

    const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    let addressSentTo = bnTohex(transferEvents[0].topics[1]);
    let tokenInValue = bnToDecStr(transferEvents[0].data);
    let tokenInAddress = transferEvents[0].address;

    // TODO: add price-per-currency (calced from UBQ oracle price + ratio to this token)?

    return {
      action: "SWAP",
      symbol: "UBQ",
      volume: tokenOutValue,
      currency: tokenLookupSymbol(tokenInAddress),
      total: tokenInValue,
      price: "",
      account: "DEX_SWAP_TO:" + addressSentTo,
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("swapTokensForExactETH probe error", e?.message);
    }
  }
};

// swapETHForExactTokens - swap(trade) UBQ(ETH) for token(s)
// 1. tx.value === total UBQ paid for this swap (add gas as well)
// 2. find last Transfer event (within receipt.logs) where topics[0] === (Transfer Event methodId)
//    - topics[2] === target wallet address
//    - address === token address to indicate what was transferred to the target wallet address
//    - data === total amount tokens transferred (use BigNumber)
const swapETHForExactTokens = (tx: ITxDetail) => {
  try {
    testMethodId(tx, "0xfb3bdb41");

    const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    let valueIn = bnToDecStr(tx.tx.value);
    let tokenOutValue = bnToDecStr(transferEvents[transferEvents.length - 1].data);
    let tokenOutAddress = transferEvents[transferEvents.length - 1].address;
    let addressSentTo = bnTohex(transferEvents[transferEvents.length - 1].topics[2]);

    return {
      action: "SWAP",
      symbol: tokenLookupSymbol(tokenOutAddress),
      volume: tokenOutValue,
      currency: "UBQ",
      total: valueIn,
      price: "",
      account: "DEX_SWAP_TO:" + addressSentTo,
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("swapETHForExactTokens probe error", e?.message);
    }
  }
};

export default Shinobi;
