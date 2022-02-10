//
// Find Defi Farming Transactions, eg Rewards, Stakes, Removals, etc
//
//
import { ITxDetail, ICSVRow } from "../interfaces";
import { bnToDecStr, bnTohex, tsFormat, tokenLookupSymbol, testMethodId, Transfer_Event } from "./tools";

const Farming = (allTxs: Array<ITxDetail>): Array<ICSVRow> => {
  let results = [] as Array<ICSVRow>;

  for (let i = 0; i < allTxs.length; i++) {
    if (allTxs[i].processed === true) {
      continue;
    }

    const details = {
      fee: allTxs[i].gas.paid,
      feeCurrency: "UBQ",
      date: tsFormat(allTxs[i].block.timestamp),
      total: "0",
      price: "0",
      currency: "UBQ",
      txHash: allTxs[i].tx.hash,
    };

    let rewards = getReward(allTxs[i]);
    if (rewards) {
      allTxs[i].processed = true;

      results.push({
        ...rewards,
        ...details,
      } as ICSVRow);
    }

    let stakes = stakeLp(allTxs[i]);
    if (stakes) {
      allTxs[i].processed = true;

      results.push({
        ...stakes,
        ...details,
      } as ICSVRow);
    }
  }

  return results;
};

// stake() - defi farming stake LP tokens
// find ONLY Transfer event from receipt.logs where topics[0] === (Transfer Event methodid)
//    - data is the total LP tokens staked
//    - address === LP token address (token address of what's been staked)
//    - topics[1] === your wallet address
//    - topics[2] === contract address
const stakeLp = (tx: ITxDetail) => {
  try {
    testMethodId(tx, "0xa694fc3a");

    const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    let farmContractAddress = bnTohex(transferEvents[0].topics[2]);
    let stakedTokenAddress = tokenLookupSymbol(transferEvents[0].address);
    let stakedTokenTotal = bnToDecStr(transferEvents[0].data);

    return {
      action: "STAKE",
      symbol: stakedTokenAddress, // TODO: map to known SLPT tokens
      volume: stakedTokenTotal,
      account: "STAKE:" + farmContractAddress, // TODO: create mappings of known farm contracts to common name (eg Tentacle.Finance INK+UBQ->INK farm)
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("stakeLp probe error", e?.message);
    }
  }
};

// getReward() - defi farming rewards function call
// find ONLY Transfer event from receipt.logs where topics[0] === (Transfer Event methodid)
//    - farm contract giving rewards is at topics[1]
//    - address sent the rewards is at topics[2]
//    - data is the total token value sent
//    - address is the token address being rewarded
//
// TODO: assumes only 1 reward token, extend to handle multi-token rewards!
const getReward = (tx: ITxDetail) => {
  try {
    testMethodId(tx, "0x3d18b912");

    const transferEvents = tx.receipt.logs.filter((log) => log?.topics?.[0]?.toLowerCase() === Transfer_Event);

    let farmContractAddress = bnTohex(transferEvents[0].topics[1]);
    //let addressSentTo = bnTohex(transferEvents[0].topics[2]);
    let tokenOutValue = bnToDecStr(transferEvents[0].data);
    let tokenOutAddress = tokenLookupSymbol(transferEvents[0].address);

    return {
      action: "REWARDS",
      symbol: tokenOutAddress,
      volume: tokenOutValue,
      account: "REWARD:" + farmContractAddress,
    };
  } catch (e: any) {
    if (e?.message.indexOf("testMethodId()") !== 0) {
      console.error("getReward probe error", e?.message);
    }
  }
};

export default Farming;
