import { faker } from '@faker-js/faker';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import Iconify from 'src/components/iconify/iconify';
import { put } from '@vercel/blob';
import { useNavigate } from 'react-router-dom';
import useContracts from 'src/hooks/contract/useContracts';
import { parseUnits } from 'viem';


const currencies = ['USDT', 'MATIC', 'USDC', 'DAI'];

export default function NewProduct() {
  const {account, posContract, priceOracleContract, publicClient, usdtContract} = useContracts()
  console.log(account, posContract, priceOracleContract, publicClient, usdtContract)
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const fileInputRef = useRef();
    function handleFileChange(e) {
        const file = e.target.files[0];
        if(file.size > 1024 * 1024 * 4) {
            alert('File size should be less than 4MB');
            return;
        }
        setImage(file);
    }
    
    async function handleNewProduct(e) {
      e.preventDefault();
      console.log('New product created');
      const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    console.log(data)
    let blob;

  if (image) {
       blob = await put(image.name, image, {
          access: 'public',
          token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
        });
    // console.log(blob.url);
  }

      const product = {
        id: faker.string.uuid(),
        imageUrl: blob?.url,
        name: data.name,
        price: parseUnits(data.price, 6),
        initialInventory: data.quantity,
        currency: data.currency,
      };
      console.log(product);

      const hash = await posContract.write.addProduct([product.name, product.price, product.initialInventory, product.imageUrl])
      
      navigate(encodeURI(`/admin/posAddress/${posContract.address}/products/mining/${hash}?name=${encodeURIComponent(product.name)}&price=${product.price}&initialInventory=${product.initialInventory}&imageUrl=${encodeURIComponent(product.imageUrl)}`))
    }
  return (
    <div>
      <Typography variant="h4">Create a new product</Typography>
      <Stack mt={2} maxWidth={400} rowGap={2} component={'form'} onSubmit={handleNewProduct}>
        <TextField name='name' label="Product Name" />

          <TextField
          InputProps={{startAdornment: "$\u00a0"}}
          name = "price"  fullWidth label="Price" />

        <TextField type='number' name = "quantity" label="Quantity" />
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
