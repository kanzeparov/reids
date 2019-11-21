pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


contract Token is MintableToken {
    string public symbol;
    string public name;
    uint8 public decimals;

    constructor() public {
        symbol = "REIDS18";
        name = "REIDSCoin_v18";
        decimals = 9;
           }
}
