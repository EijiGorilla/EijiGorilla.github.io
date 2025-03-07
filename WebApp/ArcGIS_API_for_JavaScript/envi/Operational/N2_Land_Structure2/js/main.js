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
  "esri/widgets/FeatureTable",
  "esri/widgets/Compass",
  "esri/layers/ElevationLayer",
  "esri/Ground",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Search",
  "esri/widgets/BasemapToggle",
  "esri/popup/support/FieldInfoFormat",
  "esri/PopupTemplate",
  "esri/popup/content/CustomContent",
  "esri/core/Collection"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer,
            FeatureTable, Compass, ElevationLayer, Ground,
            GraphicsLayer, Search, BasemapToggle, FieldInfoFormat,
            PopupTemplate, CustomContent, Collection) {

let chartLayerView;
var highlightSelect;
////////////////////////////////////////////////////
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "f666b3fb303c47ddb9b0dae032f800f5" // 8a9ef2a144e8423786f6139408ac3424 (original)
      }
    })
  ]
});

   var map = new Map({
        basemap: basemap, //"gray-vector", // "streets-night-vector", basemap
        ground: "world-elevation"
  }); 
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.5;
   
  var view = new MapView({
      map: map,
      center: [120.57930, 15.18],
      zoom: 10,
      /*
      highlightOptions: {
color: [255,0,197,1]
},
*/
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
  
  
  
  // hand

//*******************************//
// Label Class Property Settings //
//*******************************//
// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KmSpot"},
symbol: {
type: "text",
color: [85, 255, 0],
haloColor: "black",
haloSize: 0.5,
font: {
size: 15,
weight: "bold"
}
}
});

// Pier No label
/// Change label color with different AccessDate
function createTextSymbol(color) {
return {
      type: "text", // autocasts as new TextSymbol()
      font: {
        size: 15,
        weight: "bold"
      },
      color: color,
      haloColor: "black",
      haloSize: 1
    };
}

// when AccessDate is on or before '2022-01-01'
const alreadyAccessDate = "$feature.PIER";
const alreadyAccessDateClass = {
labelExpressionInfo: {
expression: alreadyAccessDate
},
labelPlacement: "above-center",
where: "AccessDate <= date'2022-07-31'"
};
alreadyAccessDateClass.symbol = createTextSymbol("#00c5ff");

// when AccessDate is after '2022-08-01'
const yetAccessDate = "$feature.PIER";
const yetAccessDateClass = {
labelExpressionInfo: {
expression:yetAccessDate
},
labelPlacement: "above-center",
where: "AccessDate > date'2022-08-01'"
};
yetAccessDateClass.symbol = createTextSymbol("#ffffff");


// Station label

var labelStation = new LabelClass({
symbol: {
type: "text",
color: "orange",
haloColor: "black",
haloSize: 0.7,
font: {
size: 20,
weight: "bold"
}
},
labelPlacement: "above-right",
labelExpressionInfo: {
expression: "$feature.Station"
}
});

var priorityLabel = new LabelClass({
labelExpressionInfo: {expression: "$feature.LotID"},
symbol: {
type: "text",
color: "black",
haloColor: "white",
haloSize: 0.5,
font: {
size: 12,
weight: "bold"
}
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
valueExpression: "When($feature.LandOwner == 'BASES CONVERSION DEVELOPMENT AUTHORITY', 'BCDA', \
                   $feature.LandOwner == 'MANILA RAILROAD COMPANY' || $feature.LandOwner == 'Manila Railroad Company','PNR',$feature.LandOwner)",
uniqueValueInfos: [
{
value: "BCDA",
symbol: {
  type: "simple-fill",
  color: [225,225,225],
  style: "diagonal-cross",
  outline: {
    width: 0.5,
    color: "black"
  }
}
},
{
value: "PNR",
symbol: {
  type: "simple-fill",
  color: [225,225,225],
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
value: "00_Platform",
label: "Platform",
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
value: "00_Platform 10car",
label: "Platform 10car",
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
value: "00_Station",
label: "Station Box",
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
label: "Pier Colmn",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [78, 78, 78, 0.5],
}
},
{
// All features with value of "North" will be blue
value: "Pier_Head",
label: "Pier Head",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [169, 169, 169, 0.7]
}
},
{
// All features with value of "North" will be blue
value: "Pile_Cap",
label: "Pile Cap",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [200, 200, 200, 0.7]
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
    1: [0, 197, 255], // Dismantling/Clearing (original: 255, 0, 197)
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0],// For Appraisal/Offer to Compensate
    6: [255, 0, 0] //LBP Account Opening
  };

// Fill symbol color for Structure Layer (NLO/LO)
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

function colorLotReqs(){
return {
0: [0, 197, 255], 
1: [112,173,71],
2: [0,112,255],
3: [255,255,0],
4: [255,170,0],
5: [255,0,0],
6: [0,0,0,0]
}
}

let lotLayerRenderer = {
type: "unique-value",
//field: "StatusLA",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.StatusLA == 0, '0',$feature.StatusLA == 1, '1', $feature.StatusLA == 2, '2', \
                   $feature.StatusLA == 3, '3', $feature.StatusLA == 4, '4', \
                   $feature.StatusLA == 5, '5', $feature.StatusLA)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "0",
label: "Handed-Over",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[0],
}
},
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



// Priority with handover dates
function colorPriority() {
return {
1: [255, 0, 0], // Red
2: [255, 127, 80], // Orange
3: [255, 255, 0], // Yellow
4: [0, 112, 255], // Blue
5: [112, 173, 71] // Green
}
}

var priorityDates = ["December 2022", "April 2023", "July 2023"];
                
let lotPriorityRenderer = {
type: "unique-value",
//field: "HandOverDate1", // For 3D, including this works, but for 2D we need to remove this 
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.HandOverDate1 == 'December 2022', '1', \
                   $feature.HandOverDate1 == 'April 2023', '3', \
                   $feature.HandOverDate1 == 'July 2023', '4', $feature.HandOverDate1)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "1",
label: priorityDates[0],
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
value: "3",
label: priorityDates[1],
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
value: "4",
label: priorityDates[2],
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[3]
  }
}
},
/*
{
value: "5",
label: priorityDates[4],
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[5]
  }
}
}
*/
]
}

// Occupancy
/*
let occupancyRenderer = {
type: "unique-value",
valueExpression: "When($feature.Occupancy == 0, 'Occupied', \
                   $feature.Occupancy == 1, 'Relocated', $feature.Occupancy)",
uniqueValueInfos: [
{
value: "Occupied",
label: "Occupied",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[1], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "Relocated",
label: "Relocated",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[3], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
}
]
};
*/
// ISF Relocation
const isfSymbolColor = {
1: [0, 197, 255], // Relocated  (original: 255, 0, 197)
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0], // For Appraisal/OtC/Requirements for Other Entitlements
    6: [255, 0, 0] //LBP Account Opening
}
const outlineColor = "gray";

let isfRenderer = {
type: "unique-value",
valueExpression: "When($feature.StatusRC == 1, 'relocated', \
                   $feature.StatusRC == 2, 'paid', $feature.StatusRC == 3, 'payp', \
                   $feature.StatusRC == 4, 'legalpass', $feature.StatusRC == 5, 'otc', \
                   $feature.StatusRC == 6, 'lbp', $feature.StatusRC)",
uniqueValueInfos: [
{
value: "relocated",
label: "Relocated",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[1], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "paid",
label: "Paid",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[2], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "payp",
label: "For Payment Processing",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[3], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "legalpass",
label: "For Legal Pass",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[4], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "otc",
label: "For Appraisal/OtC/Reqs for Other Entitlements",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[5], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "lbp",
label: "LBP Account Opening",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: isfSymbolColor[6], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
}
]
};

//*******************************//
// Import Layers                 //
//*******************************//
// Pier head and column
var pierHeadColumnLayerLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Pier Head/Column",
outFields: ["*"],
minScale: 150000,
maxScale: 0,
renderer: pierHeadColRenderer,
popupEnabled: false
});
pierHeadColumnLayerLayer.listMode = "hide";
map.add(pierHeadColumnLayerLayer, 1);

var chainageLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
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
minScale: 150000,
maxScale: 0,
renderer: chainageRenderer,
outFields: ["*"],
popupEnabled: false

});

//chainageLayer.listMode = "hide";
map.add(chainageLayer, 1);

///////////////////////////////////////////////////////////////////////////////
// Pier No. (point feature)
var PierNoLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
labelingInfo: [alreadyAccessDateClass, yetAccessDateClass],
renderer: pierNoRenderer,
title: "Pier No.",
minScale: 150000,
maxScale: 0,
outFields: ["*"],   
},{utcOffset: 300});
//chainageLayer.listMode = "hide";
map.add(PierNoLayer, 3);

// Date Format function
function dateFormat(inputDate, format) {
//parse the input date
const date = new Date(inputDate);

//extract the parts of the date
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();    

//replace the month
format = format.replace("MM", month.toString().padStart(2,"0"));        

//replace the year
if (format.indexOf("yyyy") > -1) {
  format = format.replace("yyyy", year.toString());
} else if (format.indexOf("yy") > -1) {
  format = format.replace("yy", year.toString().substr(2,2));
}

//replace the day
format = format.replace("dd", day.toString().padStart(2,"0"));

return format;
}

// Custom Popup Content for PierNoLayer
let customContent = new CustomContent({
outFields: ["*"],
creator: function(event) {

// Extract AsscessDate of clicked PierNoLayer
const stats = event.graphic.attributes.AccessDate;
const pierNo = event.graphic.attributes.PIER;

// Convert numeric to date format
var date = new Date(stats);
const dateValue = dateFormat(date, 'MM-dd-yyyy');

// If the date is before current date, popupContent should be "AVAILABLE"
const d1 = new Date('08-31-2022');

if (date < d1) {
DATES = "AVAILABLE";
} else {
DATES = dateValue;
}

//return `Access Date: <b>${DATES}</b>`;
return `Access Date: <b>${DATES}</b>`;

}
});

const template = new PopupTemplate({
outFields: ["*"],
title: "Pier No: <b>{PIER}</b>",
lastEditInfoEnabled: false,
content: [customContent]
});
PierNoLayer.popupTemplate = template;


//////////////////////////////////////////////////////////////////

// Station box
var stationBoxLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
renderer: stationBoxRenderer,
minScale: 150000,
maxScale: 0,
title: "Station Box",
outFields: ["*"],
popupEnabled: false
});
stationBoxLayer.listMode = "hide";
map.add(stationBoxLayer, 2);

// ROW //
var rowLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "PROW",
popupEnabled: false
});
map.add(rowLayer,2);


// Priority Lot
var priorityLayer = new FeatureLayer ({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
renderer: lotPriorityRenderer,
labelingInfo: [priorityLabel],
definitionExpression: "HandOverDate1 IS NOT NULL",
title: "Land (Hand-Over Dates)",
popupEnabled: false,
minScale: 150000,
maxScale: 0
});
map.add(priorityLayer,2);

// Free and Clear Lot //
var fncLayer = new FeatureLayer ({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
//'BASES CONVERSION DEVELOPMENT AUTHORITY', 'MANILA RAILROAD COMPANY'
layerId: 2,
title: "Free-and-Clear Area",
//popupEnabled: false
});
map.add(fncLayer,1);
//<p>Lot No: {LotID} <br>Hand-Over Date: {HandOverDate}</br>
// Relocation Status point layer


// Land 
var lotLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 7,
renderer:lotLayerRenderer,
//definitionExpression: "LandOwner NOT IN ('BASES CONVERSION DEVELOPMENT AUTHORITY','MANILA RAILROAD COMPANY')",
outFields: ["*"],
title: "Land Acquisition (Status)",
labelsVisible: false,

});
map.add(lotLayer, 1);


// Custom Popup Content for PierNoLaye
const lotStatusArray = ["Handed-Over",
                  "Paid",
                  "For Payment Processing",
                  "For Legal Pass",
                  "For Appraisal/Offer to Buy",
                  "For Expro"];

const landUseArray = ["Agricultural",
                "Agricultural & Commercial",
                "Agricultural / Residential",
                "Commercial",
                "Industrial",
                "Irrigation",
                "Residential",
                "Road",
                "Road Lot",
                "Special Exempt"
              ]

let customContentLot = new CustomContent({
outFields: ["*"],
creator: function(event) {

// Extract AsscessDate of clicked PierNoLayer
const lotNo = event.graphic.attributes.LotID;
const handOverDate = event.graphic.attributes.HandOverDate;
const handOverArea = event.graphic.attributes.percentHandedOver;
const statusLot = event.graphic.attributes.StatusLA;
const landUse = event.graphic.attributes.LandUse;
const municipal = event.graphic.attributes.Municipality;
const barangay = event.graphic.attributes.Barangay;
const landOwner = event.graphic.attributes.LandOwner;
const cpNo = event.graphic.attributes.CP;

// Convert numeric to date format

var date = new Date(handOverDate);
var DATES = dateFormat(date, 'MM-dd-yyyy');

if (DATES === '01-01-1970') {
var finalDate = "Undefined"
} else {
var finalDate = dateFormat(date, 'MM-dd-yyyy');
}
// Convert domain code to domain name
/// 1. Status
if (statusLot >= 0) {
//headerTitleDiv.innerHTML = lotStatusArray[statusLot];
var statusLotTemp = lotStatusArray[statusLot];
}

if (landUse >=1 ) {
var landUseTemp = landUseArray[landUse - 1];
}


return `<ul><li>Hand-Over Date:   <b>${finalDate}</b></li><br>
         <li>Handed-Over Area: <b>${handOverArea} %</b></li><br>
         <li>Status:           <b>${statusLotTemp}</b></li><br>
         <li>Land Use:         <b>${landUseTemp}</b></li><br>
         <li>Municipality:     <b>${municipal}</b></li><br>
         <li>Barangay:         <b>${barangay}</b></li><br>
         <li>Land Owner:       <b>${landOwner}</b>
         <li>CP:               <b>${cpNo}</b></li></ul>`;

}
});

const templateLot = new PopupTemplate({
outFields: ["*"],
title: "Lot No.: <b>{LotID}</b>",
lastEditInfoEnabled: false,
content: [customContentLot]
});
lotLayer.popupTemplate = templateLot;







////////////////////////////////////

// PNR
var pnrLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 10,
title: "Land (PNR)",
definitionExpression: "LandOwner IN ('BASES CONVERSION DEVELOPMENT AUTHORITY','MANILA RAILROAD COMPANY')",
  outFields: ["*"],
  title: "PNR",
  labelsVisible: false,
  renderer: pnrRenderer,
  popupTemplate: {
    title: "<p>{LandOwner} ({LotID})</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "HandOverDate1",
            label: "Hand-Over Date"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "LandOwner",
            label: "Land Owner"
          }
        ]
      }
    ]
  }
  //popupEnabled: false
});
map.add(pnrLayer, 1);

// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
  title: "Structure (Status)",
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
label: "LO (Land Owner)",
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
label: "NLO (Non-Land Owner)",
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
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
renderer: NLOLORenderer,
layerId: 3,
  title: "Structure (NLO/LO)",
  outFields: ["*"],
  popupEnabled: false
});
map.add(structureNLOLOLayer);


// Status of Relocation (Occupancy)
var relocationPtLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
//renderer: occupancyRenderer,
  outFields: ["*"],
  title: "Structure (Occupancy Status)",
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

// Relocation Status point layer
var reloISFLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
renderer: isfRenderer,
  outFields: ["*"],
  title: "Structure (ISF Relocation Status)",
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
            fieldName: "StatusRC",
            label: "<p>Status for Relocation(ISF)</p>"
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
//reloISFLayer.listMode = "hide";
map.add(reloISFLayer);

// Station point feature
var stationLayer = new FeatureLayer({
  portalItem: {
    id: "590680d19f2e48fdbd8bcddce3aaedb5",
    portal: {
      url: "https://gis.railway-sector.com/portal"
    }
  },
  layerId: 2,
  title: "Station",
  outFields: ["*"],
  popuEnabled: false,
  definitionExpression: "Station <> 'NCC'",
  labelingInfo: [labelStation]
});
stationLayer.listMode = "hide";
map.add(stationLayer);

// Define UI
var applicationDiv = document.getElementById("applicationDiv");

var headerDiv = document.getElementById("headerDiv");
var headerTitleDiv = document.getElementById("headerTitleDiv");

var lengendDiv = document.getElementById("lengendDiv");
var lotListExproDiv = document.getElementById("lotListExproDiv");

// Lot Statistics:
const chartElement = document.getElementById("chartPanel");
const chartTitleDiv = document.getElementById("chartTitleDiv");

const lotTitleTotalNumber = document.getElementById("lotTitleTotalNumber");
const lotTotalNumber = document.getElementById("lotTotalNumber");
const lotMoaChartDiv = document.getElementById("lotMoaChartDiv");
const lotTitlePteTotalNumber = document.getElementById("lotTitlePteTotalNumber");
const lotPteTotalNumber = document.getElementById("lotPteTotalNumber");

var opacityInput = document.getElementById("opacityInput");

// Structure Statistics:
const chartElementStructure = document.getElementById("structureChartPanel");
const structureTotalNumberDiv = document.getElementById("structureTotalNumberDiv");

const structureChartDiv = document.getElementById("structureChartDiv");
const structureMoaChartDiv = document.getElementById("structureMoaChartDiv");
const structurePteTotalNumber = document.getElementById("structurePteTotalNumber");
const structurePteDiv = document.getElementById("structurePteDiv");
  
const structureIsfTitleTotalNumber = document.getElementById("structureIsfTitleTotalNumber");

// Button Element
const chartTypeInput= document.getElementById("chartTypeInput");

// Progress Chart //
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Setting of Chart Buttons------------------------------
// Initial setting for chart: default = structure chart
//headerTitleDiv.innerHTML = "N2 Land Acquisition";
lotTitlePteTotalNumber.innerHTML = "Number of Permit-To-Enter";
lotTitleTotalNumber.innerHTML = "Number of Lot";

if (document.getElementById("Structure").checked = true) {
reloISFLayer.visible = false;
relocationPtLayer.visible = true;
updateChartStructure().then(totalNumberOfStructures);

structureIsfTitleTotalNumber.innerHTML = "Number of Structure";
structurePteTotalNumber.innerHTML = "Number of Permit-To-Enter";
}

// When city, barangay, or priority is changed, I want a chart to return to Structure
function backToStructureChart(){
document.getElementById("Structure").checked = true;
reloISFLayer.visible = false;
relocationPtLayer.visible = true;
}

//--------------------------------------------------------
// Default
updateChartLot().then(totalNumberOfLots);
//updateChartStructure().then(totalNumberOfStructures);
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

var total_lot_N = {
onStatisticField: "CASE WHEN StatusLA >= 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_lot_N",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_pte_lot, total_lot_N];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const pte = stats.total_pte_lot;
const totalN = stats.total_lot_N;
const percPTE = ((pte/totalN)*100).toFixed(0);

if (percPTE === "Infinity"){
lotPteTotalNumber.innerHTML = "N/A";
} else {
lotPteTotalNumber.innerHTML = percPTE + "% (" + pte + ")";
}

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

var total_struc_N = {
onStatisticField: "CASE WHEN StatusStruc >=1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_struc_N",
statisticType: "sum"
};

var query = structureLayer.createQuery();
query.outStatistics = [total_pte_structure,total_struc_N];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const pte = stats.total_pte_structure;
const totalN = stats.total_struc_N;
const percPTE = ((pte/totalN)*100).toFixed(0);

structurePteDiv.innerHTML = percPTE + "% (" + pte + ")";
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
var prioritySelect = document.getElementById("prioritySelect");

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
}

///////////////////////////
// 1. Get values and return to drop down list
// 1.1. Municipality
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
  

// 1.2. Barangay
function barangayFilterList(municipalValue) {
  var barangayArray = [];

  function barangayQuery() {
    var query = lotLayer.createQuery();
    if (municipalValue === undefined || municipalValue === 'None') {
      query.where = "1=1";
    } else if (municipalValue !== 'None') {
      query.where = "Municipality = '" + municipalValue + "'";
    }
  
    return lotLayer.queryFeatures(query).then(function(response) {
      stats = response.features;
      stats.forEach((result, index) => {
        const attributes = result.attributes;
        const barangay = attributes.Barangay;
        barangayArray.push(barangay);
      });
      return barangayArray;
    });
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

  function addToSelectQuery2(query2Values) {
    barangaySelect.options.length = 0;
    query2Values.sort();
    query2Values.unshift('None');
    query2Values.forEach(function(value) {
      var option = document.createElement("option");
      option.text = value;
      barangaySelect.add(option);
    });
  }

  barangayQuery()
  .then(getUniqueValues2)
  .then(addToSelectQuery2)
}
barangayFilterList();

// 1.3. Handover date
function priorityFilterList(municipalValue, barangayValue) {
  var priorityArray = [];

  function priorityQuery() {
    var query = lotLayer.createQuery();
    if (municipalValue === undefined && barangayValue === undefined) {
      query.where = "1=1";
      
      // Municipality: None, barangayValue: !None
      } else if (municipalValue === 'None' && barangayValue !== 'None') {
        query.where = "Barangay = '" + barangayValue + "'";
      
      // Municipality: None, barangayValue: None
      } else if (municipalValue === 'None' && barangayValue === 'None') {
        query.where = "1=1";
      
      // Municipality: !None, barangayValue: None
      } else if (municipalValue !== 'None' && barangayValue === 'None') {
        query.where = "Municipality = '" + municipalValue + "'";
      
      // Municipality: !None, barangayValue: !None
      } else if (municipalValue !== 'None' && barangayValue !== 'None') {
        query.where = "Municipality = '" + municipalValue + "'" + " AND " + "Barangay = '" + barangayValue + "'";
      }
  
      return lotLayer.queryFeatures(query).then(function(response) {
        stats = response.features;
        stats.forEach((result, index) => {
          const attributes = result.attributes;
          const handedOver = attributes.HandOverDate1;
          priorityArray.push(handedOver);
        });
        return priorityArray;
      });
  }


    function getUniqueValues3(values2) {
      var uniqueValues2 = [];
      values2.forEach(function(item, i) {
        if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
          uniqueValues2.push(item);
        }
      });
      return uniqueValues2;
    }
  
    function addToSelectQuery3(query2Values) {
      prioritySelect.options.length = 0;
      query2Values.sort();
      query2Values.unshift('None');
      query2Values.forEach(function(value) {
        var option = document.createElement("option");
        option.text = value;
        prioritySelect.add(option);
      });
      return query2Values;
    }

    priorityQuery()
    .then(getUniqueValues3)
    .then(addToSelectQuery3);
}
priorityFilterList();

// Set the definition expression on the lot layer
// to reflect the selecction of the user
// Only for Municipality
function setMunicipalExpression(municipal) {

if (municipal == 'None') {
  lotLayer.definitionExpression = null;
  structureLayer.definitionExpression = null;
  priorityLayer.definitionExpression = null;
  reloISFLayer.definitionExpression = null;
  pnrLayer.definitionExpression = null;

} else {
  lotLayer.definitionExpression = "Municipality = '" + municipal + "'";
  structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
  priorityLayer.definitionExpression = "Municipality = '" + municipal + "'";
  reloISFLayer.definitionExpression = "Municipality = '" + municipal + "'";
  pnrLayer.definitionExpression = "Municipality = '" + municipal + "'";;
}

zoomToLayer(lotLayer);

//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// for Municipcality + Barangay + Priority
function setMunicipalBarangayPriorityExpression(municipal, barangay, priority) {
//var municipal = municipalSelect.options[municipalSelect.selectedIndex].value;
//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
//var priori = prioritySelect.options[prioritySelect.selectedIndex].value;

// all = 'None'
if (municipal == 'None' && barangay == 'None' && priority == 'None') {
  lotLayer.definitionExpression = null;
  structureLayer.definitionExpression = null;
  priorityLayer.definitionExpression = null;
  reloISFLayer.definitionExpression = null;
  pnrLayer.definitionExpression = null;

} else if (municipal == 'None' && barangay == 'None' && priority !== 'None') {
  lotLayer.definitionExpression = "HandOverDate1 = '" + priority + "'";
  //structureLayer.definitionExpression = "HandOverDate1 = '" + priority + "'";
  priorityLayer.definitionExpression = "HandOverDate1 = '" + priority + "'";
  pnrLayer.definitionExpression = "HandOverDate1 = '" + priority + "'";

} else if (municipal == 'None' && barangay !== 'None' && priority == 'None') {
  lotLayer.definitionExpression = "Barangay = '" + barangay + "'";
  structureLayer.definitionExpression = "Barangay = '" + barangay + "'";
  priorityLayer.definitionExpression = "Barangay = '" + barangay + "'"; 
  reloISFLayer.definitionExpression = "Barangay = '" + barangay + "'";
  pnrLayer.definitionExpression = "Barangay = '" + barangay + "'";

} else if (municipal == 'None' && barangay !== 'None' && priority !== 'None') {
  lotLayer.definitionExpression = "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  structureLayer.definitionExpression = "Barangay = '" + barangay + "'";
  priorityLayer.definitionExpression = "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  pnrLayer.definitionExpression = "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'"; 

} else if (municipal !== 'None' && barangay == 'None' && priority == 'None') {
  lotLayer.definitionExpression = "Municipality = '" + municipal + "'";
  structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
  priorityLayer.definitionExpression = "Municipality = '" + municipal + "'";
  reloISFLayer.definitionExpression = "Municipality = '" + municipal + "'";
  pnrLayer.definitionExpression = "Municipality = '" + municipal + "'";

} else if (municipal !== 'None' && barangay == 'None' && priority !== 'None') {
  lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  structureLayer.definitionExpression = "Municipality = '" + municipal + "'";
  priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  pnrLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + priority + "'";

} else if (municipal !== 'None' && barangay !== 'None' && priority == 'None') {
  lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'";
  structureLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'";
  priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'"; 
  reloISFLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'";
  pnrLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'";

} else {
  lotLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  structureLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'";
  priorityLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
  pnrLayer.definitionExpression = "Municipality = '" + municipal + "'" + " AND " + "Barangay = '" + barangay + "'" + " AND " + "HandOverDate1 = '" + priority + "'";
}


//var barang = barangaySelect.options[barangaySelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

///
function filterLot() {
  var query2 = lotLayer.createQuery();
  query2.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?
  }
  
  function filterStructure() {
  var query2 = structureLayer.createQuery();
  query2.where = structureLayer.definitionExpression; // use filtered municipality. is this correct?
  }
  
  function filterPriority() {
  var query2 = pnrLayer.createQuery();
  query2.where = pnrLayer.definitionExpression; // use filtered municipality. is this correct?
  
  }
  
  function filterPNR() {
  var query2 = pnrLayer.createQuery();
  query2.where = pnrLayer.definitionExpression; // use filtered municipality. is this correct?
  }
  
  // When CP is changed, Type is reset to 'None'
  const changeSelected = (e) => {
  const $select = document.querySelector('#prioritySelect');
  $select.value = 'None'
  };




//////////////////////////////////////////////////////////////////////
// Dropdown List
// Select Municipality from dropdown list
municipalSelect.addEventListener("change", function() {
var municipal = event.target.value;
var barangay = barangaySelect.value;

setMunicipalExpression(municipal);
changeSelected();

barangayFilterList(municipal);
priorityFilterList(municipal, barangay);

filterLot();
filterStructure();
filterPriority();
filterPNR();


updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();

backToStructureChart();
zoomToLayer(lotLayer);
});

barangaySelect.addEventListener("change", function() {
var municipal = municipalSelect.value;
var barangay = event.target.value;
var priority = prioritySelect.value;

setMunicipalBarangayPriorityExpression(municipal, barangay, priority);
changeSelected();

priorityFilterList(municipal, barangay);

filterLot();
filterStructure();
filterPriority();
filterPNR();

//headerTitleDiv.innerHTML = strregion + ", " + strstate;
updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();

backToStructureChart();

zoomToLayer(lotLayer);
//relocationObjectID(reloStatusLayer);
});


prioritySelect.addEventListener("change", function() {
var municipal = municipalSelect.value;
var barangay = barangaySelect.value;
var priority = event.target.value;

setMunicipalBarangayPriorityExpression(municipal, barangay, priority);

//headerTitleDiv.innerHTML = strregion + ", " + strstate;
updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();

backToStructureChart();

//zoomToLayer(lotLayer);
//relocationObjectID(reloStatusLayer);

let arrLviews = [];

view.whenLayerView(lotLayer).then(function (layerView) {
arrLviews.push(layerView);
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
}); // End of view.whenLayerView

view.whenLayerView(pnrLayer).then(function (layerView) {
arrLviews.push(layerView);
pnrLayer.queryFeatures().then(function(results) {
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

      pnrLayer.queryExtent(queryExt).then(function(result) {
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
}); // End of view.whenLayerView

for(var i = 0; i < arrLviews.length; i++) {
arrLviews[i].filter = {
  where: "HandOverDate1 = '" + type + "'"
}
}
});


/////////////////////////////////////////////////////////////
////////////////////////////////////////////

// Switch between Structure chart and ISF Relocation Chart
chartTypeInput.addEventListener("change", filterByType);
function filterByType(e) {
const selectedType = e.target.id;
if(selectedType == "Structure") {
reloISFLayer.visible = false;
relocationPtLayer.visible = true;

updateChartLot().then(totalNumberOfLots);
updateChartStructure().then(totalNumberOfStructures);
updateMoaChartLot();
updateMoaChartStructure();
pteNumberLot();
pteNumberStructure();

lotTitleTotalNumber.innerHTML = "Number of Lots";
structureIsfTitleTotalNumber.innerHTML = "Number of Structure";
lotTitlePteTotalNumber.innerHTML = "Number of Permit-To-Enter";
structurePteTotalNumber.innerHTML = "Number of Permit-To-Enter";

} else if (selectedType == "ISF") {
reloISFLayer.visible = true;
relocationPtLayer.visible = false;
updateChartISF();
combinedAffectedHandedOverAreaChart();

// Return empty chart title
lotTitleTotalNumber.innerHTML = "";
structureIsfTitleTotalNumber.innerHTML = "";
lotTitlePteTotalNumber.innerHTML = "";
structurePteTotalNumber.innerHTML = "";

// Hide MoA charts (lot & structure) and total number div
lotTotalNumber.innerHTML = "";
lotMoaChartDiv.innerHTML = "";
lotPteTotalNumber.innerHTML = "";
structureTotalNumberDiv.innerHTML = "";
structureMoaChartDiv.innerHTML = "";
structurePteTotalNumber.innerHTML = "";
structurePteDiv.innerHTML = "";
}

}



// Create a list of expropriation Lots
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

        li.innerHTML = "Lot ID: " + "<b>" + attributes.LotID + "</b>" + "<br>" + attributes.LandOwner; // + "</br>" + "<p>" + statusla + "</p>";
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



//////////////////// Pie Chart ///////////////////////////////////////////////////
// Percent lots handed over in area by CP
// First, compile affected and handed-over areas for each CP
function n01AffectedHandedOverArea(){
var total_n01_affected = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_n01_affected",
statisticType: "sum"
};

var total_n01_handedover = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_n01_handedover",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_n01_affected, total_n01_handedover];
query.where = "CP = 'N-01'";
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const affected = stats.total_n01_affected;
const handedover = stats.total_n01_handedover;
const perc = ((handedover/affected)*100).toFixed(0);

const compileArray1 = [perc]

return compileArray1
});
}

function n02AffectedHandedOverArea(compileArray1){
var total_n02_affected = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_n02_affected",
statisticType: "sum"
};

var total_n02_handedover = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_n02_handedover",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_n02_affected, total_n02_handedover];
query.where = "CP = 'N-02'";
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const affected = stats.total_n02_affected;
const handedover = stats.total_n02_handedover;
const perc = ((handedover/affected)*100).toFixed(0);

const compileArray2 = [compileArray1[0], perc]


return compileArray2
});
}

function n03AffectedHandedOverArea(compileArray2){
var total_n03_affected = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_n03_affected",
statisticType: "sum"
};

var total_n03_handedover = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_n03_handedover",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_n03_affected, total_n03_handedover];
query.where = "CP = 'N-03'";
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const affected = stats.total_n03_affected;
const handedover = stats.total_n03_handedover;
const perc = ((handedover/affected)*100).toFixed(0);

const compileArray3 = [compileArray2[0], compileArray2[1], perc]; // handedover

return compileArray3
});
}

function n04AffectedHandedOverArea(compileArray3){
var total_n04_affected = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_n04_affected",
statisticType: "sum"
};

var total_n04_handedover = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_n04_handedover",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_n04_affected, total_n04_handedover];
query.where = "CP = 'N-04'";
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const affected = stats.total_n04_affected;
const handedover = stats.total_n04_handedover;
const perc = ((handedover/affected)*100).toFixed(0);

const compileArray4 = [compileArray3[0], compileArray3[1], compileArray3[2], perc]; // handedover

return compileArray4
});
}

function n05AffectedHandedOverArea(compileArray4){
var total_n05_affected = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_n05_affected",
statisticType: "sum"
};

var total_n05_handedover = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_n05_handedover",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_n05_affected, total_n05_handedover];
query.where = "CP = 'N-05'";
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const affected = stats.total_n05_affected;
const handedover = stats.total_n05_handedover;
const perc = ((handedover/affected)*100).toFixed(0);

const compileArray5 = [compileArray4[0], compileArray4[1], compileArray4[2], compileArray4[3], perc]; // handedover

return compileArray5
});
}



// Now use the above compiled values
function percentHandedOverLotByCPChart(compileArray5) {

  // N-01
  const n01_perc = compileArray5[0];
  const n01_other = 0;

  // N-02
  const n02_perc = compileArray5[1];
  const n02_other = 0;

  // N-03
  const n03_perc = compileArray5[2];
  const n03_other = 0;

  // N-04
  const n04_perc = compileArray5[3];
  const n04_other = 0;

  // N-05
  const n05_perc = compileArray5[4];
  const n05_other = 0;

// Chart //
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data = [
{
category: "N-05",
value1: n05_perc,
value2: 0,
},
{
category: "N-04",
value1: n04_perc,
value2: 0,
},
{
category: "N-03",
value1: n03_perc,
value2: 0,
},
{
category: "N-02",
value1: n02_perc,
value2: 0,
},
{
category: "N-01",
value1: n01_perc,
value2: 0,
}
];

chart.colors.step = 2;
chart.padding(10, 10, 10, 10);
// Legend
const LegendFontSizze = 16;
chart.legend = new am4charts.Legend();
//chart.legend.labels.template.disabled = true;
chart.legend.disabled = true;
chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;

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

// Chart Title
var title = chart.titles.create();
title.text = "Handed-Over Area"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";


var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 16;
markerTemplate.height = 16;

// Add chart title
//  var title = chart.titles.create();
//title.text = "Construction Progress"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
//title.fontSize = 20;
//title.fill = "#3ce00a";


var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 20;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label

var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";


function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
//series.calculatePercent = false;
series.dataItems.template.locations.categoryY = 0.5;

// Bar chart line color and width
series.columns.template.stroke = am4core.color("#ffffff");
series.columns.template.strokeWidth = 1.5;
series.name = name;

var labelBullet = series.bullets.push(new am4charts.LabelBullet());

if (name == "Handed-Over"){
series.fill = am4core.color("#0070ff");

labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.formatNumber('#.')}%";
//labelBullet.label.fill = am4core.color("#00FFFFFF");
labelBullet.label.fill = am4core.color("#FFFFFF");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 19;
labelBullet.locationX = 0.5;

} else if (name == "Affected Area"){
series.fill = am4core.color("#000000");
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#FF000000");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 20;
labelBullet.locationX = 0.5;

} 
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')}"


// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");

} // End of createSeries function

createSeries("value1", "Handed-Over");
createSeries("value2", "Affected Area");

} // end of updateChart()  

async function combinedAffectedHandedOverAreaChart() {
n01AffectedHandedOverArea()
.then(n02AffectedHandedOverArea)
.then(n03AffectedHandedOverArea)
.then(n04AffectedHandedOverArea)
.then(n05AffectedHandedOverArea)
.then(percentHandedOverLotByCPChart)
}


// Lot Chart
async function updateChartLot() {
var total_handedover_lot = {
onStatisticField: "CASE WHEN StatusLA = 0 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_handedover_lot",
statisticType: "sum"
};

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
query.outStatistics = [total_handedover_lot, total_paid_lot, total_payp_lot, total_legalpass_lot,
                   total_otb_lot, total_expro_lot];
query.returnGeometry = true;

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const handedover = stats.total_handedover_lot;
const paid = stats.total_paid_lot;
const payp = stats.total_payp_lot;
const legalpass = stats.total_legalpass_lot;
const otb = stats.total_otb_lot;
const expro = stats.total_expro_lot;

const totalNumberLots = handedover + paid + payp + legalpass + otb + expro;

var chart = am4core.create("chartdiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StatusLA": "Handed-Over",
  "status": handedover,
  "color": am4core.color("#00C5FF")
},
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
pieSeries.tooltip.label.fontSize = 12;

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
var title = chart.titles.create();
title.text = "Land"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 5;

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

if (selectedD == "Handed-Over") {
selectedStatus = 0;
} else if (selectedD == "Paid") {
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
lotTotalNumber.innerHTML = thousands_separators(totalNumberLots);
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
  "color": am4core.color("#00C5FF") // original: #FF00C5
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
var title = chart.titles.create();
title.text = "Structure"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 5;


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

///////////////////////////// ISF Relocation
// Relocation (ISF)
async function updateChartISF() {
var total_relocated_lot = {
onStatisticField: "CASE WHEN StatusRC = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_relocated_lot",
statisticType: "sum"
};

var total_paid_lot = {
onStatisticField: "CASE WHEN StatusRC = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_paid_lot",
statisticType: "sum"
};

var total_payp_lot = {
onStatisticField: "CASE WHEN StatusRC = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_payp_lot",
statisticType: "sum"
};

var total_legalpass_lot = {
onStatisticField: "CASE WHEN StatusRC = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_legalpass_lot",
statisticType: "sum"
};

var total_otc_lot = {
onStatisticField: "CASE WHEN StatusRC = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_otc_lot",
statisticType: "sum"
};

var total_lbp_lot = {
onStatisticField: "CASE WHEN StatusRC = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_lbp_lot",
statisticType: "sum"
};  

var query = reloISFLayer.createQuery();
query.outStatistics = [total_relocated_lot, total_paid_lot, total_payp_lot,
                   total_legalpass_lot, total_otc_lot, total_lbp_lot];
query.returnGeometry = true;

return reloISFLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const clear = stats.total_relocated_lot;
const paid = stats.total_paid_lot;
const payp = stats.total_payp_lot;
const legalpass = stats.total_legalpass_lot;
const otc = stats.total_otc_lot;
const lbp = stats.total_lbp_lot;

var chart = am4core.create("structureChartDiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StatusRC": "Relocated",
  "status": clear,
  "color": am4core.color("#00C5FF") //  original: #FF00C5
},
{
  "StatusRC": "Paid",
  "status": paid,
  "color": am4core.color("#70AD47")   
},
{
  "StatusRC": "For Payment Processing",
  "status": payp,
  "color": am4core.color("#0070FF") 
},
{
  "StatusRC": "For Legal Pass",
  "status": legalpass,
  "color": am4core.color("#FFFF00")
},
{
  "StatusRC": "For Appraisal/OtC/Requirements for Other Entitlements",
  "status": otc,
  "color": am4core.color("#FFAA00")    
},
{
  "StatusRC": "LBP Account Opening",
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


// Add a legend
const LegendFontSizze = 13;
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
var title = chart.titles.create();
title.text = "ISF Relocation"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 5;


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

if (selectedD == "Relocated") {
selectedStatus = 1;
} else if (selectedD == "Paid") {
selectedStatus = 2;
} else if (selectedD == "For Payment Processing") {
selectedStatus = 3;
} else if (selectedD == "For Legal Pass") {
selectedStatus = 4;
} else if (selectedD == "For Appraisal/OtC/Requirements for Other Entitlements") {
selectedStatus = 5;
} else if (selectedD == "LBP Account Opening") {
selectedStatus = 6;
} else {
selectedStatus = null;
}

view.when(function() {
view.whenLayerView(reloISFLayer).then(function (layerView) {
chartLayerView = layerView;
chartElementStructure.style.visibility = "visible";

reloISFLayer.queryFeatures().then(function(results) {
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

      reloISFLayer.queryExtent(queryExt).then(function(result) {
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
where: "StatusRC = " + selectedStatus
}

}); // End of view.whenLayerView


}); // End of view.when

} // End of filterByChart
} // End of createSlices function

createSlices("status", "StatusRC");

});  // End of queryFeature                 
} // End of updateChartISF()





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
title.fontSize = 15;
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
title.fontSize = 15;
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







///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
  // On-off feature layer tab
  var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage" || item.title === "Pier No." || item.title === "Land (Free and Clear)"){
          item.visible = false
        }
      }
    });


var legend = new Legend({
view: view,
container: "legendDiv",
layerInfos: [
{
layer: pierHeadColumnLayerLayer,
title: "Pier Head/Column"

},
{
layer: lotLayer,
title: "Land Acquisition (Status)"
},
{
layer: fncLayer,
title: "Free and Clear Area (Construction Workable Area)"

},
{
layer: structureLayer,
title: "Structure (Status)"
},
{
layer: structureNLOLOLayer,
title: "Structure (NLO/LO)"
},
{
layer: relocationPtLayer,
title: "Structure (Occupancy)"
},
{
layer: reloISFLayer,
title: "Structure (ISF Relocation Status)"
},
{
layer: priorityLayer,
title: "Land (Hand-Over Dates)"
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
layer: rowLayer,
title: "PROW"
},
{
layer: stationLayer,
title: "Station"
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

  const searchExpand = new Expand({
view: view,
content: searchWidget,
expandIconClass: "esri-icon-search",
group: "top-left"
});
  view.ui.add(searchExpand, {
    position: "top-left"
  });
searchExpand.watch("expanded", function() {
if(!searchExpand.expanded) {
searchWidget.searchTerm = null;
}
});
});