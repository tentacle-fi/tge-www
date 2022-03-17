import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import Web3 from "web3";
import { provider, TransactionReceipt } from "web3-core";
import { AbiItem } from "web3-utils";
import { INK, ESCH, DAO_MULTISIG, DAO_FARMING, AvailableFarms } from "farms/AvailableFarms";
import { GAS } from "ubiq-sdk/utils";
import ERC20ABI from "constants/abi/ERC20.json";
import ShinobiPoolERC20 from "ubiq-sdk/lib/clean_build/contracts/ShinobiPool.json";

export const TxConfirmationBlocks = 2; // number of blocks to wait to consider a tx mined

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitTransaction = async (provider: provider, txHash: string) => {
  const web3 = new Web3(provider);
  let txReceipt: TransactionReceipt | null = null;
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash);
    txReceipt = r;
    await sleep(2000);
  }
  return txReceipt.status;
};

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);

    const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

    gas.gas = 80000; // set custom low gas fee for this operation (approve)

    return tokenContract.methods
      .approve(spenderAddress, ethers.constants.MaxUint256)
      .send({ from: userAddress, ...gas }, async (error: any, txHash: string) => {
        if (error) {
          console.log("ERC20 could not be approved", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Approval transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.error("approve error", e);
    return false;
  }
};

export const sendUbq = async (userAddress: string, destinationAddress: string, ubqValue: string, provider: provider) => {
  try {
    const web3 = new Web3(provider);

    const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

    gas.gas = 21000 // gas specific to Ubiq send

    console.log("isSparrow");
    web3.eth.sendTransaction({
      to: destinationAddress,
      from: userAddress,
      value: ubqValue,
      ...gas,
    });
  } catch (e) {
    console.error("sendUbq error", e);
  }
};

export const sendTokens = async (userAddress: string, destinationAddress: string, tokensValue: string, tokenAddress: string, provider: provider) => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);

    const gas = window.ethereum?.isSparrow === true ? GAS.SPARROW : GAS.MM;

    gas.gas = 50000 // gas specific to Token send

    await tokenContract.methods.transfer(destinationAddress, tokensValue).send({
      from: userAddress,
      ...gas,
    });
  } catch (e) {
    console.error("sendTokens error", e);
  }
};

export const getAllowance = async (userAddress: string, spenderAddress: string, tokenAddress: string, provider: provider): Promise<string> => {
  // console.log("getAllowance");
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);
    const allowance: string = await tokenContract.methods.allowance(userAddress, spenderAddress).call();
    return allowance;
  } catch (e) {
    return "0";
  }
};

export const getEarnedAt = async (
  provider: provider,
  farmContractAddress: string,
  userAddress: string,
  atBlockHeight?: number
): Promise<BigNumber> => {
  const tokenContract = getFarmContract(provider, farmContractAddress);
  try {
    return new BigNumber(await tokenContract.methods.earned(userAddress).call(null, atBlockHeight)).dividedBy(new BigNumber(10).pow(18));
  } catch (e) {
    console.error("getEarned", e);
    return new BigNumber(0);
  }
};

export const getBalance = async (provider: provider, tokenAddress: string, userAddress: string, atBlockHeight?: number): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  try {
    const balance: string = await tokenContract.methods.balanceOf(userAddress).call(null, atBlockHeight);
    return balance;
  } catch (e) {
    console.error("getBalance", e);
    return "0";
  }
};

export const getBalanceAsBigNum = async (
  provider: provider,
  tokenAddress: string,
  userAddress: string,
  atBlockHeight?: number
): Promise<BigNumber> => {
  return new BigNumber(await getBalance(provider, tokenAddress, userAddress, atBlockHeight)).dividedBy(new BigNumber(10).pow(18));
};

export const getCoinBalance = async (provider: provider, userAddress: string): Promise<string> => {
  // console.log("getCoinBalance");
  try {
    const web3 = new Web3(provider);
    const balance: string = await web3.eth.getBalance(userAddress);

    return balance;
  } catch (e) {
    return "0";
  }
};

export const getCoinBalanceAsBigNum = async (provider: provider, userAddress: string): Promise<BigNumber> => {
  return new BigNumber(await getCoinBalance(provider, userAddress)).dividedBy(new BigNumber(10).pow(18));
};

export const getERC20Contract = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(ERC20ABI.abi as unknown as AbiItem, address);
  return contract;
};

export const getFarmContract = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(ShinobiPoolERC20.abi as unknown as AbiItem, address);
  return contract;
};

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber();
};

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals));
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18): string => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};

export const getShortDisplayBalance = (balance: BigNumber, fixedDec = 4, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed(fixedDec);
};

export const getNearestBlock = (from: Array<any>, target: number) => {
  return from.reduce(function (prev: any, curr: any) {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });
};

export const getAMPM = (date: any) => {
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  return ampm;
};

export const getTimestampDate = (obj: { ts: number; ap?: boolean }) => {
  const d = new Date(obj.ts * 1000);
  const s = ".";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear().toString().substring(0, 2) + (obj.ap ? " " + getAMPM(d) : "");
  return (day < 9 ? "0" + day : day) + s + (month <= 9 ? "0" + month : month) + s + year;
};

export const getReserves = async (provider: provider, tokenAddress: string, atBlockHeight?: number): Promise<IReserves> => {
  try {
    const tokenContract = getFarmContract(provider, tokenAddress);
    const { _reserve0, _reserve1, _blockTimestampLast } = await tokenContract.methods.getReserves().call(null, atBlockHeight);

    const ret = {
      token0: bnToDec(new BigNumber(_reserve0)),
      token1: bnToDec(new BigNumber(_reserve1)),
      timestamp: parseInt(_blockTimestampLast),
      ratio0over1: new BigNumber(_reserve0).dividedBy(new BigNumber(_reserve1)).toNumber(),
      ratio1over0: new BigNumber(_reserve1).dividedBy(new BigNumber(_reserve0)).toNumber(),
    };
    return ret;
  } catch (e) {
    console.error("getReserves error", e);
    throw new Error("unable to getReserves");
  }
};

export const getDailyRewardRate = async (provider: provider, tokenAddress: string): Promise<number> => {
  // console.log("getDailyRewardRate");

  try {
    const tokenContract = getFarmContract(provider, tokenAddress);
    const rewards = bnToDec(new BigNumber(await tokenContract.methods.rewardRate().call()));
    const rate: number = rewards * 60 * 60 * 24;
    return rate;
  } catch (e) {
    return -1;
  }
};

const isRewardsPaused = async (provider: provider, contractAddress: string): Promise<boolean> => {
  // console.log("isRewardsPaused");

  try {
    const web3 = new Web3(provider);
    const tokenContract = new web3.eth.Contract(ShinobiPoolERC20.abi as unknown as AbiItem, contractAddress);
    const pausedCall: boolean = await tokenContract.methods.paused().call();
    const periodFinish = await tokenContract.methods.periodFinish().call();

    const paused = pausedCall === true || periodFinish < Math.ceil(Date.now() / 1000);

    return paused;
  } catch (e) {
    console.error("isRewardsPaused error", e);
    return true;
  }
};

export const getTokenPrice = async (
  provider: provider,
  oraclePrice: number,
  poolLpTokenAddress: string,
  inverted: boolean = false
): Promise<ITokenPriceInfo> => {
  // console.log("getTokenPrice");

  const reserves = await getReserves(provider, poolLpTokenAddress);

  // DEBUG:
  // console.log("poolLpTokenAddress", poolLpTokenAddress);
  // console.log("inverted price", oraclePrice * reserves.ratio1over0);
  // console.log("non-invert price", oraclePrice * reserves.ratio0over1);
  // console.log("ratio1over0", reserves.ratio1over0);
  // console.log("ratio0over1", reserves.ratio0over1);
  // console.log("");

  let price = 0;
  if (inverted) {
    price = oraclePrice * reserves.ratio1over0;
  } else {
    price = oraclePrice * reserves.ratio0over1;
  }

  return {
    price: price,
    reserves: reserves,
  };
};

export interface ITokenPriceInfo {
  price: number;
  reserves: IReserves;
}

export interface IReserves {
  token0: number;
  token1: number;
  ratio0over1: number;
  ratio1over0: number;
  timestamp: number;
}

export interface ICurrentStats {
  poolTvl: number;
  farmApy: number;
  farmApr: number;
  farmTvl: number;
  accountPooledTokens: {
    token0: number;
    token1: number;
  };
  farmPooledTokens: {
    token0: number;
    token1: number;
  };
}

export interface ICirculatingSupply {
  // heldByMultisig: BigNumber;
  total: BigNumber;
}

export interface IDaoHoldings {
  ubq: BigNumber;
  ink: BigNumber;
  esch: BigNumber;
}

export const getDaoHoldings = async (provider: provider): Promise<IDaoHoldings> => {
  // Get coin and token holdings from the DAO multisig address and farming address
  const ubqHoldings = (await getCoinBalanceAsBigNum(provider, DAO_MULTISIG)).plus(await getCoinBalanceAsBigNum(provider, DAO_FARMING));
  const inkHoldings = (await getBalanceAsBigNum(provider, INK, DAO_MULTISIG)).plus(await getBalanceAsBigNum(provider, INK, DAO_FARMING));
  const eschHoldings = (await getBalanceAsBigNum(provider, ESCH, DAO_MULTISIG)).plus(await getBalanceAsBigNum(provider, ESCH, DAO_FARMING));

  // (unused currently) - Get lp holdings from the DAO multisig address and farming address
  // const ubqInkHoldings = (await getBalanceAsBigNum(provider, INK_UBQ_LPAddress, DAO_MULTISIG)).plus(
  //   await getBalanceAsBigNum(provider, INK_UBQ_LPAddress, DAO_FARMING)
  // );

  return {
    ubq: ubqHoldings,
    ink: inkHoldings,
    esch: eschHoldings,
  } as IDaoHoldings;
};

// Calculates the circulating INK supply based on the amount still held by
// the DAO minting address plus a sum of all of the individual farm holdings
export const getCirculatingSupply = async (provider: provider, inkTotalSupply: number): Promise<ICirculatingSupply> => {
  const totalSupply = new BigNumber(inkTotalSupply);

  // This address holds the minted INK which is yet to be distributed
  const INKMINTEDHOLDINGADDRESS = "0xB47D5874D2db5f398cfA0E53a5A020362F2AEAeF";

  // Grab all the individual INK quantities from each farm + the minting holding address
  let addresses = AvailableFarms.filter((farm) => farm.official === true).map((farm) => farm.yieldfarm.address);
  addresses.push(INKMINTEDHOLDINGADDRESS);

  let subtotal = new BigNumber(0);
  for (let i = 0; i < addresses.length; i++) {
    let balance = await getBalanceAsBigNum(provider, INK, addresses[i]);

    subtotal = subtotal.plus(balance);
  }

  // Total them up, and subtract them from the totalSupply
  const circulatingTotal = totalSupply.minus(subtotal);

  // console.log(
  //   "heldByDeployer:",
  //   heldByDeployer,
  //   "heldByUBQINK:",
  //   heldByUBQINK,
  //   "heldByGRANSUBQ:",
  //   heldByGRANSUBQ,
  //   "heldByUBQESCH:",
  //   heldByUBQESCH,
  //   "subtotal:",
  //   subtotal,
  //   "total:",
  //   circulatingTotal.toString()
  // );

  return {
    // heldByMultisig: heldByDeployer,
    total: circulatingTotal,
  } as ICirculatingSupply;
};

export const getInkTotalSupply = async (provider: provider) => {
  const contract = getERC20Contract(provider, INK);

  try {
    let totalSupply = new BigNumber(await contract.methods.totalSupply().call()).dividedBy(new BigNumber(10).pow(18));
    return totalSupply.toNumber();
  } catch (e) {
    console.error("getInkTotalSupply", e);
    return 0;
  }
};

export interface IDailyTransactions {
  count: number;
}

export const getDailyTransactions = async (provider: provider): Promise<IDailyTransactions> => {
  if (provider === undefined || provider === null) {
    return { count: 0 };
  }
  // console.log("getDailyTransactions");

  const web3 = new Web3(provider);

  const oneDayInSeconds = 60 * 60 * 24;
  const blockTime = 22;
  const oneDayInBlocks = Math.floor(oneDayInSeconds / blockTime);

  const currentBlock = await web3.eth.getBlockNumber();
  let totalTxs = 0;

  // get all of the addresses of the farm contracts + INK token address
  let addresses = AvailableFarms.filter((farm) => farm.official === true).map((farm) => farm.yieldfarm.address);
  addresses.push(INK);

  for (let i = 0; i < addresses.length; i++) {
    let contract = getFarmContract(provider, addresses[i]);

    try {
      let txs = await contract.getPastEvents("allEvents", { fromBlock: currentBlock - oneDayInBlocks });

      totalTxs = totalTxs + txs?.length;
    } catch (e) {
      console.error("getDailyTransactions() threw error:", e);
    }
  }

  return {
    count: totalTxs,
  } as IDailyTransactions;
};

export const getCurrentStats = async (
  provider: provider,
  token0Price: number,
  token1Price: number,
  rewardTokenPrice: number,
  reserves: IReserves,
  poolLpTokenAddress: string,
  farmContractAddress: string,
  totalFarmLPSupply: BigNumber,
  lpPercent: BigNumber,
  farmToPoolLPRatio: BigNumber
): Promise<ICurrentStats> => {
  try {
    // console.log("getCurrentStats");

    const isPaused = await isRewardsPaused(provider, farmContractAddress);
    const dailyTokenRewardEmissions = await getDailyRewardRate(provider, farmContractAddress);
    const poolTvl = reserves.token0 * token0Price + reserves.token1 * token1Price;
    const farm_token0 = farmToPoolLPRatio.toNumber() * reserves.token0;
    const farm_token1 = farmToPoolLPRatio.toNumber() * reserves.token1;
    const account_token0 = lpPercent.toNumber() * farm_token0;
    const account_token1 = lpPercent.toNumber() * farm_token1;
    const farmTvl = farm_token0 * token0Price + farm_token1 * token1Price;
    const DAYS_IN_YR = 365;
    const APY_COMPOUNDS = DAYS_IN_YR * 2;
    const farmApr = ((rewardTokenPrice * dailyTokenRewardEmissions * DAYS_IN_YR) / farmTvl) * 100;
    const farmApy = (Math.pow(1 + farmApr / 100 / APY_COMPOUNDS, APY_COMPOUNDS) - 1) * 100;

    // DEBUG: all the log statements for debug that make sense to have. if statement filters the info by address to reduce noise/mistakes
    // if (farmContractAddress === "0x2f161631b3622881EB7125f3243A4CF35271dE02") {
    // console.log('=======')
    // console.log("daily emissions", dailyTokenRewardEmissions);
    // console.log("token price", rewardTokenPrice);
    // console.log("token0 price", token0Price);
    // console.log("token1 price", token1Price);
    // console.log("token0", reserves.token0);
    // console.log("token1", reserves.token1);
    // console.log('lpPercent', lpPercent.toNumber())
    // console.log('token0 / token1', reserves.ratio0over1)
    // console.log("totalFarmLPSupply", bnToDec(totalFarmLPSupply));
    // console.log("est lp supply", Math.sqrt(reserves.token0 * reserves.token1));
    // // console.log("lp ratio", poolLpCalcRatio);
    // console.log("pool tvl", poolTvl);
    // console.log("");
    // console.log("poolLpTokenAddress", poolLpTokenAddress);
    // console.log("farmContractAddress", farmContractAddress);
    // console.log("farm token0", farm_token0);
    // console.log("farm token1", farm_token1);
    // console.log("farm tvl", farmTvl);
    // console.log("farm apr", farmApr);
    // console.log("farm apy", farmApy);
    // console.log('')
    // }

    return {
      poolTvl: poolTvl,
      farmApy: isPaused === true ? 0 : farmApy,
      farmApr: isPaused === true ? 0 : farmApr,
      farmTvl: farmTvl,
      accountPooledTokens: {
        token0: account_token0,
        token1: account_token1,
      },
      farmPooledTokens: {
        token0: farm_token0,
        token1: farm_token1,
      },
    } as ICurrentStats;
  } catch (e) {
    console.error("getCurrentStats error", e);
    throw e;
  }
};

export const sendUbqEthers = async (userAddress: string, destinationAddress: string, ubqValue: number, provider: any) => {
  // console.log("sending a tx from:", userAddress, "to:", destinationAddress, "with value:", ubqValue);
  let signer;

  // provider and signer are separate, so we need to fetch the signer (metamask)
  try {
    signer = provider.getSigner();
  } catch (e) {
    console.error("sendUbqEthers() threw error while getting signer:", e, signer);
    return;
  }

  const preparedTx = {
    from: userAddress,
    to: destinationAddress,
    value: ethers.utils.parseUnits(ubqValue.toString()).toHexString(),
  };

  let signedTx;

  try {
    signedTx = await signer.sendTransaction(preparedTx);
  } catch (e: any) {
    if (e.code === -32603) {
      console.error("Insufficient Funds, need:", ubqValue, "code: ", e.code);
      alert(`Insufficient funds. This action costs ${ubqValue} UBQ plus gas.`);
      return;
    } else if (e.code === 4001) {
      console.error("User rejected transaction", e.code);
      return;
    }
    console.error(
      "sendUbqEthers() threw unexpected error while signing or waiting, please lookup this error and write a routine for it:",
      e,
      signedTx
    );
    return;
  }

  // return just the hash
  return signedTx.hash;
};

export const waitForTransaction = async (provider: any, txHash: string) => {
  let txResult;
  try {
    txResult = await provider.waitForTransaction(txHash, TxConfirmationBlocks);
  } catch (e) {
    console.error("waitForTransaction() failed with error:", e);
    return null;
  }

  return txResult;
};

export const checkReceipt = async (provider: any, txHash: string) => {
  let receiptResult;
  try {
    receiptResult = await provider.getTransactionReceipt(txHash);
    // console.log("receipt:", receiptResult)

    if (receiptResult) {
      return receiptResult.confirmations;
    }
    return -1; // if there's not a receipt yet that's a special case we check for
  } catch (e) {
    console.error("checkReceipt() threw error:", e);
  }
};
