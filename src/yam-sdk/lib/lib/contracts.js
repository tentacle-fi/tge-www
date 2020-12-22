import BigNumber from "bignumber.js/bignumber";
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from "./constants.js";

import YAMJson from "../clean_build/contracts/YAMDelegator.json";

import YAMRebaserJson from "../clean_build/contracts/YAMRebaser.json";
import YAMRebaser2Json from "../clean_build/contracts/YAMRebaser2.json";

import WETHJson from "./weth.json";
import UNIFactJson from "./unifact2.json";
import UNIPairJson from "./uni2.json";
import UNIRouterJson from "./uniR.json";

import VotingIncJson from "../clean_build/contracts/YAMIncentivizerWithVoting.json";

import YAMv3Json from "../clean_build/contracts/YAMDelegatorV3.json";
import YAMLogic2Json from "../clean_build/contracts/YAMDelegate2.json";

export class Contracts {
  constructor(provider, networkId, web3, options) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);
    this.yam = new this.web3.eth.Contract(YAMJson.abi);

    this.voting_eth_pool = new this.web3.eth.Contract(VotingIncJson.abi);

    this.TGE1 = new this.web3.eth.Contract(YAMLogic2Json.abi);

    this.rebaser = new this.web3.eth.Contract(YAMRebaserJson.abi);
    this.eth_rebaser = new this.web3.eth.Contract(YAMRebaser2Json.abi);
    this.weth = new this.web3.eth.Contract(WETHJson);
    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }

  setProvider(provider, networkId) {
    this.yam.setProvider(provider);
    this.rebaser.setProvider(provider);
    const contracts = [
      { contract: this.yam, json: YAMJson },
      { contract: this.rebaser, json: YAMRebaserJson },
      { contract: this.eth_rebaser, json: YAMRebaser2Json },
      { contract: this.TGE1, json: YAMv3Json },
    ];

    contracts.forEach((contract) => this.setContractProvider(contract.contract, contract.json, provider, networkId));
    this.uni_fact.options.address = addressMap["uniswapFactoryV2"];
    this.uni_router.options.address = addressMap["UNIRouter"];
    this.voting_eth_pool.options.address = "0x8F8c66370f05DB40ea1f7F5a2064c588920e8599";
    this.eth_rebaser.options.address = "0xD93f403b432d39aa0f736C2021bE6051d85a1D55";

    this.names = {};
    this.names[this.yam.options.address] = "YAMv1";
    this.names[this.rebaser.options.address] = "Rebaser";
    this.names[this.TGE1.options.address] = "TGE1";
    this.names[this.eth_rebaser.options.address] = "ETH Rebaser";
    this.names[this.voting_eth_pool.options.address] = "ESCH/UBQ Shinobi LP Yield Farm";
  }

  setDefaultAccount(account) {
    this.yam.options.from = account;
    this.weth.options.from = account;
  }

  async callContractFunction(method, options) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = "0";
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise((resolve, reject) => {
        promi.on("error", (error) => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });

        promi.on("transactionHash", (txHash) => {
          if (hashOutcome === OUTCOMES.INITIAL) {
            hashOutcome = OUTCOMES.RESOLVED;
            resolve(txHash);
            if (t !== Types.ConfirmationType.Both) {
              const anyPromi = promi;
              anyPromi.off();
            }
          }
        });
      });
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise((resolve, reject) => {
        promi.on("error", (error) => {
          if ((t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED) && confirmationOutcome === OUTCOMES.INITIAL) {
            confirmationOutcome = OUTCOMES.REJECTED;
            reject(error);
            const anyPromi = promi;
            anyPromi.off();
          }
        });

        const desiredConf = confirmations || this.defaultConfirmations;
        if (desiredConf) {
          promi.on("confirmation", (confNumber, receipt) => {
            if (confNumber >= desiredConf) {
              if (confirmationOutcome === OUTCOMES.INITIAL) {
                confirmationOutcome = OUTCOMES.RESOLVED;
                resolve(receipt);
                const anyPromi = promi;
                anyPromi.off();
              }
            }
          });
        } else {
          promi.on("receipt", (receipt) => {
            confirmationOutcome = OUTCOMES.RESOLVED;
            resolve(receipt);
            const anyPromi = promi;
            anyPromi.off();
          });
        }
      });
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
        this.notifier.hash(transactionHash);
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
      this.notifier.hash(transactionHash);
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(method, options) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock("latest");
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(contract, contractJson, provider, networkId) {
    contract.setProvider(provider);
    try {
      contract.options.address = contractJson.networks[networkId] && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
