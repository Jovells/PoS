// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Account, WalletClient, createPublicClient, decodeEventLog, getContract, http, zeroAddress } from 'viem';
import priceOracleAbi from './priceOracleAbi';
import usdtAbi from './usdtAbi';
import posAbi from './posAbi';
import { polygonMumbai } from 'viem/chains';
import { useQuery, useIsRestoring } from '@tanstack/react-query';
import { Typography } from '@mui/material';
import DashboardLayout from 'src/layouts/dashboard';
import { useLocation, useParams } from 'react-router-dom';
import { posFactoryAddress, priceOracleAddress, transactionTypes, usdtAddress } from 'src/constants';
import posFactoryAbi from './posFactoryAbi';

export type Product = {
  productId: bigint;
  name: string;
  initialInventory: bigInt;
  price: bigint;
  quantity: bigint;
  sales: bigint;
  imageUrl: string;
};
export type Order = {
  transactionHash: string;
  timestamp: bigint;
  buyer: string;
  productId: bigint;
  quantity: bigint;
  totalAmount: bigint;
  payMethod: number;
};

export function getFromLocalStorage(key, buster) {
  try {
    if(buster){
      oldBuster = localStorage.getItem(key+'buster')
      oldBuster !== buster && localStorage.setItem(key +'buster', buster)
      localStorage.removeItem(key)
      return []
    }
    let value =  (
      JSON.parse(localStorage.getItem(key), (k, v) =>
        typeof v === 'string' && v.endsWith('n') ? BigInt(v.slice(0, -1)) : v
      ) || []
    );
    return value
  } catch (err) {
    console.log(err)
    return null;
  }
}
export function saveToLocalStorage(key, value, buster) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value, (k, v) =>
        typeof v === 'bigint' ? v.toString() + 'n' : v
      )
    );
    if(buster){
      localStorage.setItem(key+'buster', buster)
    }
  } catch (err) {
    console.log(err)
  }
}

const chain = polygonMumbai;
const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const posContract = getContract({
  // address: zeroAddress,
  abi: posAbi,
  publicClient,
});
export const posFactoryContract = getContract({
  address: posFactoryAddress,
  abi: posFactoryAbi,
  publicClient,
});

const usdtContract = getContract({
  address: '0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363',
  abi: usdtAbi,
  publicClient,
});

const priceOracleContract = getContract({
  address: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
  abi: priceOracleAbi,
  publicClient,
});

type ContractContextType = {
  account: any
  posOwner: string;
  posContract: typeof posContract;
  posFactoryContract: typeof posFactoryContract;
  priceOracleContract: typeof priceOracleContract;
  publicClient: typeof publicClient;
  usdtContract: typeof usdtContract;
  products: Array<Product>;
  isOwner: boolean;
  isLoading: boolean;
  orders: Array<Order>;
  mineStatus: 'mined' | 'mining' | 'error';
  setMineStatus: (status: 'mined' | 'mining' | 'error') => void;
  routeLinks: {
    dashboard: string;
    orders: string;
    products: string;
    stores: string;
    createStore: string;
    productDetails: string;
  };
  pageType: 'admin' | 'user';
  isLoadingProducts: boolean;
  isFetchingOrders: boolean;
};

export const MyContext = createContext({} as ContractContextType);

export default function ContractContext({ children }) {
  const location = useLocation();
  const params = useParams();
  const account = useAccount();
  const [[posOwner, isOwner], setPosOwner] = useState([]);
  const [[newPosContract, newPosFactoryContract, newUsdtContract, newPriceOracleContract], setContracts] = useState([
    posContract,
    posFactoryContract,
    priceOracleContract,
    usdtContract,
  ]);
  const productsQuery = 'products' + newPosContract.address;
  const ordersQuery = 'orders' + newPosContract.address;
  const {
    isFetching,
    isInitialLoading,
    isLoading,
    data: products,
    status,
    error,
  } = useQuery<Array<Product>>([productsQuery], getProducts, {
    initialData: () => getFromLocalStorage(productsQuery),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: location.pathname.includes('/products') && !!newPosContract.address,
  });
  const [mineStatus, setMineStatus] = useState<'mined' | 'mining' | 'error'>('mined');
  
  //routeCounfig
  const pageType = location.pathname.startsWith('/admin')? 'admin' : 'user'
  const base = '/'+ pageType + `/posAddress/`+  params.posAddress;
  const routeLinks = {
    dashboard: base + `/dashboard/`,
    orders: base + `/orders/`,
    products: base + `/products/`,
    stores: `/stores/`,
    createStore: `/createStore/`,
    productDetails: base + `/products/productDetails/`,
}


  // const orders= []
  const {
    isFetching : isFetchingOrders,
    isInitialLoading: isInitialLoadingOrders,
    isLoading : isLoadingOrders,
    data: orders,
    status: orderStatus,
    error: orderError,
  } = useQuery<Array<Product>>([ordersQuery], getOrders, {
    initialData: () => getFromLocalStorage(ordersQuery) || [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: location.pathname.includes('/orders') && !!newPosContract.address,
  });

    //fetch products
    async function getOrders() {
      const batchSize = 1000n;
      // const fromBlock = 41242665n;
      const fromBlock = 	41424112n;
      const numRefunds = await newPosContract.read.numRefunds() || 0n;
      const numSales = await newPosContract.read.numSales();
  
      console.log("hhhhhh",orders, numSales, numRefunds);
      const oldNumRefunds = BigInt(localStorage.getItem(ordersQuery +'buster')||0)
      const oldOrdersLength = BigInt (orders?.length || 0);
      console.log('odlNumRefunds', oldNumRefunds);
      if  ((numRefunds <= oldNumRefunds) && (numSales === oldOrdersLength)) return orders || [];
        console.log('did')
      
      let newOrders = [];
      const toBlock = await publicClient.getBlockNumber();
      const isUserPage = pageType === 'user';
      const args =  isUserPage && {buyer: account.address}
      if(isUserPage){
        const userOrders = orders?.filter(order=> order.buyer === account.address)
      }

        for (let i = fromBlock; i <= toBlock; i += batchSize) {
          const logs = await publicClient.getContractEvents({ 
            address: newPosContract.address,
            abi: posAbi,
            eventName: 'SaleOrRefund',
            fromBlock: i,
            toBlock: i + batchSize - 1n,
            args
          })
  
          console.log(i + 'th order log', logs);
  
          
          for (let log of logs) {
            const block = await publicClient.getBlock(
              {blockNumber: log.blockNumber}
              );
            const newOrder = { ...log.args, transactionHash: log.transactionHash, timestamp: block.timestamp };
  
            if(newOrder.transactionType === transactionTypes.refund){
              const saleOrderIndex = newOrders.findIndex((ord) => ord.receiptId === newOrder.receiptId)
              newOrders[saleOrderIndex]= newOrder
            }else{
              newOrders.push(newOrder);
            }
  
          }
  
          if (newOrders.length >= numSales) {
            console.log('break');
            break;
          }
        }
        const ordersFromMostRecent = newOrders.reverse();
        console.log('ordersFromMostRecent', ordersFromMostRecent);

        saveToLocalStorage(
          ordersQuery,
          ordersFromMostRecent,
          numRefunds.toString()
        );
        return ordersFromMostRecent;
      
 
    }
    async function getProducts() {
      const batchSize = 1000n;
      const fromBlock = 	41401920n;
      const toBlock = await publicClient.getBlockNumber();
      const numProducts = await newPosContract.read.numProducts();
      console.log('numProducts', numProducts);
      let prods = [];
  
      if (!products || numProducts > products.length) {
        for (let i = fromBlock; i <= toBlock; i += batchSize) {
          const logs = await newPosContract.getEvents.ProductAdded({
            fromBlock: i,
            toBlock: i + batchSize - 1n,
          });
          console.log(i + 'th log', logs);
  
          for (let log of logs) {
            const l = decodeEventLog({
              abi: newPosContract.abi,
              data: log.data,
              topics: log.topics,
            });
            const [price, quantity, sales] = await newPosContract.read.products([l.args.productId]);
  
            const p = { ...l.args, quantity, sales, price };
  
            prods = [...prods, p];
          }
  
          if (prods.length >= numProducts) {
            break;
          }
        }
        const productsFromMostRecent = prods.reverse();
  
        saveToLocalStorage(productsQuery, productsFromMostRecent);
        return productsFromMostRecent;
      }
      return products;
    }
  
  useEffect(() => {
    async function getWalletClient() {
      const w = await account.connector?.getWalletClient({ chainId: chain.id });
      console.log('w', params, account);
      setContracts([
        getContract({
          address: params.posAddress,
          abi: posAbi,
          publicClient,
          walletClient: w,
        }),
        getContract({
          address: posFactoryAddress,
          abi: posFactoryAbi,
          publicClient,
          walletClient: w,
        }),

        getContract({
          address: usdtAddress,
          abi: usdtAbi,
          publicClient,
          walletClient: w,
        }),
        getContract({
          address: priceOracleAddress,
          abi: priceOracleAbi,
          publicClient,
          walletClient: w,
        }),
      ]);

      console.log('walletClient', w);
    }

    if (account) {
      getWalletClient();
    }

  }, [account.address, account.connector, params.posAddress]);

  useEffect(() => {
    async function getPosOwner() {
      if (newPosContract.address === zeroAddress || !newPosContract.address ) return
      const posOwner = await newPosContract.read.owner();
      console.log('posOwner', posOwner);
      setPosOwner([posOwner, posOwner === account.address]);
      
      window.pos = newPosContract;
    }
    
      getPosOwner();

  
  },[newPosContract.address])


  if (status === 'loading') {
    console.log('loading')
  }

  if (status === 'success') {
    console.log('success', products);
  }

  if (status === 'error') {
    console.log('err', error);
  }
  if (orderStatus === 'loading') {
    console.log('loadingOrders')
  }

  if (orderStatus === 'success') {
    console.log('successOrders', orders);
  }

  if (orderStatus === 'error') {
    console.log('err', orderError);
  }

  console.log('posAddress', newPosContract.address,{
    isLoadingOrders,
    isFetchingOrders,
    isInitialLoadingOrders,  
  })

  return (
    <MyContext.Provider
      value={{
        account,
        isOwner,
        posOwner,
        posContract: newPosContract,
        priceOracleContract: newPriceOracleContract,
        posFactoryContract: newPosFactoryContract,
        publicClient,
        usdtContract: newUsdtContract,
        products,
        orders,
        isLoading: status === 'loading' || orderStatus === 'loading',
        mineStatus,
        setMineStatus,
        routeLinks,
        pageType,
        isFetchingOrders,
        isLoadingProducts: status === 'loading',
      }}
    >
      {children}
    </MyContext.Provider>
  );
}
