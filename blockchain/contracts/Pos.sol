// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PointOfSale {
    address public owner;  // The owner of the contract
    uint256 public totalSales;  // Total sales amount
    uint256 public numTransactions;  // Total number of transactions
    IERC20 usdt;

    // Acceptable payment methods
    enum PayMethod {
        ETH,
        USDT
    }

    // Struct to represent a product
    struct Product {
        uint256 id;
        // string name;
        uint256 price;
    }

    // Struct to rep a sale
    struct Receipt {
        uint256 id;
        address buyer;
        uint256 productId;
        uint256 quantity;
        uint256 totalAmount;
    }

    // Mapping to store products by their IDs
    mapping(uint256 => Product) public products;

    // Mapping to track the inventory of each product
    mapping(uint256 => uint256) public productInventory;

    // Mapping to keep track of product sales
    mapping(uint256 => uint256) public productSales;

    // Mapping to track receipts
    mapping(uint256 => Receipt) public receipts;

    // Event to log sales transactions
    event Sale(address indexed buyer, uint256 productId, uint256 quantity, uint256 totalAmount, PayMethod payMethod);

    // Event to log refunds
    event Refund(address indexed buyer, uint256 productId, uint256 totalAmount);

    event ProductAdded(uint256 productId, string name, uint256 price, string imageUrl);

    constructor(address paymentTokenAddress) {
        owner = msg.sender;
        // set payment ERC20 token
        usdt = IERC20(paymentTokenAddress);
    }

    // Function to add a product to the store
    function addProduct(uint256 _productId, string memory _name, uint256 _price, uint256 _initialInventory, string memory _imageUrl) public {
        require(msg.sender == owner, "Only the owner can add products");
        require(products[_productId].id == 0, "Product ID already exists");

        products[_productId] = Product(_productId, _name, _price);
        productInventory[_productId] = _initialInventory;
        emit ProductAdded(_productId, _name, _price, _imageUrl);
    }

    function _purchaseProductWithStable(uint256 _productId, uint256 _quantity, uint256 _amount) private {
        require(usdt.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }

    function _purchaseProductWithEther(uint256 _productId, uint256 _quantity, uint256 _amount) private {
        require(msg.value >= _amount, "Insufficient funds");
    }

    // Function to purchase a product
    function purchaseProduct(uint256 _productId, uint256 _quantity, PayMethod _payMethod) public payable {
        require(products[_productId].id != 0, "Product does not exist");
        require(productInventory[_productId] >= _quantity, "Insufficient inventory");
        uint256 totalPrice = products[_productId].price * _quantity;

        if(_payMethod == PayMethod.ETH) {
            _purchaseProductWithEther(_productId, _quantity, totalPrice);
        } else if (_payMethod == PayMethod.USDT) {
            _purchaseProductWithStable(_productId, _quantity, totalPrice);
        }

        // Update inventory and sales data
        productInventory[_productId] -= _quantity;
        productSales[_productId] += _quantity;
        totalSales += totalPrice;
        receipts[numTransactions] = Receipt(numTransactions, msg.sender, _productId, _quantity, totalPrice);
        numTransactions++;
        
        // Emit a sale event
        emit Sale(msg.sender, _productId, _quantity, totalPrice, _payMethod);
    }

    // Function to issue a refund
    function refund(uint256 _receiptId) external {
        require(_receiptId < numTransactions, "Invalid receipt");
        Receipt memory _receipt = receipts[_receiptId];
        require(_receipt.buyer == msg.sender, "Only buyer can get a refund");

        uint256 _productId = _receipt.productId;
        uint256 _quantity = _receipt.quantity;
        uint256 _totalAmount = _receipt.totalAmount;

        // update sales stuff
        productInventory[_productId] += _quantity;
        productSales[_productId] -= _quantity;
        totalSales -= _totalAmount;

        // issue refund
        payable(msg.sender).transfer(_totalAmount); // unsafe, should include checks to make sure there's a balance

        emit Refund(msg.sender, _productId, _totalAmount);
    }

    // Function to withdraw funds from the contract (only the owner can do this)
    function withdrawFunds(uint256 _amount) public {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        require(_amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(_amount);
    }
}