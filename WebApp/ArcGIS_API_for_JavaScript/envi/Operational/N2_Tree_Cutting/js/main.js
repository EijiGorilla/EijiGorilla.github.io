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
  var headerTitleDiv = document.getElementById("headerTitleDiv");
  const treeStatusTypeButton = document.getElementById("dataTypeInput");
  var CHART_ELEMENT = document.getElementById("chartPanel");
  var cpSelect = document.getElementById("valSelect");


///// Renderer ////#ffff00

function colorsCut(){
return {
1: [113, 171, 72, 0.8],
2: [0, 115, 255, 0.8],
3: [255, 255, 0, 0.8],
4: [255, 170, 0, 0.8],
5: [255, 0, 0, 0.8]
}
}

function colorsCompen() {
return {
1: [0, 112, 255, 0.8],
2: [255, 255, 0, 0.8],
3: [113, 171, 72, 0.8]
}
}
//const colorsCut = ["#3371AB48", "#330073FF", "#33FFFF00", "#33FFAA00", "#33FF0000"];
//const colorsCompen = ["#33FF0000", "#33FFFF00", "#3371AB48"]; //[1:Non-Compensable, 2:For Processing, 3:Compensated]
const outlineColor = "gray";

let treeCuttingRenderer = {
type: "unique-value",
valueExpression: "When($feature.Status == 1, 'cutearthb', \
                   $feature.Status == 2, 'permit', $feature.Status == 3, 'submit', \
                   $feature.Status == 4, 'ongoing', $feature.Status)",
uniqueValueInfos: [
{
value: "cutearthb",
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
value: "permit",
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
value: "submit",
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
value: "ongoing",
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
}
]
};


let treeCompensationRenderer = {
type: "unique-value",
valueExpression: "When($feature.Compensation == 1, 'nonCompensable', $feature.Compensation == 2, 'payp', \
                   $feature.Compensation == 3, 'compensated', $feature.Compensation)",
uniqueValueInfos: [ //[1:Non-Compensable, 2:For Processing, 3:Compensated]
{
value: "nonCompensable",
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
value: "payp",
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
value: "compensated",
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
}
]
};


// #9e0142|#d53e4f|#f46d43|#fdae61|#fee08b|#e6f598|#abdda4|#66c2a5|#3288bd|#5e4fa2
const colors = ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b",
         "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2",
        "#ffffff", "#44555a"];
function colorsConserve(){
return {
1: [158, 1, 66, 0.8],
2: [213, 62, 79, 0.8],
3: [244, 109, 67, 0.8],
4: [253, 174, 97, 0.8],
5: [254, 224, 139, 0.8],
6: [230, 245, 152, 0.8],
7: [171, 221, 164, 0.8],
8: [102, 194, 165, 0.8],
9: [50, 136, 189, 0.8],
10: [94, 79, 162, 0.8],
11: [255, 255, 255, 0.8],
12: [68, 85, 90, 0.8]
}
}

let treeCoonservationRenderer = {
type: "unique-value",
defaultSymbol: { type: "simple" }, 
valueExpression: "When($feature.Conservation == 1, 'Ex', $feature.Conservation == 2, 'Ew', \
                   $feature.Conservation == 3, 'CR', $feature.Conservation == 4, 'E', \
                   $feature.Conservation == 5, 'VU', $feature.Conservation == 6, 'NT', \
                   $feature.Conservation == 7, 'LC', $feature.Conservation == 8, 'DD', \
                   $feature.Conservation == 9, 'NE', $feature.Conservation == 10, 'OTS', \
                   $feature.Conservation == 11, 'NL', $feature.Conservation == 12, 'EN',$feature.Conservation)",
uniqueValueInfos: [
{
value: "Ex",
type: "simple",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[0], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "Ew",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[1], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "CR",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[2], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "E",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[3], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "VU",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[4], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "NT",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[5], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "LC",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[6], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "DD",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[7], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "NE",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[8], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "OTS",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[9], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "NL",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[10], // the first two letters dictate transparency.
outline: {
  width: 0.5,
  color: outlineColor
}
}
},
{
value: "EN",
type: "simple",
style: "triangle",
symbol: {
type: "simple-marker",
style: "triangle",
size: 5,
color: colors[11], // the first two letters dictate transparency.
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
  field: "StatusLA",
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
  ]
  };

var lotLayer = new FeatureLayer({
  portalItem: {
    id: "dca1d785da0f458b8f87638a76918496",
    portal: {
    url: "https://gis.railway-sector.com/portal"
    }
    },
    layerId: 7,
    renderer: lotRenderer,
    title: "Land",
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
            fieldName: "LandUse",
            label: "Land Use"
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
    },
    minScale: 80000

});
map.add(lotLayer);

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
outFields: ["*"],
popupEnabled: false

});

//chainageLayer.listMode = "hide";
map.add(chainageLayer);


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
definitionExpression: "Extension = 'N2'",
popupEnabled: false
});
map.add(rowLayer);

// Station point feature
var stationLayer = new FeatureLayer({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2
       //definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Tree Cutting
var treeCuttingLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
elevationInfo: {
      mode: "on-the-ground"
    },
outFields: ["CP", "Status"],
title: "Status of Tree Cutting",
renderer: treeCuttingRenderer,
popupTemplate: {
title: "<h5>{Status}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "ScientificName",
      label: "Scientific Name"
    },
    {
      fieldName: "CommonName",
      label: "Common Name"
    },
    {
      fieldName: "Province"
    },
    {
      fieldName: "Municipality"
    },
    {
      fieldName: "TreeNo",
      label: "Tree No."
    },
    {
      fieldName: "CP",
      label: "<h5>CP</h5>"
    },
    {
      fieldName: "Compensation",
      label: "Status of Tree Compensation"
    },
    {
      fieldName: "Conservation",
      label: "Conservation Status"
    },
  ]
}
]
}
});
map.add(treeCuttingLayer);

// Tree Compensation
var compensationLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
outFields: ["*"],
title: "Status of Tree Compensation",
renderer: treeCompensationRenderer,
popupTemplate: {
title: "<h5>{Compensation}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "ScientificName",
      label: "Scientific Name"
    },
    {
      fieldName: "CommonName",
      label: "Common Name"
    },
    {
      fieldName: "Province"
    },
    {
      fieldName: "Municipality"
    },
    {
      fieldName: "TreeNo",
      label: "Tree No."
    },
    {
      fieldName: "CP",
      label: "<h5>CP</h5>"
    },
    {
      fieldName: "Status",
      label: "Status of Tree Cutting"
    },
    {
      fieldName: "Conservation",
      label: "Conservation Status"
    },
  ]
}
]
}
});
map.add(compensationLayer);

// Tree Conservatin
var conservationLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
outFields: ["*"],
title: "Tree Conservation",
renderer: treeCoonservationRenderer,
popupTemplate: {
title: "<h5>{Conservation}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "ScientificName",
      label: "Scientific Name"
    },
    {
      fieldName: "CommonName",
      label: "Common Name"
    },
    {
      fieldName: "Province"
    },
    {
      fieldName: "Municipality"
    },
    {
      fieldName: "TreeNo",
      label: "Tree No."
    },
    {
      fieldName: "CP",
      label: "<h5>CP</h5>"
    },
    {
      fieldName: "Status",
      label: "Status of Tree Cutting"
    },
    {
      fieldName: "Compensation",
      label: "Status of Tree Compensation"
    },
  ]
}
]
}
});
map.add(conservationLayer);

// 
// Point clustering
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


// 
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

// Tree Coonservation
conservationLayer
    .when()
    .then(generateClusterConfig)
    .then((featureReduction) => {
      conservationLayer.featureReduction = featureReduction;

      const toggleButton = document.getElementById("toggle-cluster");
      toggleButton.addEventListener("click", toggleClustering);

      // To turn off clustering on a layer, set the
      // featureReduction property to null
      function toggleClustering() {
        if (isWithinScaleThreshold()) {
          let fr = conservationLayer.featureReduction;
          conservationLayer.featureReduction =
            fr && fr.type === "cluster" ? null : featureReduction;
        }
        toggleButton.innerText =
          toggleButton.innerText === "Enable Clustering"
            ? "Disable Clustering"
            : "Enable Clustering";
      }

      view.watch("scale", (scale) => {
        if (toggleButton.innerText === "Disable Clustering") {
          conservationLayer.featureReduction = isWithinScaleThreshold()
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
conservationLayer.visible = false;
treeCuttingLayer.visible = true;
updateChartCutting();


}

//// Station dropdown List
// Return an array of unique values in the 'Station1' field of lot Layer
// Query all features from lot layer
view.when(function() {
return treeCuttingLayer.when(function() {
  var query = treeCuttingLayer.createQuery();
  return treeCuttingLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

//Return an array of all the values in the 'Station1' field'
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.CP;
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
  cpSelect.add(option);
});
//return setLotMunicipalOnlyExpression(cpSelect.value);
}

// Set the definition expression on the lot layer to reflect the selecction of the user
// This is activated, only when station is updated in the dropdown list (not priority)
function setLotMunicipalOnlyExpression(newValue) {

if (newValue === 'None') {
compensationLayer.definitionExpression = null;
treeCuttingLayer.definitionExpression = null;
conservationLayer.definitionExpression = null;

} else {
compensationLayer.definitionExpression = "CP = '" + newValue + "'";
treeCuttingLayer.definitionExpression = "CP = '" + newValue + "'";
conservationLayer.definitionExpression = "CP = '" + newValue + "'";
}

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

// CP Dropdown list Event Listener
cpSelect.addEventListener("change", function() {
var selectedCP = event.target.value;
var selectedType = document.querySelector('input[name="dataTypeInput"]:checked').id;

// Station: None and Type: Tree Cutting
if (selectedCP === 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCutting();
filterCutStation();
zoomToLayer(treeCuttingLayer);

// Station: None and Type: Tree Compensation
} else if (selectedCP === 'None' && selectedType === 'Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCompensation();
filterCompenStation();
zoomToLayer(compensationLayer);

// Station: None and Type: Tree Conservation
} else if (selectedCP === 'None' && selectedType === 'Conservation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = false;
conservationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedCP);
updateChartConservation();
filterConserveStation();
zoomToLayer(conservationLayer);

// Station: Others and Type: Tree Cutting
} else if (selectedCP !== 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCutting();
filterCutStation();
zoomToLayer(treeCuttingLayer);

// Station: Others and Type: Tree Compensation  
} else if (selectedCP !== 'None' && selectedType === 'Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCompensation();
filterCompenStation();
zoomToLayer(compensationLayer);

// Station: Others and Type: Tree Conservation  
} else if (selectedCP !== 'None' && selectedType === 'Conservation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = false;
conservationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedCP);
updateChartConservation();
filterConserveStation();
zoomToLayer(conservationLayer);
}


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

function filterConserveStation() {
var query2 = conservationLayer.createQuery();
query2.where = conservationLayer.definitionExpression; // use filtered stations
}

///////////
treeStatusTypeButton.addEventListener("change", filterByType);
function filterByType(e) {
const selectedType = e.target.id;
var selectedCP = cpSelect.value;

// Station: None and Type: Tree Cutting
if (selectedCP === 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCutting();
filterCutStation();
zoomToLayer(treeCuttingLayer);

// Station: None and Type: Tree Compensation
} else if (selectedCP === 'None' && selectedType === 'Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCompensation();
filterCompenStation();
zoomToLayer(compensationLayer);

// Station: None and Type: Tree Conservation
} else if (selectedCP === 'None' && selectedType === 'Conservation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = false;
conservationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedCP);
updateChartConservation();
filterConserveStation();
zoomToLayer(conservationLayer);

// Station: Others and Type: Tree Cutting
} else if (selectedCP !== 'None' && selectedType === 'Tree Cutting') {
treeCuttingLayer.visible = true;
compensationLayer.visible = false;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCutting();
filterCutStation();
zoomToLayer(treeCuttingLayer);

// Station: Others and Type: Tree Compensation  
} else if (selectedCP !== 'None' && selectedType === 'Compensation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = true;
conservationLayer.visible = false;
setLotMunicipalOnlyExpression(selectedCP);
updateChartCompensation();
filterCompenStation();
zoomToLayer(compensationLayer);

// Station: Others and Type: Tree Conservation  
} else if (selectedCP !== 'None' && selectedType === 'Conservation') {
treeCuttingLayer.visible = false;
compensationLayer.visible = false;
conservationLayer.visible = true;
setLotMunicipalOnlyExpression(selectedCP);
updateChartConservation();
filterConserveStation();
zoomToLayer(conservationLayer);
}

}

async function updateChartCutting() {
function tree_cutting_status(){
return {
1: "Cut/Earthballed",
2: "Permit Acquired",
3: "Submitted to DENR",
4: "Ongoing Acquisition of Application Documents"
}
}

var total_cutearthb = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cutearthb",
statisticType: "sum"
};

var total_permit = {
onStatisticField: "CASE WHEN Status = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_permit",
statisticType: "sum"
};

var total_denr = {
onStatisticField: "CASE WHEN Status = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_denr",
statisticType: "sum"
};

var total_ongoing = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ongoing",
statisticType: "sum"
};

var query = treeCuttingLayer.createQuery();
query.outStatistics = [total_cutearthb, total_permit, total_denr,
                   total_ongoing];
query.returnGeometry = true;

treeCuttingLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const cutEarthb = stats.total_cutearthb;
const permit = stats.total_permit;
const denr = stats.total_denr;
const ongoing = stats.total_ongoing;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.hiddenState.properties.opacity = 0;

// Add data
chart.data = [
{
  "Status": tree_cutting_status()[1],
  "status": cutEarthb,
  "color": am4core.color("#71AB48")
},
{
  "Status": tree_cutting_status()[2],
  "status": permit,
  "color": am4core.color("#FFFF00")   
},
{
  "Status": tree_cutting_status()[3],
  "status": denr,
  "color": am4core.color("#FFAA00") 
},
{
  "Status": tree_cutting_status()[4],
  "status": ongoing,
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
        where: "Status = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "Status");
}); // End of queryFeatures
} // End of updateChartCutting function


// Tree Compensation
async function updateChartCompensation() {
function tree_compen_status(){
return {
1: "Non-Compensable",
2: "For Processing",
3: "Compensated"
}
}

var total_noncompen = {
onStatisticField: "CASE WHEN Compensation = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_noncompen",
statisticType: "sum"
};

var total_processing = {
onStatisticField: "CASE WHEN Compensation = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_processing",
statisticType: "sum"
};

var total_comp = {
onStatisticField: "CASE WHEN Compensation = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_comp",
statisticType: "sum"
};

var query = compensationLayer.createQuery();
query.outStatistics = [total_noncompen, total_processing, total_comp];
query.returnGeometry = true;

compensationLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const nonComp = stats.total_noncompen;
const processing = stats.total_processing;
const compensated = stats.total_comp;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.hiddenState.properties.opacity = 0;

// Add data
chart.data = [
{
  "Tree_Compe": tree_compen_status()[1],
  "status": nonComp,
  "color": am4core.color("#0070FF")
},
{
  "Tree_Compe": tree_compen_status()[2],
  "status": processing,
  "color": am4core.color("#FFFF00")   
},
{
  "Tree_Compe": tree_compen_status()[3],
  "status": compensated,
  "color": am4core.color("#71AB48") 
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
        where: "Compensation = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "Tree_Compe");
}); // End of queryFeatures
} // End of updateChartTreeComp



async function updateChartConservation() {
function tree_conservation_status(){
return {
1: "Ex",
2: "Ew",
3: "CR",
4: "E",
5: "VU",
6: "NT",
7: "LC",
8: "DD",
9: "NE",
10: "OTS",
11: "NL",
12: "EN"
}
}

var total_ex = {
onStatisticField: "CASE WHEN Conservation = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ex",
statisticType: "sum"
};

var total_ew = {
onStatisticField: "CASE WHEN Conservation = 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ew",
statisticType: "sum"
};

var total_cr = {
onStatisticField: "CASE WHEN Conservation = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cr",
statisticType: "sum"
};

var total_e = {
onStatisticField: "CASE WHEN Conservation = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_e",
statisticType: "sum"
};

var total_vu = {
onStatisticField: "CASE WHEN Conservation = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_vu",
statisticType: "sum"
};

var total_nt = {
onStatisticField: "CASE WHEN Conservation = 6 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nt",
statisticType: "sum"
};

var total_lc = {
onStatisticField: "CASE WHEN Conservation = 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_lc",
statisticType: "sum"
};

var total_dd = {
onStatisticField: "CASE WHEN Conservation = 8 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_dd",
statisticType: "sum"
};

var total_ne = {
onStatisticField: "CASE WHEN Conservation = 9 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ne",
statisticType: "sum"
};

var total_ots = {
onStatisticField: "CASE WHEN Conservation = 10 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_ots",
statisticType: "sum"
};

var total_nl = {
onStatisticField: "CASE WHEN Conservation = 11 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_nl",
statisticType: "sum"
};

var total_en = {
onStatisticField: "CASE WHEN Conservation = 12 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_en",
statisticType: "sum"
};


var query = conservationLayer.createQuery();
query.outStatistics = [total_ex, total_ew, total_cr, total_e, total_vu,
                   total_nt, total_lc, total_dd, total_ne, total_ots,
                   total_nl, total_en];
query.returnGeometry = true;

conservationLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const cons_ex = stats.total_ex;
const cons_ew = stats.total_ew;
const cons_cr = stats.total_cr;
const cons_e = stats.total_e;
const cons_vu = stats.total_vu;
const cons_nt = stats.total_nt;
const cons_lc = stats.total_lc;
const cons_dd = stats.total_dd;
const cons_ne = stats.total_ne;
const cons_ots = stats.total_ots;
const cons_nl = stats.total_nl;
const cons_en = stats.total_en;

var chart = am4core.create("chartdiv", am4charts.PieChart);
chart.hiddenState.properties.opacity = 0;

// Add data

chart.data = [
{
  "Status": tree_conservation_status()[1],
  "status": cons_ex,
  "color": am4core.color(colors[0])
},
{
  "Status": tree_conservation_status()[2],
  "status": cons_ew,
  "color": am4core.color(colors[1])   
},
{
  "Status": tree_conservation_status()[3],
  "status": cons_cr,
  "color": am4core.color(colors[2]) 
},
{
  "Status": tree_conservation_status()[4],
  "status": cons_e,
  "color": am4core.color(colors[3])
},
{
  "Status": tree_conservation_status()[5],
  "status": cons_vu,
  "color": am4core.color(colors[4])
},
{
  "Status": tree_conservation_status()[6],
  "status": cons_nt,
  "color": am4core.color(colors[5])
},
{
  "Status": tree_conservation_status()[7],
  "status": cons_lc,
  "color": am4core.color(colors[6])
},
{
  "Status": tree_conservation_status()[8],
  "status": cons_dd,
  "color": am4core.color(colors[7])
},
{
  "Status": tree_conservation_status()[9],
  "status": cons_ne,
  "color": am4core.color(colors[8])
},
{
  "Status": tree_conservation_status()[10],
  "status": cons_ots,
  "color": am4core.color(colors[9])
},
{
  "Status": tree_conservation_status()[11],
  "status": cons_nl,
  "color": am4core.color(colors[10])
},
{
  "Status": tree_conservation_status()[12],
  "status": cons_en,
  "color": am4core.color(colors[11])
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
  if (SELECTED == tree_conservation_status()[1]) {
    selectedConservation = 1;
  } else if (SELECTED == tree_conservation_status()[2]) {
    selectedConservation = 2;
  } else if (SELECTED == tree_conservation_status()[3]) {
    selectedConservation = 3;
  } else if (SELECTED == tree_conservation_status()[4]) {
    selectedConservation = 4;
  } else if (SELECTED == tree_conservation_status()[5]) {
    selectedConservation = 5;
  } else if (SELECTED == tree_conservation_status()[6]) {
    selectedConservation = 6;
  } else if (SELECTED == tree_conservation_status()[7]) {
    selectedConservation = 7;
  } else if (SELECTED == tree_conservation_status()[8]) {
    selectedConservation = 8;
  } else if (SELECTED == tree_conservation_status()[9]) {
    selectedConservation = 9;
  } else if (SELECTED == tree_conservation_status()[10]) {
    selectedConservation = 10;
  } else if (SELECTED == tree_conservation_status()[11]) {
    selectedConservation = 11;
  } else if (SELECTED == tree_conservation_status()[12]) {
    selectedConservation = 12;
  } else {
    selectedConservation = null;
  }
  
  view.when(function() {
    view.whenLayerView(conservationLayer).then(function (layerView) {
      chartLayerView = layerView;
      CHART_ELEMENT.style.visibility = "visible";
      
      conservationLayer.queryFeatures().then(function(results) {
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

        conservationLayer.queryExtent(queryExt).then(function(result) {
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
        where: "Conservation = " + selectedConservation
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart
} // End of createSlices function

createSlices("status", "Status");
}); // End of queryFeatures
} // End of updateChartConservation function

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
layer: conservationLayer,
title: "Status of Tree Conservation"
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