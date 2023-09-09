import { lotLayer } from '../layers';
import { useState, useEffect, createContext } from 'react';
import { DropDownFilter } from './DropDownFilter';
import App from '../App';

// useContext

//const UserContext = createContext([{}]);
const UserContext = createContext([
  {
    municipality: '',
    barangay: [
      {
        name: '',
      },
    ],
  },
]);

export function DropDownProvider() {
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

  useEffect(() => {
    // Query features in heret
    // 1. Obtain municipality list
    let municipalSelect: Array<string> = [];

    async function getValues() {
      var query = lotLayer.createQuery();
      return lotLayer.queryFeatures(query).then((response: any) => {
        var stats = response.features;
        var values = stats.map((feature: any) => {
          return feature.attributes.Municipality;
        });
        return values;
      });
    }

    let uniqueValues: Array<string> = [];
    async function getUniqueValues(values: any) {
      values.forEach(function (item: any, i: number) {
        if (
          (uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) &&
          item !== '' &&
          item !== null
        ) {
          uniqueValues.push(item);
        }
      });
      return uniqueValues;
    }

    async function addToSelect(values: any) {
      values.sort();
      values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
      values.forEach((value: any) => {
        municipalSelect.push(value);
      });

      // 2. Obtain barangay list
      var query = lotLayer.createQuery();
      query.where = 'Barangay IS NOT NULL';
      query.outFields = ['Municipality', 'Barangay'];
      query.groupByFieldsForStatistics = ['Municipality', 'Barangay'];
      lotLayer.queryFeatures(query).then((response: any) => {
        var stats = response.features;
        const data = stats.map((result: any, index: number) => {
          const attributes = result.attributes;
          const municipal = attributes.Municipality;
          const barang = attributes.Barangay;

          return Object.assign({
            municipality: municipal,
            barangay: barang,
          });
        });
        // Obtain unique pair of municipality and barangay
        let barangayValue = data.filter(
          (obj: any, index: number) =>
            data.findIndex(
              (item: any) =>
                item.barangay === obj.barangay && item.municipality === obj.municipality,
            ) === index,
        );

        const finalArray = municipalSelect.map((municipal: string, index: number) => {
          let temp: Array<string> = [];

          // Find barangay(s) corresponding to each municipality
          const findBarangay = barangayValue.filter((emp: any) => emp.municipality === municipal);

          // Create an array of barangays correpsonding to each municipality
          for (var j: number = 0; j < findBarangay.length; j++) {
            const barangays = findBarangay[j].barangay;
            const OBJ = Object.assign({
              name: barangays,
            });
            temp.push(OBJ);
          }
          // return the array of collected barangays to an array of municipality
          return Object.assign({
            municipality: municipal,
            barangay: temp.length === 0 ? [{ name: '' }] : temp,
          });
        });
        setInitMunicipalBarangay(finalArray);
      }); // queryFeature
    }
    getValues().then(getUniqueValues).then(addToSelect);

    // 3. Compile municipality and barangay
  }, []);

  return (
    <UserContext.Provider value={initMunicipalBarangay}>
      <DropDownFilter />
    </UserContext.Provider>
  );
}

export default UserContext;
