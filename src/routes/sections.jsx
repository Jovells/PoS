import { lazy, Suspense } from 'react';

import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import ContractContext from 'src/hooks/contract/contractContext';
import useContracts from 'src/hooks/contract/useContracts';
import PreDashboardLayout from 'src/layouts/preDashboard/preDashboardLayout';
import DashboardLayout from 'src/layouts/dashboard';
import { useAccount } from 'wagmi';
import Loader from 'src/components/Loader';

export const IndexPage = lazy(() => import('src/pages/app'));
export const StoresPage = lazy(() => import('src/pages/stores'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const OrdersPage = lazy(() => import('src/pages/order'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductDetailsPage = lazy(() => import('src/pages/productDetails'));
export const NewProductPage = lazy(() => import('src/pages/newProduct'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const LandingPage = lazy(() => import('src/pages/landing'));
export const CreateStorePage = lazy(() => import('src/pages/createStore'));




// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })


// ----------------------------------------------------------------------

export default function Router() {
  const account = useAccount()

      const Inner =
      <ContractContext>
          <DashboardLayout>
            <Suspense fallback={<Loader/>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
      </ContractContext>  
      const preDashboardInner =
      <ContractContext>
          <PreDashboardLayout>
            <Suspense fallback={<Loader/>}>
              <Outlet />
            </Suspense>
          </PreDashboardLayout>
      </ContractContext>
 
  const renderAdmin = account.isConnected 
    ? {
        element: Inner,
        children: [
          { path:'dashboard', element: <IndexPage />, index: true },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <NewProductPage /> },
          { path: 'blog', element: <BlogPage /> },
          {
            path: 'products/productDetails/:productId',
            element: <ProductDetailsPage />,
          },
          {
            path: 'products/mining/:hash',
            element: <ProductDetailsPage />,
          },
        ],
      }
    :  

    {element: <LoginPage />}

  const routes = useRoutes([
    {
      element: Inner,
      path: "/user/posAddress/:posAddress/*",
      children: [
        { path: 'dashboard', element: <IndexPage />, index: true },
        { path: 'products', element: <ProductsPage /> },
        { path: 'orders', element: <OrdersPage /> },

        {
          path: 'products/productDetails/:productId',
          element: <ProductDetailsPage />,
        },
      ],
    },
    {
      path: "/admin/posAddress/:posAddress/*",
      ...renderAdmin,
    },
    {
      path: '/',
      element: preDashboardInner,
      children:[
        { index:true,
          element: <LandingPage />},
          {
            path: 'createStore',
            element: <CreateStorePage />,
          },
          {
            path: 'stores',
            element: <StoresPage />,
          },
          {
            path: 'login',
            element: account.isConnected? <Navigate  to="/admin" /> : <LoginPage />,
          },
          {
            path: '404',
            element: <Page404/>,
          },
      
          {
            path: '*',
            element: <Page404/>,
          },
      ]
    },
  ]);

  return (routes);
}
