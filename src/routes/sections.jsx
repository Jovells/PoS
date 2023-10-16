import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import ContractContext from 'src/hooks/contract/contractContext';
import useContracts from 'src/hooks/contract/useContracts';

import DashboardLayout from 'src/layouts/dashboard';
import { useAccount } from 'wagmi';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const OrdersPage = lazy(() => import('src/pages/order'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductDetailsPage = lazy(() => import('src/pages/productDetails'));
export const NewProductPage = lazy(() => import('src/pages/newProduct'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const queryClient = new QueryClient();


// ----------------------------------------------------------------------
function Inner() {
  return (
    <DashboardLayout>
      <QueryClientProvider client={queryClient}>
        <ContractContext>
          <Suspense fallback={'loading'}>
            <Outlet />
          </Suspense>
        </ContractContext>
      </QueryClientProvider>
    </DashboardLayout>
  );
}

export default function Router() {
  const { isOwner } = useContracts();

  const renderAdmin = isOwner
    ? {
        element: <Inner />,
        children: [
          { element: <IndexPage />, index: true },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <NewProductPage /> },
          { path: 'blog', element: <BlogPage /> },
          {
            path: 'products/productDetails/:productId',
            element: <ProductDetailsPage />,
          },
        ],
      }
    : {
        path: 'admin',
        element: <Navigate to="/login" replace />,
      };

  const routes = useRoutes([
    {
      element: <Inner />,
      children: [
        { element: <IndexPage />, index: true },
        { path: 'products', element: <ProductsPage /> },
        { path: 'orders', element: <OrdersPage /> },

        {
          path: 'products/productDetails/:productId',
          element: <ProductDetailsPage />,
        },
      ],
    },
    {
      path: 'admin',
      ...renderAdmin,
    },
    {
      path: 'login',
      element: isOwner ? <Navigate to="/admin" replace /> : <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },

    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
