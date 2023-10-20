// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Pos.sol";

contract PosFactory {
    address public owner;
    uint256 public numStores;
    mapping(uint256 => address) public stores;
    mapping(address => uint256[]) public ownerStores;
    address public PRICE_ORACLE_ADDRESS = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    address public MOCK_USDT_ADDRESS = 0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363;

    event PosDeployed(address indexed posAddress, uint256 storeId, address indexed owner);

    constructor() {
        owner = msg.sender;
    }

    struct Store{
        address posAddress;
        address owner;
        uint256 storeId;
        uint256 totalSales;
        uint256 numProducts;
    }

    function setMockUSDTAndPriceOracleAddress(address _MOCK_USDT_ADDRESS, address _PRICE_ORACLE_ADDRESS) public{
        require(msg.sender == owner, "Only the Owner can perform this operation");
        PRICE_ORACLE_ADDRESS = _PRICE_ORACLE_ADDRESS;
        MOCK_USDT_ADDRESS = _MOCK_USDT_ADDRESS;
    }

    function getStores(uint256 start, uint256 end) public view returns (Store[] memory) {
        require(start <= end, "Invalid range");
        if (end > numStores) {
            end = numStores;
        }
        if (start < 1) {
            start = 1;
        }
        uint256 quantity = end - start + 1;
        Store[] memory _stores = new Store[](quantity);
        for (uint256 i = 0; i < numStores; i++) {
        Pos _store = Pos(stores[i + 1]) ;
            _stores[i] = Store(address(_store), _store.owner(), _store.storeId(), _store.totalSales(), _store.numProducts() );
        }
        return _stores;
    }

    function getOwnerStores(address _owner) public view returns (Store[] memory) {
        uint256[] memory _ownerStores = ownerStores[_owner];
        uint256 quantity = _ownerStores.length;
        Store[] memory _stores = new Store[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            Pos _store = Pos(stores[_ownerStores[i]]) ;
            _stores[i] = Store(address(_store), _store.owner(), _store.storeId(), _store.totalSales(), _store.numProducts() );
        }
        return _stores;
    }

    function deployPos() public  {
        Pos pos = new Pos(msg.sender, ++numStores, MOCK_USDT_ADDRESS,  PRICE_ORACLE_ADDRESS);
        stores[numStores] = address(pos);
        ownerStores[msg.sender].push(numStores);
        emit PosDeployed(address(pos), numStores, msg.sender);
    }

}