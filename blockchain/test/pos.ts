import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { PublicClient, getAddress, WalletClient, parseGwei, GetContractReturnType } from "viem";

describe("Pos", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  let deployPos = async () => {

    const PRICE_ORACLE_ADDRESS = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    const MOCK_USDT_ADDRESS = "0x77D670bd1363AC1c28f312139f68e66daeaab9d1";

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();


    const usdt = await hre.viem.deployContract("MockUSDT", []);
    const priceOracle = await hre.viem.deployContract("PriceOracle");
    const pos = await hre.viem.deployContract("Pos", [usdt.address, priceOracle.address]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      pos,
      usdt,
      priceOracle,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right usdt address", async function () {
      const { pos,
        usdt,
        priceOracle,
        owner,
        otherAccount,
        publicClient,
      } = await loadFixture(deployPos);

      expect((await pos.read.MOCK_USDT_ADDRESS()).toLowerCase()).to.equal(usdt.address.toLowerCase());
    });

    it("Should set the right owner", async function () {
      const { pos, owner } = await loadFixture(deployPos);

      expect((await pos.read.owner()).toLowerCase()).to.equal(getAddress(owner.account.address).toLowerCase());
    });

    it("Should set the right price Oracle address", async function () {
      const { pos, priceOracle } = await loadFixture(
        deployPos
      );

      expect((await pos.read.PRICE_ORACLE_ADDRESS()).toLocaleLowerCase()).to.equal(priceOracle.address.toLowerCase());

    });

  });

  describe("main", function () {
    it("should allow ecommerce", async function () {
      const payMethods = { USDT: 1, ETH: 0 }
      const [productName, productPrice, initialProductInventory, productImageUrl] = ["test", BigInt(10*10**6), BigInt(10), "test.com"]
      const { pos, usdt, priceOracle, otherAccount, owner, publicClient } = await loadFixture(deployPos);
      const hash = await pos.write.addProduct([productName, productPrice, initialProductInventory, productImageUrl]);
      const usdtAsOtherAccount = await hre.viem.getContractAt(
        "MockUSDT",
        usdt.address,
        { walletClient: otherAccount }
      );
      await publicClient.waitForTransactionReceipt({ hash });
      let receiptId : bigint;
      const [productId, purchaseQuantity] = [BigInt(1), BigInt(1)];
      const posAsOtherAccount = await hre.viem.getContractAt(
        "Pos",
        pos.address,
        { walletClient: otherAccount }
      );
      const [,exchangeRate] = await priceOracle.read.latestRoundData();
      const totalEthPurchacePrice = purchaseQuantity* productPrice * (BigInt(1e20) / exchangeRate);
      
      describe("actions", function () {
        
        it("Should add a product", async function () {
          const product = await pos.read.products([BigInt(1)]);
          expect(product).to.deep.equal([productPrice, initialProductInventory, BigInt(0)]);
        });


        it("should purchase a product with usdt", async function () {
          const [price, productQuantityBefore, sales] = await posAsOtherAccount.read.products([BigInt(1)]);
          usdtAsOtherAccount.write.mint();
          usdtAsOtherAccount.write.approve([pos.address, price * purchaseQuantity]);
          const hash = await posAsOtherAccount.write.purchaseProduct([productId, purchaseQuantity, payMethods.USDT]);
          await publicClient.waitForTransactionReceipt({ hash });
          console.log(5)

          const [_, productQuantityAfter, _1] = await pos.read.products([BigInt(1)]);

          expect(productQuantityAfter).to.equal(productQuantityBefore - BigInt(1));
          receiptId = await pos.read.numTransactions();
          const purchaseReceipt = await pos.read.receipts([BigInt(1)]);

          expect(purchaseReceipt).to.deep.equal(
            [receiptId,
              getAddress(otherAccount.account.address),
              productId,
              purchaseQuantity,
              price * purchaseQuantity,
              payMethods.USDT
            ])

        })
        it("should be able to refund usdt", async function () {
          const buyerBalanceBefore = await usdtAsOtherAccount.read.balanceOf([otherAccount.account.address])
          const hash = await pos.write.refund([receiptId]);
          const buyerBalanceAfter = await usdtAsOtherAccount.read.balanceOf([otherAccount.account.address])
          const receipt =  await publicClient.waitForTransactionReceipt({ hash });
          const productAFter = await pos.read.products([productId]);
          expect(productAFter).to.deep.equal([productPrice, initialProductInventory, BigInt(0)]);
          expect(buyerBalanceAfter).to.equal(buyerBalanceBefore + (productPrice * purchaseQuantity))
        })

        it("should be able to purchase with eth", async function(){
            const [price, productQuantityBefore, salesBefore] = await posAsOtherAccount.read.products([BigInt(1)]);
            const hash = await posAsOtherAccount.write.purchaseProduct([productId, purchaseQuantity, payMethods.ETH], {value: totalEthPurchacePrice});
            // await publicClient.waitForTransactionReceipt({ hash });
            
            const [_, productQuantityAfter, _1] = await pos.read.products([BigInt(1)]);
            
            expect(productQuantityAfter).to.equal(productQuantityBefore - BigInt(1));
            receiptId = await pos.read.numTransactions();
            const purchaseReceipt = await pos.read.receipts([receiptId]);
            console.log("price: ", price, "purchaseQuantity ", purchaseQuantity, "exchangeRate",  exchangeRate )
  
            expect(purchaseReceipt).to.deep.equal(
              [ receiptId,
                getAddress(otherAccount.account.address),
                productId,
                purchaseQuantity,
                totalEthPurchacePrice,
                payMethods.ETH
              ])
  
          

        })
        it("should be able to refund with eth", async function(){
          const buyerBalanceBefore = await publicClient.getBalance({address: otherAccount.account.address});
          const hash = await pos.write.refund([receiptId]);
          const buyerBalanceAfter = await publicClient.getBalance({address: otherAccount.account.address});
          const receipt =  await publicClient.waitForTransactionReceipt({ hash });
          const productAFter = await pos.read.products([productId]);
          expect(productAFter).to.deep.equal([productPrice, initialProductInventory, BigInt(0)]);
          expect(buyerBalanceAfter).to.equal(buyerBalanceBefore + totalEthPurchacePrice)

        })


      })



    })





    //   describe("Validations", function () {
    //     it("Should revert with the right error if called too soon", async function () {
    //       const { pos: lock } = await loadFixture(deployPos);

    //       await expect(lock.write.withdraw()).to.be.rejectedWith(
    //         "You can't withdraw yet"
    //       );
    //     });

    //     it("Should revert with the right error if called from another account", async function () {
    //       const { pos: lock, unlockTime, otherAccount } = await loadFixture(
    //         deployPos
    //       );

    //       // We can increase the time in Hardhat Network
    //       await time.increaseTo(unlockTime);

    //       // We retrieve the contract with a different account to send a transaction
    //       const lockAsOtherAccount = await hre.viem.getContractAt(
    //         "Lock",
    //         lock.address,
    //         { walletClient: otherAccount }
    //       );
    //       await expect(lockAsOtherAccount.write.withdraw()).to.be.rejectedWith(
    //         "You aren't the owner"
    //       );
    //     });

    //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
    //       const { pos: lock, unlockTime } = await loadFixture(
    //         deployPos
    //       );

    //       // Transactions are sent using the first signer by default
    //       await time.increaseTo(unlockTime);

    //       await expect(lock.write.withdraw()).to.be.fulfilled;
    //     });
    //   });

    //   describe("Events", function () {
    //     it("Should emit an event on withdrawals", async function () {
    //       const { pos: lock, unlockTime, lockedAmount, publicClient } =
    //         await loadFixture(deployPos);

    //       await time.increaseTo(unlockTime);

    //       const hash = await lock.write.withdraw();
    //       await publicClient.waitForTransactionReceipt({ hash });

    //       // get the withdrawal events in the latest block
    //       const withdrawalEvents = await lock.getEvents.Withdrawal()
    //       expect(withdrawalEvents).to.have.lengthOf(1);
    //       expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
    //     });
    //   });
  });
});
