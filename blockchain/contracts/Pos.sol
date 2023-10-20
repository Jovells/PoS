// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract Pos {
    address public owner;  // The owner of the contract
    uint256 public totalSales;  // Total sales amount
    uint256 public numSales;  // Total number of transactions
    uint256 public numRefunds;  // Total number of refunds
    uint256 public numProducts; // total number of product
    // uint256 public CONVERSION_RATE = 1950000000000;
    address public PRICE_ORACLE_ADDRESS = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    address public MOCK_USDT_ADDRESS = 0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363;
    uint256 public storeId;

    function setMockUSDTAndPriceOracleAddress(address _MOCK_USDT_ADDRESS, address _PRICE_ORACLE_ADDRESS) public{
        require(msg.sender == owner, "Only the Owner can perform this operation");
        PRICE_ORACLE_ADDRESS = _PRICE_ORACLE_ADDRESS;
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

    enum TransactionType{
        sale,
        refund
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
        bool refunded; 
    }

    // Mapping to store products by their IDs
    mapping(uint256 => Product) public products;

    // Mapping to track the inventory of each product
    // mapping(uint256 => uint256) public productInventory;

    // Mapping to keep track of product sales
    // Mapping to track receipts
    mapping(uint256 => Receipt) public receipts;


    // Event to log sales transactions
    event SaleOrRefund(address indexed buyer, TransactionType transactionType, uint256 indexed receiptId, uint256 productId, uint256 quantity, uint256 totalAmount, PayMethod payMethod);

    event ProductAdded(uint256 productId, string name, uint256 price, uint256 initialInventory, string imageUrl);

    constructor( address _owner, uint256 _storeId, address _MOCK_USDT_ADDRESS, address _PRICE_ORACLE_ADDRESS) {
        owner = _owner;
        // set payment ERC20 token
        MOCK_USDT_ADDRESS = _MOCK_USDT_ADDRESS;
        // set price oracle
        PRICE_ORACLE_ADDRESS = _PRICE_ORACLE_ADDRESS;
        // set store id
        storeId = _storeId;
    }

    function getProducts(uint256 start, uint256 end) public view returns (Product[] memory) {
        require(start <= end, "Invalid range");
        if (end > numProducts) {
            end = numProducts;
        }
        uint256 quantity = end - start + 1;
        Product[] memory _products = new Product[](quantity);
        for (uint256 i = 0; i < numProducts; i++) {
            _products[i] = products[i + 1];
        }
        return _products;
    }

    function getReceipts(uint256 start, uint256 end) public view returns (Receipt[] memory) {
        require(start <= end, "Invalid range");
        if (end > numSales) {
            end = numSales;
        }
        uint256 quantity = end - start + 1;
        Receipt[] memory _receipts = new Receipt[](quantity);
        for (uint256 i = 0; i < numSales; i++) {
            _receipts[i] = receipts[i + 1];
        }
        return _receipts;
    }

    //get a user's receipts
    function getBuyerReceipts(address _buyer, uint256 start, uint256 end) public view returns (Receipt[] memory) {
        require(start <= end, "Invalid range");
        if (end > numSales) {
            end = numSales;
        }
        uint256 quantity = end - start + 1;
        Receipt[] memory _receipts = new Receipt[](quantity);
        uint256 j = 0;
        for (uint256 i = 0; i < numSales; i++) {
            if (receipts[i + 1].buyer == _buyer){
                _receipts[j] = receipts[i + 1];
                j++;
            }
        }
        return _receipts;
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
        numSales++;
        receipts[numSales] = Receipt(numSales, msg.sender, _productId, _quantity, totalPrice, _payMethod, false);
        
        // Emit a sale event
        emit SaleOrRefund(msg.sender, TransactionType.sale, numSales, _productId, _quantity, totalPrice, _payMethod);
    }

    // Function to issue a refund
    function refund(uint256 _receiptId) external onlyOwner {
        require(_receiptId <= numSales, "Invalid receipt");
        Receipt memory _receipt = receipts[_receiptId];
        require(_receipt.refunded == false, "Purchase already refunded");

        uint256 _productId = _receipt.productId;
        uint256 _quantity = _receipt.quantity;
        uint256 _totalAmount = _receipt.totalAmount;
        receipts[_receiptId].refunded = true;

        // update sales stuff
        products[_productId].quantity += _quantity;
        products[_productId].sales -= _quantity;
        totalSales -= _totalAmount;
        numRefunds++;

        // issue refund
        if (_receipt.payMethod == PayMethod.ETH){
            require( address(this).balance >= _totalAmount , "insufficient balance for refund");
            payable(_receipt.buyer).transfer(_totalAmount);
        }
        else if (_receipt.payMethod == PayMethod.USDT){
            require( IERC20(MOCK_USDT_ADDRESS).balanceOf(address(this)) >= _totalAmount , "insufficient balance for refund");
            IERC20(MOCK_USDT_ADDRESS).transfer(_receipt.buyer, _receipt.totalAmount);
        }

        emit SaleOrRefund(msg.sender, TransactionType.refund , _receiptId, _productId, _quantity, _totalAmount, _receipt.payMethod);
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