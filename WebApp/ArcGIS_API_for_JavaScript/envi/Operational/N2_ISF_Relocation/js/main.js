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
  "esri/widgets/BasemapToggle"
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
      center: [120.57930, 15.18],
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

  var relocationChartDiv = document.getElementById("relocationChartDiv");
  var structurePteDiv = document.getElementById("structurePteDiv");       


  var chartTitleDiv = document.getElementById("chartTitleDiv");

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
color: [255,170,0],
size: 18,
haloColor: "black",
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

// Station Box
let stationBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "00_Platform",
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

const colorsISF = {
1: [255, 0, 197], // Relocated
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0], // For Appraisal/OtC/Requirements for Other Entitlements
    6: [255, 0, 0] //LBP Account Opening
};


// Fill symbol color for Structure Layer (Status of Structure)
let structureBoundaryRenderer = {
type: "simple-fill",
color:  [0, 0, 0, 0],
style: "solid",
outline: {
color: [112, 173, 71],
width: 1
}
};


//*******************************//
// Import Layers                 //
//*******************************//
// Relocation Status point layer
var reloISFLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
  outFields: ["*"],
  title: "Status for Relocation (ISF)",
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


function renderISFLayer() {
    const renderer = new UniqueValueRenderer({
      field: "StatusRC"
    });

    for (let property in colorsISF) {
      if (colorsISF.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            size: 4,
            color: colorsISF[property],
            outline: {  // autocasts as new SimpleLineSymbol()
              width: 0.5,
              color: "#6E6E6E"
            }
          }
        });
      }
    }

    reloISFLayer.renderer = renderer;
  }

  renderISFLayer();

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
renderer: chainageRenderer,
outFields: ["*"],
popupEnabled: false

});
//chainageLayer.listMode = "hide";
map.add(chainageLayer, 1);

// Pier No. (point feature)
var PierNoLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
title: "Pier No.",
outFields: ["*"],
popupEnabled: false,
labelingInfo: [labelPierNo],
renderer: pierNoRenderer

});

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
renderer: pierHeadColRenderer,
popupEnabled: false
});
pierHeadColumnLayerLayer.listMode = "hide";
map.add(pierHeadColumnLayerLayer);

// Station box
var stationBoxLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
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
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "ROW",
popupEnabled: false
});
map.add(rowLayer,2);

// Station point feature
var stationLayer = new FeatureLayer({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 7
       //definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Priority Lot


// Free and Clear Lot //




// Land 
var lotLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 7,
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
map.add(lotLayer);

// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 9,
  title: "Structure Boundary",
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
            fieldName: "StatusRC",
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


// Status of Relocation (Occupancy)
var relocationPtLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
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

// Progress Chart //
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default
updateChartISF();
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


// Total number of PTE for Structure
function nloloNumberISF() {
var total_nlo_ISF = {
onStatisticField: "CASE WHEN Status = 'NLO' THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nlo_ISF",
statisticType: "sum"
};

var total_lo_ISF = {
onStatisticField: "CASE WHEN Status = 'LO' THEN 1 ELSE 0 END",
outStatisticFieldName: "total_lo_ISF",
statisticType: "sum"
};

var query = reloISFLayer.createQuery();
query.outStatistics = [total_nlo_ISF, total_lo_ISF];
query.returnGeometry = true;

reloISFLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const nloISF = stats.total_nlo_ISF;
const loISF = stats.total_lo_ISF;

nloISFtotalNumberDiv.innerHTML = thousands_separators(nloISF);
loISFtotalNumberDiv.innerHTML = thousands_separators(loISF);
})

};
nloloNumberISF();

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


//////////////////////  //////////////////////////
// Return an array of unique values in the 'Brangay' field of the lot Layer
// Query all features from the lot layer
view.when(function() {
return reloISFLayer.when(function() {
  var query = reloISFLayer.createQuery();
  return reloISFLayer.queryFeatures(query);
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
reloISFLayer.definitionExpression = null;
relocationPtLayer.definitionExpression = null;
} else {
lotLayer.definitionExpression = "Municipality = '" + newValue + "'";
structureLayer.definitionExpression = "Municipality = '" + newValue + "'";
reloISFLayer.definitionExpression = "Municipality = '" + newValue + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue + "'";
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
reloISFLayer.definitionExpression = "Municipality = '" + newValue1 + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue1 + "'";
} else {
lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
structureLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
reloISFLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
relocationPtLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
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
var lotQuery = reloISFLayer.createQuery();

return reloISFLayer.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});
}


municipalSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

setLotMunicipalExpression(type);
filterLotMunicipality();

updateChartISF();
nloloNumberISF();

zoomToLayer(structureLayer);

});



function filterLotMunicipality() {
var query2 = reloISFLayer.createQuery();
query2.where = reloISFLayer.definitionExpression; // use filtered municipality. is this correct?

reloISFLayer.queryFeatures(query2)
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
updateChartISF();
nloloNumberISF();


zoomToLayer(structureLayer);

});



view.when(function() {

//reloISFLayer.outFields = ["Name", "StatusRC", "Status"];

var ownerContainer = document.getElementById("relocationOwnerList");

// Obtain a list of Owner's names and status
view.whenLayerView(reloISFLayer).then(function(statuslayerView) {
statuslayerView.watch("updating", function(val) {
  if (!val) {
    var query = new Query();
    statuslayerView.queryFeatures(query).then(function(result) {
      ownerContainer.innerHTML = "";
      result.features.forEach(function(feature) {
        var attributes = feature.attributes;
        var li = document.createElement("li");
        li.setAttribute("class", "panel-result");

        const status = attributes.StatusRC;
        if (status == 1) {
          statusRC = "Relocated"
        } else if (status == 2) {
          statusRC = "Paid"
        } else if (status == 3) {
          statusRC = "For Payment Processing"
        } else if (status == 4) {
          statusRC = "For Legal Pass"
        } else if (status == 5) {
          statusRC = "For Appraisal/OTC"
        } else if (status == 6) {
          statusRC = "LBP Account Opening"
        }
        li.innerHTML = attributes.Status + "<br>" + attributes.Name + "</br>" + "<p>" + statusRC + "</p>";
        li.addEventListener("click", function(event) {
          var target = event.target;

          var objectId = feature.attributes.OBJECTID;
          var queryExtent = new Query({
            objectIds: [objectId]
          });
          statuslayerView.queryExtent(queryExtent).then(function(result) {
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
          highlightSelect = statuslayerView.highlight([objectId]);
          
      view.on("click", function() {
        statuslayerView.filter = null;
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
const chartTitleLabel = "Progress of Land Acquisition (%)";
const chartTitleLabelStructure = "Progress of Structure (%)";

const chartElementISF = document.getElementById("ISFChartPanel");

var loISFtotalNumberDiv = document.getElementById("loISFtotalNumberDiv");
var nloISFtotalNumberDiv = document.getElementById("nloISFtotalNumberDiv");

//////////////////// Pie Chart ///////////////////////////////////////////////////
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

//const totalNumberOfNLOLO = clear + paid + payp + legalpass + otc + lbp;

var chart = am4core.create("relocationChartDiv", am4charts.PieChart);


// Add data
chart.data = [
{
  "StatusRC": "Relocated",
  "status": clear,
  "color": am4core.color("#FF00C5")
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
chartElementISF.style.visibility = "visible";

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
zoomScale: 1000,
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
        if (item.title === "Chainage" || item.title === "Pier No." || item.title === "Free and Clear" || item.title === "Relocation (Occupancy)" || item.title === "Status of Land Acquisition" ){
          item.visible = false
        }
      }
    });


var legend = new Legend({
view: view,
container: legendDiv,
layerInfos: [
{
layer: lotLayer,
title: "Status of Land Acquisition"
},
{
layer: structureLayer,
title: "Structure Boundary"
},
{
layer: relocationPtLayer,
title: "Occupancy"
},
{
layer: reloISFLayer,
title: "Status of ISF"
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


});