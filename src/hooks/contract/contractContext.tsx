// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Account, WalletClient, createPublicClient, decodeEventLog, getContract, http } from 'viem';
import priceOracleAbi from './priceOracleAbi';
import usdtAbi from './usdtAbi';
import posAbi from './posAbi';
import { polygonMumbai } from 'viem/chains';
import { useQuery, useIsRestoring } from '@tanstack/react-query';
import { Typography } from '@mui/material';
import DashboardLayout from 'src/layouts/dashboard';
import { useLocation } from 'react-router-dom';

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
  buyer: string;
  productId: bigint;
  quantity: bigint;
  totalAmount: bigint;
  payMethod: number;
};

function getFromLocalStorage(key) {
  try {
    return (
      JSON.parse(localStorage.getItem(key), (k, v) =>
        typeof v === 'string' && v.endsWith('n') ? BigInt(v.slice(0, -1)) : v
      ) || []
    );
  } catch (e) {
    return [];
  }
}

const chain = polygonMumbai;
const publicClient = createPublicClient({
  chain,
  transport: http(),
});

const posContract = getContract({
  address: '0x69a52de020299d9904177abe12c08546b99b3518',
  abi: posAbi,
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
  account: any;
  posOwner: string;
  posContract: typeof posContract;
  priceOracleContract: typeof priceOracleContract;
  publicClient: typeof publicClient;
  usdtContract: typeof usdtContract;
  products: Array<Product>;
  isOwner: boolean;
  isLoading: boolean;
  orders: Array<Order>;
};

export const MyContext = createContext({} as ContractContextType);

export default function ContractContext({ children }) {
  const location = useLocation();
  const account = useAccount();
  const [walletClient, setWalletClient] = useState<WalletClient>(null);
  const [[posOwner, isOwner], setPosOwner] = useState([]);
  const [[newPosContract, newUsdtContract, newPriceOracleContract], setContracts] = useState([
    posContract,
    priceOracleContract,
    usdtContract,
  ]);
  const {
    data: products,
    status,
    error,
  } = useQuery<Array<Product>>(['products'], getProducts, {
    initialData: () => getFromLocalStorage('products'),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !location.pathname.includes('/orders'),
  });

  // const orders= []
  const {
    data: orders,
    status: orderStatus,
    error: orderError,
  } = useQuery<Array<Product>>(['orders'], getOrders, {
    initialData: () => getFromLocalStorage('orders'),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: location.pathname.includes('/orders'),
  });


  useEffect(() => {
    async function getWalletClient() {
      const w = await account.connector?.getWalletClient({ chainId: chain.id });
      console.log('w', w);
      setContracts([
        getContract({
          address: '0x69a52de020299d9904177abe12c08546b99b3518',
          abi: posAbi,
          publicClient,
          walletClient: w,
        }),

        getContract({
          address: '0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363',
          abi: usdtAbi,
          publicClient,
          walletClient: w,
        }),
        getContract({
          address: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
          abi: priceOracleAbi,
          publicClient,
          walletClient: w,
        }),
      ]);

      console.log('walletClient', w);

      setWalletClient(w);
    }

    if (account) {
      getWalletClient();
    }
    async function getPosOwner() {
      const posOwner = await posContract.read.owner();
      console.log('posOwner', posOwner);
      setPosOwner([posOwner, posOwner === account.address]);
      
      window.pos = posContract;
    }
    if (!posOwner) {
      getPosOwner();

    }
  }, [walletClient?.chain?.id, walletClient?.account.address, account.connector]);

  //fetch products
  async function getOrders() {
    const batchSize = 1000n;
    const fromBlock = 41242665n;
    // const fromBlock = 	41322722n;
    const toBlock = await publicClient.getBlockNumber();
    const numTransactions = await posContract.read.numTransactions();
    console.log('numTransactions', numTransactions);
    let ords = [];

    if (!orders || numTransactions > orders.length) {
      for (let i = fromBlock; i <= toBlock; i += batchSize) {
        
        const logs = await posContract.getEvents.Sale({
          fromBlock: i,
          toBlock: i + batchSize - 1n,
        });

        console.log(i + 'th order log', logs);

        for (let log of logs) {
          const l = decodeEventLog({
            abi: posContract.abi,
            data: log.data,
            topics: log.topics,
          });
          // const [buyer, productId, quantity, totalPrice, payMethod] = l.args;

          const o = { ...l.args };

          ords.push(o);
        }

        if (ords.length >= numTransactions) {
          console.log('break');
          break;
        }
      }
      const ordersFromMostRecent = ords.reverse();
      console.log('ordersFromMostRecent', ordersFromMostRecent);
      localStorage.setItem(
        'orders',
        JSON.stringify(ordersFromMostRecent, (k, v) =>
          typeof v === 'bigint' ? v.toString() + 'n' : v
        )
      );
      return ordersFromMostRecent;
    }
    return orders;
  }
  async function getProducts() {
    const batchSize = 1000n;
    const fromBlock = 41242665n;
    const toBlock = await publicClient.getBlockNumber();
    const numProducts = await posContract.read.numProducts();
    console.log('numProducts', numProducts);
    let prods = [];

    if (!products || numProducts > products.length) {
      for (let i = fromBlock; i <= toBlock; i += batchSize) {
        const logs = await posContract.getEvents.ProductAdded({
          fromBlock: i,
          toBlock: i + batchSize - 1n,
        });
        console.log(i + 'th log', logs);

        for (let log of logs) {
          const l = decodeEventLog({
            abi: posContract.abi,
            data: log.data,
            topics: log.topics,
          });
          const [price, quantity, sales] = await posContract.read.products([l.args.productId]);

          const p = { ...l.args, quantity, sales, price };

          prods = [...prods, p];
        }

        if (prods.length >= numProducts) {
          break;
        }
      }
      const productsFromMostRecent = prods.reverse();
      localStorage.setItem(
        'products',
        JSON.stringify(productsFromMostRecent, (k, v) =>
          typeof v === 'bigint' ? v.toString() + 'n' : v
        )
      );
      return productsFromMostRecent;
    }
    return products;
  }

  if (status === 'loading') {
    return <Typography>Loading</Typography>;
  }

  if (status === 'success') {
    console.log('success', products);
  }

  if (status === 'error') {
    console.log('err', error);
  }

  return (
    <MyContext.Provider
      value={{
        account,
        isOwner,
        posOwner,
        posContract: newPosContract,
        priceOracleContract: newPriceOracleContract,
        publicClient,
        usdtContract: newUsdtContract,
        products,
        orders,
        isLoading: status === 'loading',
      }}
    >
      {children}
    </MyContext.Provider>
  );
}
