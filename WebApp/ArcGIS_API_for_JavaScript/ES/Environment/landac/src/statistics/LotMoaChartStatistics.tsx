import { useContext, useState, useEffect } from 'react';
import DataContext from '../components/DropDownFilter';
import LotMoaChart from '../chart/LotChart';
import { generateLotMoaData } from '../components/Query';

// Read this for why useState is not updated
//https://stackoverflow.com/questions/68627317/usestate-not-updated-as-expected
//https://codesandbox.io/s/optimistic-moore-zm8sc?file=/src/App.js

interface Props {
  value: any;
  setLotNumber: any;
}
export default function LotMoaChartStatistics() {
  const [lotMoaData, setLotMoaData] = useState([
    {
      category: String,
      value: Number,
    },
  ]);

  //const [lotNumber, setLotNumber] = useState();
  const municipalBarangayContext = useContext(DataContext);
  const municipalSelected = municipalBarangayContext.municipality;
  const barangaySelected = municipalBarangayContext.barangay;

  useEffect(() => {
    generateLotMoaData().then((result: any) => {
      setLotMoaData(result);
    });
  }, [municipalSelected, barangaySelected]);

  return <></>;
}
