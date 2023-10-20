import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';
import { RouterLink } from 'src/routes/components';
import { CardActionArea } from '@mui/material';
import useContracts from 'src/hooks/contract/useContracts';

// ----------------------------------------------------------------------

export default function ShopProductCard({ product }) {
  const {routeLinks} = useContracts();
  const renderStatus = (
    <Label
      variant="filled"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product.name}
      src={product.imageUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
        borderBottom: "1px solid lightgrey",
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.priceSale && fCurrency(product.priceSale)}
      </Typography>
      &nbsp;
      {fCurrency(product.price, product.currency)}
    </Typography>
  );

  return (
    <Card >
      <CardActionArea component={RouterLink} to={`${routeLinks.productDetails}${product.productId}`}>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.status && renderStatus}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant='caption'>{product.sales.toString()} sold</Typography>
          {renderPrice}
        </Stack>

      </Stack>
      </CardActionArea>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object,
};
