import { createContext } from 'react';

const DataContext = createContext({
  municipality: '',
  barangay: '',
});

export default DataContext;
