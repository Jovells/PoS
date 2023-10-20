import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, InputBase, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { RouterLink } from 'src/routes/components';
import one from "./1.svg";
import two from "./2.svg";
import three from "./3.svg";

export default function LandingView() {
  return (
    <>
       
        <Grid xs={12} height={'100vh'}  sm={7}>
          <Typography
            fontFamily={'Titillium Web'}
            variant="h1"
            fontSize={"50px!important"}
            sx={{ mt: 10, fontWeight: 700 }}
          >
            Decentralized  Point of Sale 
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 20, mt: 2, fontWeight: 400 }}>
            Transact securely, manage your
            inventory effortlessly, and access your business from anywhere in the world.
            {' '}
          </Typography>
          <Stack mt={2} alignItems={'center'} direction={'row'}>
          <Button
            variant="contained"
            LinkComponent={RouterLink}
            href="createStore"
            color="primary"
            size="large"
            sx={{ backgroundColor: 'black' }}
          >
            Creact a Store
          </Button>
          <Typography mx={2}>
            Or
          </Typography>
          <Button
            variant="outlined"
            LinkComponent={RouterLink}
            href="stores"
            color="inherit"
            size="large"
            
          >
            Browse stores
          </Button>
          </Stack>
        </Grid>
      
      <div className="kYmhb">
        <img src= {one}/>
        <img src= {two}/>
        <img src= {three}/>
      </div>
    </>
  );
}
