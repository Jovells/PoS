// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract PriceOracle {
    function latestRoundData() public pure returns (uint256, uint256, uint256, uint256, uint256){
        return (0, 155598473898, 0, 0, 0);
    }
}