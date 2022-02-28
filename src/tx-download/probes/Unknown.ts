import { ITxDetail, ITransferCSVRow } from "../interfaces";
import { bnToDecStr, bnTohex, tsFormat, formatTopic, tokenLookupSymbol, testMethodId, Transfer_Event } from "./tools";

// create a list of txs that are processed but don't fall into other categories
// may not return info for the CSV but another way to display info

const Unknown = (walletAddress: string, allTxs: Array<ITxDetail>): Array<ITransferCSVRow> => {
  let results = [] as Array<ITransferCSVRow>;

  // tx[]
  //    events[]
  //      processed = true/false
  // find transfers, withdrawls, deposits, etc - standard erc20 functions
  // try to lookup (in a custom processor set) of why this transaction happened (find context). this is not for determining value, but to find the service this is related with

  // Transfer:
  //  to
  //  from
  //  token
  //  value

  for (let i = 0; i < allTxs.length; i++) {
    if (allTxs[i].processed === true) {
      continue;
    }

    const details = {
      txHash: allTxs[i].tx.hash,
      fee: allTxs[i].gas.paid,
      feeSymbol: "UBQ",
      timestamp: allTxs[i].block.timestamp,
      date: tsFormat(allTxs[i].block.timestamp),
      block: allTxs[i].block.number,
    };

    let transfers = findTransfers(walletAddress, allTxs[i]);
    if (transfers?.length > 0) {
      allTxs[i].processed = true;

      transfers.forEach((transfer) => {
        results.push({
          ...transfer,
          ...details,
        });
      });
    }

    let approve = findApprove(walletAddress, allTxs[i]);
    if (approve) {
      allTxs[i].processed = true;
      results.push({
        ...approve,
        ...details,
      });
    }

    let deposits = findDeposit(walletAddress, allTxs[i]);
    if (deposits !== undefined && deposits?.length > 0) {
      allTxs[i].processed = true;

      deposits.forEach((deposit) => {
        results.push({
          ...deposit,
          ...details,
        });
      });
    }
  }

  return results;
};

// process transaction, looking for walletAddress within any Transfer event to/from
// return array of matching transfers, mapped to the necessary values for CSV
const findTransfers = (walletAddress: string, tx: ITxDetail) => {
  const topicWalletAddress = formatTopic(walletAddress);
  const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

  // console.log('transferEvents', transferEvents)

  const walletAddressTransfers = transferEvents
    .filter((t) => {
      return t.topics[1].toLowerCase() === topicWalletAddress || t.topics[2].toLowerCase() === topicWalletAddress;
    })
    .map((transfer) => {
      return {
        from: bnTohex(transfer.topics[1]),
        to: bnTohex(transfer.topics[2]),
        value: bnToDecStr(transfer.data),
        valueUSD: "", // TODO: fill this in with historical USD data
        tokenSymbol: tokenLookupSymbol(transfer.address),
        tokenAddress: transfer.address,
        reason: "Transfer", // TODO: fill this with the tx methodid or other context, if found
      };
    });

  // console.log("toAddressTransfers", toAddressTransfers);

  return walletAddressTransfers;
};

const findApprove = (walletAddress: string, tx: ITxDetail) => {
  try {
    testMethodId(tx, "0x095ea7b3");

    const contractApprovedAddress = tx.receipt.logs[0].address;

    return {
      from: walletAddress,
      to: "",
      value: "0", // no value is sent for an approval
      valueUSD: "0",
      tokenSymbol: tokenLookupSymbol(contractApprovedAddress),
      tokenAddress: contractApprovedAddress,
      reason: "Approve()",
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("findApproves probe error", e?.message);
    }
  }
};

const findDeposit = (walletAddress: string, tx: ITxDetail) => {
  try {
    const Deposit_Event = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";

    const depositEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Deposit_Event);

    let deposits = depositEvents
      .filter((depo) => depo.topics[1] === formatTopic(walletAddress))
      .map((depo) => {
        return {
          from: walletAddress,
          to: depo.address,
          value: bnToDecStr(depo.data),
          valueUSD: "", // TODO: calculate this from historical data
          tokenSymbol: "UBQ",
          tokenAddress: "UBQ", // always UBQ for Deposits
          reason: "Deposit()",
        };
      });

    return deposits;
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("findApproves probe error", e?.message);
    }
  }
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
