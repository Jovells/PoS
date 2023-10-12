import { IconButton, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import Iconify from 'src/components/iconify';

export default function NumberSelector({product, name, quantityAndPrice, setQuantityAndPrice}) {

function handleIncrease(){
  console.log(product)
    
  setQuantityAndPrice(prev=>{
        if (product.quantity <= prev.quantity ){
          return prev
        }
        return {quantity : prev.quantity + 1, price: prev.price + product.price}  })
}
function handleDecrease(){
    
  setQuantityAndPrice(prev=>{
        if (prev.quantity - 1 < 1 ){
            return prev
        }
        return{quantity : prev.quantity - 1, price: prev.price - product.price}  })
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
        value = {quantityAndPrice.quantity}
        >

        </TextField>
        <Typography variant='caption' color="text.disabled">available: {product.quantity}</Typography>
    </Stack>
  );
}