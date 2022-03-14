import { ITxDetail, ITransferCSVRow } from "../interfaces";
import {
  bnToDecStr,
  bnTohex,
  tsFormat,
  formatTopic,
  tokenLookupSymbol,
  testMethodId,
  processInputData,
  Transfer_Event,
  Deposit_Event,
  Withdrawl_Event,
} from "./tools";

// create a list of txs that are processed but don't fall into other categories
// may not return info for the CSV but another way to display info

const Transfers = (walletAddress: string, allTxs: Array<ITxDetail>): Array<ITransferCSVRow> => {
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
      // default values
      nonce: allTxs[i].tx.nonce,
      txHash: allTxs[i].tx.hash,
      fee: allTxs[i].gas.paid,
      feeSymbol: "UBQ",
      timestamp: allTxs[i].block.timestamp,
      date: tsFormat(allTxs[i].block.timestamp),
      block: allTxs[i].block.number,
      from: "",
      to: "",
      value: "",
      tokenPrice: "",
      valueUSD: "",
      tokenSymbol: "",
      tokenAddress: "",
      reason: "",
    };

    for (const fn of [findTransfers, findApprove, findDeposits, findWithdrawls]) {
      let res = fn(walletAddress, allTxs[i]);

      if (res !== undefined && Array.isArray(res) && res?.length > 0) {
        allTxs[i].processed = true;

        results = results.concat(
          res.map((r) => {
            return {
              ...details,
              ...r,
            } as ITransferCSVRow;
          })
        );
      } else if (res !== undefined && !Array.isArray(res)) {
        console.log("res", res);
      }
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
  // console.log('topicWalletAddress', topicWalletAddress)

  const methodLookup = processInputData(tx.tx.data);

  if (methodLookup.method === "Unknown" && tx.tx.data.length > 2) {
    console.warn("method name not found for", tx);
  }

  const walletAddressTransfers = transferEvents
    .filter((t) => {
      return t.topics[1].toLowerCase() === topicWalletAddress || t.topics[2].toLowerCase() === topicWalletAddress;
    })
    .map((transfer) => {
      return {
        from: bnTohex(transfer.topics[1]),
        to: bnTohex(transfer.topics[2]),
        value: bnToDecStr(transfer.data),
        tokenSymbol: tokenLookupSymbol(transfer.address),
        tokenAddress: transfer.address,
        reason: methodLookup.method,
      };
    });

  // console.log("walletAddressTransfers", walletAddressTransfers);

  return walletAddressTransfers;
};

const findApprove = (walletAddress: string, tx: ITxDetail) => {
  try {
    testMethodId(tx, "0x095ea7b3");

    const methodLookup = processInputData(tx.tx.data);
    const contractApprovedAddress = tx.receipt.logs[0].address;

    return [
      {
        from: walletAddress,
        to: "",
        value: "0", // no value is sent for an approval
        valueUSD: "0",
        tokenSymbol: tokenLookupSymbol(contractApprovedAddress),
        tokenAddress: contractApprovedAddress,
        reason: methodLookup.method,
      },
    ];
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("findApprove probe error", e?.message);
    }
  }
};

const findDeposits = (walletAddress: string, tx: ITxDetail) => {
  try {
    const depositEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Deposit_Event);

    let deposits = depositEvents
      .filter((depo) => depo.topics[1] === formatTopic(walletAddress))
      .map((depo) => {
        return {
          from: walletAddress,
          to: depo.address,
          value: bnToDecStr(depo.data),
          tokenSymbol: "UBQ",
          tokenAddress: "UBQ", // always UBQ for Deposits
          reason: "Deposit",
        };
      });

    return deposits;
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("findDeposits probe error", e?.message);
    }
  }
};

const findWithdrawls = (walletAddress: string, tx: ITxDetail) => {
  try {
    const withdrawlEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Withdrawl_Event);

    let withdrawls = withdrawlEvents
      // .filter((w) => w.topics[1] === formatTopic(walletAddress))
      .map((w) => {
        return {
          from: w.topics[1],
          to: walletAddress,
          value: bnToDecStr(w.data),
          tokenSymbol: "UBQ",
          tokenAddress: "UBQ", // always UBQ for Withdrawls
          reason: "Withdrawl",
        };
      });

    return withdrawls;
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("findWithdrawls probe error", e?.message);
    }
  }
};

export default Transfers;
