import React, { useState, useContext } from 'react';
import Select from 'react-select';
import UserContext from './DropDownProvider';
import DataContext from './DataContext';
import Statistics from './Statistics';
import LotMoaChartStatistics from '../statistics/LotMoaChartStatistics';

export const DropDownFilter = () => {
  const [municipality, setMunicipality] = useState(null);
  const [barangay, setBarangay] = useState(null);
  const [barangayList, setBarangayList] = useState([]);
  const [municipalSelected, setMunicipalSelected] = useState({
    municipality: '',
    barangay: [
      {
        name: '',
      },
    ],
  });
  const [barangaySelected, setBarangaySelected] = useState({ name: '' });

  const [lotNumber, setLotNumber] = useState(0);
  const dropDownArray = useContext(UserContext);

  // handle change event of the Municipality dropdown
  const handleMunicipalityChange = (obj: any) => {
    setMunicipalSelected(obj);
    setMunicipality(obj);
    setBarangayList(obj.barangay);
    setBarangay(null);
    setBarangaySelected({ name: '' });
  };

  // handle change event of the barangay dropdownff
  const handleBarangayChange = (obj: any) => {
    setBarangaySelected(obj);
    setBarangay(obj);
  };

  const customstyles = {
    control: (base: any) => ({
      ...base,
      height: 35,
      width: '170px',
    }),
  };

  return (
    <div
      className="DropDownFilter"
      style={{
        height: 50,
        width: '70%',
        borderColor: 'rgb(0,0,0,0)',
        paddingTop: 10,
        margin: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          fontSize: 12,
          color: 'black',
          justifyContent: 'right',
        }}
      >
        <b style={{ color: 'white', margin: 10 }}>Municipality</b>
        <Select
          placeholder="Select Municipality"
          value={municipality}
          options={dropDownArray}
          onChange={handleMunicipalityChange}
          getOptionLabel={(x: any) => x.municipality}
          styles={customstyles}
        />
        <br />
        <b style={{ color: 'white', margin: 10 }}>Barangay</b>
        <Select
          placeholder="Select Barangay"
          value={barangay}
          options={barangayList}
          onChange={handleBarangayChange}
          getOptionLabel={(x: any) => x.name}
          /*styles={customstyles}*/
        />
      </div>

      <DataContext.Provider
        value={{ municipality: municipalSelected.municipality, barangay: barangaySelected.name }}
      >
        <Statistics value={lotNumber} setLotNumber={setLotNumber} />
        <LotMoaChartStatistics />
      </DataContext.Provider>
    </div>
  );
};
//<LotChart chartID="pie-two" data={lotData} lotNumber={lotNumber} />
export default DataContext;
