import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import {
  TextSymbol3DLayer,
  LabelSymbol3D,
  PolygonSymbol3D,
  ExtrudeSymbol3DLayer,
  PointSymbol3D,
  IconSymbol3DLayer,
  SimpleMarkerSymbol,
} from '@arcgis/core/symbols';
import SolidEdges3D from '@arcgis/core/symbols/edges/SolidEdges3D';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import PopupTemplate from '@arcgis/core/PopupTemplate';

/* Chainage Layer  */
var labelChainage = new LabelClass({
  labelExpressionInfo: { expression: '$feature.KmSpot' },
  symbol: {
    type: 'text',
    color: [85, 255, 0],
    haloColor: 'black',
    haloSize: 0.5,
    font: {
      size: 15,
      weight: 'bold',
    },
  },
});

var chainageRenderer = new SimpleRenderer({
  symbol: new SimpleMarkerSymbol({
    size: 5,
    color: [255, 255, 255, 0.9],
    outline: {
      width: 0.2,
      color: 'black',
    },
  }),
});

export const chainageLayer = new FeatureLayer({
  portalItem: {
    id: '590680d19f2e48fdbd8bcddce3aaedb5',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 5,
  title: 'Chainage',
  elevationInfo: {
    mode: 'relative-to-ground',
  },
  labelingInfo: [labelChainage],
  minScale: 150000,
  maxScale: 0,
  renderer: chainageRenderer,
  outFields: ['*'],
  popupEnabled: false,
});

/* Station Box */
let stationBoxRenderer = new UniqueValueRenderer({
  field: 'Layer',
  uniqueValueInfos: [
    {
      value: '00_Platform',
      label: 'Platform',
      symbol: new SimpleFillSymbol({
        color: [160, 160, 160],
        style: 'backward-diagonal',
        outline: {
          width: 1,
          color: 'black',
        },
      }),
    },
    {
      value: '00_Platform 10car',
      label: 'Platform 10car',
      symbol: new SimpleFillSymbol({
        color: [104, 104, 104],
        style: 'cross',
        outline: {
          width: 1,
          color: 'black',
          style: 'short-dash',
        },
      }),
    },
    {
      value: '00_Station',
      label: 'Station Box',
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          width: 2,
          color: [115, 0, 0],
        },
      }),
    },
  ],
});

export const stationBoxLayer = new FeatureLayer({
  portalItem: {
    id: '590680d19f2e48fdbd8bcddce3aaedb5',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 3,
  renderer: stationBoxRenderer,
  minScale: 150000,
  maxScale: 0,
  title: 'Station Box',
  outFields: ['*'],
  popupEnabled: false,
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

/* ROW Layer */
var prowLayer = new FeatureLayer({
  portalItem: {
    id: '590680d19f2e48fdbd8bcddce3aaedb5',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 1,
  title: 'PROW',
  popupEnabled: false,
});

/* PNR */
let pnrRenderer = new UniqueValueRenderer({
  valueExpression:
    "When($feature.LandOwner == 'BASES CONVERSION DEVELOPMENT AUTHORITY', 'BCDA', $feature.LandOwner == 'MANILA RAILROAD COMPANY' || $feature.LandOwner == 'Manila Railroad Company','PNR',$feature.LandOwner)",
  uniqueValueInfos: [
    {
      value: 'BCDA',
      symbol: new SimpleFillSymbol({
        color: [225, 225, 225],
        style: 'diagonal-cross',
        outline: {
          width: 0.5,
          color: 'black',
        },
      }),
    },
    {
      value: 'PNR',
      symbol: new SimpleFillSymbol({
        color: [225, 225, 225],
        style: 'diagonal-cross',
        outline: {
          width: 0.5,
          color: 'black',
        },
      }),
    },
  ],
});

export const pnrLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 10,
  title: 'Land (PNR)',
  definitionExpression:
    "LandOwner IN ('BASES CONVERSION DEVELOPMENT AUTHORITY','MANILA RAILROAD COMPANY')",
  outFields: ['*'],
  elevationInfo: {
    mode: 'on-the-ground',
  },
  labelsVisible: false,
  renderer: pnrRenderer,
  popupTemplate: {
    title: '<p>{LandOwner} ({LotID})</p>',
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'HandOverDate',
            label: 'Hand-Over Date',
          },
          {
            fieldName: 'Municipality',
          },
          {
            fieldName: 'Barangay',
          },
          {
            fieldName: 'LandOwner',
            label: 'Land Owner',
          },
        ],
      },
    ],
  },
});

/* Station Layer */
var labelClass = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: '#d4ff33',
        },
        size: 15,
        halo: {
          color: 'black',
          size: 0.5,
        },
        font: {
          family: 'Ubuntu Mono',
          //weight: "bold"
        },
      }),
    ],
    verticalOffset: {
      screenLength: 100,
      maxWorldLength: 300,
      minWorldLength: 80,
    },

    callout: {
      type: 'line', // autocasts as new LineCallout3D()
      color: [128, 128, 128, 0.5],
      size: 0.2,
      border: {
        color: 'grey',
      },
    },
  }),
  labelPlacement: 'above-center',
  labelExpressionInfo: {
    expression: '$feature.Station',
    //value: "{TEXTSTRING}"
  },
});

function stationsSymbol(name: any) {
  return {
    type: 'web-style', // autocasts as new WebStyleSymbol()
    name: name,
    styleName: 'EsriIconsStyle', //EsriRealisticTransportationStyle, EsriIconsStyle
  };
}

var stationsRenderer = {
  type: 'unique-value', // autocasts as new UniqueValueRenderer()
  field: 'Station',
  defaultSymbol: stationsSymbol('Train'), //Backhoe, Train
};

export const stationLayer = new SceneLayer({
  portalItem: {
    id: '207cb34b8a324b40985b5805862c4b29',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  title: 'N2 Stations',
  labelingInfo: [labelClass],
  //renderer: stationsRenderer,
  elevationInfo: {
    mode: 'relative-to-ground',
  },
  definitionExpression: "Extension = 'N2'",
  //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
});
stationLayer.listMode = 'hide';

/* The colors used for the each transit line */
var lotIdLabel = new LabelClass({
  labelExpressionInfo: { expression: '$feature.LotID' },
  symbol: {
    type: 'text',
    color: 'black',
    haloColor: 'white',
    haloSize: 0.5,
    font: {
      size: 11,
      weight: 'bold',
    },
  },
});

const LOT_LABEL_CLASS = new LabelClass({
  labelExpressionInfo: {
    expression: '$feature.LotID',
  },
  symbol: {
    type: 'text', // autocasts as new TextSymbol()
    color: 'black',
    haloColor: 'white',
    haloSize: 0.5,
    font: {
      // autocast as new Font()
      family: 'Gill Sans',
      size: 8,
      weight: 'bold',
    },
  },
});

/* uniqueRenderer */
const colorLotReqs = {
  0: [0, 197, 255],
  1: [112, 173, 71],
  2: [0, 112, 255],
  3: [255, 255, 0],
  4: [255, 170, 0],
  5: [255, 0, 0],
  6: [0, 0, 0, 0],
};

let lotDefaultSymbol = new SimpleFillSymbol({
  color: [0, 0, 0, 0],
  style: 'solid',
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [110, 110, 110],
    width: 0.7,
  },
});

let lotLayerRenderer = new UniqueValueRenderer({
  field: 'StatusLA',
  defaultSymbol: lotDefaultSymbol, // autocasts as new SimpleFillSymbol()
  uniqueValueInfos: [
    {
      // All features with value of "North" will be blue
      value: 0,
      label: 'Handed-Over',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[0],
      }),
    },
    {
      // All features with value of "North" will be blue
      value: 1,
      label: 'Paid',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[1],
      }),
    },
    {
      // All features with value of "North" will be blue
      value: 2,
      label: 'For Payment Processing',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[2],
      }),
    },
    {
      // All features with value of "North" will be blue
      value: 3,
      label: 'For Legal Pass',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[3],
      }),
    },
    {
      // All features with value of "North" will be blue
      value: 4,
      label: 'For Appraisal/Offer to Buy',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[4],
      }),
    },
    {
      // All features with value of "North" will be blue
      value: 5,
      label: 'For Expro',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[5],
      }),
    },
  ],
});

// Custom popup for lot layer
const lotStatusArray = [
  'Handed-Over',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/Offer to Buy',
  'For Expro',
];

const landUseArray = [
  'Agricultural',
  'Agricultural & Commercial',
  'Agricultural / Residential',
  'Commercial',
  'Industrial',
  'Irrigation',
  'Residential',
  'Road',
  'Road Lot',
  'Special Exempt',
];

const endorsedStatus = ['Not Endorsed', 'Endorsed', 'NA'];

let customContentLot = new CustomContent({
  outFields: ['*'],
  creator: function (event: any) {
    // Extract AsscessDate of clicked pierAccessLayer
    const handedOverDate = event.graphic.attributes.HandedOverDate;
    const handOverArea = event.graphic.attributes.percentHandedOver;
    const statusLot = event.graphic.attributes.StatusLA;
    const landUse = event.graphic.attributes.LandUse;
    const municipal = event.graphic.attributes.Municipality;
    const barangay = event.graphic.attributes.Barangay;
    const landOwner = event.graphic.attributes.LandOwner;
    const cpNo = event.graphic.attributes.CP;
    const endorse = event.graphic.attributes.Endorsed;
    const endorsed = endorsedStatus[endorse];

    let daten: any;
    let date: any;
    if (handedOverDate) {
      daten = new Date(handedOverDate);
      const year = daten.getFullYear();
      const month = daten.getMonth();
      const day = daten.getDay();
      date = `${year}-${month}-${day}`;
    } else {
      date = 'Undefined';
    }
    // Convert numeric to date format 0
    //var daten = new Date(handedOverDate);
    //var date = dateFormat(daten, 'MM-dd-yyyy');
    //<li>Hand-Over Date: <b>${date}</b></li><br>

    return `<ul><li>Handed-Over Area: <b>${handOverArea} %</b></li><br>
    <li>Hand-Over Date: <b>${date}</b></li><br>
              <li>Status:           <b>${
                statusLot >= 0 ? lotStatusArray[statusLot] : ''
              }</b></li><br>
              <li>Land Use:         <b>${landUse >= 1 ? landUseArray[landUse - 1] : ''}</b></li><br>
              <li>Municipality:     <b>${municipal}</b></li><br>
              <li>Barangay:         <b>${barangay}</b></li><br>
              <li>Land Owner:       <b>${landOwner}</b>
              <li>CP:               <b>${cpNo}</b><br>
              <li>Endorsed:         <b>${endorsed}</b></li></ul>`;
  },
});

const templateLot = new PopupTemplate({
  outFields: ['*'],
  title: 'Lot No.: <b>{LotID}</b>',
  lastEditInfoEnabled: false,
  content: [customContentLot],
});

export const lotLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 7,
  labelingInfo: [lotIdLabel],
  renderer: lotLayerRenderer,
  popupTemplate: templateLot,
  title: 'Land Acquisition',
  minScale: 150000,
  maxScale: 0,
  //labelsVisible: false,
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

/* Endorsed Lot Layer */
// Endorsed lot layer
let endorsedLayerRenderer = new UniqueValueRenderer({
  field: 'Endorsed',
  defaultSymbol: lotDefaultSymbol,
  uniqueValueInfos: [
    {
      value: 0,
      label: 'Not Endorsed',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[5],
      }),
    },
    {
      value: 1,
      label: 'Endorsed',
      symbol: new SimpleFillSymbol({
        color: colorLotReqs[2],
      }),
    },
    {
      value: 2,
      label: 'NA',
      symbol: new SimpleFillSymbol({
        color: [211, 211, 211, 0.7],
      }),
    },
  ],
});

export const endorsedLotLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 7,
  renderer: endorsedLayerRenderer,
  labelingInfo: [lotIdLabel],
  outFields: ['*'],
  title: 'Land Acquisition (Endorsed Status)',
  minScale: 150000,
  maxScale: 0,
  //labelsVisible: false,
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

endorsedLotLayer.popupTemplate = templateLot;

/* Structure Layer */
const height = 5;
const edgeSize = 0.3;

const dismantled = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [0, 197, 255, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const paid = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [112, 173, 71, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const payp = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [0, 112, 255, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const legalpass = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [255, 255, 0, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const otc = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [255, 170, 0, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const lbp = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: height,
      material: {
        color: [255, 0, 0, 0.3],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const defaultStructureRenderer = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: 5,
      material: {
        color: [0, 0, 0, 0.4],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: edgeSize,
      }),
    }),
  ],
});

const structureRenderer = new UniqueValueRenderer({
  defaultSymbol: defaultStructureRenderer,
  defaultLabel: 'Other',
  field: 'StatusStruc',
  uniqueValueInfos: [
    {
      value: 1,
      symbol: dismantled,
      label: 'Dismantling/Clearing',
    },
    {
      value: 2,
      symbol: paid,
      label: 'Paid',
    },
    {
      value: 3,
      symbol: payp,
      label: 'For Payment Processing',
    },
    {
      value: 4,
      symbol: legalpass,
      label: 'For Legal Pass',
    },
    {
      value: 5,
      symbol: otc,
      label: 'For Appraisal/Offer to Compensation',
    },
    {
      value: 6,
      symbol: lbp,
      label: 'LBP Account Opening',
    },
  ],
});

export const structureLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 6,
  title: 'Structure',
  renderer: structureRenderer,
  outFields: ['*'],
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

// NLO Layer
const symbolSize = 30;
const nloSymbolRef = [
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Relocated.svg',
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_Paid.svg',
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_PaymentProcess.svg',
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LegalPass.svg',
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_OtC.svg',
  'https://EijiGorilla.github.io/Symbols/3D_Web_Style/ISF/ISF_LBP.svg',
];

const nloRenderer = new UniqueValueRenderer({
  field: 'StatusRC',
  valueExpression:
    "When($feature.StatusRC == 1, 'relocated', $feature.StatusRC == 2, 'paid', $feature.StatusRC == 3, 'payp', $feature.StatusRC == 4, 'legalpass', $feature.StatusRC == 5, 'otc', $feature.StatusRC == 6, 'lbp', $feature.StatusRC)",
  uniqueValueInfos: [
    {
      value: 'relocated',
      label: 'Relocated',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[0],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
    {
      value: 'paid',
      label: 'Paid',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[1],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
    {
      value: 'payp',
      label: 'For Payment Processing',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[2],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
    {
      value: 'legalpass',
      label: 'For Legal Pass',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[3],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
    {
      value: 'otc',
      label: 'For Appraisal/OtC/Reqs for Other Entitlements',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[4],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
    {
      value: 'lbp',
      label: 'LBP Account Opening',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: nloSymbolRef[5],
            },
            size: symbolSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
      }),
    },
  ],
});

export const nloLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 4,
  renderer: nloRenderer,
  outFields: ['*'],
  title: 'NLO (Non-Land Owner)',
  elevationInfo: {
    mode: 'relative-to-scene',
  },
  minScale: 10000,
  maxScale: 0,
  popupTemplate: {
    title: '<p>{StrucID}</p>',
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'StrucOwner',
            label: 'Structure Owner',
          },
          {
            fieldName: 'Municipality',
          },
          {
            fieldName: 'Barangay',
          },
          {
            fieldName: 'StatusRC',
            label: '<p>Status for Relocation</p>',
          },
          {
            fieldName: 'Name',
          },
          {
            fieldName: 'Status',
            label: 'NLO/LO Ownership (structure) ',
          },
        ],
      },
    ],
  },
});

/* Structure Ownership Layer */
let NLOLORenderer = new UniqueValueRenderer({
  field: 'Status',
  uniqueValueInfos: [
    {
      value: 1,
      label: 'LO (Land Owner)',
      symbol: new SimpleFillSymbol({
        style: 'forward-diagonal',
        color: [128, 128, 128, 1],
        outline: {
          color: '#6E6E6E',
          width: 0.3,
        },
      }),
    },
    {
      value: 2,
      label: 'NLO (Non-Land Owner)',
      symbol: new SimpleFillSymbol({
        style: 'vertical',
        color: [128, 128, 128, 1],
        outline: {
          color: '#6E6E6E',
          width: 0.3,
        },
      }),
    },
  ],
});

export const strucOwnershipLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  renderer: NLOLORenderer,
  layerId: 3,
  title: 'NLO/LO Ownership (Structure)',
  outFields: ['*'],
  popupEnabled: false,
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

/* Occupancy (Status of Relocation) */
const outlineColorOccupancy = 'gray';

var verticalOffsetExistingOccupancy = {
  screenLength: 10,
  maxWorldLength: 10,
  minWorldLength: 10,
};

function getUniqueValueSymbolOccupancy(name: any, size: any) {
  return {
    symbol: new PointSymbol3D({
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: {
            href: name,
          },
          size: size,
          outline: {
            color: 'white',
            size: 2,
          },
        }),
      ],
      verticalOffset: verticalOffsetExistingOccupancy,

      callout: {
        type: 'line', // autocasts as new LineCallout3D()
        color: [128, 128, 128, 0.6],
        size: 0.4,
        border: {
          color: 'grey',
        },
      },
    }),
  };
}

const occupancyPointSize = 20;
let occupancyRenderer = new UniqueValueRenderer({
  field: 'Occupancy',
  uniqueValueInfos: [
    {
      value: 0,
      label: 'Occupied',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: 'https://EijiGorilla.github.io/Symbols/Demolished.png',
            },
            size: occupancyPointSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
        verticalOffset: verticalOffsetExistingOccupancy,

        callout: {
          type: 'line', // autocasts as new LineCallout3D()
          color: [128, 128, 128, 0.6],
          size: 0.4,
          border: {
            color: 'grey',
          },
        },
      }),
    },
    {
      value: 1,
      label: 'Relocated',
      symbol: new PointSymbol3D({
        symbolLayers: [
          new IconSymbol3DLayer({
            resource: {
              href: 'https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png',
            },
            size: occupancyPointSize,
            outline: {
              color: 'white',
              size: 2,
            },
          }),
        ],
        verticalOffset: verticalOffsetExistingOccupancy,

        callout: {
          type: 'line', // autocasts as new LineCallout3D()
          color: [128, 128, 128, 0.6],
          size: 0.4,
          border: {
            color: 'grey',
          },
        },
      }),
    },
  ],
});

export const occupancyLayer = new FeatureLayer({
  portalItem: {
    id: 'dca1d785da0f458b8f87638a76918496',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 5,
  outFields: ['*'],
  title: 'Occupancy (Structure)',
  renderer: occupancyRenderer,
  elevationInfo: {
    mode: 'relative-to-scene',
  },
  popupTemplate: {
    title: '<p>{StrucID}</p>',
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'StrucOwner',
            label: 'Structure Owner',
          },
          {
            fieldName: 'Municipality',
          },
          {
            fieldName: 'Barangay',
          },
          {
            fieldName: 'Occupancy',
            label: '<p>Status for Relocation(structure)</p>',
          },
          {
            fieldName: 'Name',
          },
          {
            fieldName: 'Status',
            label: 'NLO/LO Ownership',
          },
        ],
      },
    ],
  },
});

/* Pier Head and Column */
const pHeight = 0;

const pierColumn = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: pHeight + 10,
      material: {
        color: [78, 78, 78, 0.5],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: 0.3,
      }),
    }),
  ],
});

const pierHead = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: pHeight + 10,
      material: {
        color: [169, 169, 169, 0.7],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: 1.0,
      }),
    }),
  ],
});

const pileCap = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: pHeight + 3,
      material: {
        color: [200, 200, 200, 0.7],
      },
      edges: new SolidEdges3D({
        color: '#4E4E4E',
        size: 1.0,
      }),
    }),
  ],
});

const pierHeadRenderer = new UniqueValueRenderer({
  defaultSymbol: new PolygonSymbol3D({
    symbolLayers: [
      {
        type: 'extrude',
        size: 5, // in meters
        material: {
          color: '#E1E1E1',
        },
        edges: new SolidEdges3D({
          color: '#4E4E4E',
          size: 1.0,
        }),
      },
    ],
  }),
  defaultLabel: 'Other',
  field: 'Layer',
  legendOptions: {
    title: 'Pier Head/Pier Column/Pile Cap',
  },
  uniqueValueInfos: [
    {
      value: 'Pier_Column',
      symbol: pierColumn,
      label: 'Column',
    },
    /*
  {
    value: "Pier_Head",
    symbol: pierHead,
    label: "Pier Head"
  },
  */
    {
      value: 'Pile_Cap',
      symbol: pileCap,
      label: 'Pile Cap',
    },
  ],
});

export const pierHeadColumnLayerLayer = new FeatureLayer({
  portalItem: {
    id: '590680d19f2e48fdbd8bcddce3aaedb5',
    portal: {
      url: 'https://gis.railway-sector.com/portal',
    },
  },
  layerId: 4,
  title: 'Pier Head/Column',
  definitionExpression: "Layer <> 'Pier_Head'",
  outFields: ['*'],
  minScale: 150000,
  maxScale: 0,
  renderer: pierHeadRenderer,
  popupEnabled: false,
  elevationInfo: {
    mode: 'on-the-ground',
  },
});

/* Pier Point Layer with access dates */
const pierAccessDateColor = {
  0: [0, 255, 0, 0.9], // Accessible (green)
  1: [255, 127, 80], // Orange
  2: [255, 255, 0], // Yellow
  3: [0, 112, 255], // Blue
  4: [143, 0, 255], // violet
  5: [255, 255, 255, 0.9],
  6: [255, 0, 0, 0.9], // Dates are missing
};

var defaultPierAccessSymbolRenderer = new SimpleRenderer({
  label: 'Accessible',
  symbol: new SimpleMarkerSymbol({
    size: 5,
    color: pierAccessDateColor[0],
    outline: {
      width: 0,
      color: 'black',
    },
  }),
});
const cutOffDateAccess = 1636070400000;

const pierAccessReadyDateLabel = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: pierAccessDateColor[0],
        },
        size: 15,
        font: {
          family: 'Ubuntu Mono',
          weight: 'bold',
        },
      }),
    ],
    verticalOffset: {
      screenLength: 80,
      maxWorldLength: 500,
      minWorldLength: 30,
    },
    callout: {
      type: 'line',
      size: 0.5,
      color: [0, 0, 0],
      border: {
        color: [255, 255, 255, 0.7],
      },
    },
  }),
  labelExpressionInfo: {
    expression: '$feature.PIER',
    //'DefaultValue($feature.GeoTechName, "no data")'
    //"IIF($feature.Score >= 13, '', '')"
    //value: "{Type}"
  },
  labelPlacement: 'above-center',
  where: "AccessDate <= '" + cutOffDateAccess + "'",
});

const pierAccessNotYetLabel = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: '#cccccc',
        },
        size: 10,
        font: {
          family: 'Ubuntu Mono',
          weight: 'normal',
        },
      }),
    ],
    verticalOffset: {
      screenLength: 80,
      maxWorldLength: 500,
      minWorldLength: 30,
    },
    callout: {
      type: 'line',
      size: 0.5,
      color: [0, 0, 0],
      border: {
        color: [255, 255, 255, 0.7],
      },
    },
  }),
  labelExpressionInfo: {
    expression: '$feature.PIER',
    //'DefaultValue($feature.GeoTechName, "no data")'
    //"IIF($feature.Score >= 13, '', '')"
    //value: "{Type}"
  },
  labelPlacement: 'above-center',
  where: "AccessDate > '" + cutOffDateAccess + "'" + ' OR ' + 'AccessDate IS NULL',
});

const pierAccessDateMissingLabel = new LabelClass({
  symbol: new LabelSymbol3D({
    symbolLayers: [
      new TextSymbol3DLayer({
        material: {
          color: '#ff0000',
        },
        size: 10,
        font: {
          family: 'Ubuntu Mono',
          weight: 'normal',
        },
      }),
    ],
    verticalOffset: {
      screenLength: 80,
      maxWorldLength: 500,
      minWorldLength: 30,
    },
    callout: {
      type: 'line',
      size: 0.5,
      color: [0, 0, 0],
      border: {
        color: [255, 255, 255, 0.7],
      },
    },
  }),
  labelExpressionInfo: {
    expression: '$feature.PIER',
    //'DefaultValue($feature.GeoTechName, "no data")'
    //"IIF($feature.Score >= 13, '', '')"
    //value: "{Type}"
  },
  labelPlacement: 'above-center',
  where: 'AccessDate IS NULL',
});

// 1. Get unique dates
const numberDate = new Date(cutOffDateAccess);
const cutDate = numberDate.toLocaleDateString('en-US');

export const pierAccessLayer = new FeatureLayer(
  {
    portalItem: {
      id: '590680d19f2e48fdbd8bcddce3aaedb5',
      portal: {
        url: 'https://gis.railway-sector.com/portal',
      },
    },
    layerId: 6,
    labelingInfo: [pierAccessDateMissingLabel, pierAccessReadyDateLabel, pierAccessNotYetLabel],
    title: 'Pier with Access Date',
    minScale: 150000,
    maxScale: 0,
    outFields: ['*'],
    elevationInfo: {
      mode: 'on-the-ground',
    },
  },
  //{ utcOffset: 300 },
);

// we first need to obtain unique values of date because valueExpression does not allow
// date'2021-10-01' notation
const queryDate = 'AccessDate IS NOT NULL';

let dates: any[] = [];
async function DateValues() {
  var query = pierAccessLayer.createQuery();

  query.where = queryDate;
  return pierAccessLayer.queryFeatures(query).then((response: any) => {
    var stats = response.features;

    // eslint-disable-next-line array-callback-return
    stats.forEach((result: any, index: any) => {
      const attributes = result.attributes;
      const date = attributes.AccessDate;
      dates.push(date);
    });
    return dates;
  });
}

let uniqueValues: any[] = [];
async function uniqueDateValues(values: any) {
  // eslint-disable-next-line array-callback-return
  values.forEach((item: any, index: any) => {
    if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== '') {
      uniqueValues.push(item);
    }
  });
  const sortedDates = uniqueValues.sort();
  return sortedDates;
}

function uniqueValuesInfos(sortedDates: any) {
  const dates = sortedDates.map((date: any, index: any) => {
    const temp = new Date(date);
    const labelDate = temp.toLocaleDateString('en-US');
    return Object.assign(
      {},
      {
        value: date, // make sure to use 'number'. you cannot add 'date'
        label: labelDate,
      },
    );
  });
  console.log(dates);
}
DateValues().then(uniqueDateValues).then(uniqueValuesInfos);

// 2. Point Symbol Renderer
var defaultPointSymbol = new SimpleRenderer({
  label: 'Accessible',
  symbol: new SimpleMarkerSymbol({
    size: 5,
    color: pierAccessDateColor[0],
    outline: {
      width: 0,
      color: 'black',
    },
  }),
});

const pierAccessRenderer = new UniqueValueRenderer({
  field: 'AccessDate',

  valueExpression:
    "When(IsEmpty($feature.AccessDate), 'empty', $feature.AccessDate <= 1636070400000, 'accessible', $feature.AccessDate > 1636070400000, 'others',$feature.AccessDate)",
  uniqueValueInfos: [
    {
      value: 'empty',
      label: 'Dates are missing',
      symbol: new SimpleMarkerSymbol({
        size: 5,
        color: pierAccessDateColor[6],
        outline: {
          width: 0.1,
          color: 'white',
        },
      }),
    },
    {
      value: 'accessible',
      label: 'Accessible',
      symbol: new SimpleMarkerSymbol({
        size: 5,
        color: pierAccessDateColor[0],
        outline: {
          width: 0.1,
          color: 'white',
        },
      }),
    },
    {
      value: 'others',
      label: 'Others',
      symbol: new SimpleMarkerSymbol({
        size: 5,
        color: pierAccessDateColor[5],
        outline: {
          width: 0.1,
          color: 'white',
        },
      }),
    },
  ],
});
pierAccessLayer.renderer = pierAccessRenderer;

// 3. Popup Template
function dateFormat(inputDate: any, format: any) {
  //parse the input date
  const date = new Date(inputDate);

  //extract the parts of the date
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  //replace the month
  format = format.replace('MM', month.toString().padStart(2, '0'));

  //replace the year
  if (format.indexOf('yyyy') > -1) {
    format = format.replace('yyyy', year.toString());
  } else if (format.indexOf('yy') > -1) {
    format = format.replace('yy', year.toString().substr(2, 2));
  }

  //replace the day
  format = format.replace('dd', day.toString().padStart(2, '0'));

  return format;
}

// Custom Popup Content for pierAccessLayer
let customContent = new CustomContent({
  outFields: ['*'],
  creator: function (event: any) {
    // Extract AsscessDate of clicked pierAccessLayer
    const statsDate = event.graphic.attributes.AccessDate;
    const pierNo = event.graphic.attributes.PIER;

    // Convert numeric to date format
    const date = new Date(statsDate);
    let dateValue = dateFormat(date, 'MM-dd-yyyy');

    const ddd = new Date(cutOffDateAccess);
    let dddValue = dateFormat(ddd, 'MM-dd-yyyy');

    //console.log(dateValue + "; " + dddValue);

    // If the date is before current date, popupContent should be "AVAILABLE"
    let DATES;
    if (dateValue === '01-01-1970') {
      // Empty date is entered as this
      DATES = 'NO DATES AVAILABLE';
    } else if (statsDate <= cutOffDateAccess) {
      DATES = 'ACCESSIBLE';
    } else if (statsDate > cutOffDateAccess) {
      DATES = dateValue;
    }

    //return `Access Date: <b>${DATES}</b>`;
    return `Access Date: <b>${DATES}</b>`;
  },
});

const template = new PopupTemplate({
  outFields: ['*'],
  title: 'Pier No: <b>{PIER}</b>',
  lastEditInfoEnabled: false,
  content: [customContent],
});
pierAccessLayer.popupTemplate = template;
