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
  "esri/widgets/Expand",
  "esri/widgets/Editor",
  "esri/renderers/UniqueValueRenderer",
  "esri/widgets/FeatureTable",
  "esri/widgets/Compass",
  "esri/layers/ElevationLayer",
  "esri/Ground",
  "esri/rest/support/RelationshipQuery",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Search",
  "esri/widgets/Locate",
  "esri/widgets/BasemapToggle",
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            Expand, Editor, UniqueValueRenderer,
            FeatureTable, Compass, ElevationLayer, Ground, RelationshipQuery,
            GraphicsLayer, Search, Locate, BasemapToggle) {

// ----------- Base layers -------------------- //
var basemap = new Basemap({
baseLayers: [
new VectorTileLayer({
portalItem: {
  id: "79bd8b0729b34aabb4c93fa43c59c897" // 8a9ef2a144e8423786f6139408ac3424
}
})
]
});

var map = new Map({
basemap: "gray-vector", // "streets-night-vector", basemap
ground: "world-elevation",
      //  spatialReference: {
      //  wkid: 3123
      //}
}); 
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.5;
   
var view = new MapView({
map: map,
center: [121.0194387, 14.6972616],
zoom: 14,
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

// Basemap toggle widget
const TOGGLE = new BasemapToggle({
view: view,
nextBaseMap: "hybrid"
});

view.ui.add(TOGGLE, "top-right");

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

// -----------------  Define DOM -------------------- //
let chartLayerView;
var highlightSelect;

var applicationDiv = document.getElementById("applicationDiv");

// DOM for Lot Statistics:
var lotPteDiv = document.getElementById("lotPteDiv");
var lotHandedOverDiv = document.getElementById("lotHandedOverDiv");

var CHART_ELEMENT = document.getElementById("chartPanel");
var CHART_ELEMENTStructure = document.getElementById("structureChartPanel");
var totalNumberDiv = document.getElementById("totalNumberDiv");

var totalNumberLotDiv = document.getElementById("totalNumberLotDiv");
var pteNumberLotDiv = document.getElementById("pteNumberLotDiv");
var handedoverNumberLotDiv = document.getElementById("handedoverNumberLotDiv");

// DOM for Structure Statistics:
var structureChartDiv = document.getElementById("structureChartDiv");
var totalNumberStrucDiv = document.getElementById("totalNumberStrucDiv");
var structureTotalNumberDiv = document.getElementById("structureTotalNumberDiv");
var isfNumberStrucDiv   = document.getElementById("isfNumberStrucDiv");   
var isfDiv = document.getElementById("isfDiv");

// Priority Lot Button 
//var priorityButton = document.getElementById("dataTypeInput");

// Station1 dropdown list
var stationSelect = document.getElementById("valSelect");
var landTypeSelect = document.getElementById("landTypeSelect");


//*******************************//
// Label Class Property Settings //
//*******************************//
// Lot Layer
const LOT_LABEL_CLASS = {
// autocasts as new LabelClass()
symbol: {
type: "text",  // autocasts as new TextSymbol()
color: "black",
font: {  // autocast as new Font()
family: "Gill Sans",
size: 8
}
},
labelPlacement: "always-horizontal",
labelExpressionInfo: {
expression: "$feature.CN"
}
};


//*****************************//
//      Renderer Settings      //
//*****************************//
// Default Renderer for Polygon------------
let defaultLotSymbolBoundary = {
type: "simple-fill",
color: [0, 0, 0, 0],
style: "solid",
outline: {
style: "short-dash",
color: [215, 215, 158],
width: 1.5
}
};

let BoundaryFillSymbol = {
type: "unique-value",
field: "StatusNVS3",
defaultSymbol: defaultLotSymbolBoundary,
}

// Priority Lot Renderer
let priorityLotRenderer = {
field: "Priority3",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0],
  outline: {
      width: 1,
      color: [255, 0, 0]
  }
}
};

// Lot Layer Renderer ---------
let lotDefaultSymbol = {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
style: "solid",
outline: {  // autocasts as new SimpleLineSymbol()
color: [110, 110, 110],
width: 0.7
}
};

function colorLotReqs(){
return {
1: [112,173,71],
2: [0,112,255],
3: [255,255,0],
4: [255,170,0],
5: [255,0,0],
6: [0,115,76]
}
}


let lotLayerRenderer = {
type: "unique-value",
//field: "StatusLA",
defaultSymbol: lotDefaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.StatusNVS3 == 1, '1',$feature.StatusNVS3 == 2, '2', $feature.StatusNVS3 == 3, '3', \
                   $feature.StatusNVS3 == 4, '4', $feature.StatusNVS3 == 5, '5', \
                   $feature.StatusNVS3 == 6, '6', $feature.StatusNVS3)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
label: "Paid",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[1],
}
},
{
// All features with value of "North" will be blue
value: "2",
label: "For Payment Processing",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[2],
}
},
{
// All features with value of "North" will be blue
value: "3",
label: "For Legal Pass",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[3],
}
},
{
// All features with value of "North" will be blue
value: "4",
label: "For Appraisal/Offer to Buy",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[4],
}
},
{
// All features with value of "North" will be blue
value: "5",
label: "For Expro",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[5],
}
},
{
// All features with value of "North" will be blue
value: "6",
label: "with WOP Fully Turned-over",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[6],
}
}
/*
{
// All features with value of "North" will be blue
value: "others",
label: "Others",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[6],
outline: {
  width: 2,
  color: "grey"
}
}
}
*/
]
}

// Structure Layer Render ----------------
function colorStructureReqs(){
return {
1: [112, 173, 71], // Paid #70AD47
2: [0, 112, 255], // For Payment Processing #0070FF
3: [255, 255, 0], // For Legal Pass #FFFF00
4: [255, 170, 0], // For Appraisal/Offer to Compensate #FFAA00
5: [255, 0, 0], // For Expro #FF0000
6: [0, 115, 76] //Quit Claim #00734C
}
}
let structureLayerRenderer = {
type: "unique-value",
//field: "StatusLA",
defaultSymbol: defaultLotSymbolBoundary,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.Status == 1, '1',$feature.Status == 2, '2', \
                   $feature.Status == 3, '3', \
                   $feature.Status == 4, '4', $feature.Status == 5, '5', \
                   $feature.Status == 6, '6', $feature.Status)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
label: "Paid",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[1],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
},
{
// All features with value of "North" will be blue
value: "2",
label: "For Payment Processing",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[2],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
},
{
// All features with value of "North" will be blue
value: "3",
label: "For Legal Pass",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[3],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
},
{
// All features with value of "North" will be blue
value: "4",
label: "For Appraisal/Offer to Buy",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[4],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
},
{
// All features with value of "North" will be blue
value: "5",
label: "For Expro",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[5],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
},
{
// All features with value of "North" will be blue
value: "6",
label: "Quit Claim",
symbol: {
type: "simple-fill",
color: colorStructureReqs()[6],
style: "backward-diagonal",
outline: {
  color: "#6E6E6E",
  width: 0.7
}
}
}
/*
{
// All features with value of "North" will be blue
value: "others",
label: "Others",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorStructureReqs()[6],
outline: {
  width: 2,
  color: "grey"
}
}
}
*/
]
}


// Construction boundary Renderer -----------------------
let ConstructionBoundaryFill = {
type: "unique-value",
valueExpression: "When($feature.MappingBoundary == 1, 'Boundary',$feature.MappingBoundary)",
uniqueValueInfos: [
{
value: "Boundary",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0,0],
  outline: {
    width: 1.5,
    color: [78, 78, 78],
    style: "short-dash"
  }
}
}
]
};


// Station1 Box Renderer -----------------------
let poSectionBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "U-Shape Retaining Wall",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "Cut & Cover Box",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "TBM Shaft",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "TBM",
symbol: {
  type: "simple-fill",
  color: [178, 178, 178],
  style: "backward-diagonal",
  outline: {
    width: 0.5,
    color: "black"
  }
}
},
{
value: "Station Platform",
symbol: {
  type: "simple-fill",
  color: [240, 204, 230],
  style: "backward-diagonal",
  outline: {
    width: 0.4,
    color: "black"
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
    color: "red"
  }
}
}
]
};

// ISF Renderer -----------------------
//// Color Properties for ISF
const ISF_COLOR = ["#267300", "#FF0000"];
const OUTLINE_COLOR = "white";

let isfRenderer = {
type: "unique-value",
valueExpression: "When($feature.RELOCATION == 'RELOCATED', 'Relocated', \
                   $feature.RELOCATION == 'FOR RELOCATION', 'Unrelocated', $feature.RELOCATION)",
uniqueValueInfos: [ //[1:Non-Compensable, 2:For Processing, 3:Compensated]
{
value: "Relocated",
label: "Relocated",
type: "simple",
symbol: {
type: "simple-marker",
size: 9,
color: ISF_COLOR[0], // the first two letters dictate transparency.
outline: {
  width: 1.5,
  color: OUTLINE_COLOR
}
}
},
{
value: "Unrelocated",
label: "For Relocation",
type: "simple",
symbol: {
type: "simple-marker",
size: 9,
color: ISF_COLOR[1], // the first two letters dictate transparency.
outline: {
  width: 1.5,
  color: OUTLINE_COLOR
}
}
}
]
}

//*******************************//
// Import Layers                 //
//*******************************//
// Construction boundary
var constBoundary = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
outFields: ["*"],
renderer: ConstructionBoundaryFill,
definitionExpression: "MappingBoundary = 1",
title: "Construction Boundary",
popupEnabled: false
});
//constBoundary.listMode = "hide";
map.add(constBoundary);

// Alignment
var alignmentLine = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 13,
outFields: ["*"],
title: "Alignment Line",
popupEnabled: false
});
//constBoundary.listMode = "hide";
map.add(alignmentLine);

// Segment DPWH
var dpwhSegmentLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
title: "DPWH Segment",
outFields: ["*"],
popupEnabled: false
});
map.add(dpwhSegmentLayer);

// BSS Boundary
var bssDepotLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
title: "BSS Boundary",
outFields: ["*"],
popupEnabled: false
});
map.add(bssDepotLayer);

// Creek Diversion
var creekDivLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 10,
title: "Creek Diversion",
outFields: ["*"],
popupEnabled: false
});
map.add(creekDivLayer);

// Depot Building
var depotBuildingLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
title: "Depot Building",
outFields: ["*"],
popupEnabled: false
});
map.add(depotBuildingLayer);

// BSS Building
var bssDepotBuildingLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 7,
title: "BSS Building",
outFields: ["*"],
popupEnabled: false
});
map.add(bssDepotBuildingLayer);

// East Valenzuela
var evsLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 9,
title: "East Valenzuela",
outFields: ["*"],
popupEnabled: false
});
map.add(evsLayer);

// NNC Construction boundary (Senate)
var senateBoundaryLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
title: "NCC Property",
outFields: ["*"],
popupEnabled: false
});
//senateBoundaryLayer.list = "hide";
map.add(senateBoundaryLayer);

// Station1 box
var poSectionBoxLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 8,
renderer: poSectionBoxRenderer,
title: "PO Section",
outFields: ["*"],
popupEnabled: false
});
map.add(poSectionBoxLayer);


// Station1 point feature
var stationLayer = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
definitionExpression: "Project = 'MMSP'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
});
stationLayer.listMode = "hide";
map.add(stationLayer, 0);


var lotLayer = new FeatureLayer({
portalItem: {
id: "032432d931624de9bf5ff03f1f9d7016",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
outFields: ["*"],
title: "Status of Land Acquisition",
  
//labelsVisible: false,
labelingInfo: [LOT_LABEL_CLASS],
renderer: lotLayerRenderer,
popupTemplate: {
title: "<p>{Id}</p>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "OWNER",
      label: "Land Owner"
    },
    {
      fieldName: "Station1"
    },
    {
      fieldName: "StatusNVS3",
      label: "<p>Status of Land Acquisition</p>"
    }
  ]
}
]
}
});
map.add(lotLayer, 0);


// Structure Layer
var structureLayer = new FeatureLayer({
portalItem: {
id: "ec9dac0c16af4797bb917a0babc735e9",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
title: "Status of Structure",
outFields: ["*"],
renderer: structureLayerRenderer,
popupTemplate: {
title: "<p>Structure ID: {Id_1}</p>" ,
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "CN",
      label: "Lot No."
    },
    {
      fieldName: "Status",
      label: "<p>Status of Structure</p>"
    }
  ]
}
]
}
});
map.add(structureLayer);
structureLayer.visible = true;

// Priority Lot
/*
var priorityLayer = new FeatureLayer ({
portalItem: {
id: "032432d931624de9bf5ff03f1f9d7016",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
definitionExpression: "Priority3 = 1",
//renderer: priorityLotRenderer,
title: "Priority Lot",
popupEnabled: false
});
map.add(priorityLayer, 0);
*/

// ISF
var isfLayer = new FeatureLayer ({
portalItem: {
  id: "a2e32eb82db84b3a8006e1c1e2cd7874",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
},
title: "ISF",
outFields: ["*"],
returnGeometry: true,
renderer: isfRenderer,
labelsVisible: false
});
map.add(isfLayer);


//*********** END OF DATA IMPORT ******************//


//*************************//
//**** Progress Chart **** //
//*************************//

// Call amCharts 4
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default Lot Renders when map is opened.


// Default Labels
document.getElementById("headerTitleDiv").innerHTML = "Land Acquisition (MMSP)";

totalNumberLotDiv.innerHTML = "Number of Lots";
//pteNumberLotDiv.innerHTML = "Number of PTE";
handedoverNumberLotDiv.innerHTML = "Handed-Over Lots";
totalNumberStrucDiv.innerHTML = "Number of Structures";
isfNumberStrucDiv.innerHTML = "Relocated ISF";

/* Define Zooming Function */
function zoomToLayer(layer) {
return layer.queryExtent().then(function(response) {
view.goTo(response.extent, { //response.extent
speedFactor: 2,
zoom: 17
}).catch(function(error) {
if (error.name != "AbortError") {
  console.error(error);
}
});
});
}

// Calculate statistics for
//// 1. Number of Lots
//// 2. Number of PTE
//// 3. Number of Handed-Over Lots
//// 4. Number of Structures
//// 5. Number of Relocated ISF

// 1. Total number of lots
function totalNumberOfLots(){
var totalLot = {
onStatisticField: "CASE WHEN StatusNVS3 >= 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalLot",
statisticType: "sum"
};
var query = lotLayer.createQuery();
query.outStatistics = [totalLot];
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response){
var stats = response.features[0].attributes;

const LOT_TOTAL = stats.totalLot;
//totalNumberDiv.innerHTML = LOT_TOTAL;
return LOT_TOTAL;
});

}

function totalNumberOfLotsAll(totalLotValue){
var totalLot = {
onStatisticField: "ID",
outStatisticFieldName: "totalLot",
statisticType: "count"
};
var query = lotLayer.createQuery();
query.outStatistics = [totalLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response){
var stats = response.features[0].attributes;

const LOT_TOTAL = stats.totalLot;
totalNumberDiv.innerHTML = thousands_separators(LOT_TOTAL) + " (" + totalLotValue + ")";
});
}



function totalNumberOfStructures(){
var totalStructure = {
onStatisticField: "Id",
outStatisticFieldName: "totalStructure",
statisticType: "count"
};
var query = structureLayer.createQuery();
query.outStatistics = [totalStructure];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response){
var stats = response.features[0].attributes;

const STRUCTURE_TOTAL = stats.totalStructure;
structureTotalNumberDiv.innerHTML = thousands_separators(STRUCTURE_TOTAL);
});
}

// 2. Number of PTE
function pteNumberLot(){
var totalPteLot = {
onStatisticField: "CASE WHEN PTE = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalPteLot",
statisticType: "sum"
};
var query = lotLayer.createQuery();
query.outStatistics = [totalPteLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const PTE_TOTAL = stats.totalPteLot;
//lotPteDiv.innerHTML = PTE_TOTAL;
});
} 
pteNumberLot();

// 3. Number of handed-over lots
function handedOverNumberLot(){
var totalHandedOverLot = {
onStatisticField: "CASE WHEN HandedOver = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalHandedOverLot",
statisticType: "sum"
}
var query = lotLayer.createQuery();
query.outStatistics = [totalHandedOverLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response){
var stats = response.features[0].attributes;

const HAND_OVER_TOTAL = stats.totalHandedOverLot;
lotHandedOverDiv.innerHTML = HAND_OVER_TOTAL;
});
}
handedOverNumberLot();

// 5. Number of Relocation (ISF) and Percent
function isfNumber() {
var totalRelo = {
  onStatisticField: "CASE WHEN RELOCATION = 'RELOCATED' THEN 1 ELSE 0 END",
  outStatisticFieldName: "totalRelo",
  statisticType: "sum"
};
var totalIsf = {
  onStatisticField: "RELOCATION",
  outStatisticFieldName: "totalIsf",
  statisticType: "count"
};

var query = isfLayer.createQuery();
query.outStatistics = [totalRelo, totalIsf];
query.returnGeometry = true;

isfLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const ISF_RELO = stats.totalRelo;
  const ISF_TOTAL = stats.totalIsf;
  const PERCENT = (ISF_RELO/ISF_TOTAL)*100;

  if (ISF_RELO == null) {
    isfDiv.innerHTML = 0 + " (" + 0 + " %" + ")";
  } else {
    isfDiv.innerHTML = ISF_RELO + " (" + PERCENT + "%" + ")";
  }

});
}
isfNumber();

// Thousand separators function
function thousands_separators(num)
{
var num_parts = num.toString().split(".");
num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return num_parts.join(".");
}


//--------------  Create and Update Contents in Station1 Dropwdown List ---------------//
//--------------  Update Priority Button and Handed-Over Lots ---------------//
//--------------  Query and Filter Lot and Structure Layers -----------------//

// Default state //
updateChartLot();
totalNumberOfLots().then(totalNumberOfLotsAll);
updateChartStructure();
totalNumberOfStructures();


// 1. Define Query
/// 1.1. Query all features from lot layer
view.when(function() {
return lotLayer.when(function() {
  var query = lotLayer.createQuery();
  return lotLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

/// 1.3. Query for geometry
function queryForLotGeometries() {
var lotQuery = lotLayer.createQuery();

return lotLayer.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});
}

// 2. Filter Lot for land type list
function filterLotLandType() {
var query2 = lotLayer.createQuery();
query2.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?

lotLayer.queryFeatures(query2)
.then(getQuery2Values)
.then(getUniqueValues2)
.then(addToSelectQuery2);
}

// 3. Get values and return to list
/// 2.1. Land Type
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.Type;
});
return values;
}

// Return an array of unique values in Type field of the lot Layer
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
      //headerTitleDiv.innerHTML = uniqueValues;
  }
});
return uniqueValues;
}

// Add the unique values to Land Type select element
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  landTypeSelect.add(option);
});
}

// 2.2. Station List
/// Filter Station list when land type list is changed.
function getQuery2Values(response) {
var featuresQuery2 = response.features;
var query2Values = featuresQuery2.map(function(feature) {
return feature.attributes.Station1;
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

/// Add the unique values to the second select (Station list)
function addToSelectQuery2(query2Values) {
stationSelect.options.length = 0;
query2Values.sort();
query2Values.unshift('None');
query2Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
stationSelect.add(option);
});

//return setLotBarangayExpression(handoverdateSelect.value);
}

// 3. Set DefinitionExpression on the lot layer
/// 3.1. Land Type Only
function setLandTypeExpression() {
var landType = landTypeSelect.options[landTypeSelect.selectedIndex].value;

if (landType === 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
isfLayer.definitionExpression = null;
constBoundary.definitionExpression = null;

} else if (landType === 'Station') {
lotLayer.definitionExpression = "Type = '" + landType + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'";

// when isfLayer has only 'Station' in the attribute table,
// we need to set this to 'null' when land type is 'Station'.
// Otherwise, isfNumber will not change.

// CHANGE THIS WHEN isfLayer has both 'Station' and 'Subterranean'
isfLayer.definitionExpression = null;
isfLayer.visible = true;

} else if (landType === 'Subterranean') {
lotLayer.definitionExpression = "Type = '" + landType + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'";
isfLayer.definitionExpression = "Type = '" + landType + "'";
isfLayer.visible = false;
isfDiv.innerHTML = "0" + " (0%)";

}


zoomToLayer(lotLayer);

if (!lotLayer.visible) {
lotLayer.visible = true;
}
return queryForLotGeometries;
}

///  3.2. Land Type + Station
function setLandTypeStationExpression() {
var landType = landTypeSelect.options[landTypeSelect.selectedIndex].value;
var station = stationSelect.options[stationSelect.selectedIndex].value;

if (landType == 'None' && station == 'None') {
lotLayer.definitionExpression = null;
structureLayer.definitionExpression = null;
isfLayer.definitionExpression = null;
isfLayer.visible = true;

} else if (landType !== 'None' && station == 'None') {
lotLayer.definitionExpression = "Type = '" + landType + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'";

} else if (landType === 'Station' && station == 'None') {
lotLayer.definitionExpression = "Type = '" + landType + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'";
isfLayer.definitionExpression = null;

} else if (landType === 'Subterranean' && station == 'None') {
lotLayer.definitionExpression = "Type = '" + landType + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'";
isfLayer.visible = false;
isfDiv.innerHTML = "0" + " (0%)";



zoomToLayer(lotLayer);

} else if (landType == 'None' && station !== 'None') {
lotLayer.definitionExpression = "Station1 = '" + station + "'";
structureLayer.definitionExpression = "Station1 = '" + station + "'";
isfLayer.definitionExpression = "Station1 = '" + station + "'";
constBoundary.definitionExpression = "Station1 = '" + newValue + "'";
zoomToLayer(constBoundary);

} else if (landType !== 'None' && station !== 'None') {
lotLayer.definitionExpression = "Type = '" + landType + "'" + " AND " + "Station1 = '" + station + "'";
structureLayer.definitionExpression = "Type = '" + landType + "'" + " AND " + "Station1 = '" + station + "'";

if(landType === "Station"){
isfLayer.definitionExpression = "Station1 = '" + station + "'";
isfLayer.visible = true;
} else {
isfLayer.visible = false;
}


zoomToLayer(lotLayer);
}

if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// 4. Add EventListener for land type and station dropdown lists
/// 4.1. Land Type
landTypeSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

setLandTypeExpression();
filterLotLandType();

updateChartLot();
totalNumberOfLots().then(totalNumberOfLotsAll);
updateMoaChartLot();
pteNumberLot();
handedOverNumberLot();
filterLot();

updateChartStructure();
totalNumberOfStructures();
updateMoaChartStructure();

filterIsf();
isfNumber();

});

/// 4.2. Station
stationSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

// Update All charts and numbers
setLandTypeStationExpression();

updateChartLot();
totalNumberOfLots().then(totalNumberOfLotsAll);
updateMoaChartLot();
pteNumberLot();
handedOverNumberLot();

updateChartStructure();
totalNumberOfStructures();
updateMoaChartStructure();

isfNumber();

filterIsf();
filterLot();

})


// 5. Filter Lot
/// This is critical
function filterLot() {
var query2 = lotLayer.createQuery();
query2.where = lotLayer.definitionExpression; // use filtered stations
}

function filterIsf() {
var query2 = isfLayer.createQuery();
query2.where = isfLayer.definitionExpression; // use filtered isf
}

// Handed-Over filter button
opacityInput.addEventListener("change", function(event) {
if (event.target.checked) {

//lotLayer.definitionExpression = "HandOver = 1";
view.when(function() {
// View only handed-over lots
view.whenLayerView(lotLayer).then(function (layerView) {
  lotLayer.queryFeatures().then(function(results) {
  const RESULT_LENGTH= results.features;
  const ROW_N = RESULT_LENGTH.length;
  
  // collected selected OBJECTID
  let objID = [];
  for (var i=0; i < ROW_N; i++) {
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
  
  highlightSelect = layerView.highlight(objID);

}); // End of queryFeatures

// Filter
layerView.filter = {
  where: "HandedOver = 1"
}
}); // End of view.whenLayerView
}); // End of view.when

} else {
// View all lots when check is turned off
view.when(function() {
view.whenLayerView(lotLayer).then(function (layerView) {
  lotLayer.queryFeatures().then(function(results) {
    const RESULT_LENGTH= results.features;
    const ROW_N = RESULT_LENGTH.length;
    
    let objID = [];
    for (var i=0; i < ROW_N; i++) {
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
  }); // End of queryFeatures
  layerView.filter = {
    where: "HandedOver = null || HandedOver = 1"
  }
}); // End of view.whenLayerView
}); // End of view.when
}
});


//------------- Create a list of Expropriation lots ------------------//
view.when(function() {
//reloStatusLayer.outFields = ["Name", "StatusRC", "Status"];

var ownerContainer = document.getElementById("relocationOwnerList");

// Obtain a list of Owner's names and status
view.whenLayerView(lotLayer).then(function(exprolayerView) {
exprolayerView.watch("updating", function(val) {
if (!val) {

  // Query for only Expropriation lots
  var query = new Query();
  query.where = "StatusNVS3 = 5";
  exprolayerView.queryFeatures(query).then(function(result) {
    ownerContainer.innerHTML = "";
    result.features.forEach(function(feature) {
      var attributes = feature.attributes;
      var li = document.createElement("li");
      li.setAttribute("class", "panel-result");

      const status = attributes.StatusNVS3;
      if (status == 5) {
          statusla = "Expropriation"
      }

      // Add Expropriation lots to list
      li.innerHTML = "<b>" + attributes.ID + "</b>" + "<br>" + attributes.OWNER + "</br>";
      li.addEventListener("click", function(event) {
        var target = event.target;
        var objectId = feature.attributes.OBJECTID;
        var queryExtent = new Query({
          objectIds: [objectId]
        });
        
        // Query extent for selected expropriation lot in the list
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
          
          // Highlight selected lots
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



// ------------------ PIE CHART FOR LOT ----------------------//
async function updateChartLot() {
// First, define statuses
function Status_Name_Lot(){
return {
1: "Paid",
2: "For Payment Processing",
3: "For Legal Pass",
4: "For Appraisal/Offer to Buy",
5: "For Expro",
6: "with WOP Fully Turned-over"
}
}

var totalPaidLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalPaidLot",
statisticType: "sum"
};

var totalpaypLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalpaypLot",
statisticType: "sum"
};

var totalLegalpassLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalLegalpassLot",
statisticType: "sum"
};

var totalOtbLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalOtbLot",
statisticType: "sum"
};

var totalExproLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalExproLot",
statisticType: "sum"
};

var totalDismissalLot = {
onStatisticField: "CASE WHEN StatusNVS3 = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalDismissalLot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [totalPaidLot, totalpaypLot, totalLegalpassLot,
                   totalOtbLot, totalExproLot, totalDismissalLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const PAID = stats.totalPaidLot;
const PAYP = stats.totalpaypLot;
const LEGALPASS = stats.totalLegalpassLot;
const OTB = stats.totalOtbLot;
const EXPRO = stats.totalExproLot;
const DISMISSAL = stats.totalDismissalLot;

var chart = am4core.create("chartdiv", am4charts.PieChart);

// Add data
chart.data = [
{
  "StatusNVS3": Status_Name_Lot()[1],
  "status": PAID,
  "color": am4core.color("#70AD47")
},
{
  "StatusNVS3": Status_Name_Lot()[2],
  "status": PAYP,
  "color": am4core.color("#0070FF")   
},
{
  "StatusNVS3": Status_Name_Lot()[3],
  "status": LEGALPASS,
  "color": am4core.color("#FFFF00") 
},
{
  "StatusNVS3": Status_Name_Lot()[4],
  "status": OTB,
  "color": am4core.color("#FFAA00")
},
{
 "StatusNVS3": Status_Name_Lot()[5],
  "status": EXPRO,
  "color": am4core.color("#FF0000")    
},
{
  "StatusNVS3": Status_Name_Lot()[6],
 "status": DISMISSAL,
 "color": am4core.color("#00734C")    
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
pieSeries.labels.template.fontSize = 9;
pieSeries.labels.template.fill = "#ffffff";

// Ticks (a straight line)
//pieSeries.ticks.template.disabled = true;
pieSeries.ticks.template.fill = "#ffff00";

// Create a base filter effect (as if it's not there) for the hover to return to
var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
shadow.opacity = 0;

// Chart Title
let title = chart.titles.create();
title.text = "Land Acquisition";
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = am4core.color("#ffffff");
title.marginTop = 7;

// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Add a legend
const LEGEND_FONT_SIZE = 15;
chart.legend = new am4charts.Legend();
chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LEGEND_FONT_SIZE; 
pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
//pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";

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

/// Define marker symbols properties
var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");
markerTemplate.width = 18;
markerTemplate.height = 18;

// This creates initial animation
//pieSeries.hiddenState.properties.opacity = 1;
//pieSeries.hiddenState.properties.endAngle = -90;
//pieSeries.hiddenState.properties.startAngle = -90;

// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
  const SELECTED = ev.target.dataItem.category;
  if (SELECTED == Status_Name_Lot()[1]) {
    selectedStatus = 1;
  } else if (SELECTED == Status_Name_Lot()[2]) {
    selectedStatus = 2;
  } else if (SELECTED == Status_Name_Lot()[3]) {
    selectedStatus = 3;
  } else if (SELECTED == Status_Name_Lot()[4]) {
    selectedStatus = 4;
  } else if (SELECTED == Status_Name_Lot()[5]) {
    selectedStatus = 5;
  } else if (SELECTED == Status_Name_Lot()[6]) {
    selectedStatus = 6;
  } else {
    selectedStatus = null;
  }
  
  view.when(function() {
    view.whenLayerView(lotLayer).then(function (layerView) {
      chartLayerView = layerView;
      CHART_ELEMENT.style.visibility = "visible";
      
      lotLayer.queryFeatures().then(function(results) {
        const RESULT_LENGTH = results.features;
        const ROW_N = RESULT_LENGTH.length;

        let objID = [];
        for (var i=0; i < ROW_N; i++) {
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
        where: "StatusNVS3 = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "StatusNVS3");

//return TOTAL_NUMBER_LOTS;
}); // End of queryFeatures
} // End of updateChartLot()

//function totalNumberOfLots(TOTAL_NUMBER_LOTS) {
//  totalNumberDiv.innerHTML = thousands_separators(TOTAL_NUMBER_LOTS);
//}

// ------------------ PIE CHART FOR STRUCTURE ----------------------//
async function updateChartStructure() {
function Status_Name_Structure(){
return {
1: "Paid",
2: "For Payment Processing",
3: "For Legal Pass",
4: "For Appraisal/Offer to Buy",
5: "For Expro",
6: "Quit Claim"
}
}
var totalPaidStruc = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalPaidStruc",
statisticType: "sum"
};

var totalPaypStruc = {
onStatisticField: "CASE WHEN Status = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalPaypStruc",
statisticType: "sum"
};

var totalLegalpassStruc = {
onStatisticField: "CASE WHEN Status = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalLegalpassStruc",
statisticType: "sum"
};

var totalOtbStruc = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalOtbStruc",
statisticType: "sum"
};

var totalExproStruc = {
onStatisticField: "CASE WHEN Status = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalExproStruc",
statisticType: "sum"
};

var totalQuitcStruc = {
onStatisticField: "CASE WHEN Status = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalQuitcStruc",
statisticType: "sum"
};

var query = structureLayer.createQuery();
query.outStatistics = [totalPaidStruc, totalPaypStruc, totalLegalpassStruc,
                   totalOtbStruc, totalExproStruc, totalQuitcStruc];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const PAID = stats.totalPaidStruc;
const PAYP = stats.totalPaypStruc;
const LEGALPASS = stats.totalLegalpassStruc;
const OTB = stats.totalOtbStruc;
const EXPRO = stats.totalExproStruc;
const QUITC = stats.totalQuitcStruc;

var chart = am4core.create("structureChartDiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StrucStatus": Status_Name_Structure()[1],
  "status": PAID,
  "color": am4core.color("#70AD47")   
},
{
"StrucStatus": Status_Name_Structure()[2],
"status": PAYP,
"color": am4core.color("#0070FF")   
},
{
"StrucStatus": Status_Name_Structure()[3],
"status": LEGALPASS,
"color": am4core.color("#FFFF00")   
},
{
"StrucStatus": Status_Name_Structure()[4],
"status": OTB,
"color": am4core.color("#FFAA00")   
},
{
"StrucStatus": Status_Name_Structure()[5],
"status": EXPRO,
"color": am4core.color("#FF0000") 
},
{
"StrucStatus": Status_Name_Structure()[6],
"status": QUITC,
"color": am4core.color("#00734C")
},
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

// Chart Title
let title = chart.titles.create();
title.text = "Strucure";
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = am4core.color("#ffffff");
title.marginTop = 7;


// Add a legend
const LEGEND_FONT_SIZE = 15;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LEGEND_FONT_SIZE; 
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

// Responsive code for chart
chart.responsive.enabled = true;


// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const SELECTED = ev.target.dataItem.category;

if (SELECTED == Status_Name_Structure()[1]) {
selectedStatus = 1;
} else if (SELECTED == Status_Name_Structure()[2]) {
selectedStatus = 2;
} else if (SELECTED == Status_Name_Structure()[3]) {
selectedStatus = 3;
} else if (SELECTED == Status_Name_Structure()[4]) {
selectedStatus = 4;
} else if (SELECTED == Status_Name_Structure()[5]) {
selectedStatus = 5;
} else if (SELECTED == Status_Name_Structure()[6]) {
selectedStatus = 6;
} else {
selectedStatus = null;
}

// Zoom, filter, and highlight selected chart categories 
view.when(function() {
view.whenLayerView(structureLayer).then(function (layerView) {
chartLayerView = layerView;
CHART_ELEMENT.style.visibility = "visible";

structureLayer.queryFeatures().then(function(results) {
  const RESULT_LENGTH= results.features;
  const ROW_N = RESULT_LENGTH.length;

  let objID = [];
  for (var i=0; i < ROW_N; i++) {
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
  where: "Status = " + selectedStatus
}
}); // End of view.whenLayerView
}); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "StrucStatus");

});  // End of queryFeature                 
} // End of updateChartStructure()

//function totalNumberOfStructures(TOTAL_NUMBER_STRUCTURE) {
//  structureTotalNumberDiv.innerHTML = thousands_separators(TOTAL_NUMBER_STRUCTURE);
//}


// ----------------- BAR CHART FOR MOA LOT ----------------- //
async function updateMoaChartLot() {
var totalNVSLot = {
onStatisticField: "CASE WHEN MOA = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalNVSLot",
statisticType: "sum"
};

var totalExproLot = {
onStatisticField: "CASE WHEN MOA = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalExproLot",
statisticType: "sum"
};

var totalRowuaLot = {
onStatisticField: "CASE WHEN MOA = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalRowuaLot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [totalNVSLot, totalExproLot, totalRowuaLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const NVS = stats.totalNVSLot;
const EXPRO = stats.totalExproLot;
const ROWUA = stats.totalRowuaLot;

var chart = am4core.create("lotMoaChartDiv", am4charts.XYChart);
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

categoryAxis.renderer.line.strokeOpacity = 1;
categoryAxis.renderer.line.strokeWidth = 1.5;
categoryAxis.renderer.line.stroke = am4core.color("#FFFFFF");

// Create value axis
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

// Responsive code: 
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
// Responsive code: END

// Click chart and filer 
const CHART_ELEMENT = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const SELECTED = ev.target.dataItem.categoryY;

if (SELECTED == "1-NVS") {
  selectedStatus = 1;
} else if (SELECTED == "2-Expropriation") {
  selectedStatus = 2;
} else if (SELECTED == "3-ROWUA") {
  selectedStatus = 3;
}
view.whenLayerView(lotLayer).then(function (layerView) {
  chartLayerView = layerView;
  CHART_ELEMENT.style.visibility = "visible";

  lotLayer.queryFeatures().then(function(results) {
    const RESULT_LENGTH= results.features;
    const ROW_N= RESULT_LENGTH.length;

    let objID = [];
    for (var i=0; i< ROW_N; i++) {
      var obj = results.features[i].attributes.OBJECTID;
      objID.push(obj);
    }
    
    var queryExt = new Query({
      objectIds: objID
    });

    if (highlightSelect) {
      highlightSelect.remove();
    }
    highlightSelect = layerView.highlight(objID);

    view.on("click", function() {
      layerView.filter = null;
      highlightSelect.remove();
    });
  });
}); // End of whenLayerView

chartLayerView.filter = {
  where: "MOA = " + selectedStatus
  //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
};
}; // End of filterByChart

var labelBullet = series.bullets.push(new am4charts.LabelBullet())
labelBullet.label.horizontalCenter = "left";
labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}"; //#.0as for 17k
labelBullet.locationX = 0.5;
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 14;

// Add chart title
var title = chart.titles.create();
title.text = "Mode of Acquisition"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontWeight = "bold";
title.fontSize = 16;
title.fill = "#3ce00a";

series.columns.template.adapter.add("fill", function(fill, target){
return chart.colors.getIndex(target.dataItem.index);
});

chart.data = [
{
  category: "1-NVS",
  value: NVS
},
{
  category: "2-Expropriation",
  value: EXPRO
},
{
 category: "3-ROWUA",
  value: ROWUA
}
]; // End of chart
}); // End of queryFeatures
} // End of updateMOAChartLot

updateMoaChartLot();

// ----------------- BAR CHART FOR MOA STRUCTURE ----------------- //
async function updateMoaChartStructure() {
var totalNVSLot = {
onStatisticField: "CASE WHEN S_MOA = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalNVSLot",
statisticType: "sum"
};

var totalExproLot = {
onStatisticField: "CASE WHEN S_MOA = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalExproLot",
statisticType: "sum"
};

var totalRowuaLot = {
onStatisticField: "CASE WHEN S_MOA = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "totalRowuaLot",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [totalNVSLot, totalExproLot, totalRowuaLot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const NVS = stats.totalNVSLot;
const EXPRO = stats.totalExproLot;
const ROWUA = stats.totalRowuaLot;

var chart = am4core.create("structureMoaChartDiv", am4charts.XYChart);
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

categoryAxis.renderer.line.strokeOpacity = 1;
categoryAxis.renderer.line.strokeWidth = 1.5;
categoryAxis.renderer.line.stroke = am4core.color("#FFFFFF");

// Create value axis

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

// Responsive code: 
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
// Responsive code: END

// Click chart and filer 
const CHART_ELEMENT = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const SELECTED = ev.target.dataItem.categoryY;
if (SELECTED == "1-NVS") {
  selectedStatus = 1;
} else if (SELECTED == "2-Expropriation") {
  selectedStatus = 2;
}

view.whenLayerView(lotLayer).then(function (layerView) {
  chartLayerView = layerView;
  CHART_ELEMENT.style.visibility = "visible";

  lotLayer.queryFeatures().then(function(results) {
    const RESULT_LENGTH= results.features;
    const ROW_N= RESULT_LENGTH.length;

    let objID = [];
    for (var i=0; i< ROW_N; i++) {
        var obj = results.features[i].attributes.OBJECTID;
        objID.push(obj);
      }
      
      var queryExt = new Query({
        objectIds: objID
      });
      
      if (highlightSelect) {
        highlightSelect.remove();
      }
      
      highlightSelect = layerView.highlight(objID);
      
      view.on("click", function() {
        layerView.filter = null;
        highlightSelect.remove();
      });
    });
  }); // End of whenLayerView
  
  chartLayerView.filter = {
    where: "S_MOA = " + selectedStatus
    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
  };
}; // End of filterByChart

var labelBullet = series.bullets.push(new am4charts.LabelBullet())
labelBullet.label.horizontalCenter = "left";
labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}"; //#.0as for 17k
labelBullet.locationX = 0.5;
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 14;

// Add chart title
var title = chart.titles.create();
title.text = "Mode of Acquisition"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontWeight = "bold";
title.fill = "#3ce00a";

series.columns.template.adapter.add("fill", function(fill, target){
  return chart.colors.getIndex(target.dataItem.index);
});

chart.data = [
  {
    category: "1-NVS",
    value: NVS
  },
  {
    category: "2-Expropriation",
    value: EXPRO
  }
]; // End of chart
}); // End of queryFeatures
} // End of updateS_MOAChartStructure

updateMoaChartStructure();
am4core.options.autoDispose = true;
}); // End of am4core.ready

// -------------------------  END OF CHART -------------------------------//

// Widget 
//*****************************//
//      Search Widget          //
//*****************************//
var searchWidget = new Search({
view: view,
locationEnabled: false,
allPlaceholder: "LotID, StructureID",
includeDefaultSources: false,
sources: [
{
layer: lotLayer,
searchFields: ["ID"],
displayField: "ID",
exactMatch: false,
outFields: ["ID"],
name: "Lot No",
placeholder: "example: DP89"
},
{
layer: structureLayer,
searchFields: ["Id_1"],
displayField: "Id",
exactMatch: false,
outFields: ["Id_1"],
name: "Structure ID",
placeholder: "example: QH-MMSP-02-01-S045C"
}
]
});

// Create Expand widge for Search widget
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

//*****************************//
//      Layer List Widget          //
//*****************************//
var layerList = new LayerList({
view: view,
listItemCreatedFunction: function(event) {
const item = event.item;
if (item.title === "BSS Boundary" || item.title === "BSS Building" || item.title === "Depot Building"){
item.visible = false
}
}
});

//*****************************//
//      Legend  Widget          //
//*****************************//
var legend = new Legend({
view: view,
container: legendDiv,
layerInfos: [
{
layer: lotLayer,
title: "Status of Parcellary"
},
{
layer: structureLayer,
title: "Status of Structure"
},
{
layer: isfLayer,
title: "ISF"
},
{
layer: poSectionBoxLayer,
title: "PO Section"
},
{
layer: dpwhSegmentLayer,
title: "DPWH Segment"
},
{
layer: bssDepotLayer,
title: "BSS Boundary"
},
{
layer: bssDepotBuildingLayer,
title: "BSS Building"
},
{
layer: constBoundary,
title: "Construction Boundary"
},
{
layer: senateBoundaryLayer,
title: "NCC Property"
},
{
layer: creekDivLayer,
title: "Creek Diversion"
},
{
layer: depotBuildingLayer,
title: "Depot Building"
},
{
layer: evsLayer,
title: "East Valenzuela"
},
{
layer: alignmentLine,
title: "Alignment Line"
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

// Locate widget
/*
let locateWidget = new Locate({
view: view,   // Attaches the Locate button to the view
graphic: new Graphic({
symbol: { type: "simple-marker" }  // overwrites the default symbol used for the
// graphic placed at the location of the user when found
})
});

view.ui.add(locateWidget, "top-left");
*/

/*
// Print widget
const print = new Print({
view: view,
printServiceUrl: "https://gis.railway-sector.com/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
container: "printDiv"
});
var printExpand = new Expand ({
      view: view,
      content: print,
      expandIconClass: "esri-icon-printer",
      group: "top-left"
  });
  view.ui.add(printExpand, {
      position: "top-left"
  });
*/
});