import {  createPublicClient, WalletClient, getContract, http } from 'viem';
import priceOracleAbi from './priceOracleAbi';
import usdtAbi from './usdtAbi';
import posAbi from './posAbi';
import { polygonMumbai } from 'viem/chains';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ContractContextType } from './contractContext';

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


export default function usePosAccount() : ContractContextType {
    const account = useAccount();
    const [walletClient, setWalletClient] = useState<WalletClient>(null);
    const [[posOwner, isOwner], setPosOwner] = useState<Array<any>>([]);
    const [[newPosContract, newUsdtContract, newPriceOracleContract], setContracts] = useState([
        posContract,
        priceOracleContract,
        usdtContract,
    ]);

useEffect(() => {
    console.log('account', account);
    async function getWalletClient() {
      const w = await account.connector?.getWalletClient({ chainId: chain.id });
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
    }
    if (!posOwner) {
      getPosOwner();
    }
  }, [walletClient?.chain?.id, walletClient?.account.address]);

  return { account, posOwner, posContract: newPosContract, priceOracleContract: newPriceOracleContract, publicClient, usdtContract: newUsdtContract, isOwner };
}