import { Backdrop, CircularProgress, Container, Stack } from "@mui/material";
export default function Loader(){
    return <Stack alignContent={"center"} alignItems={'center'} justifyContent={'center'}  width= {"60vw"} height={'80vh'}>
<CircularProgress size={'10vh'} color="inherit" />
</Stack>
}