// import { ethers, Contract } from 'ethers';
// import posAbi from './abi.js';
// import { createPublicClient, getContract, http } from 'viem';
// import { polygonMumbai } from 'viem/chains';

// const provider = ethers.getDefaultProvider('https://rpc.ankr.com/polygon_mumbai');

// const chain = polygonMumbai;
// const publicClient = createPublicClient({
//   chain,
//   transport: http(),
// });

// const contract = new Contract('0x69a52de020299d9904177abe12c08546b99b3518', posAbi, provider);
// const numProducts = await contract.numProducts();

// const bln = await provider.getBlockNumber();

// const filter = contract.filters.Sale;
// const events = await contract.queryFilter(filter, 41322992, 41322992);

// export const posContract = getContract({
//   address: '0x69a52de020299d9904177abe12c08546b99b3518',
//   abi: posAbi,
//   publicClient,
// });

// const viemnumProducts = await posContract.read.numProducts();

// const viemEvents = await publicClient.getContractEvents({ 
//   address: '0x69a52de020299d9904177abe12c08546b99b3518',
//   abi: posAbi,
//   eventName: 'Sale',
//   fromBlock: 41322992,
//   toBlock: 41322992
// })

// console.log('bln', bln, 'numproducts', numProducts, 
// 'events', events, 'viemEvents', viemEvents,
// 'viemnumProducts', viemnumProducts
// );
