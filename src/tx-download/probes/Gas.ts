import { ITxDetail } from "../interfaces";

const Gas = (allTxs: Array<ITxDetail>) => {
  let results = [];
  let total = 0;

  let tx = {} as ITxDetail;
  for (let i = 0; i < allTxs.length; i++) {
    tx = allTxs[i];

    // TODO: check that the 'from' address is the target address

    results.push({
      gas: tx.gas.paid,
      timestamp: tx.block.timestamp,
      to: tx.tx.to,
    });

    total += parseFloat(tx.gas.paid);
  }

  results.push({
    total: total,
  });

  return results;
};

export default Gas;
