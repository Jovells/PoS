import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'orders',
    path: '/orders/',
    icon: icon('ic_user'),
  },
  {
    title: 'products',
    path: '/products/',
    icon: icon('ic_cart'),
  },
];


export default navConfig;
