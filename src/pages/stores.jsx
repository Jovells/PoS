import { Helmet } from 'react-helmet-async';

import  StoresView  from 'src/sections/stores/view/stores-view';

// ----------------------------------------------------------------------

export default function StoresPage() {
  return (
    <>
      <Helmet>
        <title> Stores | DPoS </title>
      </Helmet>

      <StoresView />
    </>
  );
}
