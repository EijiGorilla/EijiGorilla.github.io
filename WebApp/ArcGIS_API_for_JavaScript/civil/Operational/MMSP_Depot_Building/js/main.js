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
            FeatureTable, Compass, ElevationLayer, Ground, BasemapToggle) {

let chartLayerView;
////////////////////////////////////////////////////


var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "3a62040541b84f528da3ac7b80cf4a63" 
      }
    })
  ]
});

// Add custom DEM to the default elevation layer of esri
const worldElevation = new ElevationLayer({
  url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
  });
  
  const dem = new ElevationLayer({
    portalItem: {
         id: "dd2e85411a504182adb99215aa98ab68",
          portal: {
              url: "https://gis.railway-sector.com/portal"
          }
      }
  });

  var map = new Map({
        basemap: basemap, // "streets-night-vector", basemap, topo-vector
        ground: new Ground({
          layers: [worldElevation, dem]
        })
  });
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.1;
   
  var view = new SceneView({
      map: map,
      container: "viewDiv",
      viewingMode: "local",
      camera: {
          position: {
              x: 121.0322874,
              y: 14.6750462,
              z: 1000
              },
              tilt: 65
              },
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
  var chartTitleDiv = document.getElementById("chartTitleDiv");
  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");
  var applicationDiv = document.getElementById("applicationDiv");
  const utilTypesButton = document.getElementById("dataTypeInput");


//*******************************//
// Label Class Property Settings //
//*******************************//
  // Station labels
  var stationLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "white"
          },
          size: 15,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 40,
        maxWorldLength: 100,
        minWorldLength: 20
      },

    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: 'DefaultValue($feature.Station, "no data")'
    }
  });

  // Excavation SPot Label
  var excaspotlabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "#98E600"
          },
          size: 10,
          halo: {
                size: 0.8,
                color: "black"
              },
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 100,
        maxWorldLength: 200,
        minWorldLength: 30
      },
      callout: {
        type: "line",
        size: 0.5,
        color: [0, 0, 0],
        border: {
          color: [255, 255, 255, 0.7]
        }
      }

    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      value: "Excavation"
    }
  });

//*****************************//
//      Renderer Settings      //
//*****************************// 
// Station Symbol
  function stationsSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle",//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }


// Excavation Spot Symbol
  function excaspotSymbol(name) { // Excavation Spot 
    return {
      type: "web-style",
      name: name,
      styleName: "EsriRealisticTransportationStyle"
    };
  }

// Station Renderer
  var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Name",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };

// Excavatin Spot Renderer
  var excaspotRenderer = {
    type: "unique-value",
    field: "OBJECTID",
    defaultSymbol: excaspotSymbol("Backhoe"),
    visualVariables: [
      {
        type: "size",
        minDateValue: 0,
        maxDataValue: 10,
        minSize: 8,
        maxSize: 8
      }
    ]
  };

// Legend Color for Structure Layer        
  const colors = {
    1: [225, 225, 225, 0.1], // To be Constructed (white)
    2: [130, 130, 130, 0.3], // Under Construction
    3: [255, 0, 0, 0.5], // Delayed
    4: [0, 112, 255, 0.8], // D-Wall
    5: [0, 112, 255, 0.8], // Column
    6: [0, 112, 255, 0.8],
    7: [0, 112, 255, 0.8],
    8: [0, 112, 255, 0.8],
    9: [0, 112, 255, 0.8],
    10: [0, 112, 255, 0.8],
    11: [0, 112, 255, 0.8],
    12: [0, 112, 255, 0.8],
    13: [0, 112, 255, 0.8],
    14: [0, 112, 255, 0.8],
    15: [0, 112, 255, 0.8],
    16: [0, 112, 255, 0.8]           
  };

//*******************************//
// Import Layers                 //
//*******************************//
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
                          color: [215, 215, 158],
                          style: "short-dash"
                      }
                  }
              }

          ]
};

// Construction Boundary
var constBoundary = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
outFields: ["*"],
elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "on-the-ground"
           },
renderer: ConstructionBoundaryFill,
definitionExpression: "MappingBoundary = 1" + " AND " + "Station = 'Depot'",
title: "Construction Boundary",
popupEnabled: false
});
//constBoundary.listMode = "hide";
map.add(constBoundary);

// Station point feature
var stationLayer = new SceneLayer({
    portalItem: {
      id: "6d8d606fee5841ea80fa133adbb028fc",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      },
    },
       labelingInfo: [stationLabelClass],
       renderer: stationsRenderer,
       definitionExpression: "sector = 'MMSP'" + " AND " + "Station = 'Depot'",
       popupEnabled: false,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer);


// Excavation machine
/*
  var excaSpot = new FeatureLayer({
    portalItem: {
      id: "1bc7404021644b3ba6e28b815e4e200a",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    labelingInfo: [excaspotlabelClass],
    renderer: excaspotRenderer,
    screenSizePerspectiveEnabled: false,
    title: "Excavation Spot"
  });
  excaSpot.listMode = "hide";
  view.map.add(excaSpot);
*/

// Structure Layer
  var structureLayer = new SceneLayer({ //structureLayer
    portalItem: {
      id: "1122b4b745cf467b9eaaa8cf7dd1bbf3",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    popupTemplate: {
title: "<h5>{Status}</h5>",
outFields: ["*"],
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Type",
       label: "Type of Structure"
     },
     {
       fieldName: "Name",
       Label: "Building"
     }
   ]
 }
]
},
      elevationInfo: {
          mode: "absolute-height",
          offset: 0
      },
      title: "PRI Building"
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
  });
  map.add(structureLayer, 1);

  function renderStructureLayer() {
    const renderer = new UniqueValueRenderer({
      field: "Status"
    });

    for (let property in colors) {
      if (colors.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: colors[property],
                  colorMixMode: "replace"
                },
                edges: {
                  type: "solid", // autocasts as new SolidEdges3D()
                  color: [225, 225, 225, 0.3]
                  }
              }
            ]
           }
        });
      }
    }

    structureLayer.renderer = renderer;
  }

  renderStructureLayer();

// Radio Button Selection //        
// Selection of 'D-Wall' or 'Station Box' only for visualization (not chart)

//*******************************//
//      Progress Chart           //
//*******************************//

// Total progress //
function totalProgress(){
var total_complete = {
onStatisticField: "CASE WHEN Status >= 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};
var query = structureLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_complete = stats.total_complete;
const total_obs = stats.total_obs;
document.getElementById("totalProgress").innerHTML = ((total_complete/total_obs)*100).toFixed(1) + " %";
});
}
totalProgress();


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


const dropdownValue = document.getElementById("valSelect");

// Create Bar chart to show progress of station structure
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

const chartTitleLabel = "Construction Progress";

// Default selection = 'None'
chartTitleDiv.innerHTML = chartTitleLabel + "<p>" + "Overall" + "</p>";
structureLayer.definitionExpression = null;
zoomToLayer(structureLayer);
updateChart();


///////////////////////////////////////////////////////////////

// Query Geometry
// 2. Get values and return to the list
function getValues() {
  var testArray = [];
  var query = structureLayer.createQuery();
  query.outFields = ["Building_Names"];
  structureLayer.returnGeometry = true;
  return structureLayer.queryFeatures(query).then(function(response) {
    var stats = response.features;
    stats.forEach((result, index) => {
      var attributes = result.attributes;
      const values = attributes.Building_Names;
      testArray.push(values);
    });
    return testArray;
  });
}


// 3. Return an array of unique values
function getUniqueValues(values) {
  var uniqueValues = [];

  values.forEach(function(item, i) {
    if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
    } 
  });
  return uniqueValues;
}

// 4. Add depot building names to the list as element
function addToSelect(values) {
  dropdownValue.options.length = 0;
    values.sort();
    values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
    values.forEach(function(value) {
        var option = document.createElement("option");
        option.text = value;
        dropdownValue.add(option);
    });
}

getValues()
  .then(getUniqueValues)
  .then(addToSelect)

dropdownValue.addEventListener("click", filterByTest);
function filterByTest(event) {
const selectedID = event.target.value;

if (selectedID === "None") {
  structureLayer.definitionExpression = null;
  chartTitleDiv.innerHTML = chartTitleLabel + "<p>" + "All Buildings" + "</p>";
  zoomToLayer(structureLayer);
  totalProgress();
  updateChart();
} else {
  structureLayer.definitionExpression = "Building_Names = '" + selectedID + "'";
  chartTitleDiv.innerHTML = chartTitleLabel + "<p>" + selectedID + "</p>";
  zoomToLayer(structureLayer);
  totalProgress();
  updateChart();
}



} // End of filterByTest




//////////////////////////////////////////////////////////////////////////
// Beam 
function updateChart() {
var total_beam_tobeC = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_beam_tobeC",
statisticType: "sum"
};
var total_beam_underC = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_beam_underC",
statisticType: "sum"
};
var total_beam_done = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_beam_done",
statisticType: "sum"
};   
var total_beam_delayed = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_beam_delayed",
statisticType: "sum"
};


// Column
var total_column_tobeC = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_column_tobeC",
statisticType: "sum"
};

var total_column_underC = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_column_underC",
statisticType: "sum"
};
var total_column_done = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_column_done",
statisticType: "sum"
};   
var total_column_delayed = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_column_delayed",
statisticType: "sum"
};

// Footing
var total_footing_tobeC = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_footing_tobeC",
statisticType: "sum"
};
var total_footing_underC = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_footing_underC",
statisticType: "sum"
};
var total_footing_done = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_footing_done",
statisticType: "sum"
};   
var total_footing_delayed = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_footing_delayed",
statisticType: "sum"
};

// Girder
var total_girder_tobeC = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_girder_tobeC",
statisticType: "sum"
};
var total_girder_underC = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_girder_underC",
statisticType: "sum"
};
var total_girder_done = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_girder_done",
statisticType: "sum"
};   
var total_girder_delayed = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_girder_delayed",
statisticType: "sum"
};

// Mechanical Equipment Foundation (mef)
var total_mef_tobeC = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_mef_tobeC",
statisticType: "sum"
};
var total_mef_underC = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_mef_underC",
statisticType: "sum"
};
var total_mef_done = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_mef_done",
statisticType: "sum"
};   
var total_mef_delayed = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_mef_delayed",
statisticType: "sum"
};

// Mechanical and Electrical Space (mes)
var total_mes_tobeC = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_mes_tobeC",
statisticType: "sum"
};
var total_mes_underC = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_mes_underC",
statisticType: "sum"
};
var total_mes_done = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_mes_done",
statisticType: "sum"
};   
var total_mes_delayed = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_mes_delayed",
statisticType: "sum"
};

// parapet
var total_parapet_tobeC = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_parapet_tobeC",
statisticType: "sum"
};
var total_parapet_underC = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_parapet_underC",
statisticType: "sum"
};
var total_parapet_done = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_parapet_done",
statisticType: "sum"
};   
var total_parapet_delayed = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_parapet_delayed",
statisticType: "sum"
};

// Roof Deck Slabe (roofdeck)
var total_roofdeck_tobeC = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_roofdeck_tobeC",
statisticType: "sum"
};
var total_roofdeck_underC = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_roofdeck_underC",
statisticType: "sum"
};
var total_roofdeck_done = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_roofdeck_done",
statisticType: "sum"
};   
var total_roofdeck_delayed = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_roofdeck_delayed",
statisticType: "sum"
};

// Rooftop Stair Enclsore (rooftop)
var total_rooftop_tobeC = {
onStatisticField: "CASE WHEN (Type = 9 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_rooftop_tobeC",
statisticType: "sum"
};
var total_rooftop_underC = {
onStatisticField: "CASE WHEN (Type = 9 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_rooftop_underC",
statisticType: "sum"
};
var total_rooftop_done = {
onStatisticField: "CASE WHEN (Type = 9 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_rooftop_done",
statisticType: "sum"
};   
var total_rooftop_delayed = {
onStatisticField: "CASE WHEN (Type = 9 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_rooftop_delayed",
statisticType: "sum"
};

// Skylight
var total_sky_tobeC = {
onStatisticField: "CASE WHEN (Type = 10 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_sky_tobeC",
statisticType: "sum"
};
var total_sky_underC = {
onStatisticField: "CASE WHEN (Type = 10 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_sky_underC",
statisticType: "sum"
};
var total_sky_done = {
onStatisticField: "CASE WHEN (Type = 10 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_sky_done",
statisticType: "sum"
};   
var total_sky_delayed = {
onStatisticField: "CASE WHEN (Type = 10 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_sky_delayed",
statisticType: "sum"
};

// Slab
var total_slab_tobeC = {
onStatisticField: "CASE WHEN (Type = 11 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_slab_tobeC",
statisticType: "sum"
};
var total_slab_underC = {
onStatisticField: "CASE WHEN (Type = 11 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_slab_underC",
statisticType: "sum"
};
var total_slab_done = {
onStatisticField: "CASE WHEN (Type = 11 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_slab_done",
statisticType: "sum"
};   
var total_slab_delayed = {
onStatisticField: "CASE WHEN (Type = 11 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_slab_delayed",
statisticType: "sum"
};

// Tie Beam
var total_tiebeam_tobeC = {
onStatisticField: "CASE WHEN (Type = 12 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_tiebeam_tobeC",
statisticType: "sum"
};
var total_tiebeam_underC = {
onStatisticField: "CASE WHEN (Type = 12 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_tiebeam_underC",
statisticType: "sum"
};
var total_tiebeam_done = {
onStatisticField: "CASE WHEN (Type = 12 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_tiebeam_done",
statisticType: "sum"
};   
var total_tiebeam_delayed = {
onStatisticField: "CASE WHEN (Type = 12 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_tiebeam_delayed",
statisticType: "sum"
};

// Wall Footing
var total_wallfoot_tobeC = {
onStatisticField: "CASE WHEN (Type = 13 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_wallfoot_tobeC",
statisticType: "sum"
};
var total_wallfoot_underC = {
onStatisticField: "CASE WHEN (Type = 13 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_wallfoot_underC",
statisticType: "sum"
};
var total_wallfoot_done = {
onStatisticField: "CASE WHEN (Type = 13 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_wallfoot_done",
statisticType: "sum"
};   
var total_wallfoot_delayed = {
onStatisticField: "CASE WHEN (Type = 13 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_wallfoot_delayed",
statisticType: "sum"
};

// Vertical Brace
var total_verticalbrace_tobeC = {
onStatisticField: "CASE WHEN (Type = 14 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_verticalbrace_tobeC",
statisticType: "sum"
};
var total_verticalbrace_underC = {
onStatisticField: "CASE WHEN (Type = 14 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_verticalbrace_underC",
statisticType: "sum"
};
var total_verticalbrace_done = {
onStatisticField: "CASE WHEN (Type = 14 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_verticalbrace_done",
statisticType: "sum"
};   
var total_verticalbrace_delayed = {
onStatisticField: "CASE WHEN (Type = 14 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_verticalbrace_delayed",
statisticType: "sum"
};

// Side Wall Girts
var total_sidewallgirt_tobeC = {
onStatisticField: "CASE WHEN (Type = 15 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sidewallgirt_tobeC",
statisticType: "sum"
};
var total_sidewallgirt_underC = {
onStatisticField: "CASE WHEN (Type = 15 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_sidewallgirt_underC",
statisticType: "sum"
};
var total_sidewallgirt_done = {
onStatisticField: "CASE WHEN (Type = 15 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sidewallgirt_done",
statisticType: "sum"
};   
var total_sidewallgirt_delayed = {
onStatisticField: "CASE WHEN (Type = 15 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sidewallgirt_delayed",
statisticType: "sum"
};

// Purlin
var total_purlin_tobeC = {
onStatisticField: "CASE WHEN (Type = 16 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_purlin_tobeC",
statisticType: "sum"
};
var total_purlin_underC = {
onStatisticField: "CASE WHEN (Type = 16 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_purlin_underC",
statisticType: "sum"
};
var total_purlin_done = {
onStatisticField: "CASE WHEN (Type = 16 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_purlin_done",
statisticType: "sum"
};   
var total_purlin_delayed = {
onStatisticField: "CASE WHEN (Type = 16 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_purlin_delayed",
statisticType: "sum"
};

// Girt
var total_girt_tobeC = {
onStatisticField: "CASE WHEN (Type = 17 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_girt_tobeC",
statisticType: "sum"
};
var total_girt_underC = {
onStatisticField: "CASE WHEN (Type = 17 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_girt_underC",
statisticType: "sum"
};
var total_girt_done = {
onStatisticField: "CASE WHEN (Type = 17 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_girt_done",
statisticType: "sum"
};   
var total_girt_delayed = {
onStatisticField: "CASE WHEN (Type = 17 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_girt_delayed",
statisticType: "sum"
};

// Foundation
var total_found_tobeC = {
onStatisticField: "CASE WHEN (Type = 18 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_found_tobeC",
statisticType: "sum"
};
var total_found_underC = {
onStatisticField: "CASE WHEN (Type = 18 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_found_underC",
statisticType: "sum"
};
var total_found_done = {
onStatisticField: "CASE WHEN (Type = 18 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_found_done",
statisticType: "sum"
};   
var total_found_delayed = {
onStatisticField: "CASE WHEN (Type = 18 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_found_delayed",
statisticType: "sum"
};

//Rail
var total_rail_tobeC = {
onStatisticField: "CASE WHEN (Type = 19 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rail_tobeC",
statisticType: "sum"
};
var total_rail_underC = {
onStatisticField: "CASE WHEN (Type = 19 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_rail_underC",
statisticType: "sum"
};
var total_rail_done = {
onStatisticField: "CASE WHEN (Type = 19 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rail_done",
statisticType: "sum"
};   
var total_rail_delayed = {
onStatisticField: "CASE WHEN (Type = 19 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rail_delayed",
statisticType: "sum"
};

// Sleepers
var total_sleepers_tobeC = {
onStatisticField: "CASE WHEN (Type = 20 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sleepers_tobeC",
statisticType: "sum"
};
var total_sleepers_underC = {
onStatisticField: "CASE WHEN (Type = 20 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_sleepers_underC",
statisticType: "sum"
};
var total_sleepers_done = {
onStatisticField: "CASE WHEN (Type = 20 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sleepers_done",
statisticType: "sum"
};   
var total_sleepers_delayed = {
onStatisticField: "CASE WHEN (Type = 20 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_sleepers_delayed",
statisticType: "sum"
};

// Rafter
var total_rafter_tobeC = {
onStatisticField: "CASE WHEN (Type = 21 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rafter_tobeC",
statisticType: "sum"
};
var total_rafter_underC = {
onStatisticField: "CASE WHEN (Type = 21 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_rafter_underC",
statisticType: "sum"
};
var total_rafter_done = {
onStatisticField: "CASE WHEN (Type = 21 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rafter_done",
statisticType: "sum"
};   
var total_rafter_delayed = {
onStatisticField: "CASE WHEN (Type = 21 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rafter_delayed",
statisticType: "sum"
};

// Tension Brace
var total_tensionbrace_tobeC = {
onStatisticField: "CASE WHEN (Type = 22 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_tensionbrace_tobeC",
statisticType: "sum"
};
var total_tensionbrace_underC = {
onStatisticField: "CASE WHEN (Type = 22 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_tensionbrace_underC",
statisticType: "sum"
};
var total_tensionbrace_done = {
onStatisticField: "CASE WHEN (Type = 22 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_tensionbrace_done",
statisticType: "sum"
};   
var total_tensionbrace_delayed = {
onStatisticField: "CASE WHEN (Type = 22 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_tensionbrace_delayed",
statisticType: "sum"
};

  // Rubble concrete
var total_rubblec_tobeC = {
onStatisticField: "CASE WHEN (Type = 23 and Status = 1) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rubblec_tobeC",
statisticType: "sum"
};
var total_rubblec_underC = {
onStatisticField: "CASE WHEN (Type = 23 and Status = 2) THEN 1 ELSE 0 END",  
outStatisticFieldName: "total_rubblec_underC",
statisticType: "sum"
};
var total_rubblec_done = {
onStatisticField: "CASE WHEN (Type = 23 and Status = 4) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rubblec_done",
statisticType: "sum"
};   
var total_rubblec_delayed = {
onStatisticField: "CASE WHEN (Type = 23 and Status = 3) THEN 1 ELSE 0 END", 
outStatisticFieldName: "total_rubblec_delayed",
statisticType: "sum"
};

var query = structureLayer.createQuery();
query.outStatistics = [total_beam_tobeC, total_beam_underC, total_beam_done, total_beam_delayed,
                 total_column_tobeC, total_column_underC, total_column_done, total_column_delayed,
                 total_footing_tobeC, total_footing_underC, total_footing_done, total_footing_delayed,
                 total_girder_tobeC, total_girder_underC, total_girder_done, total_girder_delayed,
                 total_mef_tobeC, total_mef_underC, total_mef_done, total_mef_delayed,
                 total_mes_tobeC, total_mes_underC, total_mes_done, total_mes_delayed,
                 total_parapet_tobeC, total_parapet_underC, total_parapet_done, total_parapet_delayed,
                 total_roofdeck_tobeC, total_roofdeck_underC, total_roofdeck_done, total_roofdeck_delayed,
                 total_rooftop_tobeC, total_rooftop_underC, total_rooftop_done, total_rooftop_delayed,
                 total_sky_tobeC, total_sky_underC, total_sky_done, total_sky_delayed,
                 total_slab_tobeC, total_slab_underC, total_slab_done, total_slab_delayed,
                 total_tiebeam_tobeC, total_tiebeam_underC, total_tiebeam_done, total_tiebeam_delayed,
                 total_wallfoot_tobeC, total_wallfoot_underC, total_wallfoot_done, total_wallfoot_delayed,
                 total_verticalbrace_tobeC, total_verticalbrace_underC, total_verticalbrace_done, total_verticalbrace_delayed,
                 total_sidewallgirt_tobeC, total_sidewallgirt_underC, total_sidewallgirt_done, total_sidewallgirt_delayed,
                 total_purlin_tobeC, total_purlin_underC, total_purlin_done, total_purlin_delayed,
                 total_girt_tobeC, total_girt_underC, total_girt_done, total_girt_delayed,
                 total_found_tobeC, total_found_underC, total_found_done, total_found_delayed,
                 total_rail_tobeC, total_rail_underC, total_rail_done, total_rail_delayed,
                 total_sleepers_tobeC, total_sleepers_underC, total_sleepers_done, total_sleepers_delayed,
                 total_rafter_tobeC, total_rafter_underC, total_rafter_done, total_rafter_delayed,
                 total_tensionbrace_tobeC, total_tensionbrace_underC, total_tensionbrace_done, total_tensionbrace_delayed,
                 total_rubblec_tobeC, total_rubblec_underC, total_rubblec_done, total_rubblec_delayed];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

// Beam
const beam_tobeC = stats.total_beam_tobeC;
const beam_underC = stats.total_beam_underC;
const beam_done = stats.total_beam_done;
const beam_delayed = stats.total_beam_delayed;

// Column
const column_tobeC = stats.total_column_tobeC;
const column_underC = stats.total_column_underC;
const column_done = stats.total_column_done;
const column_delayed = stats.total_column_delayed;

// footing
const footing_tobeC = stats.total_footing_tobeC;
const footing_underC = stats.total_footing_underC;
const footing_done = stats.total_footing_done;
const footing_delayed = stats.total_footing_delayed;

// Girder
const girder_tobeC = stats.total_girder_tobeC;
const girder_underC = stats.total_girder_underC;
const girder_done = stats.total_girder_done;
const girder_delayed = stats.total_girder_delayed;

// Mechanical Equipment Foundation
const mef_tobeC = stats.total_mef_tobeC;
const mef_underC = stats.total_mef_underC;
const mef_done = stats.total_mef_done;
const mef_delayed = stats.total_mef_delayed;

// Mechanical and Electrical Space
const mes_tobeC = stats.total_mes_tobeC;
const mes_underC = stats.total_mes_underC;
const mes_done = stats.total_mes_done;
const mes_delayed = stats.total_mes_delayed;

// Parapet
const parapet_tobeC = stats.total_parapet_tobeC;
const parapet_underC = stats.total_parapet_underC;
const parapet_done = stats.total_parapet_done;
const parapet_delayed = stats.total_parapet_delayed;

// Roof Deck Slab
const roofdeck_tobeC = stats.total_roofdeck_tobeC;
const roofdeck_underC = stats.total_roofdeck_underC;
const roofdeck_done = stats.total_roofdeck_done;
const roofdeck_delayed = stats.total_roofdeck_delayed;

// Rooftop Stair Enclosure
const rooftop_tobeC = stats.total_rooftop_tobeC;
const rooftop_underC = stats.total_rooftop_underC;
const rooftop_done = stats.total_rooftop_done;
const rooftop_delayed = stats.total_rooftop_delayed;

// Skylight
const sky_tobeC = stats.total_sky_tobeC;
const sky_underC = stats.total_sky_underC;
const sky_done = stats.total_sky_done;
const sky_delayed = stats.total_sky_delayed;

// Slab
const slab_tobeC = stats.total_slab_tobeC;
const slab_underC = stats.total_slab_underC;
const slab_done = stats.total_slab_done;
const slab_delayed = stats.total_slab_delayed;

// Tie Beam
const tiebeam_tobeC = stats.total_tiebeam_tobeC;
const tiebeam_underC = stats.total_tiebeam_underC;
const tiebeam_done = stats.total_tiebeam_done;
const tiebeam_delayed = stats.total_tiebeam_delayed;

// Wall Footing
const wallfoot_tobeC = stats.total_wallfoot_tobeC;
const wallfoot_underC = stats.total_wallfoot_underC;
const wallfoot_done = stats.total_wallfoot_done;
const wallfoot_delayed = stats.total_wallfoot_delayed;

// verticalbrace
const verticalbrace_tobeC = stats.total_verticalbrace_tobeC;
const verticalbrace_underC = stats.total_verticalbrace_underC;
const verticalbrace_done = stats.total_verticalbrace_done;
const verticalbrace_delayed = stats.total_verticalbrace_delayed;

// Side Wall Girt
const sidewallgirt_tobeC = stats.total_sidewallgirt_tobeC;
const sidewallgirt_underC = stats.total_sidewallgirt_underC;
const sidewallgirt_done = stats.total_sidewallgirt_done;
const sidewallgirt_delayed = stats.total_sidewallgirt_delayed;

// Purlin
const purlin_tobeC = stats.total_purlin_tobeC;
const purlin_underC = stats.total_purlin_underC;
const purlin_done = stats.total_purlin_done;
const purlin_delayed = stats.total_purlin_delayed;

// Girt
const girt_tobeC = stats.total_girt_tobeC;
const girt_underC = stats.total_girt_underC;
const girt_done = stats.total_girt_done;
const girt_delayed = stats.total_girt_delayed;

// Foundation
const found_tobeC = stats.total_found_tobeC;
const found_underC = stats.total_found_underC;
const found_done = stats.total_found_done;
const found_delayed = stats.total_found_delayed;

// Rail
const rail_tobeC = stats.total_rail_tobeC;
const rail_underC = stats.total_rail_underC;
const rail_done = stats.total_rail_done;
const rail_delayed = stats.total_rail_delayed;

// Sleepers
const sleepers_tobeC = stats.total_sleepers_tobeC;
const sleepers_underC = stats.total_sleepers_underC;
const sleepers_done = stats.total_sleepers_done;
const sleepers_delayed = stats.total_sleepers_delayed;

// Rafter
const rafter_tobeC = stats.total_rafter_tobeC;
const rafter_underC = stats.total_rafter_underC;
const rafter_done = stats.total_rafter_done;
const rafter_delayed = stats.total_rafter_delayed;

// Tension Brace
const tensionbrace_tobeC = stats.total_tensionbrace_tobeC;
const tensionbrace_underC = stats.total_tensionbrace_underC;
const tensionbrace_done = stats.total_tensionbrace_done;
const tensionbrace_delayed = stats.total_tensionbrace_delayed;

  // Rubble Concrete
  const rubblec_tobeC = stats.total_rubblec_tobeC;
const rubblec_underC = stats.total_rubblec_underC;
const rubblec_done = stats.total_rubblec_done;
const rubblec_delayed = stats.total_rubblec_delayed;


// Chart //
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data = [
{
category: "Rubble Concrete",
value1: rubblec_done,
value2: rubblec_underC,
value3: rubblec_tobeC,
value4: rubblec_delayed
},
{
category: "Tension Brace",
value1: tensionbrace_done,
value2: tensionbrace_underC,
value3: tensionbrace_tobeC,
value4: tensionbrace_delayed
},
{
category: "Rafter",
value1: rafter_done,
value2: rafter_underC,
value3: rafter_tobeC,
value4: rafter_delayed
},
{
category: "Sleepers",
value1: sleepers_done,
value2: sleepers_underC,
value3: sleepers_tobeC,
value4: sleepers_delayed
},
{
category: "Rail",
value1: rail_done,
value2: rail_underC,
value3: rail_tobeC,
value4: rail_delayed
},
{
category: "Foundation",
value1: found_done,
value2: found_underC,
value3: found_tobeC,
value4: found_delayed
},
{
category: "Girt",
value1: girt_done,
value2: girt_underC,
value3: girt_tobeC,
value4: girt_delayed
},
{
category: "Purlin",
value1: purlin_done,
value2: purlin_underC,
value3: purlin_tobeC,
value4: purlin_delayed
},
{
category: "Side Wall Girt",
value1: sidewallgirt_done,
value2: sidewallgirt_underC,
value3: sidewallgirt_tobeC,
value4: sidewallgirt_delayed
},
{
category: "Vertical Brace",
value1: verticalbrace_done,
value2: verticalbrace_underC,
value3: verticalbrace_tobeC,
value4: verticalbrace_delayed
},
{
category: "Wall Footing",
value1: wallfoot_done,
value2: wallfoot_underC,
value3: wallfoot_tobeC,
value4: wallfoot_delayed
},
{
category: "Tie Beam",
value1: tiebeam_done,
value2: tiebeam_underC,
value3: tiebeam_tobeC,
value4: tiebeam_delayed
},
{
category: "Slab",
value1: slab_done,
value2: slab_underC,
value3: slab_tobeC,
value4: slab_delayed
},
{
category: "Skylight",
value1: sky_done,
value2: sky_underC,
value3: sky_tobeC,
value4: sky_delayed
},
{
category: "Rooftop Stair Enclosure",
value1: rooftop_done,
value2: rooftop_underC,
value3: rooftop_tobeC,
value4: rooftop_delayed
},
{
category: "Roof Deck Slab",
value1: roofdeck_done,
value2: roofdeck_underC,
value3: roofdeck_tobeC,
value4: roofdeck_delayed
},
{
category: "Parapet",
value1: parapet_done,
value2: parapet_underC,
value3: parapet_tobeC,
value4: parapet_delayed
},
{
category: "Mecha & Electirc Space",
value1: mef_done,
value2: mef_underC,
value3: mef_tobeC,
value4: mef_delayed
},
{
category: "Mecha Equip Foundation",
value1: mef_done,
value2: mef_underC,
value3: mef_tobeC,
value4: mef_delayed
},
{
category: "Girder",
value1: girder_done,
value2: girder_underC,
value3: girder_tobeC,
value4: girder_delayed
},
{
category: "Footing",
value1: footing_done,
value2: footing_underC,
value3: footing_tobeC,
value4: footing_delayed
},
{
category: "Column",
value1: column_done,
value2: column_underC,
value3: column_tobeC,
value4: column_delayed
},
{
category: "Beam",
value1: beam_done,
value2: beam_underC,
value3: beam_tobeC,
value4: beam_delayed
}
]; // End of chart

chart.colors.step = 2;
chart.padding(10, 10, 10, 10);

// Legend
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;

var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 16;
markerTemplate.height = 16;

// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 13;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label

// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 13;
valueAxis.renderer.labels.template.fill = "#ffffff";

//


function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;

// Bar chart line color and width
series.columns.template.stroke = am4core.color("#ffffff");
series.columns.template.strokeWidth = 0.5;
series.name = name;

var labelBullet = series.bullets.push(new am4charts.LabelBullet());

if (name == "To be Constructed"){
series.fill = am4core.color("#000000");

labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
//labelBullet.label.fill = am4core.color("#00FFFFFF");
labelBullet.label.fill = am4core.color("#000000");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 12;
labelBullet.locationX = 0.5;

} else if (name == "Under Construction"){
series.fill = am4core.color("#c2c2c2");
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 12;
labelBullet.locationX = 0.5;

} else if (name == "Completed"){
series.fill = am4core.color("#0070ff");
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 12;
labelBullet.locationX = 0.5;

} else {
series.fill = am4core.color("#ff0000"); // delayed
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 12;
labelBullet.locationX = 0.5;

}
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:12px]{name}: {valueX.value.formatNumber('#.')}"
//labelBullet.label.text = "{valueX.value.formatNumber('#.')}";

// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");

series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;

// Beam
if (selectedP == "Beam" && selectedC == "To be Constructed") {
selectedLayer = 1;
selectedStatus = 1;
} else if (selectedP == "Beam" && selectedC == "Under Construction") {
selectedLayer = 1;
selectedStatus = 2;
} else if (selectedP == "Beam" && selectedC == "Delayed") {
selectedLayer = 1;
selectedStatus = 3;
} else if (selectedP == "Beam" && selectedC == "Completed") {
selectedLayer = 1;
selectedStatus = 4;

// Column
} else if (selectedP == "Column" && selectedC == "To be Constructed") {
selectedLayer = 2;
selectedStatus = 1;
} else if (selectedP == "Column" && selectedC == "Under Construction") {
selectedLayer = 2;
selectedStatus = 2;
} else if (selectedP == "Column" && selectedC == "Delayed") {
selectedLayer = 2;
selectedStatus = 3;
} else if (selectedP == "Column" && selectedC == "Completed") {
selectedLayer = 2;
selectedStatus = 4;

// Footing
} else if (selectedP == "Footing" && selectedC == "To be Constructed") {
selectedLayer = 3;
selectedStatus = 1;
} else if (selectedP == "Footing" && selectedC == "Under Construction") {
selectedLayer = 3;
selectedStatus = 2;
} else if (selectedP == "Footing" && selectedC == "Delayed") {
selectedLayer = 3;
selectedStatus = 3;
} else if (selectedP == "Footing" && selectedC == "Completed") {
selectedLayer = 3;
selectedStatus = 4;

// Girder
} else if (selectedP == "Girder" && selectedC == "To be Constructed") {
selectedLayer = 4;
selectedStatus = 1;
} else if (selectedP == "Girder" && selectedC == "Under Construction") {
selectedLayer = 4;
selectedStatus = 2;
} else if (selectedP == "Girder" && selectedC == "Delayed") {
selectedLayer = 4;
selectedStatus = 3;
} else if (selectedP == "Girder" && selectedC == "Completed") {
selectedLayer = 4;
selectedStatus = 4;

// Mecha Equip Foundation
} else if (selectedP == "Mecha Equip Foundation" && selectedC == "To be Constructed") {
selectedLayer = 5;
selectedStatus = 1;
} else if (selectedP == "Mecha Equip Foundation" && selectedC == "Under Construction") {
selectedLayer = 5;
selectedStatus = 2;
} else if (selectedP == "Mecha Equip Foundation" && selectedC == "Delayed") {
selectedLayer = 5;
selectedStatus = 3;
} else if (selectedP == "Mecha Equip Foundation" && selectedC == "Completed") {
selectedLayer = 5;
selectedStatus = 4;

// Mecha & Electirc Space
} else if (selectedP == "Mecha & Electirc Space" && selectedC == "To be Constructed") {
selectedLayer = 6;
selectedStatus = 1;
} else if (selectedP == "Mecha & Electirc Space" && selectedC == "Under Construction") {
selectedLayer = 6;
selectedStatus = 2;
} else if (selectedP == "Mecha & Electirc Space" && selectedC == "Delayed") {
selectedLayer = 6;
selectedStatus = 3;
} else if (selectedP == "Mecha & Electirc Space" && selectedC == "Completed") {
selectedLayer = 6;
selectedStatus = 4;

    // parapet
} else if (selectedP == "Parapet" && selectedC == "To be Constructed") {
selectedLayer = 7;
selectedStatus = 1;
} else if (selectedP == "Parapet" && selectedC == "Under Construction") {
selectedLayer = 7;
selectedStatus = 2;
} else if (selectedP == "Parapet" && selectedC == "Delayed") {
selectedLayer = 7;
selectedStatus = 3;
} else if (selectedP == "Parapet" && selectedC == "Completed") {
selectedLayer = 7;
selectedStatus = 4;

    // roofdeck
} else if (selectedP == "Roof Deck Slab" && selectedC == "To be Constructed") {
selectedLayer = 8;
selectedStatus = 1;
} else if (selectedP == "Roof Deck Slab" && selectedC == "Under Construction") {
selectedLayer = 8;
selectedStatus = 2;
} else if (selectedP == "Roof Deck Slab" && selectedC == "Delayed") {
selectedLayer = 8;
selectedStatus = 3;
} else if (selectedP == "Roof Deck Slab" && selectedC == "Completed") {
selectedLayer = 8;
selectedStatus = 4;

    // rooftop
} else if (selectedP == "Rooftop Stair Enclosure" && selectedC == "To be Constructed") {
selectedLayer = 9;
selectedStatus = 1;
} else if (selectedP == "Rooftop Stair Enclosure" && selectedC == "Under Construction") {
selectedLayer = 9;
selectedStatus = 2;
} else if (selectedP == "Rooftop Stair Enclosure" && selectedC == "Delayed") {
selectedLayer = 9;
selectedStatus = 3;
} else if (selectedP == "Rooftop Stair Enclosure" && selectedC == "Completed") {
selectedLayer = 9;
selectedStatus = 4;

    // Skylight
} else if (selectedP == "Skylight" && selectedC == "To be Constructed") {
selectedLayer = 10;
selectedStatus = 1;
} else if (selectedP == "Skylight" && selectedC == "Under Construction") {
selectedLayer = 10;
selectedStatus = 2;
} else if (selectedP == "Skylight" && selectedC == "Delayed") {
selectedLayer = 10;
selectedStatus = 3;
} else if (selectedP == "Skylight" && selectedC == "Completed") {
selectedLayer = 10;
selectedStatus = 4;

    // Slab
} else if (selectedP == "Slab" && selectedC == "To be Constructed") {
selectedLayer = 11;
selectedStatus = 1;
} else if (selectedP == "Slab" && selectedC == "Under Construction") {
selectedLayer = 11;
selectedStatus = 2;
} else if (selectedP == "Slab" && selectedC == "Delayed") {
selectedLayer = 11;
selectedStatus = 3;
} else if (selectedP == "Slab" && selectedC == "Completed") {
selectedLayer = 11;
selectedStatus = 4;

    // Tie Beam
} else if (selectedP == "Tie Beam" && selectedC == "To be Constructed") {
selectedLayer = 12;
selectedStatus = 1;
} else if (selectedP == "Tie Beam" && selectedC == "Under Construction") {
selectedLayer = 12;
selectedStatus = 2;
} else if (selectedP == "Tie Beam" && selectedC == "Delayed") {
selectedLayer = 12;
selectedStatus = 3;
} else if (selectedP == "Tie Beam" && selectedC == "Completed") {
selectedLayer = 12;
selectedStatus = 4;

// Wall Footing
} else if (selectedP == "Wall Footing" && selectedC == "To be Constructed") {
selectedLayer = 13;
selectedStatus = 1;
} else if (selectedP == "Wall Footing" && selectedC == "Under Construction") {
selectedLayer = 13;
selectedStatus = 2;
} else if (selectedP == "Wall Footing" && selectedC == "Delayed") {
selectedLayer = 13;
selectedStatus = 3;
} else if (selectedP == "Wall Footing" && selectedC == "Completed") {
selectedLayer = 13;
selectedStatus = 4;

// Vertical Brace
} else if (selectedP == "Vertical Brace" && selectedC == "To be Constructed") {
selectedLayer = 14;
selectedStatus = 1;
} else if (selectedP == "Vertical Brace" && selectedC == "Under Construction") {
selectedLayer = 14;
selectedStatus = 2;
} else if (selectedP == "Vertical Brace" && selectedC == "Delayed") {
selectedLayer = 14;
selectedStatus = 3;
} else if (selectedP == "Vertical Brace" && selectedC == "Completed") {
selectedLayer = 14;
selectedStatus = 4;

// Side Wall Girt
} else if (selectedP == "Side Wall Girt" && selectedC == "To be Constructed") {
selectedLayer = 15;
selectedStatus = 1;
} else if (selectedP == "Side Wall Girt" && selectedC == "Under Construction") {
selectedLayer = 15;
selectedStatus = 2;
} else if (selectedP == "Side Wall Girt" && selectedC == "Delayed") {
selectedLayer = 15;
selectedStatus = 3;
} else if (selectedP == "Side Wall Girt" && selectedC == "Completed") {
selectedLayer = 15;
selectedStatus = 4;

    // Purlin
} else if (selectedP == "Purlin" && selectedC == "To be Constructed") {
selectedLayer = 16;
selectedStatus = 1;
} else if (selectedP == "Purlin" && selectedC == "Under Construction") {
selectedLayer = 16;
selectedStatus = 2;
} else if (selectedP == "Purlin" && selectedC == "Delayed") {
selectedLayer = 16;
selectedStatus = 3;
} else if (selectedP == "Purlin" && selectedC == "Completed") {
selectedLayer = 16;
selectedStatus = 4;

    // Girt
} else if (selectedP == "Girt" && selectedC == "To be Constructed") {
selectedLayer = 16;
selectedStatus = 1;
} else if (selectedP == "Girt" && selectedC == "Under Construction") {
selectedLayer = 17;
selectedStatus = 2;
} else if (selectedP == "Girt" && selectedC == "Delayed") {
selectedLayer = 17;
selectedStatus = 3;
} else if (selectedP == "Girt" && selectedC == "Completed") {
selectedLayer = 17;
selectedStatus = 4;

    // Foundation
} else if (selectedP == "Foundation" && selectedC == "To be Constructed") {
selectedLayer = 18;
selectedStatus = 1;
} else if (selectedP == "Foundation" && selectedC == "Under Construction") {
selectedLayer = 18;
selectedStatus = 2;
} else if (selectedP == "Foundation" && selectedC == "Delayed") {
selectedLayer = 18;
selectedStatus = 3;
} else if (selectedP == "Foundation" && selectedC == "Completed") {
selectedLayer = 18;
selectedStatus = 4;

    // Rail
} else if (selectedP == "Rail" && selectedC == "To be Constructed") {
selectedLayer = 19;
selectedStatus = 1;
} else if (selectedP == "Rail" && selectedC == "Under Construction") {
selectedLayer = 19;
selectedStatus = 2;
} else if (selectedP == "Rail" && selectedC == "Delayed") {
selectedLayer = 19;
selectedStatus = 3;
} else if (selectedP == "Rail" && selectedC == "Completed") {
selectedLayer = 19;
selectedStatus = 4;

    // Sleepers
} else if (selectedP == "Sleepers" && selectedC == "To be Constructed") {
selectedLayer = 20;
selectedStatus = 1;
} else if (selectedP == "Sleepers" && selectedC == "Under Construction") {
selectedLayer = 20;
selectedStatus = 2;
} else if (selectedP == "Sleepers" && selectedC == "Delayed") {
selectedLayer = 20;
selectedStatus = 3;
} else if (selectedP == "Sleepers" && selectedC == "Completed") {
selectedLayer = 20;
selectedStatus = 4;

    // Rafter
} else if (selectedP == "Rafter" && selectedC == "To be Constructed") {
selectedLayer = 21;
selectedStatus = 1;
} else if (selectedP == "Rafter" && selectedC == "Under Construction") {
selectedLayer = 21;
selectedStatus = 2;
} else if (selectedP == "Rafter" && selectedC == "Delayed") {
selectedLayer = 21;
selectedStatus = 3;
} else if (selectedP == "Rafter" && selectedC == "Completed") {
selectedLayer = 21;
selectedStatus = 4;

    // Tension Brace
} else if (selectedP == "Tension Brace" && selectedC == "To be Constructed") {
selectedLayer = 22;
selectedStatus = 1;
} else if (selectedP == "Tension Brace" && selectedC == "Under Construction") {
selectedLayer = 22;
selectedStatus = 2;
} else if (selectedP == "Tension Brace" && selectedC == "Delayed") {
selectedLayer = 22;
selectedStatus = 3;
} else if (selectedP == "Tension Brace" && selectedC == "Completed") {
selectedLayer = 22;
selectedStatus = 4;

    // Rubble Concrete
  } else if (selectedP == "Rubble Concrete" && selectedC == "To be Constructed") {
selectedLayer = 23;
selectedStatus = 1;
} else if (selectedP == "Rubble Concrete" && selectedC == "Under Construction") {
selectedLayer = 23;
selectedStatus = 2;
} else if (selectedP == "Rubble Concrete" && selectedC == "Delayed") {
selectedLayer = 23;
selectedStatus = 3;
} else if (selectedP == "Rubble Concrete" && selectedC == "Completed") {
selectedLayer = 23;
selectedStatus = 4;

} else {
selectedLayer = null;
}

chartLayerView.filter = {
where: "Type = " + selectedLayer
//where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
};

} // End of filterByChart

view.whenLayerView(structureLayer).then(function (layerView) {
chartLayerView = layerView;

chartElement.style.visibility = "visible";

// Listen to the click event on the map view and resets to default 
view.on("click", function() {
chartLayerView.filter = null;
});
});

} // End of createSeries function

createSeries("value1", "Completed");
createSeries("value2", "Under Construction");
createSeries("value3", "To be Constructed");
createSeries("value4", "Delayed");

}); // End of queryFeatures function
}

updateChart();
am4core.options.autoDispose = true;
}); // End of am4Core.ready()


///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
  // On-off feature layer tab
  var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage" || item.title === "ROW"){
          item.visible = false
        }
      }
    });
/*
    view.ui.add(layerList, {
      position: "bottom-left"
    });
*/
var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
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
      group: "bottom-left"
  });
  view.ui.add(layerListExpand, {
      position: "bottom-left"
  });

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
  
  // See through Gound
  document
    .getElementById("opacityInput")
    .addEventListener("change", function(event) {
      map.ground.opacity = event.target.checked ? 0.1 : 0.6;
    });

  view.ui.add("menu", "bottom-left");

});