import { Tooltip } from '@mui/material';
import numeral from 'numeral';
import { formatUnits } from 'viem';

// ----------------------------------------------------------------------

export function fNumber(number) {
  return numeral(number).format();
}

export function fCurrency(number, currency = "USD", units) {
  // const format = number ? numeral(number).format('0,0.00') : '';
  const val = currency.includes('USD')  ? formatUnits(number, 6) : formatUnits(number, 18) ;

  // return result(format, '.00') + ' ' + currency;
  const finalValue = parseFloat(val).toFixed(units || (currency.includes('USD') ? 2 : 5)) + " " + currency;
  console.log('currency', currency, 'finalValue', units || (currency.includes('USD') ? 2 : 5))

  return finalValue ;
}

export function fPercent(number) {
  const format = number ? numeral(Number(number) / 100).format('0.0%') : '';

  return result(format, '.0');
}

export function fShortenNumber(number) {
  const format = number ? numeral(number).format('0.00a') : '';

  return result(format, '.00');
}

export function fData(number) {
  const format = number ? numeral(number).format('0.0 b') : '';

  return result(format, '.0');
}

function result(format, key = '.00') {
  const isInteger = format.includes(key);

  return isInteger ? format.replace(key, '') : format;
}
