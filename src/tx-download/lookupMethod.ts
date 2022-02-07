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
    name: "swapExactETHForTokens(...)",
    id: "7ff36ab5",
  },
  {
    name: "swapETHForExactTokens(...)",
    id: "fb3bdb41",
  },
  {
    name: "approve(...)",
    id: "095ea7b3",
  },
  {
    name: "addLiquidityETH(...)",
    id: "f305d719",
  },
  {
    name: "stake(...)",
    id: "a694fc3a",
  },
  {
    name: "TokenGallery::mintCollection?()",
    id: "4757382c",
  },
  {
    name: "TokenGallery::mintNFT?()",
    id: "dd615fcd",
  },
];

export default lookupMethod;
