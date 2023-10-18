import { Helmet } from 'react-helmet-async';

import ProductDetails from 'src/sections/products/view/productDetails-view';
// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Products Details | DPoS </title>
      </Helmet>

      <ProductDetails />
    </>
  );
}
