import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { products } from 'src/_mock/products';
import Iconify from 'src/components/iconify/iconify';
import { fCurrency } from 'src/utils/format-number';
import NumberSelector from '../numberSelector';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useParams } from 'react-router-dom';


export default function ProductDetails() {
  const params = useParams()
  const product = products.find(product => product.id === params.productId)
  const [quantityAndPrice, setQuantityAndPrice] = useState({quantity: 1, price: product.price, paymentCurrency: "USDT"});

  function handlePaymentCurrency(e){
    e.preventDefault();
    const selectedCurrency = e.target.value;
    setQuantityAndPrice(prev=>{
      const price = selectedCurrency === 'USDT' ? product.price * prev.quantity : product.price * prev.quantity * 1.96
      return {...prev, price: price, paymentCurrency: selectedCurrency}
    })
  }
  
  function handlePurchase(e){
    e.preventDefault()
    const data = new FormData(e.currentTarget);
    const purchaseDetails = Object.fromEntries(data.entries());
    purchaseDetails.id = product.id

    console.log('purchasing', purchaseDetails)
  }
  return product?.name ? (
    <Grid mx={'auto'} maxWidth={'lg'} px={2} columnGap={6} rowGap={3} pt={5} container>
      <Grid
        md={6}
        width={1}
        height={'400px'}
        borderRadius={'10px'}
        border={'1px solid grey'}
        sx={{
          backgroundImage: `url("${product.cover}")` || '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        cursor={'pointer'}
      >
        {!product.cover && (
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
        <Grid   maxWidth={400} mb={1}>
          <Typography
            overflow={'hidden'}
            textOverflow={'ellipsis'}
            variant="h4"
            fontWeight={'bold'}
          >
            {product.name}
          </Typography>
        </Grid>
        <Grid component={'form'} onSubmit={handlePurchase} container sm={5} md={10} rowGap={3} pt={2}>
        <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography >
              Price
            </Typography>
            <Typography variant="h4" >{fCurrency(product.price, product.currency)}</Typography>
          </Stack>

          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography >
              Quantity
            </Typography>
            <NumberSelector name="quantity" product = {product} quantityAndPrice={quantityAndPrice} setQuantityAndPrice={setQuantityAndPrice} />
          </Stack>
          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography >
              Final price
            </Typography>
            <Typography >{fCurrency(quantityAndPrice.price, quantityAndPrice.paymentCurrency)}</Typography>
          </Stack>

          <Stack
            width={1}
            alignItems={'baseline'}
            direction={'row'}
            justifyContent={'space-between'}
            columnGap={2}
          >
            <Typography >
              Payment Currency
            </Typography>
            <TextField defaultValue={"USDT"} name={"paymentCurrency"} select onChange={handlePaymentCurrency} >
              <MenuItem value={'MATIC'}>MATIC</MenuItem>
              <MenuItem value={"USDT"}>USDT</MenuItem>
            </TextField>
          </Stack>

          <Button fullWidth size="large" variant="contained" type="submit">
            Buy now
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <LoadingButton />
  );
}
