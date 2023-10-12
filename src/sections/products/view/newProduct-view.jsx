import { faker } from '@faker-js/faker';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import Iconify from 'src/components/iconify/iconify';


const currencies = ['USDT', 'MATIC', 'USDC', 'DAI'];

export default function NewProduct() {
    const [image, setImage] = useState(null);
    const fileInputRef = useRef();
    function handleFileChange(e) {
        setImage(e.target.files[0]);
    }
    
    function handleNewProduct(e) {
      e.preventDefault();
      console.log('New product created');
      const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    console.log(data)
    
      const product = {
        id: faker.string.uuid(),
        cover: image && URL.createObjectURL(image),
        name: data.name,
        price: data.price,
        quantiiy: data.quantity,
        currency: data.currency,
      };
    }
  return (
    <div>
      <Typography variant="h4">Create a new product</Typography>
      <Stack mt={2} maxWidth={400} rowGap={2} component={'form'} onSubmit={handleNewProduct}>
        <TextField name='name' label="Product Name" />
        <Stack gap={1} direction={'row'}>
          <TextField name="currency" fullWidth select label="Currency">
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </TextField>
          <TextField name = "price" fullWidth label="Price" />
        </Stack>
        <TextField name = "quantity" label="Quantity" />
        <Stack>
          <Typography pb={1} variant="subtitle2">
            Product Image
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '300px',
              borderRadius: '10px',
              border: '1px solid grey',
              backgroundImage: image ? `url(${URL.createObjectURL(image)})` : '',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current.click()}
          >
            {!image && (
              <>
                <Iconify icon="ic:round-insert-photo" sx={{ fontSize: 30, color: 'grey.500' }} />
                <Typography variant="h6" sx={{ color: 'grey.500' }}>
                  Select Image
                </Typography>
              </>
            )}
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </Stack>
        <Button variant='contained' type='submit'> Submit </Button>
      </Stack>
    </div>
  );
}
