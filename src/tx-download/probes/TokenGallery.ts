//
// Find Defi Farming Transactions, eg Rewards, Stakes, Removals, etc
//
//
import BigNumber from "bignumber.js";
import { ITxDetail, ICSVRow } from "../interfaces";
import { bnToDecStr, tsFormat, tokenLookupSymbol, testMethodId, formatTopic, Transfer_Event } from "./tools";

// custom Token.gallery event for when an NFT is transferred (sold) to another address
// const TG_TransferSingle_Event = "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";

// TODO: brute force this event name via the keccak 256 hash, and known parameter constraints (plus dictionary words for the function name)
// const TG_TransferSinglePay_Event = "0x3141d8b0da9d06f9dbe8eac7082e76b5181eb89cfdd14b2b4e008b6fc070091c";

// TODO: brute force this event name
// 2% platform fee along with other 'transfer' fees/costs/values appear to be associated with this event
const TG_TransferSinglePlatformFee_Event = "0x5afeca38b2064c23a692c4cf353015d80ab3ecc417b4f893f372690c11fbd9a6";

const TokenGallery = (walletAddress: string, allTxs: Array<ITxDetail>): Array<ICSVRow> => {
  let results = [] as Array<ICSVRow>;

  for (let i = 0; i < allTxs.length; i++) {
    if (allTxs[i].processed === true) {
      continue;
    }

    const details = {
      date: tsFormat(allTxs[i].block.timestamp),
      txHash: allTxs[i].tx.hash,
    };

    let sellForUbq = soldNFTForUBQ(walletAddress, allTxs[i]);
    if (sellForUbq) {
      allTxs[i].processed = true;

      results.push({
        ...sellForUbq,
        ...details,
      } as ICSVRow);
    }
    let sellForERC20 = soldNFTForERC20(walletAddress, allTxs[i]);
    if (sellForERC20) {
      allTxs[i].processed = true;

      results.push({
        ...sellForERC20,
        ...details,
      } as ICSVRow);
    }
  }

  return results;
};

// TokenGallery::soldNFT() - when a NFT is transferred to a new owner
// NOTE: could have the following details:
//    - zero value transfer (free)
//    - paid for in UBQ
//    - paid for in ERC20 token (as of writing only 10Grans is supported)
//
// 1. Find TG_TransferSingle_Event
//    - topics[1] === Buyer Address
//    - topics[2] === Seller Address (should match our wallet address)
// 2. Find unknown event which contains the value of the transfer (TG_TransferSinglePay_Event)
//    - parse the data field
//      - data[1] === value paid
// 3. Find First platform fee from the unknown event (TG_TransferSinglePlatformFee_Event)
//    - data value is the 2% platform fee (assuming in the same currency as the nft sold for)
// 4. Find Second platform fee from event (TG_TransferSinglePlatformFee_Event)
//    - data value is the 8% creator fee (assuming in the same currency as it was sold)
// 5. Find Third platform fee from event (TG_TransferSinglePlatformFee_Event)
//    - data value is the remaining value (90%) that goes to the current owner of the nft
// 6. Find Last Transfer Event
//    - data is the value paid to the current owner of the nft
//    - address is the erc20 token address ths was paid in
//    - topics[2] === address getting paid this value
// 7. Find Second Transfer Event
//    - data is the value paid as royalties (8%) to the creator of the nft
// 8. First Transfer Event
//    - data is the 2% platform fee
//
// TODO: check against the various ways to get paid (royalties, secondary seller)
// TODO: check against selling a 'free' nft that either the sale is recorded or not (determine which is needed)
// TODO: check ERC20 payments as well as UBQ payments work for all of the use-cases above
const soldNFTForUBQ = (walletAddress: string, tx: ITxDetail) => {
  try {
    testMethodId(tx, "0x243adbdd");
    return soldNFT(walletAddress, tx);
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("soldNFTForUBQ probe error", e?.message);
    }
  }
};
const soldNFTForERC20 = (walletAddress: string, tx: ITxDetail) => {
  try {
    testMethodId(tx, "0xcae9ca51");
    return soldNFT(walletAddress, tx);
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("soldNFTForERC20 probe error", e?.message);
    }
  }
};
const soldNFT = (walletAddress: string, tx: ITxDetail) => {
  const erc20TransferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

  // const transferSingleEvent = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === TG_TransferSingle_Event);

  // const paymentEvent = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === TG_TransferSinglePay_Event);

  const paymentFeeEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === TG_TransferSinglePlatformFee_Event);

  // does walletAddress exist in the transfers TO field?
  let foundInERC20Transfers = erc20TransferEvents.filter((log) => log?.topics?.[2]?.toLowerCase() === formatTopic(walletAddress));

  // does walletAddress exist in the custom ubq transfer functions?
  let foundInCustomUBQTransfers = paymentFeeEvents.filter((log) => log?.topics?.[1]?.toLowerCase() === formatTopic(walletAddress));

  if (foundInCustomUBQTransfers.length < 1 && foundInERC20Transfers.length < 1) {
    // walletAddress did not get paid for this. possibly a purchase or something else. abort as sale.
    console.error("walletAddress not found in any payments");
    console.log(erc20TransferEvents);
    console.log(paymentFeeEvents);
    return;
  }

  // assume default is UBQ (gas coin)
  let totalPaidValue = new BigNumber(0);
  let paidCurrencySymbol = "UBQ"; // assume gas currency by default (it'll be the most popular)

  if (foundInCustomUBQTransfers.length > 0) {
    // our wallet got paid some UBQ for this sale (royalties and possibly more)
    // add all the values up that apply (all of the found data hex values)
    foundInCustomUBQTransfers.forEach((log) => {
      totalPaidValue = totalPaidValue.plus(log.data);
    });
  }

  if (foundInERC20Transfers.length > 0) {
    // paid in ERC20 tokens, tally up the total
    paidCurrencySymbol = tokenLookupSymbol(foundInERC20Transfers[0].address);

    foundInERC20Transfers.forEach((log) => {
      totalPaidValue = totalPaidValue.plus(log.data);
    });
  }

  let paidValue = bnToDecStr(totalPaidValue);

  // let buyerAddress = bnTohex(transferSingleEvent[0].topics[1]);
  // let sellerAddress = bnTohex(transferSingleEvent[0].topics[2]);
  // let twoPercentPlatformFeeValue = bnToDecStr(paymentFeeEvents[0].data);
  // let eightPercentRoyaltyFeeValue = bnToDecStr(paymentFeeEvents[1].data);
  // let ninteyPercentOwnerFeeValue = bnToDecStr(paymentFeeEvents[2].data);

  // record only the value(s) that our wallet address gets
  return {
    action: "SELL",
    symbol: "oNFT",
    volume: "1", // TODO: check if multiple sales are possible in one transaction
    account: "SELL_NFT:TG",
    fee: "0", // we didn't pay gas for this tx, it's inbound
    feeCurrency: "UBQ",
    total: paidValue,
    price: "0",
    currency: paidCurrencySymbol,
  };
};

export default TokenGallery;
