import { INK } from "farms/AvailableFarms";

export async function switchToUBQNetwork() {
  let ethereum = window.ethereum;

  try {
    await ethereum.request({ method: "eth_requestAccounts" });
  } catch (e) {
    console.error("eth_requestAccounts error", e);
  }

  try {
    return await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x8" }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    switch (switchError.code) {
      case 4902:
        try {
          return await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                // settings match https://chainlist.org/ which resolves an warning/error to the users of MetaMask
                chainId: "0x8",
                rpcUrls: ["https://rpc.octano.dev"],
                chainName: "Ubiq",
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
      case -32061:
        console.log("request failed. rpc request doesn't exist for this wallet.");
        break;
      default:
        console.error("wallet_switchEthereumChain error code:", switchError.code, switchError.message);
    }

    return Promise.reject();
  }
}

// convenience function for the Help page
export async function addInkToWallet() {
  await addTokenToWallet("INK", INK, "ink.png");
}

export async function addTokenToWallet(tokenSymbol, tokenAddress, tokenIconUrl) {
  let ethereum = window.ethereum;
  const tokenDecimals = 18;

  try {
    const wasAdded = await ethereum.request({
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
