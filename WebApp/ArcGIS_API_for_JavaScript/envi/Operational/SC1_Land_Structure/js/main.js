require([
  "esri/Basemap",
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/support/FeatureFilter",
  "esri/layers/SceneLayer",
  "esri/layers/Layer",
  "esri/layers/TileLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/support/LabelClass",
  "esri/symbols/LabelSymbol3D",
  "esri/WebMap",
  "esri/WebScene",
  "esri/portal/PortalItem",
  "esri/portal/Portal",
  "esri/widgets/TimeSlider",
  "esri/widgets/Legend",
  "esri/widgets/LayerList",
  "esri/widgets/Fullscreen",
  "esri/rest/geometryService",
  "esri/rest/support/Query",
  "esri/rest/support/StatisticDefinition",
  "esri/symbols/WebStyleSymbol",
  "esri/TimeExtent",
  "esri/widgets/Expand",
  "esri/widgets/Editor",
  "esri/renderers/UniqueValueRenderer",
  "esri/widgets/support/DatePicker",
  "esri/widgets/FeatureTable",
  "esri/widgets/Compass",
  "esri/layers/ElevationLayer",
  "esri/Ground",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Search",
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground,
            GraphicsLayer, Search) {

let chartLayerView;
var highlightSelect;
////////////////////////////////////////////////////
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "8a9ef2a144e8423786f6139408ac3424" // 3a62040541b84f528da3ac7b80cf4a63
      }
    })
  ]
});

   var map = new Map({
        basemap: "gray-vector", // "streets-night-vector", basemap
        ground: "world-elevation"
  }); 
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.5;
   
  var view = new MapView({
      map: map,
      center: [121.0477729, 14.4136156],
      zoom: 10,
      container: "viewDiv",
      environment: {
          background: {
              type: "color", // autocasts as new ColorBackground()
              color: [0, 0, 0, 1]
              },
              // disable stars
              starsEnabled: false,
              //disable atmosphere
              atmosphereEnabled: false
              }
  });

  //
  function shiftCamera(deg) {
    var camera = view.camera.clone();
    camera.position.longitude += deg;
    return camera;
  }

  function catchAbortError(error) {
    if (error.name != "AbortError") {
      console.error(error);
    }
  }

  // Setup UI
  var applicationDiv = document.getElementById("applicationDiv");

  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");

  var lengendDiv = document.getElementById("lengendDiv");
  var lotListExproDiv = document.getElementById("lotListExproDiv");

  // Lot Statistics:
  var lotStatsDiv = document.getElementById("lotStatsDiv");
  var lotChartDiv = document.getElementById("lotChartDiv");
  //var lotTotalNumberDiv = document.getElementById("lotTotalNumberDiv");

  var lotPteDiv = document.getElementById("lotPteDiv");

   // Structure Statistics:
   var structureStatsDiv = document.getElementById("structureStatsDiv");
  var structureChartDiv = document.getElementById("structureChartDiv");
  

  var barangayChartDiv = document.getElementById("barangayChartDiv");



  var structurePteDiv = document.getElementById("structurePteDiv");       


  var chartTitleDiv = document.getElementById("chartTitleDiv");
  var StructureChartTitleDiv = document.getElementById("structureChartTitleDiv");


  const utilTypesButton = document.getElementById("dataTypeInput");

const cpButtonElement = document.getElementById("cpButton");
const refuseListElement = document.getElementById("refuseButton");


//*******************************//
// Label Class Property Settings //
//*******************************//
// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KmSpot"},
symbol: {
type: "text",
color: [85, 255, 0],
size: 25,
haloColor: "black",
haloSize: 0.5
}
});

// Pier No label
var labelPierNo = new LabelClass({
labelExpressionInfo: {expression: "$feature.PIER"},
symbol: {
type: "text",
color: [0, 112, 255],
size: 25,
haloColor: "black",
haloSize: 0.5
}
});

// Station label

var labelStation = new LabelClass({
labelExpressionInfo: {expression: "$feature.Station"},
symbol: {
type: "text",
color: [0,0,0],
size: 35,
haloColor: "white",
haloSize: 1
}
});
//*****************************//
//      Renderer Settings      //
//*****************************// 
// Chainage symbol
var chainageRenderer = {
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: [255, 255, 255, 0.9],
outline: {
  width: 0.2,
  color: "black"
}
}
};

// pier No
var pierNoRenderer = {
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: [255, 255, 255, 0.9],
outline: {
  width: 0.2,
  color: "black"
}
}
}

// PNR
let pnrRenderer = {
type: "unique-value",
valueExpression: "When($feature.LandOwner == 'MANILA RAILROAD COMPANY' || $feature.LandOwner == 'Manila Railroad Company','PNR',$feature.LandOwner)",
uniqueValueInfos: [
{
value: "PNR",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0.5],
  style: "diagonal-cross",
  outline: {
    width: 0.5,
    color: "black"
  }
}
}
]
};

// Station Box
let stationBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "Extension Platform for 10 cars",
symbol: {
  type: "simple-fill",
  color: [160, 160, 160],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "Platform",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "cross",
  outline: {
    width: 1,
    color: "black",
    style: "short-dash"
  }
}
},
{
value: "Station Box",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0],
  outline: {
    width: 2,
    color: [115, 0, 0]
  }
}
}
]
};

// Pier Heand Pier Column
let pierHeadColRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill" },  // autocasts as new SimpleFillSymbol()
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "Pier_Column",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [78, 78, 78, 0.5],
}
},
{
// All features with value of "North" will be blue
value: "Pier_Head",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [169, 169, 169, 0.7]
}
}
]
};


// Standalone status of relocation table
let reloStatusLayerRenderer = {
type: "simple",  // autocasts as new SimpleRenderer()
symbol: {
type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
size: 4,
color: [0, 0, 0, 0],
outline: {  // autocasts as new SimpleLineSymbol()
width: 0.4,
color: "#A8A800"
}
}
};

// Default symbol
let defaultSymbol = {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
style: "solid",
outline: {  // autocasts as new SimpleLineSymbol()
color: [110, 110, 110],
width: 0.7
}
};

let lotLayerRenderer = {
type: "unique-value",
field: "Reqs",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.Reqs == 1, '1', $feature.Reqs == 2, '2', \
                   $feature.Reqs == 3, '3', $feature.Reqs == 4, '4', \
                   $feature.Reqs == 5, '5', $feature.Reqs == 6, '6', \
                   $feature.Reqs == 7, '7', $feature.Reqs == 8, '8', $feature.Reqs)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[1],
}
},
{
// All features with value of "North" will be blue
value: "2",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[2],
}
},
{
// All features with value of "North" will be blue
value: "3",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[3],
}
},
{
// All features with value of "North" will be blue
value: "4",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[4],
}
},
{
// All features with value of "North" will be blue
value: "5",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[5],
}
},
{
// All features with value of "North" will be blue
value: "6",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[6],
}
},
{
// All features with value of "North" will be blue
value: "7",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[7],
}
},
{
value: "8",
symbol: {
  type: "simple-fill",
  color: colorLotReqs()[8],
  style: "diagonal-cross",
  outline: {
    width: 0.5,
    color: "black"
  }
}
}
]
}

// Priority
let lotPriorityRenderer = {
type: "unique-value",
field: "Priority1",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.Priority1 == 1, '1', $feature.Priority1 == 2, '2', \
                   $feature.Priority1 == 3, '3', $feature.Priority1)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[1]
  }
}
},
{
// All features with value of "North" will be blue
value: "2",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[2]
  }
}
},
{
value: "3",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[3]
  }
}
},
]
}

let barangayRenderer = {
type: "unique-value",
field: "Coop",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.Coop == 1, '1', $feature.Coop == 2, '2', \
                   $feature.Coop == 3, '3', $feature.Coop == 4, '4', \
                   $feature.Coop == 5, '5', $feature.Coop == 6, '6', $feature.Coop)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[1]
  }
}
},
{
// All features with value of "North" will be blue
value: "2",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[2]
  }
}
},
{
// All features with value of "North" will be blue
value: "3",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[3]
  }
}
},
{
// All features with value of "North" will be blue
value: "4",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[4]
  }
}
},
{
// All features with value of "North" will be blue
value: "5",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[5]
  }
}
},
{
// All features with value of "North" will be blue
value: "6",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 2,
    color: colorBarangay()[6]
  }
}
},
]
}

let structureRenderer = {
type: "unique-value",
field: "BasicPlan",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.BasicPlan == 1, '1', $feature.BasicPlan == 2, '2', \
                   $feature.BasicPlan == 3, '3', $feature.BasicPlan == 4, '4', \
                   $feature.BasicPlan == 5, '5', $feature.BasicPlan == 6, '6', \
                   $feature.BasicPlan == 7, '7', $feature.BasicPlan)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[1],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
            }
},
},
{
// All features with value of "North" will be blue
value: "2",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[2],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
{
// All features with value of "North" will be blue
value: "3",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[3],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
{
// All features with value of "North" will be blue
value: "4",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[4],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
{
// All features with value of "North" will be blue
value: "5",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[5],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
{
// All features with value of "North" will be blue
value: "6",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[6],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
{
// All features with value of "North" will be blue
value: "7",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructure()[7],
style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
},
},
]
}

// Lot Requirements symbol
function colorLotReqs(){
return {
1: [0,0,128],
2: [49,149,183],
3: [68,85,90],
4: [255,170,0],
5: [255,255,0],
6: [255,255,255],
7: [255,0,0],
8: [0,0,0,0.5]
}
}

function colorPriority() {
return {
1: [255,0,0],
2: [255,255,0],
3: [0,0,0]
}
}

function colorBarangay() {
return {
1: [0,0,128,0.5],
2: [68,85,90,0.5],
3: [255,255,255,0.5],
4: [255,170,0,0.5],
5: [255,0,0,0.5],
6: [0,0,0,0.5]
}

}

function colorStructure() {
return {
1: [0,0,128], // Complete
    2: [68,85,90], // Surveyed and for drafting
    3: [255,255,255], // For Survey
    4: [255,255, 0], // For Reschedule
    5: [255,204,203], // Missing tag or structure or owner
    6: [255,0,0], //  refused
    7: [0,0,0,0.5] // NA
}
}

// Fill symbol color for Structure Layer (Status of Structure)
const colors = {
    1: [0,0,128], // Complete
    2: [68,85,90], // Surveyed and for drafting
    3: [255,255,255], // For Survey
    4: [255,255, 0], // For Reschedule
    5: [255,204,203], // Missing tag or structure or owner
    6: [255,0,0], //  refused
    7: [0,0,0,0.5] // NA
  };

// Fill symbol color for Structure Layer (NLO/LO)


//*******************************//
// Import Layers                 //
//*******************************//
// Station point feature
var stationLayer = new FeatureLayer({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
title: "Station",
outFields: ["*"],
popuEnabled: false,
labelingInfo: [labelStation]
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer,0);

// Pier head and column
var pierHeadColumnLayerLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Pier Head/Column",
outFields: ["*"],
renderer: pierHeadColRenderer,
popupEnabled: false
});
pierHeadColumnLayerLayer.listMode = "hide";
map.add(pierHeadColumnLayerLayer, 1);

var chainageLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
title: "Chainage",
elevationInfo: {
mode: "relative-to-ground"
},
labelingInfo: [labelChainage],
renderer: chainageRenderer,
outFields: ["*"],
popupEnabled: false

});

//chainageLayer.listMode = "hide";
map.add(chainageLayer, 1);

// Pier No. (point feature)
var PierNoLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
labelingInfo: [labelPierNo],
renderer: pierNoRenderer,
title: "Pier No.",
outFields: ["*"],
popupEnabled: false

});


// Station box
var stationBoxLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
renderer: stationBoxRenderer,
title: "Station Box",
outFields: ["*"],
popupEnabled: false
});
stationBoxLayer.listMode = "hide";
map.add(stationBoxLayer);

//chainageLayer.listMode = "hide";
map.add(PierNoLayer, 1);

// ROW //
var rowLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "ROW",
popupEnabled: false
});
map.add(rowLayer,2);


// Priority Lot
var priorityLayer = new FeatureLayer ({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 8,
renderer: lotPriorityRenderer,
definitionExpression: "ContSubm = 1",
title: "Priority Lot",
popupEnabled: false
});
map.add(priorityLayer,0);

// Free and Clear Lot //
var fncLayer = new FeatureLayer ({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 9,
title: "Free and Clear",
popupEnabled: false
});
map.add(fncLayer,2);

// Relocation Status point layer


// Land 
var lotLayer = new FeatureLayer({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 14,
renderer: lotLayerRenderer,
definitionExpression: "ContSubm = 1",
  outFields: ["*"],
  title: "Lot Requirements",
  labelsVisible: false,
  popupTemplate: {
    title: "<p>{LotID}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "LandOwner",
            label: "Land Owner"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "Reqs",
            label: "<p>Requirements</p>"
          },
          {
            fieldName: "Priority1",
            label: "<p>Priority</p>"
          }
        ]
      }
    ]
  }
});
map.add(lotLayer, 1);

// PNR
var pnrLayer = new FeatureLayer({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 17,
  outFields: ["*"],
  title: "PNR",
  labelsVisible: false,
  popuEnabled: false,
  renderer: pnrRenderer

});
map.add(pnrLayer, 1);

// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 13,
definitionExpression: "ContSubm = 1",
renderer: structureRenderer,
  title: "Structure Basic Plan",
  outFields: ["*"],
  popupTemplate: {
    title: "<p>{StrucID}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StrucOwner",
            label: "Structure Owner"
          },
          {
            fieldName: "BasicPlan",
            label: "<p>Status of Structure</p>"
          },               
          {
            fieldName: "LotID",
            label: "Lot ID"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          }
        ]
      }
    ]
  }
});
map.add(structureLayer);

/*
function renderStructureLayer() {
    const renderer = new UniqueValueRenderer({
      field: "BasicPlan"
    });

    for (let property in colors) {
      if (colors.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "simple-fill",
            color: colors[property],
            style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
           }
        });
      }
    }

    structureLayer.renderer = renderer;
  }

  renderStructureLayer();
*/

// Barangay
var barangayLayer = new FeatureLayer({
portalItem: {
id: "21212e2402314a88abc95f6b2780276e",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
renderer: barangayRenderer,
  outFields: ["*"],
  title: "Barangay",
  popupTemplate: {
    title: "<p>{Barangay}</p>",

    content: [
      {
        type: "fields",
        fieldInfos: [
        {
            fieldName: "Municipality"
          },
          {
            fieldName: "Subcon",
            label: "Subcontractors"
          },
          {
            fieldName: "Coop",
            label: "<p>Cooperation</p>"
          }
        ]
      }
    ]
  }
  //labelsVisible: false,
  //popuEnabled: false,

});
map.add(barangayLayer);

// 
const lotStrucReloTypeButton = document.getElementById("dataTypeInput");
const selectedButton = document.getElementById("SelectedButton");

// Progress Chart //
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default
updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
// Click event handler for Lot, Structure, and Relocation


//*******************************//
//      Progress Chart           //
//*******************************//
/* Function for zooming to selected layers */
function zoomToLayer(layer) {
return layer.queryExtent().then(function(response) {
view.goTo(response.extent, { //response.extent
speedFactor: 2
}).catch(function(error) {
if (error.name != "AbortError") {
  console.error(error);
}
});
});
}



// Thousand separators function
function thousands_separators(num)
{
var num_parts = num.toString().split(".");
num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return num_parts.join(".");
}

// Define 
var municipalSelect = document.getElementById("valSelect");
var barangaySelect = document.getElementById("barangaySelect");
var prioritySelect = document.getElementById("prioritySelect");

////////////////////////////////////////////////




// Query all features from lot layer to extract a list of municipalities 
// before selecting from drop-down list
view.when(function() {
return lotLayer.when(function() {
  var query = lotLayer.createQuery();
  return lotLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)


// newValue1: municipality, "1st"
// newValue2: Barangay
// newValue3: Priority1

function queryForLotGeometries() {
var lotQuery = lotLayer.createQuery();

return lotLayer.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});

var structureQuery = structureLayer.createQuery();

return structureLayer.queryFeatures(structureQuery).then(function(response) {
structureGeometries = response.features.map(function(feature) {
  return feature.geometry;
});
return structureGeometries;
});
}


// 1. Write Function to filter Barangay and Priority
/// 1.1. Filter Lot for Municipality List
function filterLotMunicipality() {
var query2 = lotLayer.createQuery();
query2.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?

lotLayer.queryFeatures(query2)
.then(getQuery2Values)
.then(getUniqueValues2)
.then(addToSelectQuery2);
}

/// 1.2. Filter Lot for Priority List
function filterLotPriorityMunicipality() {
var query3 = lotLayer.createQuery();
query3.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?

lotLayer.queryFeatures(query3)
.then(getQuery3Values)
.then(getUniqueValues3)
.then(addToSelectQuery3);
}

/// 1.3. Filter Barangay for Priority List
function filterLotPriorityBarangay() {
var query4 = barangayLayer.createQuery();
query4.where = barangayLayer.definitionExpression; // use filtered municipality. is this correct?

barangayLayer.queryFeatures(query4)
.then(getQuery4Values)
.then(getUniqueValues4)
.then(addToSelectQuery4);
}

/////////////////////////////////////////////////////////////////////////
// 2. Get values and Return to list
//Return an array of all the values in the 'Municipality' field'
/// 2.1. Municipality
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.Municipality;
});
return values;
}

// Return an array of unique values in the 'Municipality' field of the lot Layer
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
  }
});
return uniqueValues;
}

// Add the unique values to the municipalility select element. this will allow the user
// to filter lot layer by municipality.
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  municipalSelect.add(option);
});
//return setMunicipalExpression(municipalSelect.value);
}

/// 2.2. Barangay
// Filter Barangay List when Municipalit list changes
function getQuery2Values(response) {
var featuresQuery2 = response.features;
var query2Values = featuresQuery2.map(function(feature) {
return feature.attributes.Barangay;
});
return query2Values;
}

function getUniqueValues2(values2) {
var uniqueValues2 = [];
values2.forEach(function(item, i) {
  if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
      uniqueValues2.push(item);
  }
});
return uniqueValues2;
}

// Add the unique values to the second select element (Barangay)
function addToSelectQuery2(query2Values) {
barangaySelect.options.length = 0;
query2Values.sort();
query2Values.unshift('None');
query2Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
barangaySelect.add(option);
});

//return setLotBarangayExpression(barangaySelect.value);
}


/// 2.3. Priority
// 2.3.1. Filter Priority List when Municipalit list changes
function getQuery3Values(response) {
var featuresQuery3 = response.features;
var query3Values = featuresQuery3.map(function(feature) {
return feature.attributes.Priority1_1;
});
return query3Values;
}

function getUniqueValues3(values3) {
var uniqueValues3 = [];
values3.forEach(function(item, i) {
  if ((uniqueValues3.length < 1 || uniqueValues3.indexOf(item) === -1) && item !== "") {
      uniqueValues3.push(item);
  }
});
return uniqueValues3;
}

function addToSelectQuery3(query3Values) {
prioritySelect.options.length = 0;
query3Values.sort();
query3Values.unshift('None');
query3Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
prioritySelect.add(option);
});

//return setLotBarangayExpression(barangaySelect.value);
}

// 2.3.2. Filter Priority List when Barangay list changes
function getQuery4Values(response) {
var featuresQuery4 = response.features;
var query4Values = featuresQuery4.map(function(feature) {
return feature.attributes.Priority1_1;
});
return query4Values;
}

function getUniqueValues4(values4) {
var uniqueValues4 = [];
values4.forEach(function(item, i) {
  if ((uniqueValues4.length < 1 || uniqueValues4.indexOf(item) === -1) && item !== "") {
      uniqueValues4.push(item);
  }
});
return uniqueValues4;
}

function addToSelectQuery4(query4Values) {
prioritySelect.options.length = 0;
query4Values.sort();
query4Values.unshift('None');
query4Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
prioritySelect.add(option);
});

//return setLotBarangayExpression(barangaySelect.value);
}

///////////////////////////////////////////////////////////////////////////////
// Set the definition expression on the lot layer
// to reflect the selecction of the user
// Only for Municipality
function setMunicipalExpression() {
var municipal = municipalSelect.options[municipalSelect.selectedIndex].value;

if (municipal == 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;

} else {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'";
}



//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// Only for Municipcality + Barangay
function setMunicipalBarangDefinitionExpression() {
var municipal = municipalSelect.options[municipalSelect.selectedIndex].value;
var barang = barangaySelect.options[barangaySelect.selectedIndex].value;

// headerTitleDiv.innerHTML = municipal + ", " + barang;

if (municipal == 'None' && barang == 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;

} else if (municipal !== 'None' && barang == 'None') {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'"; 

} else if (municipal == 'None' && barang !== 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;

} else {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
}

//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// for Municipcality + Barangay + Priority
function setMunicipalBarangayPriorityExpression() {
var municipal = municipalSelect.options[municipalSelect.selectedIndex].value;
var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
var priori = prioritySelect.options[prioritySelect.selectedIndex].value;

//headerTitleDiv.innerHTML = municipal + ", " + barang + ", "+ priori;

// all = 'None'
if (municipal == 'None' && barang == 'None' && priori == 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;

} else if (municipal == 'None' && barang == 'None' && priori !== 'None') {
lotLayer.definitionExpression = "Priority1_1 = '" + priori + "'";
//structureLayer.definitionExpression = "Priority1_1 = '" + priori + "'";
priorityLayer.definitionExpression = "Priority1_1 = '" + priori + "'"; 

} else if (municipal == 'None' && barang !== 'None' && priori == 'None') {
lotLayer.definitionExpression = "Barangay = '" + barang + "'";
structureLayer.definitionExpression = "Barangay = '" + barang + "'";
priorityLayer.definitionExpression = "Barangay = '" + barang + "'"; 

} else if (municipal == 'None' && barang !== 'None' && priori !== 'None') {
lotLayer.definitionExpression = "Barangay = '" + barang + "'" + " AND " + "Priority1_1 = '" + priori + "'";
structureLayer.definitionExpression = "Barangay = '" + barang + "'";
priorityLayer.definitionExpression = "Barangay = '" + barang + "'" + " AND " + "Priority1_1 = '" + priori + "'"; 

} else if (municipal !== 'None' && barang == 'None' && priori == 'None') {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'";

} else if (municipal !== 'None' && barang == 'None' && priori !== 'None') {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Priority1_1 = '" + priori + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Priority1_1 = '" + priori + "'";

} else if (municipal !== 'None' && barang !== 'None' && priori == 'None') {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'"; 

} else {
lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'" + " AND " + "Priority1_1 = '" + priori + "'";
structureLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'";
priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barang + "'" + " AND " + "Priority1_1 = '" + priori + "'";
}


//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}





//////////////////////////////////////////////////////////////////////
// addEventListener for Municipality, Barangay, and Priority
municipalSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;


setMunicipalExpression();
filterLotMunicipality();
filterLotPriorityMunicipality();
filterLotPriorityBarangay();


updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateBarangay()
updatePriorityChartLot();

zoomToLayer(lotLayer);

});

barangaySelect.addEventListener("change", function() {
var type = event.target.value;

setMunicipalBarangDefinitionExpression();
filterLotPriorityMunicipality();
filterLotPriorityBarangay();

//headerTitleDiv.innerHTML = strregion + ", " + strstate;
updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateBarangay();
updatePriorityChartLot();
zoomToLayer(lotLayer);
//relocationObjectID(reloStatusLayer);

});


prioritySelect.addEventListener("change", function() {
var type = event.target.value;

//headerTitleDiv.innerHTML = strregion + ", " + strstate + ", " + type;

setMunicipalBarangayPriorityExpression();

//headerTitleDiv.innerHTML = strregion + ", " + strstate;
updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateBarangay();
updatePriorityChartLot();
zoomToLayer(lotLayer);
//relocationObjectID(reloStatusLayer);

});



//


// const refuseListElement = document.getElementById("refuseButton");
// 
let researchlayerView;
let barangaylayerView;

view.when(function() {

//reloStatusLayer.outFields = ["Name", "StatusRC", "Status"];
var ownerContainer = document.getElementById("relocationOwnerList");


// Obtain a list of Owner's names and status
view.whenLayerView(lotLayer).then(function(researchlayerView) {
researchlayerView.watch("updating", function(val) {
if (!val) {
  var query = new Query();
  query.where = "Reqs = 7";
  researchlayerView.queryFeatures(query).then(function(result) {
    ownerContainer.innerHTML = "";
    result.features.forEach(function(feature) {
      var attributes = feature.attributes;
      var li = document.createElement("li");
      li.setAttribute("class", "panel-result");

      const status = attributes.Reqs;
      if (status == 7) {
        statusla = "Refused"
      }

      li.innerHTML = "Lot ID: " + "<b>" + attributes.LotID + "</b>" + "<br>" + attributes.LandOwner + "</br>" + "<p>" + statusla + "</p>";
      li.addEventListener("click", function(event) {
        var target = event.target;

        var objectId = feature.attributes.OBJECTID;
        var queryExtent = new Query({
          objectIds: [objectId]
        });
        researchlayerView.queryExtent(queryExtent).then(function(result) {
          if (result.extent) {
            view.goTo({
              target: result.extent,
              speedFactor: 2,
              zoom: 17})
              .catch(function(error) {
                        if (error.name != "AbortError") {
                          console.error(error);
              }
            }); // End of catch
          } // End of if (result.extent)
        }); // End of layerView.queryExtent
        if (highlightSelect) {
          highlightSelect.remove();
        }
        highlightSelect = researchlayerView.highlight([objectId]);
        
    view.on("click", function() {
      researchlayerView.filter = null;
      highlightSelect.remove();
    });

      }); // End of li.addEventListener
      ownerContainer.appendChild(li);
    }); // End of result.features.forEach
  }); // End of layerView.queryFeatures
} // End of if (!val)
}); // End of layerView.watch
}); // End of view.whenLayerView
}); // End of view.when()



// Refused list for Barangay
var refusedListBarangay = document.getElementById("refusedListBaragayDiv");

view.when(function() {

//reloStatusLayer.outFields = ["Name", "StatusRC", "Status"];

//var ownerContainer = document.getElementById("relocationOwnerList");

// Obtain a list of Owner's names and status
view.whenLayerView(barangayLayer).then(function(barangaylayerView) {
barangaylayerView.watch("updating", function(val) {
if (!val) {
  var query = new Query();
  query.where = "Coop = 5";
  barangaylayerView.queryFeatures(query).then(function(result) {
    refusedListBarangay.innerHTML = "";
    result.features.forEach(function(feature) {
      var attributes = feature.attributes;
      var li = document.createElement("li");
      li.setAttribute("class", "panel-result");

      const status = attributes.Coop;
      if (status == 5) {
        statusla = "Refused"
      }

      li.innerHTML = "Municipality: " + "<b>" + attributes.Municipality + "</b>" + "<br>" + "Barangay: " + attributes.Barangay + "</br>" + "<p>" + statusla + "</p>";
      li.addEventListener("click", function(event) {
        var target = event.target;

        var objectId = feature.attributes.OBJECTID;
        var queryExtent = new Query({
          objectIds: [objectId]
        });
        barangaylayerView.queryExtent(queryExtent).then(function(result) {
          if (result.extent) {
            view.goTo({
              target: result.extent,
              speedFactor: 2,
              zoom: 17})
              .catch(function(error) {
                        if (error.name != "AbortError") {
                          console.error(error);
              }
            }); // End of catch
          } // End of if (result.extent)
        }); // End of layerView.queryExtent
        if (highlightSelect) {
          highlightSelect.remove();
        }
        highlightSelect = barangaylayerView.highlight([objectId]);
        
    view.on("click", function() {
      barangaylayerView.filter = null;
      highlightSelect.remove();
    });

      }); // End of li.addEventListener
      refusedListBarangay.appendChild(li);
    }); // End of result.features.forEach
  }); // End of layerView.queryFeatures
} // End of if (!val)
}); // End of layerView.watch
}); // End of view.whenLayerView
}); // End of view.when()






//////
const chartTitleLabel = "Progress of Land Acquisition (%)";
const chartTitleLabelStructure = "Progress of Structure (%)";

const chartElement = document.getElementById("chartPanel");
const chartElementStructure = document.getElementById("structureChartPanel");

var totalNumberDiv = document.getElementById("totalNumberDiv");
var structureTotalNumberDiv = document.getElementById("structureTotalNumberDiv");

//////////////////// Pie Chart ///////////////////////////////////////////////////
// Lot Chart
async function updateChartLot() {
var total_survdraft_struc = {
onStatisticField: "CASE WHEN Reqs = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survdraft_struc",
statisticType: "sum"
};

var total_survey_struc = {
onStatisticField: "CASE WHEN Reqs = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survey_struc",
statisticType: "sum"
};

var total_resche_struc = {
onStatisticField: "CASE WHEN Reqs = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_resche_struc",
statisticType: "sum"
};

var total_survdraft_lot = {
onStatisticField: "CASE WHEN Reqs = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survdraft_lot",
statisticType: "sum"
};

var total_second_lot = {
onStatisticField: "CASE WHEN Reqs = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_second_lot",
statisticType: "sum"
};

var total_survres_lot = {
onStatisticField: "CASE WHEN Reqs = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survres_lot",
statisticType: "sum"
};

var total_refuse_lot = {
onStatisticField: "CASE WHEN Reqs = 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_refuse_lot",
statisticType: "sum"
};

var total_na_lot = {
onStatisticField: "CASE WHEN Reqs = 8 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_na_lot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_survdraft_struc, total_survey_struc, total_resche_struc,
                   total_survdraft_lot, total_second_lot, total_survres_lot,
                  total_refuse_lot, total_na_lot];
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const comp = stats.total_survdraft_struc;
const incomp = stats.total_survey_struc;
const survplan = stats.total_resche_struc;
const survdraft = stats.total_survdraft_lot;
const research = stats.total_second_lot;
const survres = stats.total_survres_lot;
const refuse = stats.total_refuse_lot;
const nna = stats.total_na_lot;

const totalNumberLots = comp + incomp + survplan + survdraft + research + survres + refuse + nna;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.responsive.enabled = true;

// Add data
chart.data = [
{
  "Reqs": "Complete",
  "status": comp,
  "color": am4core.color("#000080")
},
{
  "Reqs": "Incomplete Documents",
  "status": incomp,
  "color": am4core.color("#3196B7")   
},
{
  "Reqs": "Surveyed and with plan",
  "status": survplan,
  "color": am4core.color("#44555A")
},
{
  "Reqs": "Surveyed and for drafting",
  "status": survdraft,
  "color": am4core.color("#FFAA00")
},
{
  "Reqs": "Researched",
  "status": research,
  "color": am4core.color("#FFFF00")    
},
{
  "Reqs": "For Survey & Research",
  "status": survres,
  "color": am4core.color("#FFFFFF")    
},
{
  "Reqs": "Refused",
  "status": refuse,
  "color": am4core.color("#FF0000")    
},
{
  "Reqs": "NA",
  "status": nna,
  "color": am4core.color("#FFFF0000")    
},
];

// Set inner radius
chart.innerRadius = am4core.percent(30);

// Add and configure Series

function createSlices(field, status){
var pieSeries = chart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = field;
pieSeries.dataFields.category = status;

pieSeries.slices.template.propertyFields.fill = "color";
pieSeries.slices.template.stroke = am4core.color("#fff");
pieSeries.slices.template.strokeWidth = 1;
pieSeries.slices.template.strokeOpacity = 1;

pieSeries.slices.template
// change the cursor on hover to make it apparent the object can be interacted with
.cursorOverStyle = [
{
"property": "cursor",
"value": "pointer"
}
];


// Hover setting
pieSeries.tooltip.label.fontSize = 12;

// Pie
//pieSeries.alignLabels = false;
//pieSeries.labels.template.bent = false;
pieSeries.labels.template.disabled = true;
pieSeries.labels.template.radius = 3;
pieSeries.labels.template.padding(0,0,0,0);
pieSeries.labels.template.fontSize = 9;
pieSeries.labels.template.fill = "#ffffff";

// Ticks (a straight line)
//pieSeries.ticks.template.disabled = true;
pieSeries.ticks.template.fill = "#ffff00";

// Create a base filter effect (as if it's not there) for the hover to return to
var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
shadow.opacity = 0;

// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Responsive code for chart
chart.responsive.enabled = true;
chart.responsive.useDefault = false

chart.responsive.rules.push({
relevant: function(target) {
if (target.pixelWidth <= 400) {
  return true;
}
return false;
},
state: function(target, stateId) {
if (target instanceof am4charts.PieSeries) {
  var state = target.states.create(stateId);
      
  var labelState = target.labels.template.states.create(stateId);
  labelState.properties.disabled = true;
      
  var tickState = target.ticks.template.states.create(stateId);
  tickState.properties.disabled = true;
  return state;
}
if (target instanceof am4charts.Legend) {
  var state = target.states.create(stateId);
  state.properties.paddingTop = 0;
  state.properties.paddingRight = 0;
  state.properties.paddingBottom = 0;
  state.properties.paddingLeft = 0;
  state.properties.marginLeft = 0;
  return state;
}
return null;
}
});
// Responsive code for chart

// Chart Title
let title = chart.titles.create();
title.text = "Lot Requirements";
title.fontSize = 20;
title.fill = am4core.color("#ffffff");
title.marginTop = 7;

// Add a legend
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze; 
pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
//pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";



var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 18;
markerTemplate.height = 18;
// This creates initial animation
//pieSeries.hiddenState.properties.opacity = 1;
//pieSeries.hiddenState.properties.endAngle = -90;
//pieSeries.hiddenState.properties.startAngle = -90;

// Click chart and filter, update maps

pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedD = ev.target.dataItem.category;

if (selectedD == "Complete") {
selectedStatus = 1;
} else if (selectedD == "Incomplete Documents") {
selectedStatus = 2;
} else if (selectedD == "Surveyed and with plan") {
selectedStatus = 3;
} else if (selectedD == "Surveyed and for drafting") {
selectedStatus = 4;
} else if (selectedD == "Researched") {
selectedStatus = 5;
} else if (selectedD == "For Survey & Research") {
selectedStatus = 6;
} else if (selectedD == "Refused") {
selectedStatus = 7;
} else if (selectedD == "NA") {
selectedStatus = 8;

} else {
selectedStatus = null;
}

view.when(function() {
view.whenLayerView(lotLayer).then(function (layerView) {
chartLayerView = layerView;
chartElement.style.visibility = "visible";

lotLayer.queryFeatures().then(function(results) {
  const ggg = results.features;
      const rowN = ggg.length;

      let objID = [];
      for (var i=0; i < rowN; i++) {
          var obj = results.features[i].attributes.OBJECTID;
          objID.push(obj);
      }

      var queryExt = new Query({
          objectIds: objID
      });

      lotLayer.queryExtent(queryExt).then(function(result) {
          if (result.extent) {
              view.goTo(result.extent)
          }
      });

      if (highlightSelect) {
          highlightSelect.remove();
      }
      highlightSelect = layerView.highlight(objID);

      view.on("click", function() {
      layerView.filter = null;
      highlightSelect.remove();
      });
}); // End of queryFeatures
layerView.filter = {
where: "Reqs = " + selectedStatus
}
}); // End of view.whenLayerView

}); // End of view.when
} // End of filterByChart

} // End of createSlices function

createSlices("status", "Reqs");

return totalNumberLots;

}); // End of queryFeatures
} // End of updateChartLot()

function totalNumberOfLots(totalNumberLots) {
totalNumberDiv.innerHTML = thousands_separators(totalNumberLots);
}

/////////////////////////////////////////////////////////////////////////////////////////

// Structure Chart
async function updateChartStructure() {
var total_complete_struc = {
onStatisticField: "CASE WHEN BasicPlan = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete_struc",
statisticType: "sum"
};

var total_survdraft_struc = {
onStatisticField: "CASE WHEN BasicPlan = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survdraft_struc",
statisticType: "sum"
};

var total_survey_struc = {
onStatisticField: "CASE WHEN BasicPlan = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_survey_struc",
statisticType: "sum"
};

var total_resche_struc = {
onStatisticField: "CASE WHEN BasicPlan = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_resche_struc",
statisticType: "sum"
};

var total_miss_struc = {
onStatisticField: "CASE WHEN BasicPlan = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_miss_struc",
statisticType: "sum"
};

var total_refuse_struc = {
onStatisticField: "CASE WHEN BasicPlan = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_refuse_struc",
statisticType: "sum"
};

var total_na_struc = {
onStatisticField: "CASE WHEN BasicPlan = 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_na_struc",
statisticType: "sum"
};  

var query = structureLayer.createQuery();
query.outStatistics = [total_complete_struc, total_survdraft_struc, total_survey_struc,
                   total_resche_struc, total_miss_struc, total_refuse_struc, total_na_struc];
query.returnGeometry = true;

return structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const complete = stats.total_complete_struc;
const survdraft = stats.total_survdraft_struc;
const survey = stats.total_survey_struc;
const resche = stats.total_resche_struc;
const miss = stats.total_miss_struc;
const refuse = stats.total_refuse_struc;
const nna = stats.total_na_struc;

const totalNumberStructures = complete + survdraft + survey + resche + miss + refuse + nna;

var chart = am4core.create("structureChartDiv", am4charts.PieChart);

chart.responsive.enabled = true;
// Add data
chart.data = [
{
  "BasicPlan": "Complete",
  "status": complete,
  "color": am4core.color("#000080")
},
{
  "BasicPlan": "Survey and for drafting",
  "status": survdraft,
  "color": am4core.color("#44555A")   
},
{
  "BasicPlan": "For Survey",
  "status": survey,
  "color": am4core.color("#FFFFFF") 
},
{
  "BasicPlan": "For Reschedule",
  "status": resche,
  "color": am4core.color("#FFFF00")
},
{
  "BasicPlan": "Missing tag or structure or owner",
  "status": miss,
  "color": am4core.color("#FFCCCB")    
},
{
  "BasicPlan": "Refused",
  "status": refuse,
  "color": am4core.color("#FF0000")    
},
{
  "BasicPlan": "NA",
  "status": nna,
  "color": am4core.color("#FFFF0000")    
}
];

// Set inner radius
chart.innerRadius = am4core.percent(30);

// Add and configure Series
function createSlices(field, status) {
var pieSeries = chart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = field;
pieSeries.dataFields.category = status;

pieSeries.slices.template.propertyFields.fill = "color";
pieSeries.slices.template.stroke = am4core.color("#fff");
pieSeries.slices.template.strokeWidth = 1;
pieSeries.slices.template.strokeOpacity = 1;

pieSeries.slices.template.adapter.add("fill", function(fill, target) {
var pattern = new am4core.LinePattern();
pattern.width = 7;
pattern.height = 7;
pattern.strokeWidth = 2;
pattern.stroke = target.dataItem.dataContext.color;
pattern.rotation = 135;
return pattern;
});

pieSeries.slices.template.background.adapter.add("fill", function(fill, target) {
return target.dataItem ? target.dataItem.dataContext.color : fill;
});

pieSeries.slices.template
// change the cursor on hover to make it apparent the object can be interacted with
.cursorOverStyle = [
{
"property": "cursor",
"value": "pointer"
}
];


// Hover setting
pieSeries.tooltip.label.fontSize = 12;

// Pie
//pieSeries.alignLabels = false;
//pieSeries.labels.template.bent = false;
pieSeries.labels.template.disabled = true;
pieSeries.labels.template.radius = 3;
pieSeries.labels.template.padding(0,0,0,0);
pieSeries.labels.template.fontSize = 9;
pieSeries.labels.template.fill = "#ffffff";

// Ticks (a straight line)
//pieSeries.ticks.template.disabled = true;
pieSeries.ticks.template.fill = "#ffff00";

// Create a base filter effect (as if it's not there) for the hover to return to
var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
shadow.opacity = 0;



// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Responsive code for chart
chart.responsive.enabled = true;
chart.responsive.useDefault = false

chart.responsive.rules.push({
relevant: function(target) {
if (target.pixelWidth <= 400) {
  return true;
}
return false;
},
state: function(target, stateId) {
if (target instanceof am4charts.PieSeries) {
  var state = target.states.create(stateId);
      
  var labelState = target.labels.template.states.create(stateId);
  labelState.properties.disabled = true;
      
  var tickState = target.ticks.template.states.create(stateId);
  tickState.properties.disabled = true;
  return state;
}
if (target instanceof am4charts.Legend) {
  var state = target.states.create(stateId);
  state.properties.paddingTop = 0;
  state.properties.paddingRight = 0;
  state.properties.paddingBottom = 0;
  state.properties.paddingLeft = 0;
  state.properties.marginLeft = 0;
  return state;
}
return null;
}
});
// Responsive code for chart

// Chart Title
let title = chart.titles.create();
title.text = "Structure Basic Plan";
title.fontSize = 20;
title.fill = am4core.color("#ffffff");
title.marginTop = 7;

// Add a legend
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze; 
pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
//pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";

chart.legend.horizontalGap = 0;
chart.legend.marginLeft = 0;
chart.legend.marginRight = 0;


var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 18;
markerTemplate.height = 18;
// This creates initial animation
//pieSeries.hiddenState.properties.opacity = 1;
//pieSeries.hiddenState.properties.endAngle = -90;
//pieSeries.hiddenState.properties.startAngle = -90;

// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedD = ev.target.dataItem.category;

if (selectedD == "Complete") {
selectedStatus = 1;
} else if (selectedD == "Survey and for drafting") {
selectedStatus = 2;
} else if (selectedD == "For Survey") {
selectedStatus = 3;
} else if (selectedD == "For Reschedule") {
selectedStatus = 4;
} else if (selectedD == "Missing tag or structure or owner") {
selectedStatus = 5;
} else if (selectedD == "Refused") {
selectedStatus = 6;
} else if (selectedD == "NA") {
selectedStatus = 7;

} else {
selectedStatus = null;
}

view.when(function() {
view.whenLayerView(structureLayer).then(function (layerView) {
chartLayerView = layerView;
chartElementStructure.style.visibility = "visible";

structureLayer.queryFeatures().then(function(results) {
  const ggg = results.features;
      const rowN = ggg.length;

      let objID = [];
      for (var i=0; i < rowN; i++) {
          var obj = results.features[i].attributes.OBJECTID;
          objID.push(obj);
      }

      var queryExt = new Query({
          objectIds: objID
      });

      structureLayer.queryExtent(queryExt).then(function(result) {
          if (result.extent) {
              view.goTo(result.extent)
          }
      });

      if (highlightSelect) {
          highlightSelect.remove();
      }
      highlightSelect = layerView.highlight(objID);

      view.on("click", function() {
      layerView.filter = null;
      highlightSelect.remove();
      });

}); // End of queryFeatures
layerView.filter = {
where: "BasicPlan = " + selectedStatus
}

}); // End of view.whenLayerView


}); // End of view.when

} // End of filterByChart
} // End of createSlices function

createSlices("status", "BasicPlan");

return totalNumberStructures;

});  // End of queryFeature                 
} // End of updateChartStructure()

function totalNumberOfStructures(totalNumberStructures) {
structureTotalNumberDiv.innerHTML = thousands_separators(totalNumberStructures);
}


/////////////////////////////////////////////////////////////////////
// Barangay Chart
async function updateBarangay() {
var total_coopassist_barang = {
onStatisticField: "CASE WHEN Coop = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_coopassist_barang",
statisticType: "sum"
};

var total_coopnoassist_barang = {
onStatisticField: "CASE WHEN Coop = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_coopnoassist_barang",
statisticType: "sum"
};

var total_coord_barang = {
onStatisticField: "CASE WHEN Coop = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_coord_barang",
statisticType: "sum"
};

var total_quaran_barang = {
onStatisticField: "CASE WHEN Coop = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_quaran_barang",
statisticType: "sum"
};

var total_refuse_barang = {
onStatisticField: "CASE WHEN Coop = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_refuse_barang",
statisticType: "sum"
};

var total_na_barang = {
onStatisticField: "CASE WHEN Coop = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_na_barang",
statisticType: "sum"
};  

var query = barangayLayer.createQuery();
query.outStatistics = [total_coopassist_barang, total_coopnoassist_barang, total_coord_barang,
                   total_quaran_barang, total_refuse_barang, total_na_barang];
query.returnGeometry = true;

return barangayLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const coopassist = stats.total_coopassist_barang;
const coopnoassist = stats.total_coopnoassist_barang;
const coord = stats.total_coord_barang;
const quaran = stats.total_quaran_barang;
const refuse = stats.total_refuse_barang;
const nna = stats.total_na_barang;

const totalNumberBarangay = coopassist + coopnoassist + coord + quaran + refuse + nna;

var chart = am4core.create("barangayChartDiv", am4charts.PieChart);
chart.responsive.enabled = true;

// Add data
chart.data = [
{
  "Coop": "Cooperative w/ assistance",
  "status": coopassist,
  "color": am4core.color("#000080")
},
{
  "Coop": "Cooperative w/out assistance",
  "status": coopnoassist,
  "color": am4core.color("#44555A")   
},
{
  "Coop": "For Coordination",
  "status": coord,
  "color": am4core.color("#FFFFFF") 
},
{
  "Coop": "Quarantine/Reschedule",
  "status": quaran,
  "color": am4core.color("#FFAA00")
},
{
  "Coop": "Refused",
  "status": refuse,
  "color": am4core.color("#FF0000")    
},
{
  "Coop": "NA",
  "status": nna,
  "color": am4core.color("#FFFF0000")    
}
];

// Set inner radius
chart.innerRadius = am4core.percent(30);

// Add and configure Series
function createSlices(field, status) {
var pieSeries = chart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = field;
pieSeries.dataFields.category = status;

pieSeries.slices.template.propertyFields.fill = "color";
pieSeries.slices.template.stroke = am4core.color("#fff");
pieSeries.slices.template.strokeWidth = 1;
pieSeries.slices.template.strokeOpacity = 1;

/*
pieSeries.slices.template.adapter.add("fill", function(fill, target) {
var pattern = new am4core.LinePattern();
pattern.width = 7;
pattern.height = 7;
pattern.strokeWidth = 1.5;
pattern.stroke = target.dataItem.dataContext.color;
pattern.rotation = 135;
return pattern;
});

pieSeries.slices.template.background.adapter.add("fill", function(fill, target) {
return target.dataItem ? target.dataItem.dataContext.color : fill;
});
*/

pieSeries.slices.template
// change the cursor on hover to make it apparent the object can be interacted with
.cursorOverStyle = [
{
"property": "cursor",
"value": "pointer"
}
];


// Hover setting
pieSeries.tooltip.label.fontSize = 12;

// Pie
//pieSeries.alignLabels = false;
//pieSeries.labels.template.bent = false;
pieSeries.labels.template.disabled = true;
pieSeries.labels.template.radius = 3;
pieSeries.labels.template.padding(0,0,0,0);
pieSeries.labels.template.fontSize = 9;
pieSeries.labels.template.fill = "#ffffff";

// Ticks (a straight line)
//pieSeries.ticks.template.disabled = true;
pieSeries.ticks.template.fill = "#ffff00";

// Create a base filter effect (as if it's not there) for the hover to return to
var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
shadow.opacity = 0;



// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Responsive code for chart
chart.responsive.enabled = true;
chart.responsive.useDefault = false

chart.responsive.rules.push({
relevant: function(target) {
if (target.pixelWidth <= 400) {
  return true;
}
return false;
},
state: function(target, stateId) {
if (target instanceof am4charts.PieSeries) {
  var state = target.states.create(stateId);
      
  var labelState = target.labels.template.states.create(stateId);
  labelState.properties.disabled = true;
      
  var tickState = target.ticks.template.states.create(stateId);
  tickState.properties.disabled = true;
  return state;
}
if (target instanceof am4charts.Legend) {
  var state = target.states.create(stateId);
  state.properties.paddingTop = 0;
  state.properties.paddingRight = 0;
  state.properties.paddingBottom = 0;
  state.properties.paddingLeft = 0;
  state.properties.marginLeft = 0;
  return state;
}
return null;
}
});
// Responsive code for chart

// Chart Title
let title = chart.titles.create();
title.text = "Cooperation (Barangay)";
title.fontSize = 20;
title.fill = am4core.color("#ffffff");
title.marginTop = 7;
//title.marginBottom = 10;

// Add a legend
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze; 
pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
//pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";

chart.legend.horizontalGap = 0;
chart.legend.marginLeft = 0;
chart.legend.marginRight = 0;


var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 18;
markerTemplate.height = 18;
// This creates initial animation
//pieSeries.hiddenState.properties.opacity = 1;
//pieSeries.hiddenState.properties.endAngle = -90;
//pieSeries.hiddenState.properties.startAngle = -90;

// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedD = ev.target.dataItem.category;

if (selectedD == "Cooperative w/ assistance") {
selectedStatus = 1;
} else if (selectedD == "Cooperative w/out assistance") {
selectedStatus = 2;
} else if (selectedD == "For Coordination") {
selectedStatus = 3;
} else if (selectedD == "Quarantine/Reschedule") {
selectedStatus = 4;
} else if (selectedD == "Refused") {
selectedStatus = 5;
} else if (selectedD == "NA") {
selectedStatus = 6;
} else {
selectedStatus = null;
}

view.when(function() {
view.whenLayerView(barangayLayer).then(function (layerView) {
chartLayerView = layerView;
chartElementStructure.style.visibility = "visible";

barangayLayer.queryFeatures().then(function(results) {
  const ggg = results.features;
      const rowN = ggg.length;

      let objID = [];
      for (var i=0; i < rowN; i++) {
          var obj = results.features[i].attributes.OBJECTID;
          objID.push(obj);
      }

      var queryExt = new Query({
          objectIds: objID
      });

      barangayLayer.queryExtent(queryExt).then(function(result) {
          if (result.extent) {
              view.goTo(result.extent)
          }
      });

      if (highlightSelect) {
          highlightSelect.remove();
      }
      highlightSelect = layerView.highlight(objID);

      view.on("click", function() {
      layerView.filter = null;
      highlightSelect.remove();
      });

}); // End of queryFeatures
layerView.filter = {
where: "Coop = " + selectedStatus
}

}); // End of view.whenLayerView


}); // End of view.when

} // End of filterByChart
} // End of createSlices function

createSlices("status", "Coop");

return totalNumberBarangay;

});  // End of queryFeature                 
} // End of updateChartStructure()

updateBarangay();



//////////////////// Bar Chart for MOA ///////////////////////////////////////////////////
// Lot
async function updatePriorityChartLot() {
var total_first_lot = {
onStatisticField: "CASE WHEN Priority1 = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_first_lot",
statisticType: "sum"
};

var total_second_lot = {
onStatisticField: "CASE WHEN Priority1 = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_second_lot",
statisticType: "sum"
};

var total_third_lot = {
onStatisticField: "CASE WHEN Priority1 = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_third_lot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_first_lot, total_second_lot, total_third_lot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const first = stats.total_first_lot;
const second = stats.total_second_lot;
const third = stats.total_third_lot;

var chart = am4core.create("lotMoaChartDiv", am4charts.XYChart);
//chart.responsive.enabled = true;
chart.hiddenState.properties.opacity = 0;
chart.padding(10, 10, 10, 10);

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 1;
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.labels.template.fontSize = 11;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeOpacity = 1;
categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
categoryAxis.renderer.grid.template.strokeWidth = 1.5;


//categoryAxis.renderer.cellStartLocation = 0;
//categoryAxis.renderer.cellEndLocation = 0.7;
/////////////////
categoryAxis.renderer.labels.template.fontSize = 13;
categoryAxis.renderer.line.strokeOpacity = 1;
categoryAxis.renderer.line.strokeWidth = 1.5;
categoryAxis.renderer.line.stroke = am4core.color("#FFFFFF");

// Create value axis

//////////////

var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 12;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.line.strokeOpacity = 1;
valueAxis.renderer.line.strokeWidth = 1.5;
valueAxis.renderer.line.stroke = am4core.color("#FFFFFF");

var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryY = "category";
series.dataFields.valueX = "value";
series.tooltipText = "{valueX.value}"
series.columns.template.strokeOpacity = 0;

var labelBullet = series.bullets.push(new am4charts.LabelBullet())
labelBullet.label.horizontalCenter = "left";
labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}"; //#.0as for 17k
labelBullet.locationX = 0.5;
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 15;

// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false

chart.responsive.rules.push({
relevant: function(target) {
if (target.pixelWidth <= 400) {
return true;
}

return false;
},
state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

/*
// Create a separate state for background
target.setStateOnChildren = true;
var bgstate = target.background.states.create(stateId);
bgstate.properties.fill = am4core.color("#fff");
bgstate.properties.fillOpacity = 0;
*/
return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});

// Add chart title
var title = chart.titles.create();
title.text = "[bold]Priority Lot[/]"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 16;
title.fill = "#3ce00a";

//series.columns.template.adapter.add("fill", function(fill, target){
// return chart.colors.getIndex(target.dataItem.index);
//});


chart.data = [
{
category: "1st Priority",
value: first,
color: am4core.color("#FF0000")
},
{
category: "2nd Priority",
value: second,
color: am4core.color("#FFFF00")
},
{
category: "3rd Priority",
value: third,
color: am4core.color("#FFFFFF00")
}
]; // End of chart


}); // End of queryFeatures

} // End of updatePriorityChartLot
updatePriorityChartLot();

am4core.options.autoDispose = true;
}); // End of am4core.ready



//*****************************//
//      Search Widget          //
//*****************************//
var searchWidget = new Search({
view: view,
locationEnabled: false,
allPlaceholder: "LotID, StructureID, Chainage",
includeDefaultSources: false,
sources: [
{
layer: lotLayer,
searchFields: ["LotID"],
displayField: "LotID",
exactMatch: false,
outFields: ["LotID"],
name: "Lot ID",
placeholder: "example: 10083"
},
{
layer: structureLayer,
searchFields: ["StrucID"],
displayField: "StrucID",
exactMatch: false,
outFields: ["StrucID"],
name: "Structure ID",
placeholder: "example: MCRP-01-02-ML022"
},
{
layer: chainageLayer,
searchFields: ["KmSpot"],
displayField: "KmSpot",
exactMatch: false,
outFields: ["*"],
name: "Main KM",
placeholder: "example: 80+400"
},
{
layer: PierNoLayer,
searchFields: ["PIER"],
displayField: "PIER",
exactMatch: false,
outFields: ["PIER"],
name: "Pier No",
zoomScale: 1000,
placeholder: "example: P-288"
}
]
});

const searchExpand = new Expand({
view: view,
content: searchWidget,
expandIconClass: "esri-icon-search",
group: "top-right"
});
  view.ui.add(searchExpand, {
    position: "top-right"
  });
searchExpand.watch("expanded", function() {
if(!searchExpand.expanded) {
searchWidget.searchTerm = null;
}
});





///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
  // On-off feature layer tab
  var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage" || item.title === "Pier No." || item.title === "Free and Clear"){
          item.visible = false
        }
      }
    });


var legend = new Legend({
view: view,
container: legendDiv,
layerInfos: [
{
layer: barangayLayer,
title: "Cooperation for Barangay"
},
{
layer: lotLayer,
title: "Lot Requirements"
},
{
layer: structureLayer,
title: "Structure Basic Plan"
},
{
layer: priorityLayer,
title: "Priority Lot"
},
{
layer: stationBoxLayer,
title: "Station Box"
},
{
layer: pnrLayer,
title: "PNR"
},
{
layer: pierHeadColumnLayerLayer,
title: "Pier Head/Column"

}
]
});

/*
var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "bottom-right"
});
view.ui.add(legendExpand, {
position: "bottom-right"
});
*/

  var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "bottom-left"
  });
  view.ui.add(layerListExpand, {
      position: "bottom-left"
  });
  // End of LayerList

  view.ui.empty("top-left");

  // Compass
  var compass = new Compass({
    view: view});
    // adds the compass to the top left corner of the MapView
  view.ui.add(compass, "top-left");

  // See-through-Ground        
    view.when(function() {
    // allow navigation above and below the ground
    map.ground.navigationConstraint = {
      type: "none"
    };
    // the webscene has no basemap, so set a surfaceColor on the ground
    map.ground.surfaceColor = "#fff";
    // to see through the ground, set the ground opacity to 0.4
    map.ground.opacity = 0.5;
  });
    
  // Full screen logo
  view.ui.add(
      new Fullscreen({
          view: view,
          element: applicationDiv
      }),
      "top-left"
  );

//test
});