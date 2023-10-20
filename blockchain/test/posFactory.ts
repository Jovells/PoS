import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { PublicClient, getAddress, WalletClient, parseGwei, GetContractReturnType, decodeEventLog } from "viem";

describe("PosFactory", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  let deployPosFactory = async () => {

    const PRICE_ORACLE_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    const MOCK_USDT_ADDRESS = "0x77D670bd1363AC1c28f312139f68e66daeaab9d1";

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const posFactory = await hre.viem.deployContract("PosFactory");

    const publicClient = await hre.viem.getPublicClient();

    return {
      posFactory,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    // it("Should set the right usdt address", async function () {
    //   const { posFactory,
    //     usdt,
    //     priceOracle,
    //     owner,
    //     otherAccount,
    //     publicClient,
    //   } = await loadFixture(deployPosFactory);

    //   expect((await posFactory.read.MOCK_USDT_ADDRESS()).toLowerCase()).to.equal(usdt.address.toLowerCase());
    // });

    it("Should set the right owner", async function () {
      const { posFactory, owner } = await loadFixture(deployPosFactory);

      expect((await posFactory.read.owner()).toLowerCase()).to.equal(getAddress(owner.account.address).toLowerCase());
    });


  });

  describe("main", function () {
    it("Should create a new pos", async function () {
      const { posFactory, publicClient, owner, otherAccount } = await loadFixture(deployPosFactory);

      const posFactoryAsOtherAccount = await hre.viem.getContractAt(
        "PosFactory",
        posFactory.address,
        { walletClient: otherAccount }
      );

      const hash = await posFactoryAsOtherAccount.write.deployPos();
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const log = decodeEventLog({
        abi: posFactory.abi,
        data: receipt.logs[0].data,
        topics: receipt.logs[0].topics,
      });
      console.log(log);

      const posAddress = await posFactoryAsOtherAccount.read.stores([1n]);
      const ownerStores = await posFactoryAsOtherAccount.read.getOwnerStores([otherAccount.account.address]);
      const stores = await posFactoryAsOtherAccount.read.getStores([0n, 2n]);
      console.log('ownerStores from factory',ownerStores);
      console.log('stores from factory',stores);
      expect(ownerStores[0].storeId).to.equal(1n);
      expect(posAddress).to.not.equal(0n);
      expect(log.args.owner.toLowerCase()).to.equal(getAddress(otherAccount.account.address).toLowerCase());
    })

  })
})



