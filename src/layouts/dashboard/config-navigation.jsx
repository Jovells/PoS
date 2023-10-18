import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const admin = [
  {
    title: 'dashboard',
    path: '/admin',
    icon: icon('ic_analytics'),
  },
  {
    title: 'orders',
    path: '/admin/orders',
    icon: icon('ic_user'),
  },
  {
    title: 'products',
    path: '/admin/products',
    icon: icon('ic_cart'),
  },
];
const user = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'products',
    path: '/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'orders',
    path: '/orders',
    icon: icon('ic_cart'),
  },
];

const navConfig = {user, admin}

export default navConfig;
