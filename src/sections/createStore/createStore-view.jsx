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
import { Button, Card, CardActionArea, Divider, Modal } from '@mui/material';
import posFactoryAbi from 'src/hooks/contract/posFactoryAbi';
import { decodeEventLog } from 'viem';
import { useSearchParams } from 'react-router-dom';
import Address from 'src/components/address';
import { RouterLink } from 'src/routes/components';
import { getFromLocalStorage } from 'src/hooks/contract/contractContext';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

// ----------------------------------------------------------------------

export default function CreateStoreView() {
  const account = useAccount();
  const { posFactoryContract, publicClient } = useContracts();
  const [searchParams, setSearchparams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const params =
    searchParams.size === 0 ? null : Object.fromEntries(searchParams.entries());
  const [store, setStore] = useState(params);
  console.log('params', params, 'search', Object.fromEntries(searchParams.entries()));
  const theme = useTheme();

  const router = useRouter();

  const [open, setOpen] = useState(!!store);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const {data: ownerStores} = useQuery(
    ['ownerStores' + account.address],
    async () => {
      const ownerStores = await posFactoryContract.read.getOwnerStores([account.address]);
      return ownerStores;
    },
    {
      initialData: getFromLocalStorage('ownersStores' + account.address) || [],
      enabled: !!account.address || !!posFactoryContract.address,
    }
  );

  const handleClick = () => {
    setSearchparams({ a: 7, b: 8 });
  };

  const handleDeploy = async () => {
    const hash = await posFactoryContract.write.deployPos();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const log = decodeEventLog({
      abi: posFactoryContract.abi,
      data: receipt.logs[0].data,
      topics: receipt.logs[0].topics,
    });
    const { posAddress, storeId, owner } = log.args;
    setStore({ posAddress, storeId, owner });
    setSearchparams({ posAddress, storeId, owner });
    router.push('?posAddress=' + posAddress + '&storeId=' + storeId.toString() + '&owner=' + owner);
  };

  console.log('ownerStores', ownerStores);


  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        width: '100vw',
        height: '85vh',
      }}
    >
      <Stack alignItems="center" pt={5} sx={{ height: 1 }}>
        {!account.isConnected && (
          <>
            <Typography mb={2} variant="h4">
              Connect your wallet to create a store
            </Typography>
            <ConnectButton />
          </>
        )}
        {account.isConnected && <Grid width={'100vw'} >
            <Stack gap={2} alignItems={'baseline'} alignContent={''} direction={'row'}>
            <Typography mb={3} variant="h5">My Stores</Typography>

            <Button variant="contained" size="medium" onClick={handleDeploy}>
              Deploy New Store
            </Button>
          </Stack>
          <Stack direction={'row'} gap={2}>
                {ownerStores?.[0]? ownerStores.map(store => 
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


               
             </Card>
                ):
                <Typography> You have not deployed any stores</Typography>
                
              }
              </Stack>
        
        </Grid>
            } 
        {store && (
          <Modal
          open={open}
        onClose={handleClose}>
            <Card sx={{   position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)', width: 300, p: 3 }}>
              <Typography variant="h6">Congratulations!</Typography>
              <Typography mb={2}> Your store has been Deployed</Typography>
              <Stack mb={0.5} direction={'row'} justifyContent={'space-between'}>
                <Typography variant="subtitle2">Store Address</Typography>
                <Address address={store.posAddress} />
              </Stack>
              <Stack mb={1} direction={'row'} justifyContent={'space-between'}>
                <Typography variant="subtitle2">Store Id: </Typography>
                <Typography> {store.storeId.toString()}</Typography>
              </Stack>
              <Button
                LinkComponent={RouterLink}
                href={'/admin/posAddress/' + store.posAddress +'/dashBoard'}
                fullWidth
                variant="contained"
                size="large"
              >
                Go to Dashboard
              </Button>
            </Card>
          </Modal>
        )}
      </Stack>
    </Box>
  );
}
