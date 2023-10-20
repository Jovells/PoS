import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Address from 'src/components/address';
import useContracts from 'src/hooks/contract/useContracts';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  productId,
  receiptId,
  avatarUrl,
  buyer,
  timestamp,
  quantity,
  totalAmount,
  status,
  handleClick,
  transactionHash
}) {
  const [open, setOpen] = useState(null);
  const {posContract, publicClient} = useContracts();
  const [mineStatus, setMineStatus] = useState('mined')

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleRefund = async () => {
    console.log('pid', productId, 'buyer', buyer)
    
    setOpen(null);
    try {
      const hash = await posContract.write.refund([receiptId]);
      setMineStatus('mining');
      console.log('hash', hash);
      await publicClient.waitForTransactionReceipt({hash});
      setMineStatus('mined');
    } catch (err) {
      console.log(err)
      setMineStatus('reverted')
    }
        
  };

  return (
    <>
      <TableRow className={mineStatus === 'mining' ? "blink" : ""} hover tabIndex={-1} role="checkbox" selected={selected}>

        <TableCell>
          <Address address={transactionHash}/>
          </TableCell>

        <TableCell padding='none' component="th" scope="row" >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={productId} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {productId}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell><Address address = {buyer} /></TableCell>

        <TableCell>
          <Stack>
            <Typography>
          {new Date(timestamp).toLocaleDateString('en-GB')}
            </Typography>
            <Typography variant='caption'>
          {new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true,  })}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="center">{quantity}</TableCell>

        <TableCell>{totalAmount}</TableCell>

        <TableCell>
          <Label color={(status === 'refunded' && 'error') || 'success'}>{status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={()=>setOpen(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleRefund} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Refund
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};
