import numeral from 'numeral';
import { formatUnits } from 'viem';

// ----------------------------------------------------------------------

export function fNumber(number) {
  return numeral(number).format();
}

export function fCurrency(number, currency = "USD") {
  // const format = number ? numeral(number).format('0,0.00') : '';
  const val = currency === ('USD' || 'USDT')  ? formatUnits(number, 6) : formatUnits(number, 18) ;

  // return result(format, '.00') + ' ' + currency;
  return parseFloat(val).toFixed(currency===('USD' || 'USDT')? 2 : 5) + " " + currency;
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
