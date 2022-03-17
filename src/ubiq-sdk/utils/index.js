import Web3 from "web3";
import BigNumber from "bignumber.js";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

export const GAS = {
  MM: {
    // metamask and other wallets gas fee settings
    gas: 510000,
    gasPrice: (81 * 1000000000).toString() /*gwei*/,
    maxFeePerGas: (81 * 1000000000).toString() /*gwei*/,
    maxPriorityFeePerGas: (1 * 1000000000).toString() /*gwei*/,
  },
  SPARROW: {
    // sparrows broken 'legacy' gas fee settings
    gas: 510000,
    gasPrice: (81 * 1000000000).toString() /*gwei*/,
  },
};

export const getPoolTotalSupply = async (poolContract) => {
  return await poolContract.methods.totalSupply().call();
};

export const stake = async (ubiq, amount, account, poolContract, onTxHash) => {
  const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

  gas.gas = 120000 // gas for stake()

  return poolContract.methods
    .stake(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
    .send({ from: account, ...gas }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Staking error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(ubiq.web3.eth, txHash);
      if (!status) {
        console.log("Staking transaction failed.");
        return false;
      }
      return true;
    });
};

export const unstake = async (ubiq, amount, account, poolContract, onTxHash) => {
  const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

  gas.gas = 160000 // gas for withdraw()

  return poolContract.methods
    .withdraw(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
    .send({ from: account, ...gas }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Unstaking error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(ubiq.web3.eth, txHash);
      if (!status) {
        console.log("Unstaking transaction failed.");
        return false;
      }
      return true;
    });
};

export const harvest = async (ubiq, account, poolContract, onTxHash) => {
  const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

  gas.gas = 110000;

  return poolContract.methods.getReward().send({ from: account, ...gas }, async (error, txHash) => {
    if (error) {
      onTxHash && onTxHash("");
      console.log("Harvest error", error);
      return false;
    }
    if (onTxHash === undefined) {
      // if the txHash callback isn't defined, return right away
      return true;
    }

    onTxHash && onTxHash(txHash);
    const status = await waitTransaction(ubiq.web3.eth, txHash);
    if (!status) {
      console.log("Harvest transaction failed.");
      return false;
    }
    return true;
  });
};

export const redeem = async (ubiq, account, poolContract, onTxHash) => {
  const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

  gas.gas = 180000 // gas for exit()

  return poolContract.methods.exit().send({ from: account, ...gas }, async (error, txHash) => {
    if (error) {
      onTxHash && onTxHash("");
      console.log("Redeem error", error);
      return false;
    }
    onTxHash && onTxHash(txHash);
    const status = await waitTransaction(ubiq.web3.eth, txHash);
    if (!status) {
      console.log("Redeem transaction failed.");
      return false;
    }
    return true;
  });
};

export const getEarned = async (pool, account) => {
  return new BigNumber(await pool.methods.earned(account).call());
};

export const getStaked = async (pool, account) => {
  return new BigNumber(await pool.methods.balanceOf(account).call());
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitTransaction = async (provider, txHash) => {
  const web3 = new Web3(provider);
  let txReceipt = null;
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash);
    txReceipt = r;
    await sleep(2000);
  }
  return txReceipt.status;
};
