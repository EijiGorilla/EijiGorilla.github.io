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
  "esri/widgets/Search"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground, Search) {

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
              x: 120.565000,
              y: 15.210,
              z: 750
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
// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KmSpot"},
symbol: {
type: "text",
color: [85, 255, 0],
size: 25
}
});

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
  id: "c15d7cdc13cc4d64875e7a772cb41d71",
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

// Centerline and chainage
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

// Station
var stationLayer = new SceneLayer({
portalItem: {
          id: "207cb34b8a324b40985b5805862c4b29",
          portal: {
            url: "https://gis.railway-sector.com/portal"
          }
      },
       labelingInfo: [labelClass],
       renderer: stationsRenderer,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           }
       //definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer, 0);


// Station structures
  var structureLayer = new SceneLayer({ //structureLayer
    portalItem: {
      id: "657134597b0f4f2095ce3485d2ea05cf",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    popupTemplate: {
title: "<h5>{Status}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "StructureType",
       label: "Structure Type"
     },
     {
       fieldName: "StructureLevel",
       label: "Structure Level"
     },
     {
       fieldName: "Type",
       label: "Type of Structure"
     },
     {
       fieldName: "SubType",
       label: "Subtype of Structure",
     }
   ]
 }
]
},
      elevationInfo: {
          mode: "absolute-height",
          offset: 0
      },
      title: "Station Structure"
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
  });
  structureLayer.listMode = "hide";
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
function perBuildingProgress() {
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
var query = structureLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_complete = stats.total_complete;
const total_obs = stats.total_obs;
document.getElementById("totalProgressDiv").innerHTML = ((total_complete/total_obs)*100).toFixed(1) + " %";
});
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

// Default selection = 'None'
structureLayer.definitionExpression = "Name = 'LRS'";
perBuildingProgress();
chartStFoundation();
chartStColumn();
chartStFraming();
chartRoofs();
chartFloors();
chartWalls();
chartColumns();
chartOthers();
zoomToLayer(structureLayer);


// click the label and display selected bulidng
view.when(function() {
view.on("click", function(event) {
view.hitTest(event).then(function(response) {
const feature = response.results[0].graphics.attributes.Name;
  structureLayer.definitionExpression = "Name = '" + feature + "'";
  zoomToLayer(structureLayer);
  perBuildingProgress();
  chartStFoundation();
  chartStColumn();
  chartStFraming();
  chartRoofs();
  chartFloors();
  chartWalls();
  chartColumns();
  chartOthers();
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

var query = structureLayer.createQuery();
query.outStatistics = [total_stFoundation_tobec, total_stFoundation_underc, total_stFoundation_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 1;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 1;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 1;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  //arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2

      }); // end of view.when

      // Query view using compiled arrays
      chartLayerView.filter = {
        where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
              //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
      };

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

var query = structureLayer.createQuery();
query.outStatistics = [total_stColumn_tobec, total_stColumn_underc, total_stColumn_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 2;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 2;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 2;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
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

var query = structureLayer.createQuery();
query.outStatistics = [total_stFraming_tobec, total_stFraming_underc, total_stFraming_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 3;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 3;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 3;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
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

var query = structureLayer.createQuery();
query.outStatistics = [total_roofs_tobec, total_roofs_underc, total_roofs_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 4;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 4;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 4;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
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

var query = structureLayer.createQuery();
query.outStatistics = [total_floors_tobec, total_floors_underc, total_floors_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 5;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 5;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 5;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
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

var query = structureLayer.createQuery();
query.outStatistics = [total_walls_tobec, total_walls_underc, total_walls_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 6;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 6;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 6;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
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

var query = structureLayer.createQuery();
query.outStatistics = [total_columns_tobec, total_columns_underc, total_columns_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 7;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 7;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 7;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures




} // End of Chart


// 8. Others
function chartOthers() {
var total_others_tobec = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_others_tobec",
statisticType: "sum"
};

var total_others_underc = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_others_underc",
statisticType: "sum"  
};

var total_others_comp = {
onStatisticField: "CASE WHEN (Type = 8 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_others_comp",
statisticType: "sum"  
};

var query = structureLayer.createQuery();
query.outStatistics = [total_others_tobec, total_others_underc, total_others_comp];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const others_tobec = stats.total_others_tobec;
const others_underc = stats.total_others_underc;
const others_comp = stats.total_others_comp;

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
      value1: others_comp,
      value2: others_underc,
      value3: others_tobec,
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
      series.columns.template.stroke = am4core.color("#ffffff"); //#00B0F0
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
        if (others_comp === 0) {
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
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 8;
              selectedStatus = 1;

          } else if (selectedC === "Under Construction"){
              selectedLayer = 8;
              selectedStatus = 2;

          } else if (selectedC === "Complete") {
              selectedLayer = 8;
              selectedStatus = 4;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(structureLayer).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
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
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(structureLayer).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures




} // End of Chart


}); // End of am4Core.ready()


///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
  // On-off feature layer tab
  var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage"){
          item.visible = false
        }
      }
    });
/*
    view.ui.add(layerList, {
      position: "bottom-left"
    });
*/

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
},
{
layer: chainageLayer,
title: "chainage"
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


// Layer List
var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "top-right"
  });
  view.ui.add(layerListExpand, {
      position: "top-right"
  });

  view.ui.empty("top-left");

  // Compass
  var compass = new Compass({
    view: view});
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

})