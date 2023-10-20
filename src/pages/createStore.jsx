import { Helmet } from 'react-helmet-async';

import  CreateStoreView  from 'src/sections/createStore/createStore-view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Create Store | DPoS </title>
      </Helmet>

      <CreateStoreView />
    </>
  );
}
