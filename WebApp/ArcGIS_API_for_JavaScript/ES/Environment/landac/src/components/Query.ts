import { lotLayer, nloLayer, structureLayer } from '../layers';
import StatisticDefinition from '@arcgis/core/rest/support/StatisticDefinition';
import * as am5 from '@amcharts/amcharts5';

// Read this for why useState is not updated
//https://stackoverflow.com/questions/68627317/usestate-not-updated-as-expected
//https://codesandbox.io/s/optimistic-moore-zm8sc?file=/src/App.js

// For Lot Pie Chart
const statusLot: string[] = [
  'Handed-Over',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/Offer to Buy',
  'For Expro',
];

export async function generateLotData() {
  var total_handedover_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 0 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_handedover_lot',
    statisticType: 'sum',
  });

  var total_paid_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_paid_lot',
    statisticType: 'sum',
  });

  var total_payp_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_payp_lot',
    statisticType: 'sum',
  });

  var total_legalpass_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 3 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_legalpass_lot',
    statisticType: 'sum',
  });

  var total_otb_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 4 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_otb_lot',
    statisticType: 'sum',
  });

  var total_expro_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA = 5 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_expro_lot',
    statisticType: 'sum',
  });

  var query = lotLayer.createQuery();
  query.outStatistics = [
    total_handedover_lot,
    total_paid_lot,
    total_payp_lot,
    total_legalpass_lot,
    total_otb_lot,
    total_expro_lot,
  ];
  query.returnGeometry = true;

  return lotLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const handedover = stats.total_handedover_lot;
    const paid = stats.total_paid_lot;
    const payp = stats.total_payp_lot;
    const legalpass = stats.total_legalpass_lot;
    const otb = stats.total_otb_lot;
    const expro = stats.total_expro_lot;

    const compile = [
      {
        category: statusLot[0],
        value: handedover,
        sliceSettings: {
          fill: am5.color('#00c5ff'),
        },
      },
      {
        category: statusLot[1],
        value: paid,
        sliceSettings: {
          fill: am5.color('#70ad47'),
        },
      },
      {
        category: statusLot[2],
        value: payp,
        sliceSettings: {
          fill: am5.color('#0070ff'),
        },
      },
      {
        category: statusLot[3],
        value: legalpass,
        sliceSettings: {
          fill: am5.color('#ffff00'),
        },
      },
      {
        category: statusLot[4],
        value: otb,
        sliceSettings: {
          fill: am5.color('#ffaa00'),
        },
      },
      {
        category: statusLot[5],
        value: expro,
        sliceSettings: {
          fill: am5.color('#ff0000'),
        },
      },
    ];
    return compile;
  });
}

export async function generateLotNumber() {
  var total_lot_number = new StatisticDefinition({
    onStatisticField: 'CASE WHEN LotID IS NOT NULL THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lot_number',
    statisticType: 'sum',
  });

  var total_lot_pie = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA >= 0 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lot_pie',
    statisticType: 'sum',
  });

  var query = lotLayer.createQuery();
  //query.where = 'LotID IS NOT NULL';
  query.outStatistics = [total_lot_number, total_lot_pie];
  query.returnGeometry = true;

  return lotLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const totalLotNumber = stats.total_lot_number;
    const totalLotPie = stats.total_lot_pie;
    return [totalLotNumber, totalLotPie];
  });
}

// For Permit-to-Enter
export async function generatePermitEnter() {
  var total_pte_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN PTE = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_pte_lot',
    statisticType: 'sum',
  });

  var total_lot_N = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusLA >= 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lot_N',
    statisticType: 'sum',
  });

  var query = lotLayer.createQuery();
  //query.where = 'LotID IS NOT NULL';
  query.outStatistics = [total_pte_lot, total_lot_N];
  query.returnGeometry = true;

  return lotLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const pte = stats.total_pte_lot;
    const totaln = stats.total_lot_N;
    const percent = ((pte / totaln) * 100).toFixed(0);
    return [percent, totaln];
  });
}

// For Lot MoA Chart
const statusMOA: String[] = [
  'For Negotiation',
  'Expropriation',
  'Donation',
  'CA 141',
  'No Need to Acquire',
];

export async function generateLotMoaData() {
  var total_nego_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_nego_lot',
    statisticType: 'sum',
  });

  var total_expro_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_expro_lot',
    statisticType: 'sum',
  });

  var total_donate_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 3 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_donate_lot',
    statisticType: 'sum',
  });

  var total_ca141_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 4 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_ca141_lot',
    statisticType: 'sum',
  });

  var total_noneed_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 5 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_noneed_lot',
    statisticType: 'sum',
  });

  var query = lotLayer.createQuery();
  query.outStatistics = [
    total_nego_lot,
    total_expro_lot,
    total_donate_lot,
    total_ca141_lot,
    total_noneed_lot,
  ];
  query.returnGeometry = true;
  return lotLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const nego = stats.total_nego_lot;
    const expro = stats.total_expro_lot;
    const donate = stats.total_donate_lot;
    const ca141 = stats.total_ca141_lot;
    const noneed = stats.total_noneed_lot;

    const compile = [
      {
        category: statusMOA[0],
        value: nego,
      },
      {
        category: statusMOA[1],
        value: expro,
      },
      {
        category: statusMOA[2],
        value: donate,
      },
      {
        category: statusMOA[3],
        value: ca141,
      },
      {
        category: statusMOA[4],
        value: noneed,
      },
    ];
    return compile;
  });
}

// For monthly progress chart of lot
export async function generateLotProgress(municipality: any, barangay: any) {
  var total_count_handedOver_private = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (LandOwner <> 'BASES CONVERSION DEVELOPMENT AUTHORITY' and LandOwner <> 'MANILA RAILROAD COMPANY') THEN 1 ELSE 0 END",
    outStatisticFieldName: 'total_count_handedOver_private',
    statisticType: 'sum',
  });

  var total_count_handedOver_public = new StatisticDefinition({
    onStatisticField:
      "CASE WHEN (LandOwner = 'BASES CONVERSION DEVELOPMENT AUTHORITY' or LandOwner = 'MANILA RAILROAD COMPANY') THEN 1 ELSE 0 END",
    outStatisticFieldName: 'total_count_handedOver_public',
    statisticType: 'sum',
  });

  var query = lotLayer.createQuery();
  query.outStatistics = [total_count_handedOver_private, total_count_handedOver_public];
  // eslint-disable-next-line no-useless-concat
  const municipal = municipality;
  const barang = barangay;
  const queryMunicipality = "Municipality = '" + municipal + "'";
  const queryBarangay = "Barangay = '" + barang + "'";
  const queryMunicipalBarangay = queryMunicipality + ' AND ' + queryBarangay;
  const queryHandedOverDate = 'HandedOverDate IS NOT NULL';

  if (municipal && barang) {
    query.where = queryHandedOverDate + ' AND ' + queryMunicipalBarangay;
  } else if (municipal && !barang) {
    query.where = queryHandedOverDate + ' AND ' + queryMunicipality;
  } else {
    query.where = queryHandedOverDate;
  }

  query.outFields = ['HandedOverDate'];
  query.orderByFields = ['HandedOverDate'];
  query.groupByFieldsForStatistics = ['HandedOverDate'];

  return lotLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features;
    const data = stats.map((result: any, index: any) => {
      const attributes = result.attributes;
      const date = attributes.HandedOverDate;

      const privateCount = attributes.total_count_handedOver_private;
      const publicCount = attributes.total_count_handedOver_public;

      // compile in object array
      return Object.assign({
        date: date,
        private: privateCount,
        public: publicCount,
      });
    });

    return data;
  });
}

// Structure
const statusStructure = [
  'Dismantling/Clearing',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/Offer to Compensate',
  'LBP Account Opening',
];

export async function generateStructureData() {
  var total_clear_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_clear_lot',
    statisticType: 'sum',
  });

  var total_paid_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_paid_lot',
    statisticType: 'sum',
  });

  var total_payp_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 3 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_payp_lot',
    statisticType: 'sum',
  });

  var total_legalpass_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 4 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_legalpass_lot',
    statisticType: 'sum',
  });

  var total_otc_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 5 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_otc_lot',
    statisticType: 'sum',
  });

  var total_lbp_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc = 6 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lbp_lot',
    statisticType: 'sum',
  });

  var query = structureLayer.createQuery();
  query.outStatistics = [
    total_clear_lot,
    total_paid_lot,
    total_payp_lot,
    total_legalpass_lot,
    total_otc_lot,
    total_lbp_lot,
  ];
  query.returnGeometry = true;
  query.outFields = ['*'];
  return structureLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;

    const clear = stats.total_clear_lot;
    const paid = stats.total_paid_lot;
    const payp = stats.total_payp_lot;
    const legalpass = stats.total_legalpass_lot;
    const otc = stats.total_otc_lot;
    const lbp = stats.total_lbp_lot;

    const compile = [
      {
        category: statusStructure[0],
        value: clear,
        sliceSettings: {
          fill: am5.color('#00C5FF'),
        },
      },
      {
        category: statusStructure[1],
        value: paid,
        sliceSettings: {
          fill: am5.color('#70AD47'),
        },
      },
      {
        category: statusStructure[2],
        value: payp,
        sliceSettings: {
          fill: am5.color('#0070FF'),
        },
      },
      {
        category: statusStructure[3],
        value: legalpass,
        sliceSettings: {
          fill: am5.color('#FFFF00'),
        },
      },
      {
        category: statusStructure[4],
        value: otc,
        sliceSettings: {
          fill: am5.color('#FFAA00'),
        },
      },
      {
        category: statusStructure[5],
        value: lbp,
        sliceSettings: {
          fill: am5.color('#FF0000'),
        },
      },
    ];
    return compile;
  });
}

// For Permit-to-Enter
export async function generateStrucNumber() {
  var total_pte_structure = new StatisticDefinition({
    onStatisticField: 'CASE WHEN PTE = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_pte_structure',
    statisticType: 'sum',
  });

  var total_struc_N = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusStruc >=1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_struc_N',
    statisticType: 'sum',
  });

  var query = structureLayer.createQuery();
  //query.where = 'LotID IS NOT NULL';
  query.outStatistics = [total_pte_structure, total_struc_N];
  return structureLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const pte = stats.total_pte_structure;
    const totaln = stats.total_struc_N;
    const percPTE = Number(((pte / totaln) * 100).toFixed(0));
    return [percPTE, pte, totaln];
  });
}

const statusMoaStructure = ['For Negotiation', 'Expropriation', 'Donation', 'No Need to Acquire'];

export async function generateStrucMoaData() {
  var total_nego_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_nego_lot',
    statisticType: 'sum',
  });

  var total_expro_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_expro_lot',
    statisticType: 'sum',
  });

  var total_donate_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 3 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_donate_lot',
    statisticType: 'sum',
  });

  var total_noneed_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN MoA = 4 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_noneed_lot',
    statisticType: 'sum',
  });

  var query = structureLayer.createQuery();
  query.outStatistics = [total_nego_lot, total_expro_lot, total_donate_lot, total_noneed_lot];
  query.returnGeometry = true;
  return structureLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const nego = stats.total_nego_lot;
    const expro = stats.total_expro_lot;
    const donate = stats.total_donate_lot;
    const noneed = stats.total_noneed_lot;

    const compile = [
      {
        category: statusMoaStructure[0],
        value: nego,
      },
      {
        category: statusMoaStructure[1],
        value: expro,
      },
      {
        category: statusMoaStructure[2],
        value: donate,
      },
      {
        category: statusMoaStructure[3],
        value: noneed,
      },
    ];
    return compile;
  });
}

// Non-Land Owner
const statusNlo = [
  'Relocated',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/OtC/Requirements for Other Entitlements',
  'LBP Account Opening',
];
export async function generateNloData() {
  var total_relocated_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_relocated_lot',
    statisticType: 'sum',
  });

  var total_paid_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_paid_lot',
    statisticType: 'sum',
  });

  var total_payp_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 3 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_payp_lot',
    statisticType: 'sum',
  });

  var total_legalpass_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 4 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_legalpass_lot',
    statisticType: 'sum',
  });

  var total_otc_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 5 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_otc_lot',
    statisticType: 'sum',
  });

  var total_lbp_lot = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC = 6 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lbp_lot',
    statisticType: 'sum',
  });

  var query = nloLayer.createQuery();
  query.outStatistics = [
    total_relocated_lot,
    total_paid_lot,
    total_payp_lot,
    total_legalpass_lot,
    total_otc_lot,
    total_lbp_lot,
  ];
  query.returnGeometry = true;

  return nloLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;

    const clear = stats.total_relocated_lot;
    const paid = stats.total_paid_lot;
    const payp = stats.total_payp_lot;
    const legalpass = stats.total_legalpass_lot;
    const otc = stats.total_otc_lot;
    const lbp = stats.total_lbp_lot;

    const compile = [
      {
        category: statusNlo[0],
        value: clear,
        sliceSettings: {
          fill: am5.color('#00C5FF'),
        },
      },
      {
        category: statusNlo[1],
        value: paid,
        sliceSettings: {
          fill: am5.color('#70AD47'),
        },
      },
      {
        category: statusNlo[2],
        value: payp,
        sliceSettings: {
          fill: am5.color('#0070FF'),
        },
      },
      {
        category: statusNlo[3],
        value: legalpass,
        sliceSettings: {
          fill: am5.color('#FFFF00'),
        },
      },
      {
        category: statusNlo[4],
        value: otc,
        sliceSettings: {
          fill: am5.color('#FFAA00'),
        },
      },
      {
        category: statusNlo[5],
        value: lbp,
        sliceSettings: {
          fill: am5.color('#FF0000'),
        },
      },
    ];
    return compile;
  });
}

export async function generateNloNumber() {
  var total_lbp = new StatisticDefinition({
    onStatisticField: 'CASE WHEN StatusRC >= 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'total_lbp',
    statisticType: 'sum',
  });

  var query = nloLayer.createQuery();
  query.outStatistics = [total_lbp];
  return nloLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features[0].attributes;
    const totalnlo = stats.total_lbp;

    return totalnlo;
  });
}

// For dropdown list
export async function getMuniciaplityBarangayPair() {
  var query = lotLayer.createQuery();
  // eslint-disable-next-line no-useless-concat
  query.where = 'Barangay IS NOT NULL' + ' AND ' + 'Municipality IS NOT NULL';
  query.outFields = ['Municipality', 'Barangay'];
  query.groupByFieldsForStatistics = ['Municipality', 'Barangay'];

  return lotLayer.queryFeatures(query).then((response: any) => {
    const values = response.features.map((result: any, index: number) => {
      const municipal = result.attributes.Municipality;
      const barang = result.attributes.Barangay;

      return Object.assign({
        municipality: municipal,
        barangay: barang,
      });
    });

    const municipalSelect = values
      .map((item: any) => item.municipality)
      .filter((municipality: any, index: any, emp: any) => emp.indexOf(municipality) === index);

    const pair = values.filter(
      (val: any, index: any) =>
        values.findIndex(
          (item: any) => item.barangay === val.barangay && item.municipality === val.municipality,
        ) === index,
    );

    const finalArray = municipalSelect.map((municipal: string, index: number) => {
      let temp: Array<string> = [];

      // Find barangay(s) corresponding to each municipality
      const findBarangay = pair.filter((emp: any) => emp.municipality === municipal);

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

    return finalArray;
  }); // end of qureyFeatures
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    var num_parts = num.toString().split('.');
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num_parts.join('.');
  }
}
