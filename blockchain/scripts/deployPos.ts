import { formatEther, parseEther } from "viem";
import hre from "hardhat";

async function main() {
  const usdtAddress = "0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363";
  const priceOracleAddress = "0x0715A7794a1dc8e42615F059dD6e406A6594651A"

  const pos = await hre.viem.deployContract("Pos", [usdtAddress, priceOracleAddress]);

  console.log(
    `Pos deployed to ${pos.address}. Usdt address: ${usdtAddress}. Price oracle address: ${priceOracleAddress}.
    run 
    npx hardhat verify --network mumbai "${pos.address}" "${usdtAddress}" "${priceOracleAddress}"
    to verify the contract on the blockchain.
    `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
