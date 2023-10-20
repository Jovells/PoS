import logo from "../../components/logo/logo.svg";
import { AppBar, Box, Button, Divider, Paper, Stack, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RouterLink } from "src/routes/components";

/**
 * Site header
 */
export default function ({children}){
  return (
    <>
      <Stack py={2} px={3} mx={"auto"} maxWidth={"lg"} direction={"row"} justifyContent="space-between">
        <RouterLink style={{ textDecoration: "none", color: "inherit" }} href="/">
          <Stack direction={"row"} alignContent={"center"} gap={1} alignItems={"center"}>
            <img priority width={50} height={50} src={logo} alt="Follow us on Twitter" />
            <Typography fontFamily={'Titillium Web'} fontWeight={900} variant="h6">DPoS</Typography>
          </Stack>
        </RouterLink>
        <ConnectButton />
      </Stack>
      <Divider />
      <Grid container px={3}  maxWidth={'lg'} m={'auto'} alignItems="center">
      {children}
      </Grid>
    </>
  );
};
