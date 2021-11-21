import {INK, GRANS } from "farms/AvailableFarms"

export default function metamask() {
  let ethereum = window.ethereum;

  document.addEventListener("DOMContentLoaded", documentReady, false);
  function documentReady() {
    console.log("ready");

    setTimeout(async () => {
      ethereum = window.ethereum;

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x8" }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        switch (switchError.code) {
          case 4902:
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x8",
                    rpcUrls: ["https://rpc.octano.dev"],
                    chainName: "UBQ",
                    blockExplorerUrls: ["https://ubiqscan.io"],
                    iconUrls: ["https://ubiqsmart.com/favicon.ico", "https://ubiqsmart.com/logo.svg"],
                    nativeCurrency: {
                      name: "UBQ",
                      symbol: "UBQ",
                      decimals: 18,
                    },
                  },
                ],
              });
            } catch (addError) {
              // handle "add" error
              console.error("add UBQ network to MetaMask failed", addError);
            }

            break;
          case -32002:
            console.log("awaiting previous request to switch to this chain/network.");
            break;
          default:
            console.error("wallet_switchEthereumChain error code:", switchError.code, switchError.message);
        }
      }
    }, 1);
  }
}

export async function addInkToWallet() {
  await addTokenToWallet("INK", INK, "ink.png");
}

export async function addGransToWallet() {
  await addTokenToWallet("GRANS", GRANS, "grans.png");
}

async function addTokenToWallet(tokenSymbol, tokenAddress, tokenIconUrl) {
  const tokenDecimals = 18;

  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals,
          image: window.location.protocol + "//" + window.location.host + "/tokens/" + tokenIconUrl,
        },
      },
    });

    if (wasAdded) {
      console.log("Thanks for adding");
    } else {
      console.log("not added");
    }
  } catch (error) {
    console.log(error);
  }
}
