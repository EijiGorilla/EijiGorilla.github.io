require([
  "esri/Basemap",
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/views/layers/support/FeatureFilter",
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
  "esri/layers/BuildingSceneLayer",
  "esri/widgets/BuildingExplorer",
  "esri/widgets/Slice",
  "esri/analysis/SlicePlane",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/MeshSymbol3D",
  "esri/symbols/edges/SolidEdges3D",
  "esri/layers/GroupLayer"
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
            BuildingSceneLayer, BuildingExplorer, Slice, SlicePlane,
            SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer) {


////////////////////////////////////////////////////
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "8a9ef2a144e8423786f6139408ac3424" 
      }
    })
  ]
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
              x: 120.57930,
              y: 15.18,
              z: 500
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

// OpenStreetMap 3D Buildings
let osmSymbol = {
type: "mesh-3d",
symbolLayers: [
{
type: "fill",
material: {
  color: [74, 80, 87, 0.5],
  colorMixMode: "replace"
},
edges: {
  type: "solid", // autocasts as new SolidEdges3D()
  color: [225, 225, 225, 0.3]
}
}
]
};


var osm3D = new SceneLayer({
portalItem: {
id: "ca0470dbbddb4db28bad74ed39949e25"
},
title: "OpenStreetMap 3D Buildings"
});
map.add(osm3D);
osm3D.renderer = {
type: "simple",
symbol: osmSymbol
}



// Label Class
  // Station labels
  var labelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: [255, 170, 0]
          },
          size: 20,
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
      expression: "$feature.Station"
      //value: "{TEXTSTRING}"
  }
  });

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
  
// Station Layer
var stationLayer = new SceneLayer({
      portalItem: {
          id: "212904618a1f44c1a78e2446d905e679"
      },
       labelingInfo: [labelClass],
       renderer: stationsRenderer,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
       definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Station structures
const buildingLayer = new BuildingSceneLayer({
portalItem: {
id: "2cf9d20eede94e45abaf868a6fc8d4a3"
},
outFields: ["*"],
title: "N2 Station Structures"

});
map.add(buildingLayer);


view.ui.empty("top-left");

const buildingExplorer = new BuildingExplorer({
view: view,
layers: [buildingLayer]
});
view.ui.add(buildingExplorer, "bottom-right");

// only display the building levels filter
buildingExplorer.visibleElements = {
phases: false,
disciplines: false
};
//////////////////////////////////////////////////////////////////////////////////

/// chart
const headerTitleDiv = document.getElementById("headerTitleDiv");


/*
    const excludedLayers = [];
  const sliceButton = document.getElementById("slice");
  const resetPlaneBtn = document.getElementById("resetPlaneBtn");
  const clearPlaneBtn = document.getElementById("clearPlaneBtn");
  const sliceOptions = document.getElementById("sliceOptions");
  const plane = new SlicePlane({
    position: {
      latitude: 34.0600460070941,
      longitude: -117.18669237418565,
      z: 417.75
    },
    tilt: 32.62,
    width: 29,
    height: 29,
    heading: 0.46
  });
  var sliceWidget = null;
          var sliceTiltEnabled = true;
*/
// Discipline: Architectural
var doorsLayer = null;
var windowsLayer = null;

// Discipline: Structural
var stFramingLayer = null;
var stColumnLayer = null;
var stFoundationLayer = null;

buildingLayer.when(() => {
// Iterate through the flat array of sublayers and extract the ones
// that should be excluded from the slice widget
buildingLayer.allSublayers.forEach((layer) => {
// modelName is standard accross all BuildingSceneLayer,
// use it to identify a certain layer
switch (layer.modelName) {
// Because of performance reasons, the Full Model view is
// by default set to false. In this scene the Full Model should be visible.
case "FullModel":
  layer.visible = true;
  break;
  case "Overview":
  case "Rooms":
    layer.visible = false;
    break;

  // Extract the layers that should not be hidden by the slice widget
  case "Doors":
    doorsLayer = layer;
    excludedLayers.push(layer);
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
// setSliceWidget();
});

/*
  function setSliceWidget() {
    sliceWidget = new Slice({
      view: view,
      container: "sliceContainer"
    });
    sliceWidget.viewModel.excludedLayers.addMany(excludedLayers);
    sliceTiltEnabled = true;
    sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
    sliceWidget.viewModel.shape = plane;
    sliceWidget.viewModel.watch("state", (value) => {
      if (value === "ready") {
        clearPlaneBtn.style.display = "none";
      } else {
        clearPlaneBtn.style.display = "inherit";
      }
    });
  }

  resetPlaneBtn.addEventListener("click", () => {
    document.getElementById("tiltEnabled").checked = true;
    sliceTiltEnabled = true;
    sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
    sliceWidget.viewModel.shape = plane;
  });

  clearPlaneBtn.addEventListener("click", () => {
    sliceWidget.viewModel.clear();
  });

  document
    .getElementById("tiltEnabled")
    .addEventListener("change", (event) => {
      sliceTiltEnabled = event.target.checked;
      sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
    });

  document.getElementById("color").addEventListener("change", (event) => {
    if (event.target.checked) {
      // A renderer can be set on a BuildingComponentSublayer
      doorsLayer.renderer = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "mesh-3d", // autocasts as new MeshSymbol3D()
          symbolLayers: [
            {
              type: "fill", // autocasts as new FillSymbol3DLayer()
              material: {
                color: "red"
              }
            }
          ]
        }
      };

    } else {
      doorsLayer.renderer = null;
    }
  });
*/
//////////////
let abort = false;
let center = null;
function rotate() {
  if (!view.interacting && !abort) {
    
    play.style.display = "none";
    pause.style.display = "block";
    
    center = center || view.center;
    
    view.goTo({
      heading: view.camera.heading + 0.2,
      center
    }, {animate: false});
    
    requestAnimationFrame(rotate);
  } else {
    abort = false;
    center = null;
    play.style.display = "block";
    pause.style.display = "none";
  }
} // end

play.onclick = rotate;
pause.onclick = function() {
  abort = true;
};

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

////////////////////////////////
var stationList = document.getElementById("stationList");
var ttt = stationList.getElementsByClassName("test");

am4core.ready(function() {
am4core.useTheme(am4themes_animated);

buildingLayer.when(() => {
//updateChart();
stFramingLayer.definitionExpression = "Station = 8";
stFramingLayer.visible = true;
zoomToLayer(stFramingLayer);

stColumnLayer.definitionExpression = "Station = 8";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 8";
stFoundationLayer.visible = true;


combineAll();

});
// Default selection = 'None'

// Station list
for(var i = 0; i < ttt.length; i ++) {
ttt[i].addEventListener("click", filterByP);
}

function filterByP(event) {
var current = document.getElementsByClassName("active");
current[0].className = current[0].className.replace(" active","");
this.className += " active";

const selectedID = event.target.id;
if(selectedID == "Calumpit") {
stFramingLayer.definitionExpression = "Station = 8";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 8";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 8";
stFoundationLayer.visible = true;

combineAll();
zoomToLayer(stFramingLayer);

} else if (selectedID == "Apalit") {
stFramingLayer.definitionExpression = "Station = 7";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 7";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 7";
stFoundationLayer.visible = true;      

combineAll();
zoomToLayer(stFramingLayer); 

} else if (selectedID == "San Fernando") {
stFramingLayer.definitionExpression = "Station = 6";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 6";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 6";
stFoundationLayer.visible = true;      

combineAll();
zoomToLayer(stFramingLayer); 

} else if (selectedID == "Angeles") {
stFramingLayer.definitionExpression = "Station = 5";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 5";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 5";
stFoundationLayer.visible = true;      

combineAll();
zoomToLayer(stFramingLayer); 

} else if (selectedID == "Clark") {
stFramingLayer.definitionExpression = "Station = 4";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 4";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 4";
stFoundationLayer.visible = true;      

combineAll();
zoomToLayer(stFramingLayer); 

} else if (selectedID == "CIA") {
stFramingLayer.definitionExpression = "Station = 3";
stFramingLayer.visible = true;

stColumnLayer.definitionExpression = "Station = 3";
stColumnLayer.visible = true;

stFoundationLayer.definitionExpression = "Station = 3";
stFoundationLayer.visible = true;      

combineAll();
zoomToLayer(stFramingLayer); 

}
}



// Structural Disciplines
// StructuralColumns
//const structuralColumn_comp = {1:[], 2:[], 3:[], 4:[]};
const compArray = {1:[], 2:[], 3:[], 4:[],
             5:[], 6:[], 7:[], 8:[],
             9:[], 10:[], 11:[], 12:[]};

function structuralColumns(){
// Column 
var total_column_tobeC = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",  // Pile & Pile Cap and to be Constructed
outStatisticFieldName: "total_column_tobeC",
statisticType: "sum"
};

var total_column_underC = {
onStatisticField: "CASE WHEN Status = 2 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Under construction
outStatisticFieldName: "total_column_underC",
statisticType: "sum"
};
var total_column_done = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Complete
outStatisticFieldName: "total_column_done",
statisticType: "sum"
};   
var total_column_delayed = {
onStatisticField: "CASE WHEN Status = 3 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Delayed
outStatisticFieldName: "total_column_delayed",
statisticType: "sum"
};


var query = stColumnLayer.createQuery();
query.outStatistics = [total_column_tobeC, total_column_underC, total_column_done, total_column_delayed];
query.returnGeometry = true;

return stColumnLayer.queryFeatures(query).then(function(response){

var stats = response.features[0].attributes;

// column
const column_tobeC = stats.total_column_tobeC;
const column_underC = stats.total_column_underC;
const column_done = stats.total_column_done;
const column_delayed = stats.total_column_delayed;
const compile_column = [column_done, column_underC, column_tobeC, column_delayed];

for (var i=0; i <=3; i++){
compArray[i+1] = compile_column[i];
}

//compArray[1] = compile_column[0];
//compArray[2] = compile_column[1];


return compArray;

});
} // End of structuralColumns function

// StructuralFraming
function structuralFraming(compArray){
var total_framing_tobeC = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",  // Pile & Pile Cap and to be Constructed
outStatisticFieldName: "total_framing_tobeC",
statisticType: "sum"
};

var total_framing_underC = {
onStatisticField: "CASE WHEN Status = 2 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Under construction
outStatisticFieldName: "total_framing_underC",
statisticType: "sum"
};
var total_framing_done = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Complete
outStatisticFieldName: "total_framing_done",
statisticType: "sum"
};   
var total_framing_delayed = {
onStatisticField: "CASE WHEN Status = 3 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Delayed
outStatisticFieldName: "total_framing_delayed",
statisticType: "sum"
};

var query = stFramingLayer.createQuery();
query.outStatistics = [total_framing_tobeC, total_framing_underC, total_framing_done, total_framing_delayed];
query.returnGeometry = true;

return stFramingLayer.queryFeatures(query).then(function(response){

var stats = response.features[0].attributes;

// framing
const framing_tobeC = stats.total_framing_tobeC;
const framing_underC = stats.total_framing_underC;
const framing_done = stats.total_framing_done;
const framing_delayed = stats.total_framing_delayed;
const compile_framing = [framing_done, framing_underC, framing_tobeC, framing_delayed];

for (var i=0; i <= 3; i++){
compArray[i+5] = compile_framing[i];
}
return compArray;

});
} // End of structuralColumns function

// StructuralFoundation
function structuralFoundation(compArray){
var total_foundation_tobeC = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",  // Pile & Pile Cap and to be Constructed
outStatisticFieldName: "total_foundation_tobeC",
statisticType: "sum"
};

var total_foundation_underC = {
onStatisticField: "CASE WHEN Status = 2 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Under construction
outStatisticFieldName: "total_foundation_underC",
statisticType: "sum"
};
var total_foundation_done = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Complete
outStatisticFieldName: "total_foundation_done",
statisticType: "sum"
};   
var total_foundation_delayed = {
onStatisticField: "CASE WHEN Status = 3 THEN 1 ELSE 0 END",  // Pile & Pile Cap and Delayed
outStatisticFieldName: "total_foundation_delayed",
statisticType: "sum"
};

var query = stFoundationLayer.createQuery();
query.outStatistics = [total_foundation_tobeC, total_foundation_underC, total_foundation_done, total_foundation_delayed];
query.returnGeometry = true;

return stFoundationLayer.queryFeatures(query).then(function(response){

var stats = response.features[0].attributes;

// foundation
const foundation_tobeC = stats.total_foundation_tobeC;
const foundation_underC = stats.total_foundation_underC;
const foundation_done = stats.total_foundation_done;
const foundation_delayed = stats.total_foundation_delayed;
const compile_foundation = [foundation_done, foundation_underC, foundation_tobeC, foundation_delayed];

for (var i=0; i <= 3; i++){
compArray[i+9] = compile_foundation[i];
}
return compArray;

});
} // End of structuralColumns function


///////////////////////////////////////////////////////////


function updateStructural(compArray) {
// Chart //
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in



chart.data = [
{
category: "Column",
value1: compArray[1], // Completed
value2: compArray[2], // Under Construction
value3: compArray[3], // To be Constructed
value4: compArray[4] // Delayed
},
{
category: "Framing",
value1: compArray[5],
value2: compArray[6],
value3: compArray[7],
value4: compArray[8]
},
{
category: "Foundation",
value1: compArray[9], // Completed
value2: compArray[10], // Under Construction
value3: compArray[11], // To be Constructed
value4: compArray[12] // Delayed
}
]; // End of chart

chart.colors.step = 2;
chart.padding(10, 10, 10, 10);

// Legend
const LegendFontSizze = 15;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;
chart.legend.disabled = true;

var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 16;
markerTemplate.height = 16;

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 16;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label

var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 14;
valueAxis.renderer.labels.template.fill = "#ffffff";

function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercen = true;
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
series.fillOpacity = 0.7;
labelBullet.locationX = 0.7;

labelBullet.locationX = 0.5;
labelBullet.label.text = "";

//labelBullet.label.fill = am4core.color("#00FFFFFF");
labelBullet.label.fill = am4core.color("#000000");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 13;
labelBullet.locationX = 0.5;

} else if (name == "Under Construction"){
series.fill = am4core.color("#c2c2c2");
series.fillOpacity = 0.7;
labelBullet.locationX = 0.7;
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;
labelBullet.locationX = 0.5;

} else if (name == "Completed"){
series.fill = am4core.color("#0070ff");
series.fillOpacity = 0.7;
labelBullet.locationX = 0.7;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 20;
labelBullet.locationX = 0.5;

} else {
series.fill = am4core.color("#ff0000"); // delayed
series.fillOpacity = 0.7;
labelBullet.locationX = 0.7;
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;
labelBullet.locationX = 0.5;

}
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:12px]{name}: {valueX.value.formatNumber('#.')}"

// Click chart and filter, update maps
//const chartElement = document.getElementById("chartPanel");
///////////////////////
// Click chart and filter, update maps
const chartPanelDiv = document.getElementById("chartPanelDiv");

series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
//const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;

// D-Wall
if (selectedP == "Foundation") {
  selectedLayer = "Structural Foundation";
  stFoundationLayer.visible = true;
  stColumnLayer.visible = false;
  stFramingLayer.visible = false;

} else if (selectedP == "Column") {
  selectedLayer = "Structural Columns"
  stFoundationLayer.visible = false;
  stColumnLayer.visible = true;
  stFramingLayer.visible = false;

} else if (selectedP == "Framing") {
selectedLayer = "Structural Framing";
stFoundationLayer.visible = false;
stColumnLayer.visible = false;
stFramingLayer.visible = true;

} else {
selectedLayer = null;
}

// Listen to the click event on the map view and resets to default 
view.on("click", function() {
stFoundationLayer.visible = true;
stColumnLayer.visible = true;
stFramingLayer.visible = true;
});
////////////////////
// https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingSceneLayerView.html

} // End of filterByChart

//////////////////////////


} // End of createSeries function
createSeries("value1", "Completed");
createSeries("value2", "Under Construction");
createSeries("value3", "To be Constructed");
createSeries("value4", "Delayed");


} //updateChart

function combineAll(){
structuralColumns()
.then(structuralFraming)
.then(structuralFoundation)
.then(updateStructural);
}

}); // End of am4core.ready



//////////////////////////////////////////////////////////////////////////////////////
  // See-through-Ground        
  view.when(function() {
    // allow navigation above and below the ground
    map.ground.navigationConstraint = {
      type: "none"
    };
    // the webscene has no basemap, so set a surfaceColor on the ground
    map.ground.surfaceColor = "#fff";
    // to see through the ground, set the ground opacity to 0.4
    map.ground.opacity = 0.9; //
  });

          // See through Gound
          document
    .getElementById("opacityInput")
    .addEventListener("change", function(event) {
      //map.ground.opacity = event.target.checked ? 0.1 : 0.9;
      map.ground.opacity = event.target.checked ? 0.1 : 0.6;
    });

  view.ui.add("menu", "bottom-left");


///////////////////////////////////////////////////////
var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Architectural" ||
            item.title === "OpenStreetMap 3D Buildings"){
          item.visible = false
        }
      }
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

// Full screen logo
view.ui.add(
new Fullscreen({
view: view,
element: viewDiv
}),
"bottom-right"
);

});