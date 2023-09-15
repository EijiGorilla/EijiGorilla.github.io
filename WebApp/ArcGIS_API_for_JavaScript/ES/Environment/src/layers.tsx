import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import { PolygonSymbol3D, ExtrudeSymbol3DLayer } from '@arcgis/core/symbols';
import SolidEdges3D from '@arcgis/core/symbols/edges/SolidEdges3D';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import PopupTemplate from '@arcgis/core/PopupTemplate';

/*
export const water = new VectorTileLayer({
  portalItem: {
    id: 'cd266578c33f4724acb93b9fff57cbb6',
  },
});
*/
/* The colors used for the each transit line */
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
  labelingInfo: [LOT_LABEL_CLASS],
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
function dateFormat(date: Date, arg1: string) {
  throw new Error('Function not implemented.');
}
