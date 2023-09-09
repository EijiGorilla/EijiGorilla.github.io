import { useContext, useState, useEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import DataContext from '../components/DropDownFilter';
import LotChart from '../chart/LotChart';
import { generateLotData, generateLotNumber } from '../components/Query';

// Read this for why useState is not updated
//https://stackoverflow.com/questions/68627317/usestate-not-updated-as-expected
//https://codesandbox.io/s/optimistic-moore-zm8sc?file=/src/App.js

interface Props {
  value: any;
  setLotNumber: any;
}
export default function LotChartStatistics({ value, setLotNumber }: Props) {
  const [lotData, setLotData] = useState([
    {
      category: String,
      value: Number,
      sliceSettings: {
        fill: am5.color('#00c5ff'),
      },
    },
  ]);

  //const [lotNumber, setLotNumber] = useState();
  const municipalBarangayContext = useContext(DataContext);
  const municipalSelected = municipalBarangayContext.municipality;
  const barangaySelected = municipalBarangayContext.barangay;

  useEffect(() => {
    generateLotData().then((result: any) => {
      setLotData(result);

      generateLotNumber().then((result: any) => {
        setLotNumber(result);
      });
    });
  }, [municipalSelected, barangaySelected]);

  return <></>;
}
