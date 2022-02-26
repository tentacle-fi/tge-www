//
// Find swaps on Ubiq. Named Shinobi after the Shinobi Uniswap V2 deployment on Ubiq
//
//

import { ITxDetail } from "../interfaces";
import { bnToDecStr, bnTohex, tokenLookupSymbol, tsFormat, testMethodId, Transfer_Event, Withdrawl_Event } from "./tools";

const Shinobi = (walletAddress: string, allTxs: Array<ITxDetail>) => {
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

    let transfers = tokenTransfer(walletAddress, allTxs[i]);
    if (transfers) {
      allTxs[i].processed = true;

      results.push({
        ...transfers,
        ...details,
      });
    }
  }

  return results;
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

// swapExactETHForTokens()
// Find last Transfer
//    - topics[2] should contain walletAddress
//    - data is the value transferred
//    - address is the token transferred

// transfer()
// Find only Transfer Event
//    - topics[1] === address the transfer is from
//    - topics[2] === address the transfer is to
//    - data is the value of the transfer
//    - address is the token transferred
const tokenTransfer = (walletAddress: string, tx: ITxDetail) => {
  try {
    testMethodId(tx, "0xa9059cbb");

    const transferEvent = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    let transferFromAddress = bnTohex(transferEvent[0].topics[1]);
    let transferToAddress = bnTohex(transferEvent[0].topics[2]);
    let transferValue = bnToDecStr(transferEvent[0].data);
    let tokenAddressSymbol = tokenLookupSymbol(transferEvent[0].address);

    // TODO: review the values here to align them with the CSV goals
    return {
      action: transferFromAddress.toLowerCase() === walletAddress ? "TRANSFER_OUT" : "TRANSFER_IN",
      symbol: tokenAddressSymbol,
      volume: transferValue,
      currency: "",
      total: "",
      price: "",
      account: "TRANSFER_TO:" + transferToAddress,
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("swapETHForExactTokens probe error", e?.message);
    }
  }
};

export default Shinobi;
