//
// Purpose: Look Up a keccak hashed methodID and return the details if the hash is known
//
// Details include: name of method, method hash
//

interface IMethod {
  name: string;
  id: string;
}

interface IMethodResult extends IMethod {
  found: boolean;
}

// TODO: check for duplicate methodid's and names

const lookupMethod = (methodId: string): IMethodResult => {
  for (let i = 0; i < methods.length; i++) {
    if (methods[i].id === methodId) {
      return {
        ...methods[i],
        found: true,
      };
    }
  }

  return {
    found: false,
    name: "Unknown",
    id: "",
  };
};

// TODO: get all functions we need to look for from Uniswap v2 router contract docs
// https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokenssupportingfeeontransfertokens
//
// to find the keccak hash of the method: https://gchq.github.io/CyberChef/#recipe=Find_/_Replace(%7B'option':'Simple%20string','string':'uint'%7D,'uint256',true,false,true,false)Find_/_Replace(%7B'option':'Regex','string':'%5C%5Cn'%7D,'',true,false,true,false)Find_/_Replace(%7B'option':'Simple%20string','string':'%20'%7D,'',true,false,true,false)Keccak('256')&input=c3dhcEV4YWN0VG9rZW5zRm9yVG9rZW5zU3VwcG9ydGluZ0ZlZU9uVHJhbnNmZXJUb2tlbnMoCiAgdWludCwKICB1aW50LAogIGFkZHJlc3NbXSwKICBhZGRyZXNzLAogIHVpbnQKKQ
//
// TODO: pull from: https://raw.githubusercontent.com/octanolabs/spectrum-interface/master/scripts/contracts.js
const methods: Array<IMethod> = [
  {
    name: "getReward()",
    id: "3d18b912",
  },
  {
    name: "stake(...)",
    id: "a694fc3a",
  },
  {
    name: "transfer(...)",
    id: "a9059cbb",
  },
  {
    name: "swapExactETHForTokens(...)", // TODO
    id: "7ff36ab5",
  },
  {
    name: "swapTokensForExactTokens", // TODO
    id: "8803dbee",
  },
  {
    name: "swapExactTokensForTokens(...)", // TODO
    id: "38ed1739",
  },
  {
    name: "swapTokensForExactETH(...)",
    id: "4a25d94a",
  },
  {
    name: "swapETHForExactTokens(...)",
    id: "fb3bdb41",
  },
  {
    name: "approve(...)", // TODO
    id: "095ea7b3",
  },
  {
    name: "addLiquidityETH(...)", // TODO - WIP
    id: "f305d719",
  },
  {
    name: "addLiquidity(...)", // TODO
    id: "e8e33700",
  },
  {
    name: "TokenGallery::mintCollection?()", // TODO
    id: "4757382c",
  },
  {
    name: "TokenGallery::mintNFT?()", // TODO
    id: "dd615fcd",
  },
  {
    name: "TokenGallery::soldNFTForUBQ()",
    id: "243adbdd",
  },
  {
    name: "TokenGallery::soldNFTForERC20()",
    id: "cae9ca51",
  },
  {
    name: "Enmaku::withdraw(...)", // TODO
    id: "21a0adb6",
  },
];

export default lookupMethod;
