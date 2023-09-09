import { lotLayer } from '../layers';
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

// For Lot MoA Chart
const statusMOA = ['For Negotiation', 'Expropriation', 'Donation', 'CA 141', 'No Need to Acquire'];

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
    const handedover = stats.total_handedover_lot;
    const paid = stats.total_paid_lot;
    const payp = stats.total_payp_lot;
    const legalpass = stats.total_legalpass_lot;
    const otb = stats.total_otb_lot;
    const expro = stats.total_expro_lot;

    const compile = [
      {
        category: statusMOA[0],
        value: handedover,
        sliceSettings: {
          fill: am5.color('#00c5ff'),
        },
      },
      {
        category: statusMOA[1],
        value: paid,
        sliceSettings: {
          fill: am5.color('#70ad47'),
        },
      },
      {
        category: statusMOA[2],
        value: payp,
        sliceSettings: {
          fill: am5.color('#0070ff'),
        },
      },
      {
        category: statusMOA[3],
        value: legalpass,
        sliceSettings: {
          fill: am5.color('#ffff00'),
        },
      },
      {
        category: statusMOA[4],
        value: otb,
        sliceSettings: {
          fill: am5.color('#ffaa00'),
        },
      },
      {
        category: statusMOA[5],
        value: expro,
        sliceSettings: {
          fill: am5.color('#ff0000'),
        },
      },
    ];
    return compile;
  });
}
