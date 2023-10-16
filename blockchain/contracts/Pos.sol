// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract Pos {
    address public owner;  // The owner of the contract
    uint256 public totalSales;  // Total sales amount
    uint256 public numTransactions;  // Total number of transactions
    uint256 public numProducts; // total number of product
    // uint256 public CONVERSION_RATE = 1950000000000;
    address public PRICE_ORACLE_ADDRESS = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
    address public MOCK_USDT_ADDRESS = 0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363;

    function setPriceOracleAddress (address _PRICE_ORACLE_ADDRESS) public onlyOwner{
        PRICE_ORACLE_ADDRESS = _PRICE_ORACLE_ADDRESS;
    }

    function setMockUSDTAddress (address _MOCK_USDT_ADDRESS) public onlyOwner{
        MOCK_USDT_ADDRESS = _MOCK_USDT_ADDRESS;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only the Owner can perform this operation");
        _;
    }


    // Acceptable payment methods
    enum PayMethod {
        ETH,
        USDT
    }

    // Struct to represent a product
    struct Product {
        uint256 price;
        uint256 quantity;
        uint256 sales;
    }

    // Struct to rep a sale
    struct Receipt {
        uint256 id;
        address buyer;
        uint256 productId;
        uint256 quantity;
        uint256 totalAmount;
        PayMethod payMethod;   
    }

    // Mapping to store products by their IDs
    mapping(uint256 => Product) public products;

    // Mapping to track the inventory of each product
    // mapping(uint256 => uint256) public productInventory;

    // Mapping to keep track of product sales
    // Mapping to track receipts
    mapping(uint256 => Receipt) public receipts;

    // Event to log sales transactions
    event Sale(address indexed buyer, uint256 productId, uint256 quantity, uint256 totalAmount, PayMethod payMethod);

    // Event to log refunds
    event Refund(address indexed buyer, uint256 productId, uint256 totalAmount, PayMethod paymethod);

    event ProductAdded(uint256 productId, string name, uint256 price, uint256 initialInventory, string imageUrl);

    constructor(address _MOCK_USDT_ADDRESS, address _PRICE_ORACLE_ADDRESS) {
        owner = msg.sender;
        // set payment ERC20 token
        MOCK_USDT_ADDRESS = _MOCK_USDT_ADDRESS;
        // set price oracle
        PRICE_ORACLE_ADDRESS = _PRICE_ORACLE_ADDRESS;
    }

    // Function to add a product to the store
    function addProduct(string memory _name, uint256 _price, uint256 _initialInventory, string memory _imageUrl) public onlyOwner{
        require(msg.sender == owner, "Only the owner can add products");

        products[++numProducts] = Product( _price, _initialInventory, 0);
        emit ProductAdded(numProducts, _name, _price, _initialInventory, _imageUrl);
    }

    function _purchaseProductWithStable(uint256 _amount) private {
        require(IERC20(MOCK_USDT_ADDRESS).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }

    function _purchaseProductWithEther( uint256 _amount) private returns(uint256) {
        uint256 latestPrice = GetLastestPrice();
        require(msg.value >= _amount * (1e20 / latestPrice), "Insufficient funds");
        return msg.value;
    }

    function GetLastestPrice() public view returns (uint){
        AggregatorV3Interface Price = AggregatorV3Interface(PRICE_ORACLE_ADDRESS);
        (,int256 price,,,) = Price.latestRoundData();
        return uint(price);
    }

    // Function to purchase a product
    function purchaseProduct(uint256 _productId, uint256 _quantity, PayMethod _payMethod) public payable {
        require(products[_productId].quantity >= _quantity, "Insufficient inventory or product does not exist");
        uint256 totalPrice = products[_productId].price * _quantity;

        if(_payMethod == PayMethod.ETH) {
            totalPrice = _purchaseProductWithEther(totalPrice);
        } else if (_payMethod == PayMethod.USDT) {
            _purchaseProductWithStable(totalPrice);
        }

        // Update inventory and sales data
        products[_productId].quantity -= _quantity;
        products[_productId].sales += _quantity;
        totalSales += totalPrice;
        numTransactions++;
        receipts[numTransactions] = Receipt(numTransactions, msg.sender, _productId, _quantity, totalPrice, _payMethod);
        
        // Emit a sale event
        emit Sale(msg.sender, _productId, _quantity, totalPrice, _payMethod);
    }

    // Function to issue a refund
    function refund(uint256 _receiptId) external onlyOwner {
        require(_receiptId <= numTransactions, "Invalid receipt");
        Receipt memory _receipt = receipts[_receiptId];

        uint256 _productId = _receipt.productId;
        uint256 _quantity = _receipt.quantity;
        uint256 _totalAmount = _receipt.totalAmount;

        // update sales stuff
        products[_productId].quantity += _quantity;
        products[_productId].sales -= _quantity;
        totalSales -= _totalAmount;

        // issue refund
        if (_receipt.payMethod == PayMethod.ETH){
            require( address(this).balance >= _totalAmount , "insufficient balance for refund");
            payable(_receipt.buyer).transfer(_totalAmount);
        }
        else if (_receipt.payMethod == PayMethod.USDT){
            require( IERC20(MOCK_USDT_ADDRESS).balanceOf(address(this)) >= _totalAmount , "insufficient balance for refund");
            IERC20(MOCK_USDT_ADDRESS).transfer(_receipt.buyer, _receipt.totalAmount);
        }

        emit Refund(msg.sender, _productId, _totalAmount, _receipt.payMethod);
    }

    // Function to withdraw funds from the contract (only the owner can do this)
    function withdrawFunds(uint256 _amount, PayMethod _currency, address _to) public onlyOwner {
        if (_currency == PayMethod.ETH){
            require( address(this).balance >= _amount , "insufficient balance");
            payable(_to).transfer(_amount);
        }
        else if (_currency == PayMethod.USDT){
            require( IERC20(MOCK_USDT_ADDRESS).balanceOf(address(this)) >= _amount , "insufficient balance");
            IERC20(MOCK_USDT_ADDRESS).transfer(_to, _amount);
        }

    }
}