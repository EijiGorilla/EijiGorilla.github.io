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
  "esri/widgets/Search",
  "esri/layers/BuildingSceneLayer",
  "esri/widgets/BuildingExplorer"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground, Search,
            BuildingSceneLayer, BuildingExplorer) {

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

  var map = new Map({
        basemap: basemap, // "streets-night-vector", 
        ground: "world-elevation"
  }); 
   
  var view = new SceneView({
      map: map,
      container: "viewDiv",
      viewingMode: "local",
      camera: {
          position: {
              x: 121.1622434,
              y: 14.2258077,
              z: 500
              },
              tilt: 10
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


//*******************************//
// Label Class Property Settings //
//*******************************//

// Station Label
var labelClass = new LabelClass({
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
            //weight: "bold"
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
      //value: "{TEXTSTRING}"
  }
  });


// Labeling Building spot
var buildingSpotLabelClass = {
symbol: {
    type: "label-3d",// autocasts as new LabelSymbol3D()
    symbolLayers: [
      {
        type: "text", // autocasts as new TextSymbol3DLayer()
        material: {
          color: "orange"
        },
        size: 12,
        color: "black",
        haloColor: "black",
        haloSize: 1,
        font: {
          family: "Ubuntu Mono",
          //weight: "bold"
        },
      }
    ],
    verticalOffset: {
      screenLength: 50,
      maxWorldLength: 300,
      minWorldLength: 40
    },
    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: "white",
      size: 0.5,
      border: {
        color: "grey"
      }
    }
  },
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: "$feature.Name"
    //value: "{TEXTSTRING}"
}
}

//*****************************//
//      Renderer Settings      //
//*****************************// 
// Building location
let buildingSpotSymbol = {
type: "simple",  // autocasts as new SimpleRenderer()
symbol: {
type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
size: 5,
color: "white",
outline: {  // autocasts as new SimpleLineSymbol()
width: 0.5,
color: [0, 0, 0, 0]
}
}
};

// Station Symbol
  function stationsSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }

  // Station Renderer
  var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Station",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };


// Legend Color for Structure Layer
// 0.1: more transparent, 0.9: not transparent 
  const colors = {
    1: [225, 225, 225, 0.1], // To be Constructed (white)
    2: [130, 130, 130, 0.5], // Under Construction
    3: [255, 0, 0, 0.8], // Delayed
    4: [0, 112, 255, 0.8], // Pile/Pile Cap
    5: [0, 112, 255, 0.8], // Beam
    6: [0, 112, 255, 0.8], // Column
    7: [0, 112, 255, 0.8], // Slab
    8: [0, 112, 255, 0.8], // Roof
  };

//*******************************//
// Import Layers                 //
//*******************************//

var buildingLocation = new FeatureLayer({
portalItem: {
  id: "b54ca5d42ad74c9a9f770da7aacf30c3",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
},
elevationInfo: {
mode: "relative-to-ground"
},
title: "Building Spot",
renderer: buildingSpotSymbol,
labelingInfo: [buildingSpotLabelClass],
popupEnabled: false,
outFields: ["*"]
});
map.add(buildingLocation);


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

// Depot Building Layer
const buildingLayer = new BuildingSceneLayer({
  portalItem: {
    id: "2bcbc0e0d05a4b87a1e87af9344a3fae",
    portal: {
      url: "https://gis.railway-sector.com/portal"
    }
  },
  outFields: ["*"],
  title: "SC Depot Building"
});
map.add(buildingLayer);

const buildingExplorer = new BuildingExplorer({
  view: view,
  layers: [buildingLayer]
  });
  //view.ui.add(buildingExplorer, "top-right");
  
  // only display the building levels filter
  buildingExplorer.visibleElements = {
  phases: false,
  disciplines: true
  };
/////////////////////////////

// Discipline: Architectural
var columnsLayer = null;
var doorsLayer = null;
var floorsLayer = null;
var roofsLayer = null;
var furnitureLayer = null;
var wallsLayer = null;
var stairsLayer = null;
var windowsLayer = null;

// Discipline: Structural
var stFramingLayer = null;
var stColumnLayer = null;
var stFoundationLayer = null;

//
var excludedLayers = [];
var genericModelLayers = null;

// Compile building scene layers
buildingLayer.when(() => {
buildingLayer.allSublayers.forEach((layer) => {
switch(layer.modelName) {
// Because of performance reasons, the Full Model view is
// by default set to false. In this scene the Full Model should be visible.
 
  // Extract layers that should not be hidden by the sllice widget?
  case "GenericModel":
    genericModelLayers = layer;
    layer.visible = false;

  case "Furniture":
    furnitureLayer = layer;
    layer.visible = false;

  case "Doors":
    doorsLayer = layer;
    //excludedLayers.push(layer);
    break;

  case "Columns":
    columnsLayer = layer;
    //excludedLayers.push(layer);
    break;

  case "Floors":
    floorsLayer = layer;
    //excludedLayers
    break;

  case "Stairs":
    stairsLayer = layer;
    break;

  case "Roofs":
    roofsLayer = layer;
    break;

  case "Walls":
    wallsLayer = layer;
    break;
  
  case "Windows":
    windowsLayer = layer;
    break;

  case "StructuralFraming":
    stFramingLayer = layer;
    break;

  case "StructuralColumns":
    stColumnLayer = layer;
    break;

  case "StructuralFoundation":
    stFoundationLayer = layer;
    break;

  default:
    layer.visible = true;
}
});
});


//*******************************//
//      Progress Chart           //
//*******************************//
// Total progress //
function totalProgressStFoundation() {
  // structural Foundation
  var total_complete = {
    onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_complete",
    statisticType: "sum"
  };

  var total_obs = {
    onStatisticField: "Status",
    outStatisticFieldName: "total_obs",
    statisticType: "count"
  };

var query = stFoundationLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return stFoundationLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;

  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const compile_stFoundation = [total_comp, total_obs];
  return compile_stFoundation;
});
}

// structural columns
function totalProgressStColumn(compile_stFoundation) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = stColumnLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return stColumnLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_stFoundation[0];
const comp_obs = total_obs + compile_stFoundation[1];
const compile_stColumn = [comp_comp, comp_obs];

return compile_stColumn;
});
}

// structura framing
function totalProgressStFraming(compile_stColumn) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = stFramingLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return stFramingLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_stColumn[0];
const comp_obs = total_obs + compile_stColumn[1];
const compile_stFraming = [comp_comp, comp_obs];

return compile_stFraming;
});
}

// Columns
function totalProgressColumns(compile_stFraming) {
// structural Foundation
var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = columnsLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return columnsLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_stFraming[0];
  const comp_obs = total_obs + compile_stFraming[1];
  const compile_columns = [comp_comp, comp_obs];
  
  return compile_columns;
});
}

// Doors
function totalProgressDoors(compile_columns) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = doorsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return doorsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_columns[0];
const comp_obs = total_obs + compile_columns[1];
const compile_doors = [comp_comp, comp_obs];

return compile_doors;
});
}

// Floors
function totalProgressFloors(compile_doors) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = floorsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return floorsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_doors[0];
const comp_obs = total_obs + compile_doors[1];
const compile_floors = [comp_comp, comp_obs];

return compile_floors;
});
}

// Roofs
function totalProgressRoofs(compile_floors) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = roofsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return roofsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_floors[0];
const comp_obs = total_obs + compile_floors[1];
const compile_roofs = [comp_comp, comp_obs];

return compile_roofs;
});
}

// Walls
function totalProgressWalls(compile_roofs) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = wallsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return wallsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_roofs[0];
const comp_obs = total_obs + compile_roofs[1];
const compile_walls = [comp_comp, comp_obs];

return compile_walls;
});
}

// Stairs
function totalProgressStairs(compile_walls) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = stairsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return stairsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_walls[0];
const comp_obs = total_obs + compile_walls[1];
const compile_stairs = [comp_comp, comp_obs];

return compile_stairs;
});
}

// Windows

function totalProgressWindows(compile_stairs) {
// structural Foundation
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};

var query = windowsLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
return windowsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_comp = stats.total_complete;
const total_obs = stats.total_obs;
const comp_comp = total_comp + compile_stairs[0];
const comp_obs = total_obs + compile_stairs[1];
const compile_windows = [comp_comp, comp_obs];

return compile_windows;
});
}

// Combine All
function progressAll(compile_stairs) {

document.getElementById("totalProgressDiv").innerHTML = ((compile_stairs[0]/compile_stairs[1])*100).toFixed(1) + " %";
}

function totalProgressDepot() {
totalProgressStFoundation()
.then(totalProgressStColumn)
.then(totalProgressStFraming)
.then(totalProgressColumns)
.then(totalProgressDoors)
.then(totalProgressFloors)
.then(totalProgressRoofs)
.then(totalProgressWalls)
.then(totalProgressStairs)
.then(totalProgressWindows)
.then(progressAll)
}


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

// Create Bar chart to show progress of station structure
am4core.ready(function() {
am4core.useTheme(am4themes_animated);
const selectedBuildingDiv = document.getElementById("selectedBuildingDiv");

// Default selection = 'None'
buildingLayer.when(() => {
// All depot names for SC:
//"TMO"  "MCS"  "DB1"  "WPH1" "WPH2"
//"SH1"  "BPS"  "MPS"  "OCC"  "CPS"  "CNT"  "FP1"  "DSP"  "LRS"  "URS"  "WRS" 
//"CMV"  "LOS"  "DHS"  "LGS"  "TGB" 
const defaultStation = "OCC";

const defaultDepot = "Name = '" + defaultStation + "'";
selectedBuildingDiv.innerHTML = defaultStation;

columnsLayer.definitionExpression = defaultDepot;
doorsLayer.definitionExpression = defaultDepot;
floorsLayer.definitionExpression = defaultDepot;
roofsLayer.definitionExpression = defaultDepot;
wallsLayer.definitionExpression = defaultDepot;
stairsLayer.definitionExpression = defaultDepot;
windowsLayer.definitionExpression = defaultDepot;

stFramingLayer.definitionExpression = defaultDepot;
stColumnLayer.definitionExpression = defaultDepot;
stFoundationLayer.definitionExpression = defaultDepot;

columnsLayer.visible = true;
doorsLayer.visible = true;
floorsLayer.visible = true;
roofsLayer.visible = true;
wallsLayer.visible = true;
stairsLayer.visible = true;
windowsLayer.visible = true;

stFramingLayer.visible = true;
stColumnLayer.visible = true;
stFoundationLayer.visible = true;

totalProgressDepot();
chartStFoundation();
chartStColumn();
chartStFraming();
chartRoofs();
chartFloors();
chartWalls();
chartColumns();

zoomToLayer(stFramingLayer);

combineOthers();


// click the label and display selected bulidng

view.when(function() {
  view.on("click", function(event) {
    view.hitTest(event).then(function(response) {
      const feature = response.results[0].graphic.attributes.Name;
      const updatedName = "Name = '" + feature + "'";
      columnsLayer.definitionExpression = updatedName;
      doorsLayer.definitionExpression = updatedName;
      floorsLayer.definitionExpression = updatedName;
      roofsLayer.definitionExpression = updatedName;
      wallsLayer.definitionExpression = updatedName;
      stairsLayer.definitionExpression = updatedName;
      windowsLayer.definitionExpression = updatedName;

      stFramingLayer.definitionExpression = updatedName;
      stColumnLayer.definitionExpression = updatedName;
      stFoundationLayer.definitionExpression = updatedName;

      selectedBuildingDiv.innerHTML = feature;

      zoomToLayer(stFramingLayer);
      totalProgressDepot()
      chartStFoundation();
      chartStColumn();
      chartStFraming();
      chartRoofs();
      chartFloors();
      chartWalls();
      chartColumns();
      combineOthers();
    })
  })
});


// Chart
// 1. Structural Foundation
function chartStFoundation() {
var total_stFoundation_tobec = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFoundation_tobec",
statisticType: "sum"
};

var total_stFoundation_underc = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFoundation_underc",
statisticType: "sum"  
};

var total_stFoundation_comp = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFoundation_comp",
statisticType: "sum"  
};

var query = stFoundationLayer.createQuery();
query.outStatistics = [total_stFoundation_tobec, total_stFoundation_underc, total_stFoundation_comp];
query.returnGeometry = true;

stFoundationLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const foundation_tobec = stats.total_stFoundation_tobec;
const foundation_underc = stats.total_stFoundation_underc;
const foundation_comp = stats.total_stFoundation_comp;

// Chart //
var chart = am4core.create("chartStFoundationDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "St. Foundation",
      value1: foundation_comp,
      value2: foundation_underc,
      value3: foundation_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (foundation_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = false;
          stFramingLayer.visible = false;
          roofsLayer.visible = false;
          wallsLayer.visible = false;
          floorsLayer.visible = false;
          doorsLayer.visible = false;
          stairsLayer.visible = false;
          columnsLayer.visible = false;
          windowsLayer.visible = false;

          // Listen to the click event on the map view and resets to default 
          view.on("click", function() {
            stColumnLayer.visible = true;
            stFramingLayer.visible = true;
            roofsLayer.visible = true;
            wallsLayer.visible = true;
            floorsLayer.visible = true;
            doorsLayer.visible = true;
            stairsLayer.visible = true;
            columnsLayer.visible = true;
            windowsLayer.visible = true;
          });


  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart

// 2. Structural Column
function chartStColumn() {
var total_stColumn_tobec = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_tobec",
statisticType: "sum"
};

var total_stColumn_underc = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_underc",
statisticType: "sum"  
};

var total_stColumn_comp = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_comp",
statisticType: "sum"  
};

var query = stColumnLayer.createQuery();
query.outStatistics = [total_stColumn_tobec, total_stColumn_underc, total_stColumn_comp];
query.returnGeometry = true;

stColumnLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const column_tobec = stats.total_stColumn_tobec;
const column_underc = stats.total_stColumn_underc;
const column_comp = stats.total_stColumn_comp;

// Chart //
var chart = am4core.create("chartStColumnDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "St. Column",
      value1: column_comp,
      value2: column_underc,
      value3: column_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (column_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = true;
        stFramingLayer.visible = false;
        roofsLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = false;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stFramingLayer.visible = true;
          roofsLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          columnsLayer.visible = true;
          windowsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 3. Structural Framing
function chartStFraming() {
var total_stFraming_tobec = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_tobec",
statisticType: "sum"
};

var total_stFraming_underc = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_underc",
statisticType: "sum"  
};

var total_stFraming_comp = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_comp",
statisticType: "sum"  
};

var query = stFramingLayer.createQuery();
query.outStatistics = [total_stFraming_tobec, total_stFraming_underc, total_stFraming_comp];
query.returnGeometry = true;

stFramingLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const framing_tobec = stats.total_stFraming_tobec;
const framing_underc = stats.total_stFraming_underc;
const framing_comp = stats.total_stFraming_comp;

// Chart //
var chart = am4core.create("chartStFramingDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "St. Framing",
      value1: framing_comp,
      value2: framing_underc,
      value3: framing_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (framing_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = true;
        roofsLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = false;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          roofsLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          columnsLayer.visible = true;
          windowsLayer.visible = true;
        });

  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


//4. Roofs
function chartRoofs() {
var total_roofs_tobec = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_roofs_tobec",
statisticType: "sum"
};

var total_roofs_underc = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_roofs_underc",
statisticType: "sum"  
};

var total_roofs_comp = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_roofs_comp",
statisticType: "sum"  
};

var query = roofsLayer.createQuery();
query.outStatistics = [total_roofs_tobec, total_roofs_underc, total_roofs_comp];
query.returnGeometry = true;

roofsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const roofs_tobec = stats.total_roofs_tobec;
const roofs_underc = stats.total_roofs_underc;
const roofs_comp = stats.total_roofs_comp;

// Chart //
var chart = am4core.create("chartRoofsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "Roofs",
      value1: roofs_comp,
      value2: roofs_underc,
      value3: roofs_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (roofs_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        roofsLayer.visible = true;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = false;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          columnsLayer.visible = true;
          windowsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 5. Floors
function chartFloors() {
var total_floors_tobec = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_tobec",
statisticType: "sum"
};

var total_floors_underc = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_underc",
statisticType: "sum"  
};

var total_floors_comp = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_comp",
statisticType: "sum"  
};

var query = floorsLayer.createQuery();
query.outStatistics = [total_floors_tobec, total_floors_underc, total_floors_comp];
query.returnGeometry = true;

floorsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const floors_tobec = stats.total_floors_tobec;
const floors_underc = stats.total_floors_underc;
const floors_comp = stats.total_floors_comp;

// Chart //
var chart = am4core.create("chartFloorsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "Floors",
      value1: floors_comp,
      value2: floors_underc,
      value3: floors_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (floors_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {

        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        roofsLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = true;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = false;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          roofsLayer.visible = true;
          wallsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          columnsLayer.visible = true;
          windowsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 6. Walls
function chartWalls() {
var total_walls_tobec = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_tobec",
statisticType: "sum"
};

var total_walls_underc = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_underc",
statisticType: "sum"  
};

var total_walls_comp = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_comp",
statisticType: "sum"  
};

var query = wallsLayer.createQuery();
query.outStatistics = [total_walls_tobec, total_walls_underc, total_walls_comp];
query.returnGeometry = true;

wallsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const walls_tobec = stats.total_walls_tobec;
const walls_underc = stats.total_walls_underc;
const walls_comp = stats.total_walls_comp;

// Chart //
var chart = am4core.create("chartWallsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "Walls",
      value1: walls_comp,
      value2: walls_underc,
      value3: walls_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (walls_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        roofsLayer.visible = false;
        wallsLayer.visible = true;
        floorsLayer.visible = false;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = false;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          roofsLayer.visible = true;
          floorsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          columnsLayer.visible = true;
          windowsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 7. Columns
function chartColumns() {
var total_columns_tobec = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_tobec",
statisticType: "sum"
};

var total_columns_underc = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_underc",
statisticType: "sum"  
};

var total_columns_comp = {
onStatisticField: "CASE WHEN (Type = 7 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_comp",
statisticType: "sum"  
};

var query = columnsLayer.createQuery();
query.outStatistics = [total_columns_tobec, total_columns_underc, total_columns_comp];
query.returnGeometry = true;

columnsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const columns_tobec = stats.total_columns_tobec;
const columns_underc = stats.total_columns_underc;
const columns_comp = stats.total_columns_comp;

// Chart //
var chart = am4core.create("chartColumnsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
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

chart.data = [
  {
      category: "Columns",
      value1: columns_comp,
      value2: columns_underc,
      value3: columns_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (columns_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        roofsLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        doorsLayer.visible = false;
        stairsLayer.visible = false;
        columnsLayer.visible = true;
        windowsLayer.visible = false;

        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          roofsLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          doorsLayer.visible = true;
          stairsLayer.visible = true;
          windowsLayer.visible = true;
  
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 8. Others
// We need to compile three architectural discipline layers
// 1. doorsLayer
// 2. stairsLayer
// 3. windowsLayer

  
function doorsL() {
  var total_doors_tobec = {
  onStatisticField: "CASE WHEN (Type = 8 and Status = 1) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_doors_tobec",
  statisticType: "sum"
  };
  
  var total_doors_underc = {
  onStatisticField: "CASE WHEN (Type = 8 and Status = 2) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_doors_underc",
  statisticType: "sum"  
  };
  
  var total_doors_comp = {
  onStatisticField: "CASE WHEN (Type = 8 and Status = 4) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_doors_comp",
  statisticType: "sum"  
  };
  
  var query = doorsLayer.createQuery();
  query.outStatistics = [total_doors_tobec, total_doors_underc, total_doors_comp];
  query.returnGeometry = true;
  
  return doorsLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const doors_tobeC = stats.total_doors_tobec;
  const doors_underC = stats.total_doors_underc;
  const doors_comp = stats.total_doors_comp;
  const compile_doors = [doors_tobeC, doors_underC, doors_comp];
  
  return compile_doors;
  }); // end of queryFeatures
  } // end of doorsL function
 
  function stairsL(compile_doors) {
    var total_stairs_tobec = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 1) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_stairs_tobec",
    statisticType: "sum"
    };
    
    var total_stairs_underc = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_stairs_underc",
    statisticType: "sum"  
    };
    
    var total_stairs_comp = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 4) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_stairs_comp",
    statisticType: "sum"  
    };
    
    var query = stairsLayer.createQuery();
    query.outStatistics = [total_stairs_tobec, total_stairs_underc, total_stairs_comp];
    query.returnGeometry = true;
    
    return stairsLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    
    const stairs_tobeC = stats.total_stairs_tobec;
    const stairs_underC = stats.total_stairs_underc;
    const stairs_comp = stats.total_stairs_comp;
    
    const comp_tobeC = stairs_tobeC + compile_doors[0];
    const comp_underC = stairs_underC + compile_doors[1];
    const comp_comp = stairs_comp + compile_doors[2];
    
    const compile_stairs = [comp_tobeC, comp_underC, comp_comp];
    
    return compile_stairs;
    }); // end of queryFeatures
    } // end of stairsL function
    
    
    function windowsL(compile_stairs) { //
    var total_windows_tobec = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 1) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_windows_tobec",
    statisticType: "sum"
    };
    
    var total_windows_underc = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_windows_underc",
    statisticType: "sum"  
    };
    
    var total_windows_comp = {
    onStatisticField: "CASE WHEN (Type = 8 and Status = 4) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_windows_comp",
    statisticType: "sum"  
    };
    
    var query = windowsLayer.createQuery();
    query.outStatistics = [total_windows_tobec, total_windows_underc, total_windows_comp];
    query.returnGeometry = true;
    
    return windowsLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    
    const windows_tobeC = stats.total_windows_tobec;
    const windows_underC = stats.total_windows_underc;
    const windows_comp = stats.total_windows_comp;
    
    const comp_tobeC = windows_tobeC + compile_stairs[0];
    const comp_underC = windows_underC + compile_stairs[1];
    const comp_comp = windows_comp + compile_stairs[2];
    
    const compile_windows = [comp_tobeC, comp_underC, comp_comp];
    
    return compile_windows;
    }); // end of queryFeatures
    } // end of windowsL function
    
    
    function chartOthers(compile_windows) {
    // Chart //
    var chart = am4core.create("chartOthersDiv", am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
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
    
              // Create a separate state for background
              // target.setStateOnChildren = true;
              // var bgstate = target.background.states.create(stateId);
              // bgstate.properties.fill = am4core.color("#fff");
              // bgstate.properties.fillOpacity = 0;
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

    chart.data = [
      {
          category: "Others",
          value1: compile_windows[2],
          value2: compile_windows[1],
          value3: compile_windows[0],
      }
    ];
    
      // Define chart setting
      chart.colors.step = 2;
      chart.padding(0, 0, 0, 0);
      
      // Axis Setting
      /// Category Axis
      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.labels.template.fontSize = 0;
      categoryAxis.renderer.labels.template.fill = "#ffffff";
      categoryAxis.renderer.minGridDistance = 5; //can change label
      categoryAxis.renderer.grid.template.strokeWidth = 0;
      
      /// Value Axis
      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 50;
      valueAxis.renderer.labels.template.fontSize = 0;
      valueAxis.renderer.labels.template.fill = "#ffffff";
      valueAxis.renderer.grid.template.strokeWidth = 0;
      
      //valueAxis.disabled = true;
      //categoryAxis.disabled = true;
      let arrLviews = [];
      
      // Layerview and Expand
      function createSeries(field, name) {
          var series = chart.series.push(new am4charts.ColumnSeries());
          series.calculatePercent = true;
          series.dataFields.valueX = field;
          series.dataFields.categoryY = "category";
          series.stacked = true;
          series.dataFields.valueXShow = "totalPercent";
          series.dataItems.template.locations.categoryY = 0.5;
          
          // Bar chart line color and width
          series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
          series.columns.template.strokeWidth = 0.5;
          series.name = name;
          
          var labelBullet = series.bullets.push(new am4charts.LabelBullet());
          
          if (name == "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
          
          } else if (name === "Under Construction") {
              series.fill = am4core.color("#FFCCCCCC");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
          
          } else {
            // When completed value is zero, show no labels.
            if (compile_windows[2] === 0) {
              labelBullet.label.text = "";
            } else {
              labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 20;
          }
          labelBullet.locationX = 0.5;
          labelBullet.interactionsEnabled = false;
          
          series.columns.template.width = am4core.percent(60);
          series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
              
          // Click chart and filter, update maps
          const chartElement = document.getElementById("chartPanel");
          series.columns.template.events.on("hit", filterByChart, this);
    
          function filterByChart(ev) {
            stFoundationLayer.visible = false;
            stColumnLayer.visible = false;
            stFramingLayer.visible = false;
            wallsLayer.visible = false;
            floorsLayer.visible = false;
            columnsLayer.visible = false;

            doorsLayer.visible = true;
            windowsLayer.visible = true;
            stairsLayer.visible = true;

            view.on("click", function() {
              stFoundationLayer.visible = true;
              stColumnLayer.visible = true;
              stFramingLayer.visible = true;
              wallsLayer.visible = true;
              floorsLayer.visible = true;
              columnsLayer.visible = true;
            });
    


      } // End of filterByChart
    } // end of createSeries function
    
    createSeries("value1", "Complete");
    createSeries("value2", "Under Construction");
    createSeries("value3", "Incomplete");
    } // End of Chart

    
    function combineOthers() {
    doorsL()
    .then(stairsL)
    .then(windowsL)
    .then(chartOthers)
    }
    
    
});



}); // End of am4Core.ready()


///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
// On-off feature layer tab

// Search
var searchWidget = new Search({
view: view,
locationEnabled: false,
includeDefaultSources: false,
sources: [
{
layer: buildingLocation,
searchFields: ["Name", "LAYER"],
displayField: "Name",
exactMatch: false,
outFields: ["Name"],
name: "Building Name",
placeholder: "Building Name"
}
]
});
view.ui.add(searchWidget, "top-right");
//

// Legend
var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
{
layer: rowLayer,
title: "PROW"
}
]
});

var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "top-right"
});
view.ui.add(legendExpand, {
position: "top-right"
});

view.ui.empty("top-left");

// Compass
var compass = new Compass({view: view});
// adds the compass to the top left corner of the MapView
view.ui.add(compass, "top-right");

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
element: viewDiv
}),
"top-right"
);
  
// See through Gound
document
.getElementById("opacityInput")
.addEventListener("change", function(event) {
map.ground.opacity = event.target.checked ? 0.1 : 0.6;
});
view.ui.add("menu", "top-right");
});