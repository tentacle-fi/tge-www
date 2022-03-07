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
        name: methods[i].name.substring(0, methods[i].name.indexOf("(")),
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
  // erc20
  { id: "095ea7b3", name: "approve(address _spender, uint256 _value)" },
  { id: "42966c68", name: "burn(uint256 _value)" },
  { id: "79cc6790", name: "burnFrom(address _from, uint256 _value)" },
  { id: "66188463", name: "decreaseApproval(address _spender, uint256 _subtractedValue)" },
  { id: "7d64bcb4", name: "finishMinting()" },
  { id: "d73dd623", name: "increaseApproval(address _spender, uint256 _addedValue)" },
  { id: "40c10f19", name: "mint(address _to, uint256 _amount)" },
  { id: "f2fde38b", name: "transferOwnership(address newOwner)" },
  { id: "a9059cbb", name: "transfer(address _to, uint256 _value)" },
  { id: "23b872dd", name: "transferFrom(address _from, address _to, uint256 _value)" },
  // multisig (Fusion)
  { id: "173825d9", name: "removeOwner(address _owner)" },
  { id: "5c52c2f5", name: "resetSpentToday()" },
  { id: "7065cb48", name: "addOwner(address _owner)" },
  { id: "797af627", name: "confirm(bytes32 _h)" },
  { id: "b20d30a9", name: "setDailyLimit(uint256 _newLimit)" },
  { id: "b61d27f6", name: "execute(address _to, uint256 _value, bytes _data)" },
  { id: "b75c7dc6", name: "revoke(bytes32 _operation)" },
  { id: "ba51a6df", name: "changeRequirement(uint256 _newRequired)" },
  { id: "c2cf7326", name: "hasConfirmed(bytes32 _operation, address _owner)" },
  { id: "cbf0b0c0", name: "kill(address _to)" },
  { id: "f00d4b5d", name: "changeOwner(address _from, address _to)" },
  // escher
  { id: "4e71d92d", name: "claim()" },
  { id: "0121b93f", name: "vote(uint256 candidate)" },
  // trex user wallet
  { id: "6ea056a9", name: "sweep(address _token, uint256 _amount)" },
  { id: "c0ee0b8a", name: "tokenFallback(address _from, uint256 _value, bytes _data)" },
  // trex controller
  { id: "19449cb2", name: "changeAuthorizedCaller(address _newCaller)" },
  { id: "28090abb", name: "logSweep(address from, address to, address token, uint256 amount)" },
  { id: "3c18d318", name: "sweeperOf(address _token)" },
  { id: "5e949fa0", name: "changeDestination(address _dest)" },
  { id: "5ed7ca5b", name: "halt()" },
  { id: "77bb09eb", name: "addSweeper(address _token, address _sweeper)" },
  { id: "a6f9dae1", name: "changeOwner(address _owner)" },
  { id: "a9b1d507", name: "makeWallet()" },
  { id: "be9a6555", name: "start()" },
  // Erc20.exchange
  { id: "04804ee8", name: "sell(string token, uint256 amount, uint256 price)" },
  { id: "06909f69", name: "cancel(string token, uint256 index)" },
  { id: "07da68f5", name: "stop()" },
  { id: "1dffdbe6", name: "trade(string token, uint256 maker, uint256 taker)" },
  { id: "7b8bf4fd", name: "set_fee(uint256 the_maker_fee, uint256 the_taker_fee, uint256 the_deploy_fee)" },
  { id: "7cb97b2b", name: "set_owner(address new_owner)" },
  { id: "9b0a5e67", name: "buy(string token, uint256 amount, uint256 price)" },
  { id: "9d2cd67c", name: "collect_main_fee()" },
  { id: "b2f05133", name: "set_trader(address new_trader)" },
  { id: "c5346fb1", name: "approve_coin(string coin, bool approved)" },
  { id: "e142400e", name: "createToken(string symbol, string name, address coin_address, uint8 decimals)" },
  { id: "e7b1a7ae", name: "collect_fee(string token)" },
  { id: "e95d74e0", name: "set_coin_minimum_trade(string token, uint256 the_minimum_trade)" },
  { id: "eca6e42d", name: "set_minimum_trade(uint256 the_minimum_trade)" },
  { id: "f29f7b1b", name: "remove_coin(uint256 index)" },
  { id: "f780d867", name: "add_coin(string coin, string name, address base, uint8 digits)" },
  // tornado.cash
  { id: "b214faa5", name: "deposit(bytes32 _commitment)" },
  {
    id: "21a0adb6",
    name: "withdraw(bytes _proof, bytes32 _root, bytes32 _nullifierHash, address _recipient, address _relayer, uint256 _fee, unit256 _refund)",
  },
  { id: "97fc007c", name: "updateVerifier(address _newVerifier)" },
  { id: "06394c9b", name: "changeOperator(address _newOperator)" },
  // uniswap-v2-core
  { id: "c9c65396", name: "createPair(address tokenA, address tokenB)" },
  { id: "f46901ed", name: "setFeeTo(address _feeTo)" },
  { id: "a2e74af6", name: "setFeeToSetter(address _feeToSetter)" },
  { id: "89afcb44", name: "burn(address to)" },
  { id: "485cc955", name: "initialize(address _token0, address _token1)" },
  { id: "6a627842", name: "mint(address to)" },
  { id: "d505accf", name: "permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)" },
  { id: "bc25cf77", name: "skim(address to)" },
  { id: "022c0d9f", name: "swap(uint256 amount0out, uint256 amount1Out, address to, bytes data)" },
  { id: "fff6cae9", name: "sync()" },
  // uniswap-v2-periphery
  {
    id: "e8e33700",
    name: "addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)",
  },
  {
    id: "f305d719",
    name: "addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, uint256 deadline)",
  },
  {
    id: "baa2abde",
    name: "removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)",
  },
  {
    id: "02751cec",
    name: "removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline)",
  },
  {
    id: "af2979eb",
    name: "removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline)",
  },
  {
    id: "ded9382a",
    name: "removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)",
  },
  {
    id: "5b0d5984",
    name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)",
  },
  {
    id: "2195995c",
    name: "removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, unit256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)",
  },
  { id: "fb3bdb41", name: "swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)" },
  { id: "7ff36ab5", name: "swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)" },
  { id: "b6f9de95", name: "swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)" },
  { id: "18cbafe5", name: "swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)" },
  {
    id: "791ac947",
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
  },
  { id: "38ed1739", name: "swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)" },
  {
    id: "5c11d795",
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
  },
  { id: "4a25d94a", name: "swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)" },
  { id: "8803dbee", name: "swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)" },
  // staking rewards
  { id: "a694fc3a", name: "stake(uint256 amount)" },
  { id: "2e1a7d4d", name: "withdraw(uint256 amount)" },
  { id: "3d18b912", name: "getReward()" },
  { id: "e9fad8ee", name: "exit()" },
  // ERC1155
  { id: "a22cb465", name: "setApprovalForAll(address operator, bool approved)" },
  { id: "f242432a", name: "safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)" },
  { id: "2eb2c2d6", name: "safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)" },

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
