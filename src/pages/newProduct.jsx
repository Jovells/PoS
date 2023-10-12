import { Helmet } from 'react-helmet-async';

import NewProduct from 'src/sections/products/view/newProduct-view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Products | Minimal UI </title>
      </Helmet>

      <NewProduct />
    </>
  );
}
