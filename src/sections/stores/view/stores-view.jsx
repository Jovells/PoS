import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'src/routes/hooks';
import { bgGradient } from 'src/theme/css';
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import useContracts from 'src/hooks/contract/useContracts';
import { useAccount, useQuery } from 'wagmi';
import { Button, Card, CardActionArea, Divider } from '@mui/material';
import posFactoryAbi from 'src/hooks/contract/posFactoryAbi';
import { decodeEventLog } from 'viem';
import { useSearchParams } from 'react-router-dom';
import Address from 'src/components/address';
import { RouterLink } from 'src/routes/components';
import { getFromLocalStorage, saveToLocalStorage } from 'src/hooks/contract/contractContext';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

// ----------------------------------------------------------------------

export default function CreateStoreView() {
  const account = useAccount();
  const { posFactoryContract, publicClient } = useContracts();
  const theme = useTheme();

  const router = useRouter();

  const {data: stores} = useQuery(
    ['stores'],
    getStores,
    {
      initialData: getFromLocalStorage('ownersStores' + account.address) || [],
      enabled: !!posFactoryContract.address,
    }
  );

  async function getStores() {
      const numStores = await posFactoryContract.read.numStores();
      console.log('numStores', numStores, 'stores', stores);
      if(numStores === BigInt(stores.length)) return stores;
      const storesFromContract = await posFactoryContract.read.getStores([1n, numStores]);
      saveToLocalStorage('stores' + account.address, storesFromContract)
      return storesFromContract;
  }

  const handleClick = () => {
    setSearchparams({ a: 7, b: 8 });
  };


  console.log('stores', stores);


  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: '85vh',
      }}
    >
      <Stack alignItems="center" mt={5} sx={{ height: 1 }}>

        <Grid width={'100vw'} >
            <Typography mb={2} variant="h5">All Stores</Typography>
          <Stack direction={'row'} gap={2}>
                {stores?.map(store => 
                <Card key ={store.storeId} sx={{p:3, width: 200}} component={CardActionArea} LinkComponent={RouterLink} href={'/user/posAddress/'+ store.posAddress +"/dashboard"}>
                  <Stack ml={-0.5} mb={1.5}  direction={'row'} justifyContent={'space-between'}>
                    <Address chars={3} address={store.posAddress} />
                  </Stack>
                  <Stack  direction={'row'} justifyContent={'space-between'}>
                    <Typography color={"GrayText"} variant="caption">Store Id</Typography>
                    <Typography> {store.storeId.toString()} </Typography>
                  </Stack>
                    <Divider orientation='horizontal' />
                  <Stack mt={0.5}  direction={'row'} justifyContent={'space-between'}>
                    <Typography color={"GrayText"} variant="caption">Owner</Typography>
                    <Address chars={3} address={store.owner} />
                  </Stack>


                  
                </Card>)
                }
              </Stack>
      
        </Grid>

      </Stack>
    </Box>
  );
}
