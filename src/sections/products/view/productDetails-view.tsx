import {
  Button,
  FormControl,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import Iconify from 'src/components/iconify/iconify';
import { fCurrency } from 'src/utils/format-number';
import NumberSelector from '../numberSelector';
import { LoadingButton } from '@mui/lab';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useContracts from 'src/hooks/contract/useContracts';
import { Product } from 'src/hooks/contract/contractContext';
import { payMethods } from 'src/constants';
import { decodeEventLog } from 'viem';
import { ContractTransactionResponse } from 'ethers';
import { useAccount } from 'wagmi';

export default function ProductDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useAccount()
  const { products, routeLinks, usdtContract, isOwner, posContract, publicClient, priceOracleContract } = useContracts();

  let initialProduct: Product;
  if (params.productId) {
    initialProduct =
      products.find((product) => product.productId === BigInt(params.productId)) || ({} as Product);
  } else if (params.hash) {
    const sParams = Object.fromEntries(searchParams.entries());
    initialProduct = {
      imageUrl: decodeURIComponent(sParams.imageUrl),
      name: sParams.name,
      quantity: BigInt(sParams.initialInventory),
      price: BigInt(sParams.price),
      initialInventory: BigInt(sParams.initialInventory),
      sales: 0n,
    };
  }
  const [product, setProduct] = useState(initialProduct);
  const [mineStatus, setMineStatus] = useState<'mined' | 'mining' | 'reverted'>(
    params.productId ? 'mined' : 'mining'
  );
  //@ts-ignore
  const [exchangeRate, setExchangeRate] = useState(0n);
  async function getAndSetExchangeRate() {
    const [, rate] = await priceOracleContract.read.latestRoundData();
    console.log('rate', rate);
    const exRate = BigInt(1e20) / rate;
    setExchangeRate(exRate);
    return exRate
  }
  useEffect(() => {
    getAndSetExchangeRate();
  });

  useEffect(() => {
    if (mineStatus !== 'mining') return;
    waitForProductToMine().then(([newMineStatus, productId]) => {
      setMineStatus(newMineStatus);
      productId && setProduct((oldProduct) => ({ ...oldProduct, productId: productId }));
    });
  }, [mineStatus]);

  async function waitForProductToMine() {
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: params.hash });

      const decodedLogs = receipt.logs?.map((log) => {
        try {
          return decodeEventLog({
            abi: posContract.abi,
            data: log.data,
            topics: log.topics,
          });
        } catch (e) {}
      });

      return ['mined', decodedLogs.find((log) => log.eventName === 'ProductAdded')?.args.productId];
    } catch (e) {
      return ['reverted'];
    }
  }

  const [quantityAndPrice, setQuantityAndPrice] = useState({
    quantity: 1n,
    price: product.price,
    paymentCurrency: payMethods.USDT,
  });

  function handlePaymentCurrency(e) {
    e.preventDefault();
    const selectedCurrency = parseInt(e.target.value);
    setQuantityAndPrice((prev) => {
      const price =
        selectedCurrency === payMethods.USDT
          ? product.price * prev.quantity
          : product.price * prev.quantity * exchangeRate;
        console.log('price', price, 'selectedCurrency', selectedCurrency, 'prev', prev, 'exchangeRate', exchangeRate );
      return { ...prev, price: price, paymentCurrency: selectedCurrency };
    });
  }

  async function handlePurchase(e) {
    e.preventDefault();
    let value = 0n;
    if (quantityAndPrice.paymentCurrency === payMethods.ETH ){
      const currentRate = await getAndSetExchangeRate();
      value = product.price * quantityAndPrice.quantity * currentRate;
      console.log('ex', quantityAndPrice,'rate', currentRate, 'v', value)
    }else{
    try{
      
      const allowance = await usdtContract.read.allowance([account.address, posContract.address]);
      // const allowance = 0n
      console.log('allowance', allowance);
      if(allowance < (quantityAndPrice.price * quantityAndPrice.quantity)){
        const allowanceHash = await usdtContract.write.approve([posContract.address, quantityAndPrice.price * quantityAndPrice.quantity]);     
        setMineStatus('mining');
        await publicClient.waitForTransactionReceipt({hash: allowanceHash})
      }
    }catch(e){
      alert(e);
      setMineStatus('reverted');
      console.log(e)
    }
  }
  setMineStatus('mining');
  console.log(product, quantityAndPrice)
  const args:[bigint, bigint, number]  = [
    product.productId,
    quantityAndPrice.quantity,
    quantityAndPrice.paymentCurrency,
  ]
  try {
    console.log('simulating', value);
    // await posContract.simulate.purchaseProduct(args, {value});
    const purchaseHash = await posContract.write.purchaseProduct(args, {value}) ;
    await publicClient.waitForTransactionReceipt({ hash: purchaseHash });
    setMineStatus('mined');
  
    navigate(routeLinks.orders);
  } catch (e) {
    console.log('error', e);
    setMineStatus('reverted');
  }


  }

  return product?.name ? (
    <Grid
      component={FormControl}
      disabled
      mx={'auto'}
      className={mineStatus === 'mining' ? 'blink' : ''}
      maxWidth={'lg'}
      px={2}
      columnGap={6}
      rowGap={3}
      pt={5}
      container
    >
      <Grid
        md={6}
        width={1}
        height={'400px'}
        borderRadius={'10px'}
        border={'1px solid grey'}
        sx={{
          backgroundImage: `url("${product.imageUrl}")` || '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        cursor={'pointer'}
      >
        {!product.imageUrl && (
          <Iconify icon="ic:round-insert-photo" sx={{ fontSize: 30, color: 'grey.500' }} />
        )}
      </Grid>
      <Grid
        height={'400px'}
        columnGap={2}
        pr={1}
        sx={{
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            borderRadius: '8px',
            // outline: '1px solid slategrey'
          },
        }}
        overflow={'auto'}
        md={5}
        container
      >
        <Grid maxWidth={400} mb={1}>
          <Typography
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            variant="h4"
            fontWeight={'bold'}
          >
            {product.name}
          </Typography>
        </Grid>
        <Grid
          component={'form'}
          onSubmit={handlePurchase}
          container
          sm={5}
          md={10}
          rowGap={3}
          pt={2}
        >
          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography>Price</Typography>
            <Typography variant="h4">{fCurrency(product.price, 'USD' )}</Typography>
          </Stack>

          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography>Quantity</Typography>
            <NumberSelector
              name="quantity"
              exchangeRate={exchangeRate}
              product={product}
              quantityAndPrice={quantityAndPrice}
              setQuantityAndPrice={setQuantityAndPrice}
            />
          </Stack>
          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography>Final price</Typography>
            <Typography>
              {fCurrency(quantityAndPrice.price, quantityAndPrice.paymentCurrency===payMethods.ETH ?'MATIC':'USDT')}
            </Typography>
          </Stack>

          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography>Payment Currency</Typography>
            <TextField
              defaultValue={payMethods.USDT}
              name={'paymentCurrency'}
              select
              onChange={handlePaymentCurrency}
            >
              <MenuItem value={payMethods.ETH}>MATIC</MenuItem>
              <MenuItem value={payMethods.USDT}>USDT</MenuItem>
            </TextField>
          </Stack>

          <Button
            disabled={mineStatus == 'mining'}
            fullWidth
            size="large"
            variant="contained"
            type="submit"
          >
            {isOwner?  "Update Product" : "Buy now" }
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <LoadingButton />
  );
}
