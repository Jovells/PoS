import { useContext } from 'react';
import {MyContext} from './contractContext';

export default function useContracts() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
}