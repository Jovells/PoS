// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    function decimals() public pure override returns(uint8){
        return 6;
    }
    constructor() ERC20("USDT", "USDT") {
        _mint(msg.sender, 10000 * 10**decimals());
    }

    function mint() external {
        _mint(msg.sender, 1000 * 10**decimals());
    }
    function mintTo(address to, uint256 amount) external {
        _mint(to, amount);
    }
}