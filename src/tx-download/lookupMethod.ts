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
    name: "swapExactETHForTokens(...)", // TODO
    id: "7ff36ab5",
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
];

export default lookupMethod;
