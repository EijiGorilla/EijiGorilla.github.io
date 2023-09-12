import React, { useState, useEffect, ReactNode, useContext, createContext } from 'react';
import Select from 'react-select';
import DataContext from './DataContext';
import { getMuniciaplityBarangayPair } from './Query';

export const DropDownFilter = () => {
  const [initMunicipalBarangay, setInitMunicipalBarangay] = useState([
    {
      municipality: '',
      barangay: [
        {
          name: '',
        },
      ],
    },
  ]);

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

  useEffect(() => {
    getMuniciaplityBarangayPair().then((response: any) => {
      setInitMunicipalBarangay(response);
    });
  }, []);

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
    option: (defaultStyles: any, state: any) => ({
      ...defaultStyles,
      color: state.isSelected ? '#212529' : '#fff',
      backgroundColor: state.isSelected ? '#a0a0a0' : '#212529',
    }),

    control: (defaultStyles: any) => ({
      ...defaultStyles,
      backgroundColor: '#212529',
      border: 'none',
      height: 35,
      width: '170px',
    }),
    singleValue: (defaultStyles: any) => ({ ...defaultStyles, color: '#fff' }),
  };

  /*
  const customstyles = {
    control: (base: any) => ({
      ...base,
      height: 35,
      width: '170px',
    }),
  };
*/
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
          options={initMunicipalBarangay}
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
          styles={customstyles}
        />
      </div>

      <DataContext.Provider
        value={{
          municipality: municipalSelected.municipality,
          barangay: barangaySelected.name,
        }}
      ></DataContext.Provider>
    </div>
  );
};
//<LotChart chartID="pie-two" data={lotData} lotNumber={lotNumber} />
export default DataContext;
