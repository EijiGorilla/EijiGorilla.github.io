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
  "esri/widgets/BasemapToggle",
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
            GraphicsLayer, Search, BasemapToggle) {

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

  const toggle = new BasemapToggle({
    view: view,
    nextBaseMap: "hybrid"
  });

  view.ui.add(toggle, "top-right");

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
  const chartElement = document.getElementById("chartPanel");
  var lotStatsDiv = document.getElementById("lotStatsDiv");
  var lotChartDiv = document.getElementById("lotChartDiv");
  //var lotTotalNumberDiv = document.getElementById("lotTotalNumberDiv");
  var lotPteDiv = document.getElementById("lotPteDiv");
  var totalNumberDiv = document.getElementById("totalNumberDiv");
  const titleNumberLot = document.getElementById("titleNumberLot");
  const pteLotTotalNumberDiv = document.getElementById("pteLotTotalNumberDiv");


   // Structure Statistics:
   const chartElementStructure = document.getElementById("structureChartPanel");
   var structureStatsDiv = document.getElementById("structureStatsDiv");
  var structureChartDiv = document.getElementById("structureChartDiv");
  var structurePteDiv = document.getElementById("structurePteDiv");       


  var chartTitleDiv = document.getElementById("chartTitleDiv");
  var StructureChartTitleDiv = document.getElementById("structureChartTitleDiv");
  var structureTotalNumberDiv = document.getElementById("structureTotalNumberDiv");
  const utilTypesButton = document.getElementById("dataTypeInput");
  const titleNumberStrucISF = document.getElementById("titleNumberStrucISF");
  const pteStrucTotalNumberDiv = document.getElementById("pteStrucTotalNumberDiv");


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

// Fill symbol color for Structure Layer (Status of Structure)
const colors = {
    1: [255, 0, 197], // Dismantling/Clearing
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0], // For Appraisal/Offer to Compensate
    6: [255, 0, 0] //LBP Account Opening
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
title: "Priority Lot",
popupEnabled: false
});
map.add(priorityLayer,2);

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
  outFields: ["*"],
  title: "Status of Land Acquisition",
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
            fieldName: "StatusLA",
            label: "<p>Status of Land Acquisition</p>"
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
  title: "Status of Structure",
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
            fieldName: "StatusStruc",
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


function renderStructureLayer() {
    const renderer = new UniqueValueRenderer({
      field: "StatusStruc"
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

// Structure (NLO/LO)
let NLOLORenderer = {
type: "unique-value",
field: "Status",
uniqueValueInfos:[
{
value: 1,
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
style: "forward-diagonal",
color: [128, 128, 128, 0.8],
outline: {
  color: "#6E6E6E",
  width: 0.3
}
}
},
{
value: 2,
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
style: "vertical",
color: [128, 128, 128, 0.8],
outline: {
  color: "#6E6E6E",
  width: 0.3
}
}
}
]
};


var structureNLOLOLayer = new FeatureLayer({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
renderer: NLOLORenderer,
layerId: 10,
  title: "Structure (NLO/LO)",
  outFields: ["*"],
  popupEnabled: false
});
structureNLOLOLayer.listMode = "hide";
map.add(structureNLOLOLayer);


// Status of Relocation (Occupancy)
var relocationPtLayer = new FeatureLayer({
portalItem: {
id: "c38a7320b34b45b580778d7363f4e4c3",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 12,
  outFields: ["*"],
  title: "Relocation (Occupancy)",
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
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "Occupancy",
            label: "<p>Status for Relocation(structure)</p>"
          },
          {
            fieldName: "Name",
          },
          {
            fieldName: "Status",
            label: "Status of NLO/LO"
          }
        ]
      }
    ]
  }
});
map.add(relocationPtLayer);


// 
const lotStrucReloTypeButton = document.getElementById("dataTypeInput");
const selectedButton = document.getElementById("SelectedButton");

// Progress Chart //
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

pteLotTotalNumberDiv.innerHTML = "Number of PTE";
titleNumberLot.innerHTML = "Number of Lot";
titleNumberStrucISF.innerHTML = "Number of Structure";
pteStrucTotalNumberDiv.innerHTML = "Number of PTE";

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

// TOtal number of PTE for LOT
function pteNumberLot(){
var total_pte_lot = {
onStatisticField: "CASE WHEN PTE = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_pte_lot",
statisticType: "sum"
};
var query = lotLayer.createQuery();
query.outStatistics = [total_pte_lot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const pte = stats.total_pte_lot;
lotPteDiv.innerHTML = pte;
});
} 
pteNumberLot();

// Total number of PTE for Structure
function pteNumberStructure() {
var total_pte_structure = {
onStatisticField: "CASE WHEN PTE = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_pte_structure",
statisticType: "sum"
};
var query = structureLayer.createQuery();
query.outStatistics = [total_pte_structure];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const pte = stats.total_pte_structure;
structurePteDiv.innerHTML = pte;
})
}
pteNumberStructure();

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


////////////////////////////////////////////////
// Return an array of unique values in the 'Brangay' field of the lot Layer
// Query all features from the lot layer
view.when(function() {
return lotLayer.when(function() {
  var query = lotLayer.createQuery();
  return lotLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

//Return an array of all the values in the 'Municipality' field'
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
return setLotMunicipalExpression(municipalSelect.value);
}

// Set the definition expression on the lot layer
// to reflect the selecction of the user
function setLotMunicipalExpression(newValue) {
if (newValue == 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
relocationPtLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;

} else {
lotLayer.definitionExpression = "Municipality = '" + newValue + "'";
structureLayer.definitionExpression = "Municipality = '" + newValue + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue + "'";
priorityLayer.definitionExpression = "Municipality = '" + newValue + "'";
}

/*
if (!lotLayer.visible || !structureLayer.visible || !reloISFLayer.visible || !relocationPtLayer.visible) {
  lotLayer.visible = true;
  structureLayer.visible = true;
  reloISFLayer.visible = true;
  relocationPtLayer.visible = true;
}
*/
return queryForLotGeometries();
}

function setLotDefinitionExpression(newValue1, newValue2){
if(newValue2 == undefined || newValue2 == 'None'){
lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'";
structureLayer.definitionExpression = "Municipality = '" + newValue1 + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue1 + "'";
priorityLayer.definitionExpression = "Municipality = '" + newValue1 + "'";

} else {
lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
structureLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
priorityLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
}
/*
if(!lotLayer.visible || !structureLayer.visible || !reloISFLayer.visible || !relocationPtLayer.visible){
lotLayer.visible = true;
structureLayer.visible = true;
  reloISFLayer.visible = true;
  relocationPtLayer.visible = true;
}
*/

return queryForLotGeometries();
}

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


municipalSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

setLotMunicipalExpression(type);
filterLotMunicipality();


updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();

zoomToLayer(lotLayer);

});



function filterLotMunicipality() {
var query2 = lotLayer.createQuery();
query2.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?

lotLayer.queryFeatures(query2)
.then(getQuery2Values)
.then(getUniqueValues2)
.then(addToSelectQuery2);
}

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

return setLotBarangayExpression(barangaySelect.value);
}


barangaySelect.addEventListener("click", function() {
var type = event.target.value;
setLotDefinitionExpression(municipalSelect.value, type);

updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();


zoomToLayer(lotLayer);
//relocationObjectID(reloStatusLayer);

});



view.when(function() {

//reloStatusLayer.outFields = ["Name", "StatusRC", "Status"];

var ownerContainer = document.getElementById("relocationOwnerList");

// Obtain a list of Owner's names and status
view.whenLayerView(lotLayer).then(function(exprolayerView) {
exprolayerView.watch("updating", function(val) {
  if (!val) {
    var query = new Query();
    query.where = "StatusLA = 5";
    exprolayerView.queryFeatures(query).then(function(result) {
      ownerContainer.innerHTML = "";
      result.features.forEach(function(feature) {
        var attributes = feature.attributes;
        var li = document.createElement("li");
        li.setAttribute("class", "panel-result");

        const status = attributes.StatusLA;
        if (status == 5) {
          statusla = "Expropriation"
        }

        li.innerHTML = "Lot ID: " + "<b>" + attributes.LotID + "</b>" + "<br>" + attributes.LandOwner + "</br>" + "<p>" + statusla + "</p>";
        li.addEventListener("click", function(event) {
          var target = event.target;

          var objectId = feature.attributes.OBJECTID;
          var queryExtent = new Query({
            objectIds: [objectId]
          });
          exprolayerView.queryExtent(queryExtent).then(function(result) {
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
          highlightSelect = exprolayerView.highlight([objectId]);
          
      view.on("click", function() {
        exprolayerView.filter = null;
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



//////

//////////////////// Pie Chart ///////////////////////////////////////////////////
// Lot Chart
async function updateChartLot() {
var total_paid_lot = {
onStatisticField: "CASE WHEN StatusLA = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_paid_lot",
statisticType: "sum"
};

var total_payp_lot = {
onStatisticField: "CASE WHEN StatusLA = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_payp_lot",
statisticType: "sum"
};

var total_legalpass_lot = {
onStatisticField: "CASE WHEN StatusLA = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_legalpass_lot",
statisticType: "sum"
};

var total_otb_lot = {
onStatisticField: "CASE WHEN StatusLA = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_otb_lot",
statisticType: "sum"
};

var total_expro_lot = {
onStatisticField: "CASE WHEN StatusLA = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_expro_lot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_paid_lot, total_payp_lot, total_legalpass_lot,
                   total_otb_lot, total_expro_lot];
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const paid = stats.total_paid_lot;
const payp = stats.total_payp_lot;
const legalpass = stats.total_legalpass_lot;
const otb = stats.total_otb_lot;
const expro = stats.total_expro_lot;

const totalNumberLots = paid + payp + legalpass + otb + expro;

var chart = am4core.create("chartdiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StatusLA": "Paid",
  "status": paid,
  "color": am4core.color("#70AD47")
},
{
  "StatusLA": "For Payment Processing",
  "status": payp,
  "color": am4core.color("#0070FF")   
},
{
  "StatusLA": "For Legal Pass",
  "status": legalpass,
  "color": am4core.color("#FFFF00") 
},
{
  "StatusLA": "For Appraisal/Offer to Buy",
  "status": otb,
  "color": am4core.color("#FFAA00")
},
{
  "StatusLA": "For Expro",
  "status": expro,
  "color": am4core.color("#FF0000")    
}
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
pieSeries.tooltip.label.fontSize = 9;

// Pie
//pieSeries.alignLabels = false;
//pieSeries.labels.template.bent = false;
pieSeries.labels.template.disabled = true;
pieSeries.labels.template.radius = 3;
pieSeries.labels.template.padding(0,0,0,0);
pieSeries.labels.template.fontSize = 10;
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


// Add a legend
const LegendFontSizze = 12;
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

// Chart Title
var title = chart.titles.create();
title.text = "Land"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 5;

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

if (selectedD == "Paid") {
selectedStatus = 1;
} else if (selectedD == "For Payment Processing") {
selectedStatus = 2;
} else if (selectedD == "For Legal Pass") {
selectedStatus = 3;
} else if (selectedD == "For Appraisal/Offer to Buy") {
selectedStatus = 4;
} else if (selectedD == "For Expro") {
selectedStatus = 5;
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
where: "StatusLA = " + selectedStatus
}
}); // End of view.whenLayerView

}); // End of view.when
} // End of filterByChart

} // End of createSlices function

createSlices("status", "StatusLA");

return totalNumberLots;

}); // End of queryFeatures
} // End of updateChartLot()

function totalNumberOfLots(totalNumberLots) {
totalNumberDiv.innerHTML = thousands_separators(totalNumberLots);
}


// Structure Chart
async function updateChartStructure() {
var total_clear_lot = {
onStatisticField: "CASE WHEN StatusStruc = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_clear_lot",
statisticType: "sum"
};

var total_paid_lot = {
onStatisticField: "CASE WHEN StatusStruc = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_paid_lot",
statisticType: "sum"
};

var total_payp_lot = {
onStatisticField: "CASE WHEN StatusStruc = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_payp_lot",
statisticType: "sum"
};

var total_legalpass_lot = {
onStatisticField: "CASE WHEN StatusStruc = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_legalpass_lot",
statisticType: "sum"
};

var total_otc_lot = {
onStatisticField: "CASE WHEN StatusStruc = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_otc_lot",
statisticType: "sum"
};

var total_lbp_lot = {
onStatisticField: "CASE WHEN StatusStruc = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_lbp_lot",
statisticType: "sum"
};  

var query = structureLayer.createQuery();
query.outStatistics = [total_clear_lot, total_paid_lot, total_payp_lot,
                   total_legalpass_lot, total_otc_lot, total_lbp_lot];
query.returnGeometry = true;

return structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const clear = stats.total_clear_lot;
const paid = stats.total_paid_lot;
const payp = stats.total_payp_lot;
const legalpass = stats.total_legalpass_lot;
const otc = stats.total_otc_lot;
const lbp = stats.total_lbp_lot;

const totalNumberStructures = clear + paid + payp + legalpass + otc + lbp;

var chart = am4core.create("structureChartDiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StatusStruc": "Dismantling/Clearing",
  "status": clear,
  "color": am4core.color("#FF00C5")
},
{
  "StatusStruc": "Paid",
  "status": paid,
  "color": am4core.color("#70AD47")   
},
{
  "StatusStruc": "For Payment Processing",
  "status": payp,
  "color": am4core.color("#0070FF") 
},
{
  "StatusStruc": "For Legal Pass",
  "status": legalpass,
  "color": am4core.color("#FFFF00")
},
{
  "StatusStruc": "For Appraisal/Offer to Compensate",
  "status": otc,
  "color": am4core.color("#FFAA00")    
},
{
  "StatusStruc": "LBP Account Opening",
  "status": lbp,
  "color": am4core.color("#FF0000")    
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
pattern.strokeWidth = 1.5;
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
pieSeries.tooltip.label.fontSize = 9;

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


// Add a legend
const LegendFontSizze = 12;
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

// Chart Title
var title = chart.titles.create();
title.text = "Structure"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 5;

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

if (selectedD == "Dismantling/Clearing") {
selectedStatus = 1;
} else if (selectedD == "Paid") {
selectedStatus = 2;
} else if (selectedD == "For Payment Processing") {
selectedStatus = 3;
} else if (selectedD == "For Legal Pass") {
selectedStatus = 4;
} else if (selectedD == "For Appraisal/Offer to Compensate") {
selectedStatus = 5;
} else if (selectedD == "LBP Account Opening") {
selectedStatus = 6;
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
where: "StatusStruc = " + selectedStatus
}

}); // End of view.whenLayerView


}); // End of view.when

} // End of filterByChart
} // End of createSlices function

createSlices("status", "StatusStruc");

return totalNumberStructures;

});  // End of queryFeature                 
} // End of updateChartStructure()

function totalNumberOfStructures(totalNumberStructures) {
structureTotalNumberDiv.innerHTML = thousands_separators(totalNumberStructures);
}

//////////////////// Bar Chart for MOA ///////////////////////////////////////////////////
// Lot
async function updateMoaChartLot() {
var total_nego_lot = {
onStatisticField: "CASE WHEN MoA = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nego_lot",
statisticType: "sum"
};

var total_expro_lot = {
onStatisticField: "CASE WHEN MoA = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_expro_lot",
statisticType: "sum"
};

var total_donate_lot = {
onStatisticField: "CASE WHEN MoA = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_donate_lot",
statisticType: "sum"
};

var total_ca141_lot = {
onStatisticField: "CASE WHEN MoA = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ca141_lot",
statisticType: "sum"
};

var total_noneed_lot = {
onStatisticField: "CASE WHEN MoA = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_noneed_lot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_nego_lot, total_expro_lot, total_donate_lot, total_ca141_lot, total_noneed_lot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const nego = stats.total_nego_lot;
const expro = stats.total_expro_lot;
const donate = stats.total_donate_lot;
const ca141 = stats.total_ca141_lot;
const noneed = stats.total_noneed_lot;


var chart = am4core.create("lotMoaChartDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;
chart.padding(10, 10, 10, 10);

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 1;
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.labels.template.fontSize = 13;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeOpacity = 1;
categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
categoryAxis.renderer.grid.template.strokeWidth = 1.5;


//categoryAxis.renderer.cellStartLocation = 0;
//categoryAxis.renderer.cellEndLocation = 0.7;
/////////////////
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
labelBullet.label.fontSize = 10;

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
title.text = "[bold]Mode of Acquisition[/]"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 12;
title.fill = "#3ce00a";

series.columns.template.adapter.add("fill", function(fill, target){
return chart.colors.getIndex(target.dataItem.index);
});

chart.data = [
{
category: "No Need to Acquire",
value: noneed
},
{
category: "CA 141",
value: ca141
},
{
category: "Donation",
value: donate
},
{
category: "Expropriation",
value: expro
},
{
category: "For Negotiation",
value: nego
}
]; // End of chart


}); // End of queryFeatures

} // End of updateMoaChartLot
updateMoaChartLot();

// Lot
async function updateMoaChartStructure() {
var total_nego_lot = {
onStatisticField: "CASE WHEN MoA = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nego_lot",
statisticType: "sum"
};

var total_expro_lot = {
onStatisticField: "CASE WHEN MoA = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_expro_lot",
statisticType: "sum"
};

var total_donate_lot = {
onStatisticField: "CASE WHEN MoA = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_donate_lot",
statisticType: "sum"
};

var total_ca141_lot = {
onStatisticField: "CASE WHEN MoA = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ca141_lot",
statisticType: "sum"
};

var total_noneed_lot = {
onStatisticField: "CASE WHEN MoA = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_noneed_lot",
statisticType: "sum"
};

var query = structureLayer.createQuery();
query.outStatistics = [total_nego_lot, total_expro_lot, total_donate_lot, total_ca141_lot, total_noneed_lot];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const nego = stats.total_nego_lot;
const expro = stats.total_expro_lot;
const donate = stats.total_donate_lot;
const ca141 = stats.total_ca141_lot;
const noneed = stats.total_noneed_lot;


var chart = am4core.create("structureMoaChartDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;
chart.padding(10, 10, 10, 10);

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 1;
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.labels.template.fontSize = 13;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeOpacity = 1;
categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
categoryAxis.renderer.grid.template.strokeWidth = 1.5;


//categoryAxis.renderer.cellStartLocation = 0;
//categoryAxis.renderer.cellEndLocation = 0.7;
/////////////////
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
labelBullet.label.fontSize = 10;

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
title.text = "[bold]Mode of Acquisition[/]"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 12;
title.fill = "#3ce00a";

series.columns.template.adapter.add("fill", function(fill, target){
return chart.colors.getIndex(target.dataItem.index);
});

chart.data = [
{
category: "No Need to Acquire",
value: noneed
},
{
category: "CA 141",
value: ca141
},
{
category: "Donation",
value: donate
},
{
category: "Expropriation",
value: expro
},
{
category: "For Negotiation",
value: nego
}
]; // End of chart


}); // End of queryFeatures

} // End of updateMoaChartStructure
updateMoaChartStructure();
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
layer: pierHeadColumnLayerLayer,
title: "Pier Head/Column"

},
{
layer: lotLayer,
title: "Status of Parcellary"
},
{
layer: structureLayer,
title: "Status of Structure"
},
{
layer: structureNLOLOLayer,
title: "Structure (NLO/LO)"
},
{
layer: relocationPtLayer,
title: "Occupancy"
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


});