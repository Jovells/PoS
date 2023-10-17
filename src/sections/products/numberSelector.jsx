import { IconButton, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import Iconify from 'src/components/iconify';
import { payMethods } from 'src/constants';

export default function NumberSelector({product, name, quantityAndPrice, setQuantityAndPrice, exchangeRate}) {

function handleIncrease(){
  console.log(product)
    
  setQuantityAndPrice(prev=>{
        if (product.quantity <= prev.quantity ){
          return prev
        }
        console.log({...prev, quantity : prev.quantity + 1n, product} )
        const price = quantityAndPrice.paymentCurrency === 'USDT' ? product.price * (prev.quantity + 1n) : product.price * (prev.quantity +1n) * exchangeRate


        return {...prev, quantity : prev.quantity + 1n, price}  })
}
function handleDecrease(){
    
  setQuantityAndPrice(prev=>{
        if (prev.quantity - 1n < 1n ){
            return prev
        }
        const price = quantityAndPrice.paymentCurrency === payMethods.USDT? product.price * (prev.quantity - 1n) : product.price * (prev.quantity -1n) * exchangeRate

        return{...prev, quantity : prev.quantity - 1n, price}  })
}
  return (
    <Stack alignItems={"flex-end"}>
        <TextField sx={{width:"150px"}} name = {name} InputProps={{
            startAdornment:      <IconButton onClick={handleDecrease}>
            <Iconify icon="humbleicons:minus" />
          </IconButton>,
          endAdornment:      <IconButton onClick={handleIncrease}>
          <Iconify icon="humbleicons:plus" />
        </IconButton>
        }}
        value = {quantityAndPrice.quantity.toString()}
        />
        <Typography variant='caption' color="text.disabled">available: {product.quantity.toString()}</Typography>
    </Stack>
  );
}
