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
  "esri/layers/support/Sublayer",
  "esri/widgets/Search",
  "esri/widgets/Compass",
  "esri/smartMapping/labels/clusters",
  "esri/smartMapping/popup/clusters"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol, Expand, Editor,
            UniqueValueRenderer, Sublayer, Search, Compass, clusterLabelCreator, clusterPopupCreator) {

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
        basemap: basemap, // "streets-night-vector", 
        ground: "world-elevation"
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
  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");
  var applicationDiv = document.getElementById("applicationDiv");
  const treeTCP_ProcesTypeButton = document.getElementById("dataTypeInput");
  var commentDiv = document.getElementById("commentDiv");
  var CHART_ELEMENT = document.getElementById("chartPanel");

  // Station1 dropdown list
var stationSelect = document.getElementById("valSelect");


///// Renderer ///
// Boundary
// Construction boundary
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
                          color: [215, 215, 158], //[78, 78, 78]
                          style: "short-dash"
                      }
                  }
              }

          ]
};


// Lot
let defaultLotSymbol = {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
};

let lotRenderer = {
type: "unique-value",
field: "TCP_Proces",
defaultSymbol: defaultLotSymbol,
uniqueValueInfos: [
  {
      value: 1,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  },
  {
      value: 2,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  },
  {
      value: 3,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  },
  {
      value: 4,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  },
  {
      value: 5,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  },
  {
      value: 6,
      symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
          color: [225, 225, 225],
          width: 0.7
      }
      }
  }
]
};
//
function colorsCut(){
return {
1: [113,171,72,0.8],
2: [94,79,162,0.8],
3: [255,255,0,0.8],
4: [255,170,0,0.8],
5: [0,115,255,0.8],
6: [50,136,189,0.8],
7: [255,0,0,0.8],
}
}

const outlineColor = "gray";

let treeCuttingRenderer = {
type: "unique-value",
valueExpression: "When($feature.TCP_Proces == 1, 'tcpapp', $feature.TCP_Proces == 2, 'denr', \
                   $feature.TCP_Proces == 3, 'permitcut', $feature.TCP_Proces == 4, 'permitearthb', \
                   $feature.TCP_Proces == 5, 'cut', $feature.TCP_Proces == 6, 'earthb', \
                   $feature.TCP_Proces == 7, 'tcpexp', 'other')",
uniqueValueInfos: [
{
value: "tcpapp",
label: "For TCP Application",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[1], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "denr",
label: "Submitted to DENR",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[2], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "permitcut",
label: "With Permit-Not Yet Cut",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[3], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "permitearthb",
label: "With Permit-Not Yet Earthballed",
type: "simple",
symbol: {
type: "simple-marker",
size: 4,
color: colorsCut()[4], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "cut",
label: "Cut",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[5], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "earthb",
label: "Earthballed",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[6], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "tcpexp",
label: "TCP Expired",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCut()[7], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
}
]
};

//
function colorsCompen(){
return {
1: [0,115,255,0.8],
2: [255,255,0,0.8],
3: [50,136,189,0.8],
4: [255,170,0,0.8],
5: [113,171,72,0.8],
6: [255,0,0,0.8],
7: [94,79,162,0.8],
}
}


let treeTree_CompeRenderer = {
type: "unique-value",
valueExpression: "When($feature.Tree_Compe == 1, 'otc', $feature.Tree_Compe == 2, 'legalpass', \
                   $feature.Tree_Compe == 3, 'payp', $feature.Tree_Compe == 4, 'checkissue', \
                   $feature.Tree_Compe == 5, 'paid', $feature.Tree_Compe == 6, 'nocomp', \
                   $feature.Tree_Compe == 7, 'donate', $feature.Tree_Compe)",
uniqueValueInfos: [
{
value: "otc",
label: "For Appraisal/OtC",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCompen()[1], // the first two letters dictate transparency.
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
color: colorsCompen()[2], // the first two letters dictate transparency.
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
color: colorsCompen()[3], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "checkissue",
label: "For Check Issuance",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCompen()[4], // the first two letters dictate transparency.
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
color: colorsCompen()[5], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "nocomp",
label: "No Compensation",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCompen()[6], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "donate",
label: "For Donation",
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: colorsCompen()[7], // the first two letters dictate transparency.
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

// Status of LA
// Lot

var lotLayer = new FeatureLayer({
portalItem: {
  id: "032432d931624de9bf5ff03f1f9d7016",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
},
layerId: 1,
title: "Status of Land Acquisition",
renderer: lotRenderer,
popupEnabled: false,
    outFields: ["*"]
  });
  lotLayer.listMode = "hide";
  map.add(lotLayer,1);

// Tree Cutting
var treeCuttingLayer = new FeatureLayer ({
portalItem: {
id: "30cdb9f9775146308a05dd17cfbfa87a",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
elevationInfo: {
      mode: "on-the-ground"
    },
layerId: 1,
outFields: ["*"],
title: "Status of Tree Cutting",
renderer: treeCuttingRenderer,
popupTemplate: {
title: "<h5>{TCP_Proces}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-lot",
  title: "Lot"
 }
],
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "Scientific",
      label: "Scientific Name"
    },
    {
      fieldName: "Common_Nam",
      label: "Common Name"
    },
    {
      fieldName: "TreeStatus",
      label: "Tree Status"
    },
    {
      fieldName: "Recom",
      label: "Recommendation"
    },
    {
      fieldName: "City"
    },
    {
      fieldName: "Id",
      label: "Tree ID"
    },
    {
      fieldName: "Tree_Compe",
      label: "Tree Compensation"
    },
    {
        fieldName: "Remarks2",
        label: "Remarks"
    }
  ]
}
]
}
});
map.add(treeCuttingLayer,2);

// Tree Tree_Compe
var compensationLayer = new FeatureLayer ({
portalItem: {
id: "30cdb9f9775146308a05dd17cfbfa87a",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
outFields: ["*"],
layerId: 1,
title: "Status of Tree Compensation",
renderer: treeTree_CompeRenderer,
popupTemplate: {
title: "<h5>{Tree_Compe}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-lot",
  title: "Lot"
 }
],
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "Scientific",
      label: "Scientific Name"
    },
    {
      fieldName: "Common_Nam",
      label: "Common Name"
    },
    {
      fieldName: "TreeStatus",
      label: "Tree Status"
    },
    {
      fieldName: "Recom",
      label: "Recommendation"
    },
    {
      fieldName: "City"
    },
    {
      fieldName: "Id",
      label: "Tree ID"
    },
    {
      fieldName: "TCP_Proces",
      label: "Tree Cutting"
    },
    {
        fieldName: "Remarks2",
        label: "Remarks"
    }
  ]
}
]
}
});
map.add(compensationLayer,1);



// Point clustering
// Tree-Cutting Layer
// Override the default symbol representing the cluster extent
view.popup.viewModel.selectedClusterBoundaryFeature.symbol = {
type: "simple-fill",
style: "solid",
color: "rgba(50,50,50,0.15)",
outline: {
width: 0.5,
color: "rgba(50,50,50,0.25)"
}
};

treeCuttingLayer
    .when()
    .then(generateClusterConfig)
    .then((featureReduction) => {
      treeCuttingLayer.featureReduction = featureReduction;

      const toggleButton = document.getElementById("toggle-cluster");
      toggleButton.addEventListener("click", toggleClustering);

      // To turn off clustering on a layer, set the
      // featureReduction property to null
      function toggleClustering() {
        if (isWithinScaleThreshold()) {
          let fr = treeCuttingLayer.featureReduction;
          treeCuttingLayer.featureReduction =
            fr && fr.type === "cluster" ? null : featureReduction;
        }
        toggleButton.innerText =
          toggleButton.innerText === "Enable Clustering"
            ? "Disable Clustering"
            : "Enable Clustering";
      }

      view.watch("scale", (scale) => {
        if (toggleButton.innerText === "Disable Clustering") {
          treeCuttingLayer.featureReduction = isWithinScaleThreshold()
            ? featureReduction
            : null;
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });

  function isWithinScaleThreshold() {
    return view.scale > 5000;
  }

  async function generateClusterConfig(layer) {
    // generates default popupTemplate
    const popupTemplate = await clusterPopupCreator
      .getTemplates({ layer })
      .then(
        (popupTemplateResponse) =>
          popupTemplateResponse.primaryTemplate.value
      );

    // generates default labelingInfo
    const { labelingInfo, clusterMinSize } = await clusterLabelCreator
      .getLabelSchemes({ layer, view })
      .then((labelSchemes) => labelSchemes.primaryScheme);

    return {
      type: "cluster",
      popupTemplate,
      labelingInfo,
      clusterMinSize
    };
  }


// Tree Compensation Layer
compensationLayer
    .when()
    .then(generateClusterConfig)
    .then((featureReduction) => {
      compensationLayer.featureReduction = featureReduction;

      const toggleButton = document.getElementById("toggle-cluster");
      toggleButton.addEventListener("click", toggleClustering);

      // To turn off clustering on a layer, set the
      // featureReduction property to null
      function toggleClustering() {
        if (isWithinScaleThreshold()) {
          let fr = compensationLayer.featureReduction;
          compensationLayer.featureReduction =
            fr && fr.type === "cluster" ? null : featureReduction;
        }
        toggleButton.innerText =
          toggleButton.innerText === "Enable Clustering"
            ? "Disable Clustering"
            : "Enable Clustering";
      }

      view.watch("scale", (scale) => {
        if (toggleButton.innerText === "Disable Clustering") {
          compensationLayer.featureReduction = isWithinScaleThreshold()
            ? featureReduction
            : null;
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });

  function isWithinScaleThreshold() {
    return view.scale > 5000;
  }

  async function generateClusterConfig(layer) {
    // generates default popupTemplate
    const popupTemplate = await clusterPopupCreator
      .getTemplates({ layer })
      .then(
        (popupTemplateResponse) =>
          popupTemplateResponse.primaryTemplate.value
      );

    // generates default labelingInfo
    const { labelingInfo, clusterMinSize } = await clusterLabelCreator
      .getLabelSchemes({ layer, view })
      .then((labelSchemes) => labelSchemes.primaryScheme);

    return {
      type: "cluster",
      popupTemplate,
      labelingInfo,
      clusterMinSize
    };
  }


/////////////////////////////////////////////////////////////////////////////////////
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

am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Defaul Label

if (document.getElementById("Tree Cutting").checked = true) {
compensationLayer.visible = false;
treeCuttingLayer.visible = true;
updateChartCutting();


}

//// Station dropdown List
// Return an array of unique values in the 'Station1' field of lot Layer
// Query all features from lot layer
view.when(function() {
return stationLayer.when(function() {
  var query = stationLayer.createQuery();
  return stationLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

//Return an array of all the values in the 'Station1' field'
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.Station1;
});
return values;
}

// Return an array of unique values in the 'Station1' field of the lot Layer
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
  }
});
return uniqueValues;
}

// Add the unique values to the Station1 select element. this will allow the user
// to filter lot layer by stations.
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  stationSelect.add(option);
});
return setLotMunicipalOnlyExpression(stationSelect.value);
}

// Set the definition expression on the lot layer to reflect the selecction of the user
// This is activated, only when station is updated in the dropdown list (not priority)
function setLotMunicipalOnlyExpression(newValue) {

if (newValue == 'None') {
compensationLayer.definitionExpression = null;
treeCuttingLayer.definitionExpression = null;
constBoundary.definitionExpression = null;

} else {
compensationLayer.definitionExpression = "Station1 = '" + newValue + "'";
treeCuttingLayer.definitionExpression = "Station1 = '" + newValue + "'";
constBoundary.definitionExpression = "Station1 = '" + newValue + "'";
}

/*
if (!treeCuttingLayer.visible) {
treeCuttingLayer.visible = true;
}
*/
return queryForLotGeometries();
}


function queryForLotGeometries() {
var lotQuery = treeCuttingLayer.createQuery();

return treeCuttingLayer.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});

}

// Statino Dropdown list Event Listener
stationSelect.addEventListener("change", function() {
var selectedStation = event.target.value;
var target = event.target;

var selectedType = document.querySelector('input[name="dataTypeInput"]:checked').id;

// Station: None and Type: Tree Cutting
if (selectedStation === 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedStation);
updateChartCutting();
filterCutStation();

// Station: None and Type: Tree Compensation
} else if (selectedStation === 'None' && selectedType === 'Tree Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedStation);
updateChartTreeComp();
filterCompenStation();

// Station: Others and Type: Tree Cutting
} else if (selectedStation !== 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedStation);
updateChartCutting();
filterCutStation();

// Station: Others and Type: Tree Compensation  
} else if (selectedStation !== 'None' && selectedType === 'Tree Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedStation);
updateChartTreeComp();
filterCompenStation();
}

zoomToLayer(constBoundary);
});

// Filter lot and ISF layers
function filterCutStation() {
var query2 = treeCuttingLayer.createQuery();
query2.where = treeCuttingLayer.definitionExpression; // use filtered stations
}

function filterCompenStation() {
var query2 = compensationLayer.createQuery();
query2.where = compensationLayer.definitionExpression; // use filtered stations
}

///////////
treeTCP_ProcesTypeButton.addEventListener("change", filterByType);
function filterByType(e) {

var selectedStation = stationSelect.value;
const selectedType = e.target.id;

// Station: None and Type: Tree Cutting
if (selectedStation === 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedStation);
updateChartCutting();
filterCutStation();

// Station: None and Type: Tree Compensation
} else if (selectedStation === 'None' && selectedType === 'Tree Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedStation);
updateChartTreeComp();
filterCompenStation();

// Station: Others and Type: Tree Cutting
} else if (selectedStation !== 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedStation);
updateChartCutting();
filterCutStation();

// Station: Others and Type: Tree Compensation  
} else if (selectedStation !== 'None' && selectedType === 'Tree Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedStation);
updateChartTreeComp();
filterCompenStation();
}


}



/////////////////////////////////////////////////////////

async function updateChartCutting() {
function tree_cutting_status(){
return {
1: "For TCP Application",
2: "Submitted to DENR",
3: "With Permit-Not Yet Cut",
4: "With Permit-Not Yet Earthballed",
5: "Cut",
6: "Earthballed",
7: "TCP Expired"
}
}

var total_tcpapp = {
onStatisticField: "CASE WHEN TCP_Proces = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_tcpapp",
statisticType: "sum"
};

var total_denr = {
onStatisticField: "CASE WHEN TCP_Proces = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_denr",
statisticType: "sum"
};

var total_permitcut = {
onStatisticField: "CASE WHEN TCP_Proces = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_permitcut",
statisticType: "sum"
};

var total_permitearthb = {
onStatisticField: "CASE WHEN TCP_Proces = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_permitearthb",
statisticType: "sum"
};

var total_cut = {
onStatisticField: "CASE WHEN TCP_Proces = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cut",
statisticType: "sum"
};

var total_earthb = {
onStatisticField: "CASE WHEN TCP_Proces = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_earthb",
statisticType: "sum"
};

var total_tcpexp = {
onStatisticField: "CASE WHEN TCP_Proces = 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_tcpexp",
statisticType: "sum"
};

var query = treeCuttingLayer.createQuery();
query.outStatistics = [total_tcpapp, total_denr, total_permitcut,
                   total_permitearthb, total_cut, total_earthb, total_tcpexp];
query.returnGeometry = true;

treeCuttingLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const depot_tcpapp = stats.total_tcpapp;
const depot_denr = stats.total_denr;
const depot_permitcut = stats.total_permitcut;
const depot_permitearthb = stats.total_permitearthb;
const depot_cut = stats.total_cut;
const depot_earthb = stats.total_earthb;
const depot_tcpexp = stats.total_tcpexp;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.hiddenState.properties.opacity = 0;

// Add data
chart.data = [
{
  "TCP_Proces": tree_cutting_status()[1],
  "status": depot_tcpapp,
  "color": am4core.color("#71AB48")
},
{
  "TCP_Proces": tree_cutting_status()[2],
  "status": depot_denr,
  "color": am4core.color("#5E4FA2")   
},
{
  "TCP_Proces": tree_cutting_status()[3],
  "status": depot_permitcut,
  "color": am4core.color("#FFFF00") 
},
{
  "TCP_Proces": tree_cutting_status()[4],
  "status": depot_permitearthb,
  "color": am4core.color("#FFAA00")
},
{
 "TCP_Proces": tree_cutting_status()[5],
  "status": depot_cut,
  "color": am4core.color("#0073FF")    
},
{
  "TCP_Proces": tree_cutting_status()[6],
 "status": depot_earthb,
 "color": am4core.color("#3288BD")    
},
{
  "TCP_Proces": tree_cutting_status()[7],
 "status": depot_tcpexp,
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
pieSeries.labels.template.fontSize = 9;
pieSeries.labels.template.fill = "#ffffff";

// Ticks (a straight line)
//pieSeries.ticks.template.disabled = true;
pieSeries.ticks.template.fill = "#ffff00";

// Create a base filter effect (as if it's not there) for the hover to return to
var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
shadow.opacity = 0;

// Chart Title
/*
let title = chart.titles.create();
title.text = "Tree Cutting";
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = am4core.color("#ffffff");
title.marginTop = 7;
*/
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
  if (SELECTED == tree_cutting_status()[1]) {
    selectedStatus = 1;
  } else if (SELECTED == tree_cutting_status()[2]) {
    selectedStatus = 2;
  } else if (SELECTED == tree_cutting_status()[3]) {
    selectedStatus = 3;
  } else if (SELECTED == tree_cutting_status()[4]) {
    selectedStatus = 4;
  } else if (SELECTED == tree_cutting_status()[5]) {
    selectedStatus = 5;
  } else if (SELECTED == tree_cutting_status()[6]) {
    selectedStatus = 6;
  } else if (SELECTED == tree_cutting_status()[7]) {
    selectedStatus = 7;
  } else {
    selectedStatus = null;
  }
  
  view.when(function() {
    view.whenLayerView(treeCuttingLayer).then(function (layerView) {
      chartLayerView = layerView;
      CHART_ELEMENT.style.visibility = "visible";
      
      treeCuttingLayer.queryFeatures().then(function(results) {
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

        treeCuttingLayer.queryExtent(queryExt).then(function(result) {
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
        where: "TCP_Proces = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "TCP_Proces");
}); // End of queryFeatures
} // End of updateChartCutting function


// Tree Compensation
async function updateChartTreeComp() {
function tree_compen_status(){
return {
1: "For Appraisal/OtC",
2: "For Legal Pass",
3: "For Payment Processing",
4: "For Check Issuance",
5: "Paid",
6: "No Compensation",
7: "For Donation"
}
}

var total_appraisal = {
onStatisticField: "CASE WHEN Tree_Compe = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_appraisal",
statisticType: "sum"
};

var total_legalpass = {
onStatisticField: "CASE WHEN Tree_Compe = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_legalpass",
statisticType: "sum"
};

var total_payp = {
onStatisticField: "CASE WHEN Tree_Compe = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_payp",
statisticType: "sum"
};

var total_checkissue = {
onStatisticField: "CASE WHEN Tree_Compe = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_checkissue",
statisticType: "sum"
};

var total_paid = {
onStatisticField: "CASE WHEN Tree_Compe = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_paid",
statisticType: "sum"
};

var total_nocompen = {
onStatisticField: "CASE WHEN Tree_Compe = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nocompen",
statisticType: "sum"
};

var total_donation = {
onStatisticField: "CASE WHEN Tree_Compe = 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_donation",
statisticType: "sum"
};

var query = compensationLayer.createQuery();
query.outStatistics = [total_appraisal, total_legalpass, total_payp,
                   total_checkissue, total_paid, total_nocompen, total_donation];
query.returnGeometry = true;

compensationLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const depot_tcpapp = stats.total_appraisal;
const depot_denr = stats.total_legalpass;
const depot_permitcut = stats.total_payp;
const depot_permitearthb = stats.total_checkissue;
const depot_cut = stats.total_paid;
const depot_earthb = stats.total_nocompen;
const depot_tcpexp = stats.total_donation;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.hiddenState.properties.opacity = 0;

// Add data
chart.data = [
{
  "Tree_Compe": tree_compen_status()[1],
  "status": depot_tcpapp,
  "color": am4core.color("#0073FF")
},
{
  "Tree_Compe": tree_compen_status()[2],
  "status": depot_denr,
  "color": am4core.color("#FFFF00")   
},
{
  "Tree_Compe": tree_compen_status()[3],
  "status": depot_permitcut,
  "color": am4core.color("#3288BD") 
},
{
  "Tree_Compe": tree_compen_status()[4],
  "status": depot_permitearthb,
  "color": am4core.color("#FFAA00")
},
{
 "Tree_Compe": tree_compen_status()[5],
  "status": depot_cut,
  "color": am4core.color("#71AB48")    
},
{
  "Tree_Compe": tree_compen_status()[6],
 "status": depot_earthb,
 "color": am4core.color("#FF0000") 
},
{
  "Tree_Compe": tree_compen_status()[7],
 "status": depot_tcpexp,
 "color": am4core.color("#5E4FA2")    
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
/*
let title = chart.titles.create();
title.text = "Tree Cutting";
title.fontSize = 20;
title.fontWeight = "bold";
title.fill = am4core.color("#ffffff");
title.marginTop = 7;
*/
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
  if (SELECTED == tree_compen_status()[1]) {
    selectedStatus = 1;
  } else if (SELECTED == tree_compen_status()[2]) {
    selectedStatus = 2;
  } else if (SELECTED == tree_compen_status()[3]) {
    selectedStatus = 3;
  } else if (SELECTED == tree_compen_status()[4]) {
    selectedStatus = 4;
  } else if (SELECTED == tree_compen_status()[5]) {
    selectedStatus = 5;
  } else if (SELECTED == tree_compen_status()[6]) {
    selectedStatus = 6;
  } else if (SELECTED == tree_compen_status()[7]) {
    selectedStatus = 7;
  } else {
    selectedStatus = null;
  }
  
  view.when(function() {
    view.whenLayerView(compensationLayer).then(function (layerView) {
      chartLayerView = layerView;
      CHART_ELEMENT.style.visibility = "visible";
      
      compensationLayer.queryFeatures().then(function(results) {
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

        compensationLayer.queryExtent(queryExt).then(function(result) {
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
        where: "Tree_Compe = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "Tree_Compe");
}); // End of queryFeatures
} // End of updateChartTreeComp

am4core.options.autoDispose = true;
}); // End of am4core.ready

//*****************************//
//      PopUp Settig           //
//*****************************//
var highlightSelect;

/////////////////////////////////////////////////////////////////////////////////////
/*
view.when(function () {
    view.popup.autoOpenEnabled = true; //disable popups

    // Create the Editor
    let editor = new Editor({
      view: view
    });

    // Add widget to top-right of the view
    view.ui.add(editor, "bottom-right");
  });
*/

var searchWidget = new Search({
view: view,
locationEnabled: false,
allPlaceholder: "Tree No, Chainage",
includeDefaultSources: false,
sources: [
{
layer: treeCuttingLayer,
searchFields: ["ID"],
displayField: "ID",
exactMatch: false,
outFields: ["*"],
name: "Tree ID.",
placeholder: "Tree ID: DP-T-1"
}
]
});

const searchExpand = new Expand({
view: view,
content: searchWidget,
expandIconClass: "esri-icon-search",
group: "bottom-right"
});
  view.ui.add(searchExpand, {
    position: "bottom-right"
  });
searchExpand.watch("expanded", function() {
if(!searchExpand.expanded) {
searchWidget.searchTerm = null;
}
});

// LayerList and Add legend to the LayerList
  // On-off feature layer tab
    var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage") {
          item.visible = false
        }    
      }
    });

    var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
{
layer: treeCuttingLayer,
title: "Status of Tree Cutting"
},
{
layer: compensationLayer,
title: "Status of Tree Compensation"
},
{
layer: constBoundary,
title: "Construction Boundary"
}
]
});

var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "bottom-right"
});
view.ui.add(legendExpand, {
position: "bottom-right"
});

  var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "bottom-right"
  });
  view.ui.add(layerListExpand, {
      position: "bottom-right"
  });
  // End of LayerList

  view.ui.empty("top-left");

  // Compass
  var compass = new Compass({
    view: view});
    // adds the compass to the top left corner of the MapView
  view.ui.add(compass, "bottom-right");

          // Full screen logo
  view.ui.add(
      new Fullscreen({
          view: view,
          element: viewDiv
      }),
      "bottom-right"
  );

});