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
  "esri/PopupTemplate",
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
  "esri/TimeExtent",
  "esri/widgets/Search",
  "esri/widgets/BasemapToggle"
], function(Basemap, Map, MapView, SceneView, FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal, PopupTemplate,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer,
            DatePicker, FeatureTable, Compass, TimeExtent, Search, BasemapToggle) {


// Basemap
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "8a9ef2a144e8423786f6139408ac3424"
      }
    })
  ]
});

// Add Map
var map = new Map({
  basemap: basemap, // "streets-night-vector"
  ground: "world-elevation" // ground: "no"
}); 
//map.ground.surfaceColor = "#FFFF";
//map.ground.opacity = 0.5;
         
// Add scene view
var view = new SceneView({
  map: map,
  container: "viewDiv",
  viewingMode: "local",
  camera: {
    position: {
      x: 120.75200,
      y: 14.90,
      z: 2500
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

// Basemap Toggle
const toggle = new BasemapToggle({
  view: view,
  nextBaseMap: "hybrid"
});
view.ui.add(toggle, "top-right");
      
// Error Abort function 
function catchAbortError(error) {
  if (error.name != "AbortError") {
    console.error(error);
  }
}

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

// Pier No Label
var pierNoLabelClass = new LabelClass({
  symbol: {
    type: "label-3d",// autocasts as new LabelSymbol3D()
    symbolLayers: [
      {
        type: "text", // autocasts as new TextSymbol3DLayer()
        material: {
          color: "white"
        },
        size: 10,
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
    callout: {
      type: "line", // autocasts as new LineCallout3D()
      color: "white",
      size: 0.7,
      border: {
        color: "grey"
      }
    }
  },
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: "$feature.PIER"
            //value: "{TEXTSTRING}"
  }
});

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

//*****************************//
//      Renderer Settings      //
//*****************************//
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

// Legend Color for Viaduct Layer
// 0.1: more transparent, 0.9: not transparent 
const colors = {
  1: [225, 225, 225, 0.1], // To be Constructed (white)
  2: [130, 130, 130, 0.5], // Under Construction
  3: [255, 0, 0, 0.8], // Delayed
  4: [0, 112, 255, 0.8], // Bored Pile
  5: [0, 112, 255, 0.8], // Pile cap
  6: [0, 112, 255, 0.8], // Pier
  7: [0, 112, 255, 0.8], // Pier head
  8: [0, 112, 255, 0.8], // Pre-cast
};

        
//*******************************//
// Import Layers                 //
//*******************************//
// Station Layer
var stationLayer = new SceneLayer({
  portalItem: {
    id: "87903f4d1859454a837d68e18a27ad4c",
    portal: {
      url: "https://gis.railway-sector.com/portal"
    }
  },
  labelingInfo: [labelClass],
  renderer: stationsRenderer,
  elevationInfo: {
    mode: "relative-to-ground"
  },
  definitionExpression: "Extension = 'SC'"
              //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
});
stationLayer.listMode = "hide";
map.add(stationLayer, 0);

// Centerline and chainage
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
  labelingInfo: [pierNoLabelClass],
  elevationInfo: {
    mode: "on-the-ground" //absolute-height, relative-to-ground
  },
  title: "Pier No",
  outFields: ["*"],
  popupEnabled: false
});

//chainageLayer.listMode = "hide";
map.add(PierNoLayer, 1);

// PROW //
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

// Viaduct Layer
var viaductLayer = new SceneLayer({
  portalItem: {
    id: "a17403d9c7de46b282437f30b66bfdca",
    portal: {
      url: "https://gis.railway-sector.com/portal"
    }
  },
  // popupTemplate: viadTemplate,
  elevationInfo: {
    mode: "absolute-height" //absolute-height, relative-to-ground
  },
  title: "Viaduct sample",
  outFields: ["*"],
  // when filter using date, example below. use this format
  //definitionExpression: "EndDate = date'2020-6-3'"
  /*
  popupTemplate: {
    title: "<h5>{Status1}</h5>",
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
            fieldName: "PierNumber",
            Label: "Pier No."
          }
        ]
      }
    ]
  }
  */      
});
viaductLayer.listMode = "hide";
map.add(viaductLayer);

// Symbology for Viaduct Layer
function renderViaductLayer() {
  // Obtain unique values from Status1
  const renderer = new UniqueValueRenderer({
    field: "Status1"
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
  viaductLayer.renderer = renderer;
}
renderViaductLayer();


//*******************************//
//      Progress Chart           //
//*******************************//
// Total progress //
function perCpProgress() {
var total_complete = {
  onStatisticField: "CASE WHEN Status1 = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
};

var total_obs = {
  onStatisticField: "Status1",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
};

var query = viaductLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;

viaductLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;

  const total_complete = stats.total_complete;
  const total_obs = stats.total_obs;
  document.getElementById("totalProgressDiv").innerHTML = ((total_complete/total_obs)*100).toFixed(1) + " %";
});
}
perCpProgress();

// Function for zooming to selected layers */
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

// Setup DOM
var headerDiv = document.getElementById("headerDiv");
var headerTitleDiv = document.getElementById("headerTitleDiv");
var applicationDiv = document.getElementById("applicationDiv");
const cpButtonElement = document.getElementById("cpButton");
const monthlyProgressChartDiv = document.getElementById("monthlyProgressChartDiv");
const chartElement = document.getElementById("chartPanel");


//*******************************************************************//
// CHART FUNCTION:
//
// All commands related to chart must fall inside am4core
//*******************************************************************//

 // Create a Bar chart to calculate % completion for each viaduct sample
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default label
if (document.getElementById("S-01").checked = true) {
    viaductLayer.definitionExpression = "CP = 'S-01'";
    PierNoLayer.definitionExpression = "CP = 'S-01'";
    zoomToLayer(viaductLayer);
    chartAllViaduct();
    perCpProgress();
}

// click event handler for contract packages
cpButtonElement.addEventListener("click", filterByTest);
function filterByTest(event) {
  const selectedID = event.target.id;

    viaductLayer.definitionExpression = "CP = '" + selectedID + "'";
    PierNoLayer.definitionExpression = "CP = '" + selectedID + "'";
    zoomToLayer(viaductLayer);
    chartAllViaduct();
    //updateChart();
    perCpProgress();

}


// CHART
// 1. Bored pile
function chartBoredPile() {
    var total_boredpile_incomp = {
        onStatisticField: "CASE WHEN (Type = 1 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_boredpile_incomp",
        statisticType: "sum"
    }

    var total_boredpile_comp = {
        onStatisticField: "CASE WHEN (Type = 1 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_boredpile_comp",
        statisticType: "sum"
    }

    var total_boredpile_delay = {
        onStatisticField: "CASE WHEN (Type = 1 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_boredpile_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_boredpile_incomp, total_boredpile_comp, total_boredpile_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const boredPile_incomp = stats.total_boredpile_incomp;
        const boredPile_comp = stats.total_boredpile_comp;
        const boredPile_delay = stats.total_boredpile_delay;

        var chart = am4core.create("chartBoredPileDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "Bored Pile",
            value1: boredPile_comp,
            value2: boredPile_delay,
            value3: boredPile_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (boredPile_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 1" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartBoredPileDiv

// 2. Pile Cap
function chartPileCap() {
    var total_pilecap_incomp = {
        onStatisticField: "CASE WHEN (Type = 2 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pilecap_incomp",
        statisticType: "sum"
    }

    var total_pilecap_comp = {
        onStatisticField: "CASE WHEN (Type = 2 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pilecap_comp",
        statisticType: "sum"
    }

    var total_pilecap_delay = {
        onStatisticField: "CASE WHEN (Type = 2 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pilecap_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_pilecap_incomp, total_pilecap_comp, total_pilecap_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const pileCap_incomp = stats.total_pilecap_incomp;
        const pileCap_comp = stats.total_pilecap_comp;
        const pileCap_delay = stats.total_pilecap_delay;

        var chart = am4core.create("chartPileCapDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "Pile Cap",
            value1: pileCap_comp,
            value2: pileCap_delay,
            value3: pileCap_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (pileCap_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 2" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartPileCap


// 3. Pier
function chartPier() {
    var total_pier_incomp = {
        onStatisticField: "CASE WHEN (Type = 3 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pier_incomp",
        statisticType: "sum"
    }

    var total_pier_comp = {
        onStatisticField: "CASE WHEN (Type = 3 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pier_comp",
        statisticType: "sum"
    }

    var total_pier_delay = {
        onStatisticField: "CASE WHEN (Type = 3 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pier_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_pier_incomp, total_pier_comp, total_pier_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const pier_incomp = stats.total_pier_incomp;
        const pier_comp = stats.total_pier_comp;
        const pier_delay = stats.total_pier_delay;

        var chart = am4core.create("chartPierDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "Pier",
            value1: pier_comp,
            value2: pier_delay,
            value3: pier_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (pier_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 3" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartPier


// 4. Pier Head
function chartPierHead() {
    var total_pierhead_incomp = {
        onStatisticField: "CASE WHEN (Type = 4 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pierhead_incomp",
        statisticType: "sum"
    }

    var total_pierhead_comp = {
        onStatisticField: "CASE WHEN (Type = 4 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pierhead_comp",
        statisticType: "sum"
    }

    var total_pierhead_delay = {
        onStatisticField: "CASE WHEN (Type = 4 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_pierhead_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_pierhead_incomp, total_pierhead_comp, total_pierhead_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const pierHead_incomp = stats.total_pierhead_incomp;
        const pierHead_comp = stats.total_pierhead_comp;
        const pierHead_delay = stats.total_pierhead_delay;

        var chart = am4core.create("chartPierHeadDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "Pier Head",
            value1: pierHead_comp,
            value2: pierHead_delay,
            value3: pierHead_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (pierHead_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 4" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartPierHeadDiv


// 5. Precast
function chartPrecast() {
    var total_precast_incomp = {
        onStatisticField: "CASE WHEN (Type = 5 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_precast_incomp",
        statisticType: "sum"
    }

    var total_precast_comp = {
        onStatisticField: "CASE WHEN (Type = 5 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_precast_comp",
        statisticType: "sum"
    }

    var total_precast_delay = {
        onStatisticField: "CASE WHEN (Type = 5 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_precast_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_precast_incomp, total_precast_comp, total_precast_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const preCast_incomp = stats.total_precast_incomp;
        const preCast_comp = stats.total_precast_comp;
        const preCast_delay = stats.total_precast_delay;

        var chart = am4core.create("chartPrecastDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "Precast",
            value1: preCast_comp,
            value2: preCast_delay,
            value3: preCast_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (preCast_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 5" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartPrecastDiv

// 7. At-Grade
function chartAtGrade() {
    var total_atgrade_incomp = {
        onStatisticField: "CASE WHEN (Type = 7 and Status1 = 1) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_atgrade_incomp",
        statisticType: "sum"
    }

    var total_atgrade_comp = {
        onStatisticField: "CASE WHEN (Type = 7 and Status1 = 4) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_atgrade_comp",
        statisticType: "sum"
    }

    var total_atgrade_delay = {
        onStatisticField: "CASE WHEN (Type = 7 and Status1 = 3) THEN 1 ELSE 0 END",
        outStatisticFieldName: "total_atgrade_delay",
        statisticType: "sum"
    }

    var query = viaductLayer.createQuery();
    query.outStatistics = [total_atgrade_incomp, total_atgrade_comp, total_atgrade_delay];
    query.returnGeometry = true;

    viaductLayer.queryFeatures(query).then(function(response) {
        var stats = response.features[0].attributes;
        const atGrade_incomp = stats.total_atgrade_incomp;
        const atGrade_comp = stats.total_atgrade_comp;
        const atGrade_delay = stats.total_atgrade_delay;

        var chart = am4core.create("chartAtGradeDiv", am4charts.XYChart);
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

    chart.hiddenState.properties.opacity = 0;
    chart.data = [
        {
            category: "At Grade",
            value1: atGrade_comp,
            value2: atGrade_delay,
            value3: atGrade_incomp,
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
    
        if (name === "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;

        } else if (name === "Delay"){
            series.fill = am4core.color("#FF0000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
    
        } else {
            // When completed value is zero, show no labels.
            if (atGrade_comp === 0) {
                labelBullet.label.text = "";
            } else {
                labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 15;
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
                selectedStatus = 1;
            } else if (selecteC === "Delay"){
                selectedStatus = 3;
            } else if (selectedC === "Complete") {
                selectedStatus = 4;
            } else {
                selectedLayer = null;
            }
            
            var highlight = null;
            // Update layerView based on viaduct components being selected
            view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                viaductLayerView.filter = {
                    where: "Type = 7" + " AND " +  "Status1 = " + selectedStatus
                    //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                };
                
                viaductLayerView.queryFeatures().then(function(results) {
                    const ggg = results.features;
                    const rowN = ggg.length;
                    
                    // Extract and obtain OBJECTID
                    let objID = [];
                    for (var i=0; i< rowN; i++) {
                        var obj = results.features[i].attributes.OBJECTID;
                        objID.push(obj);
                    }
                    
                    // Reset selection by clicking anywhere on the map
                    view.on("click", function() {
                        viaductLayerView.filter = null;
                        // highlight.remove();
                    });
                });
            }); // whenLayerView
        } // End of filterByChart
    } // end of createSeries function
    createSeries("value1", "Complete");
    createSeries("value2", "Delay");
    createSeries("value3", "Incomplete");
}); // end of queryFeatures
} // end of chartAtGradeDiv

// Compile function
function chartAllViaduct(){
    chartBoredPile();
    chartPileCap();
    chartPier();
    chartPierHead();
    chartPrecast();
    chartAtGrade();
}



// Time line bar charts //
// This stacked bar charnts show monthly construction progress by year and components
//************************************
// Define Year, Month, and Types

const pile_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const pile_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const pileC_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const pileC_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const pier_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const pier_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const pierH_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
const pierH_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};

const precast_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const precast_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

 
// OPTION 1:
  function summaryStats(){
    const pile_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    const pile_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    
    const pileC_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    const pileC_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    
    const pier_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    const pier_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

    const pierH_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
    const pierH_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};

    const precast_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
    const precast_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

 
    var total_count = {
    onStatisticField: "CASE WHEN Status1 = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_count",
    statisticType: "sum"
  }

  var query = viaductLayer.createQuery();
  query.where = "Year IS NOT NULL";
query.outStatistics = [total_count];
//query.orderByFields = ["Type Year Month"];
query.groupByFieldsForStatistics = ["Type", "Year", "Month"];

  return viaductLayer.queryFeatures(query).then(function(response) {
    stats = response.features;
    
    stats.forEach((result, index) => {
      const attributes = result.attributes;
      const TYPE = attributes.Type;
      const YEAR = attributes.Year;
      const MONTH = attributes.Month;
      const DATE = attributes.end_date;
      const VALUE = attributes.total_count;

      // Type = 1 (Bored Piles)
      if(TYPE === 1 && YEAR === 2021){
        pile_2021[MONTH].push(VALUE);

      } else if (TYPE === 1 && YEAR === 2022){
        pile_2022[MONTH].push(VALUE);

      } else if (TYPE === 2 && YEAR === 2021){
        pileC_2021[MONTH].push(VALUE);

      } else if (TYPE === 2 && YEAR === 2022){
        pileC_2022[MONTH].push(VALUE);
        
      } else if (TYPE === 3 && YEAR === 2021){
        pier_2021[MONTH].push(VALUE);
        
      } else if (TYPE === 3 && YEAR === 2022){
        pier_2022[MONTH].push(VALUE);
        
      } else if (TYPE === 4 && YEAR === 2021){
        pierH_2021[MONTH].push(VALUE);
        
      } else if (TYPE === 4 && YEAR === 2022){
        pierH_2022[MONTH].push(VALUE);
        
      } else if (TYPE === 5 && YEAR === 2021){
        precast_2021[MONTH].push(VALUE);
        
      } else if (TYPE === 5 && YEAR === 2022){
        precast_2022[MONTH].push(VALUE);
        
      }

    });
    return [pile_2021, pile_2022,
            pileC_2021, pileC_2022,
            pier_2021, pier_2022,
            pierH_2021, pierH_2022,
            precast_2021, precast_2022];
});
  }
//*************************************

function MonthlyProgressChart([pile_2021, pile_2022,
            pileC_2021, pileC_2022,
            pier_2021, pier_2022,
            pierH_2021, pierH_2022,
            precast_2021, precast_2022]){


var chart = am4core.create("monthlyProgressChartDiv", am4charts.XYChart);

// Add data
chart.data = [
  {
  date: new Date(2020, 12), // Jan. 2021
  value1: pile_2021[1],
  value2: pileC_2021[1],
  value3: pier_2021[1],
  value4: pierH_2021[1],
  value5: precast_2022[1]
},
{
  date: new Date(2021, 1),
  value1: pile_2021[2],
  value2: pileC_2021[2],
  value3: pier_2021[2],
  value4: pierH_2021[2],
  value5: precast_2021[2]
},
{
  date: new Date(2021, 2),
  value1: pile_2021[3],
  value2: pileC_2021[3],
  value3: pier_2021[3],
  value4: pierH_2021[3],
  value5: precast_2021[3]
},
{
  date: new Date(2021, 3),
  value1: pile_2021[4],
  value2: pileC_2021[4],
  value3: pier_2021[4],
  value4: pierH_2021[4],
  value5: precast_2021[4]
},
{
  date: new Date(2021, 4),
  value1: pile_2021[5],
  value2: pileC_2021[5],
  value3: pier_2021[5],
  value4: pierH_2021[5],
  value5: precast_2021[5]
},
{
  date: new Date(2021, 5),
  value1: pile_2021[6],
  value2: pileC_2021[6],
  value3: pier_2021[6],
  value4: pierH_2021[6],
  value5: precast_2021[6]
},
{
  date: new Date(2021, 6),
  value1: pile_2021[7],
  value2: pileC_2021[7],
  value3: pier_2021[7],
  value4: pierH_2021[7],
  value5: precast_2021[7]
},
{
  date: new Date(2021, 7),
  value1: pile_2021[8],
  value2: pileC_2021[8],
  value3: pier_2021[8],
  value4: pierH_2021[8],
  value5: precast_2021[8]
},
{
  date: new Date(2021, 8),
  value1: pile_2021[9],
  value2: pileC_2021[9],
  value3: pier_2021[9],
  value4: pierH_2021[9],
  value5: precast_2021[9]
},
{
  date: new Date(2021, 9),
  value1: pile_2021[10],
  value2: pileC_2021[10],
  value3: pier_2021[10],
  value4: pierH_2021[10],
  value5: precast_2021[10]
},
{
  date: new Date(2021, 10),
  value1: pile_2021[11],
  value2: pileC_2021[11],
  value3: pier_2021[11],
  value4: pierH_2021[11],
  value5: precast_2021[11]
},
{
  date: new Date(2021, 11),
  value1: pile_2021[12],
  value2: pileC_2021[12],
  value3: pier_2021[12],
  value4: pierH_2021[12],
  value5: precast_2021[12]
},
{
  date: new Date(2021, 12),
  value1: pile_2022[1],
  value2: pileC_2022[1],
  value3: pier_2022[1],
  value4: pierH_2022[1],
  value5: precast_2022[1]
},
{
  date: new Date(2022, 1),
  value1: pile_2022[2],
  value2: pileC_2022[2],
  value3: pier_2022[2],
  value4: pierH_2022[2],
  value5: precast_2022[2]
},
{
  date: new Date(2022, 2),
  value1: pile_2022[3],
  value2: pileC_2022[3],
  value3: pier_2022[3],
  value4: pierH_2022[3],
  value5: precast_2022[3]
},
{
  date: new Date(2022, 3),
  value1: pile_2022[4],
  value2: pileC_2022[4],
  value3: pier_2022[4],
  value4: pierH_2022[4],
  value5: precast_2022[4]
},
{
  date: new Date(2022, 4),
  value1: pile_2022[5],
  value2: pileC_2022[5],
  value3: pier_2022[5],
  value4: pierH_2022[5],
  value5: precast_2022[5]
},
{
  date: new Date(2022, 5),
  value1: pile_2022[6],
  value2: pileC_2022[6],
  value3: pier_2022[6],
  value4: pierH_2022[6],
  value5: precast_2022[6]
},
{
  date: new Date(2022, 6),
  value1: pile_2022[7],
  value2: pileC_2022[7],
  value3: pier_2022[7],
  value4: pierH_2022[7],
  value5: precast_2022[7]
}
];

//** Legend Properties
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

/// Alignment of Legend
chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

/// Position, Font Size, Fill
chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;

/// Legend marker size and shape and color
var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");
markerTemplate.width = 16;
markerTemplate.height = 16;

//** Category Axis Properties
var categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
categoryAxis.dataFields.category = "date";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 10;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.baseInterval = {
  "timeUnit": "month",
  "count": 1
};
var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.disabled = true;
valueAxis.min = 0;

//** Create series function for bar chart
function createSeries(field, name) {
  // Set up series
  var series = chart.series.push(new am4charts.ColumnSeries());
  series.name = name;
  series.dataFields.valueY = field;
  series.dataFields.dateX = "date";
  series.sequencedInterpolation = true;

  // Make it stacked
  series.stacked = true;
  
  // Configure columns
  series.columns.template.width = am4core.percent(60);
  series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
  
  // Add label
  /*
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueY}";
  labelBullet.locationY = 0.5;
  labelBullet.label.hideOversized = true;
  */
  return series;
}
createSeries("value1", "Pile");
createSeries("value2", "Pile Cap");
createSeries("value3", "Pier");
createSeries("value4", "Pier Head");
createSeries("value5", "Precast");
// Create scrollbars
//chart.scrollbarX = new am4core.Scrollbar();
//chart.scrollbarY = new am4core.Scrollbar();
}

// Monthly Progress Chart
var monthlyProgressInput = document.getElementById("monthlyProgressInput");
view.when(function() {
  monthlyProgressInput.addEventListener("change", function(event) {
    
    if (event.target.checked === true){
      summaryStats().then(MonthlyProgressChart);
      monthlyProgressChartDiv.style.display = 'block';
    } else if (event.target.checked === false) {
      monthlyProgressChartDiv.style.display = 'none';
    }
    
    //monthlyProgressChartDiv.removeAttr("style");
    //event.target.checked ? summaryStats().then(MonthlyProgressChart) : monthlyProgressChartDiv.style.display = 'none';
   
    });

});
// Progress Bar Charts //
// Pile

am4core.options.autoDispose = true;
}); // end am4core.ready()

// Editor: enable when necessary
/*
view.when(function () {
  view.popup.autoOpenEnabled = true; //disable popups
  // Create the Editor
  const editor = new Editor({
    view: view
  });
  // Add widget to top-right of the view
  view.ui.add(editor, "top-right");
});
*/

// Monthly Progress Chart 
const progressExpand = new Expand({
  view: view,
  content: document.getElementById("monthlyProgressChartDiv"),
  expandIconClass: "esri-icon-filter"
});

// LayerList and Add legend to the LayerList
var layerList = new LayerList({
  view: view,
  listItemCreatedFunction: function(event) {
    const item = event.item;
    if (item.title === "Chainage" || item.title === "OpenStreetMap 3D Buildings"){
      item.visible = false
    }
  }
});

var layerListExpand = new Expand ({
    view: view,
    content: layerList,
    expandIconClass: "esri-icon-visible",
    group: "top-right"
});
view.ui.add(layerListExpand, {
    position: "top-right"
});


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
    },
    {
      layer: PierNoLayer,
      title: "Pier No."
    },
    {
      layer: osm3D,
      title: "OpenStreetMap 3D Buildings"
    }
  ]
});
var legendExpand = new Expand({
    view: view,
    content: legend,
    expandIconClass: "esri-icon-legend"
});
view.ui.add(legendExpand, {
    position: "top-right"
});

var layerListExpand = new Expand ({
  view: view,
  content: layerList,
  expandIconClass: "esri-icon-visible"
});
view.ui.add(layerListExpand, {
  position: "top-left"
});

// Empty top-left widget
view.ui.empty("top-left");

// See-through-Ground
view.when(function() {
  // allow navigation above and below the ground
  map.ground.navigationConstraint = {
    type: "none"
  };
  // the webscene has no basemap, so set a surfaceColor on the ground
  map.ground.surfaceColor = "#fff";
          
  // to see through the ground, set the ground opacity to 0.4
  map.ground.opacity = 0.9;
});
          
document.getElementById("opacityInput")
        .addEventListener("change", function(event) {
          map.ground.opacity = event.target.checked ? 0.1 : 0.6;
        });


//Search Widget 
var searchWidget = new Search({
  view: view,
  locationEnabled: false,
  allPlaceholder: "Chainage or Utility ID",
  includeDefaultSources: false,
  sources: [
    {
      layer: chainageLayer,
      searchFields: ["KmSpot"],
      displayField: "KmSpot",
      exactMatch: false,
      outFields: ["KmSpot"],
      name: "Main KM",
      placeholder: "example: 80+400"
  },
  {
      layer: viaductLayer,
      searchFields: ["PierNumber"],
      displayField: "PierNumber",
      exactMatch: false,
      outFields: ["PierNumber"],
      name: "Pier No.",
      placeholder: "example: PLK-01"
  },
  {
      layer: viaductLayer,
      searchFields: ["OBJECTID"],
      displayField: "OBJECTID",
      exactMatch: false,
      outFields: ["OBJECTID"],
      name: "OBJECTID",
      placeholder: "example: 12617"
  }
]
});

const searchExpand = new Expand({
  view: view,
  content: searchWidget,
  expandIconClass: "esri-icon-search"
});
view.ui.add(searchExpand, {
  position: "top-right"
});

searchExpand.watch("expanded", function() {
  if(!searchExpand.expanded) {
    searchWidget.searchTerm = null;
  }
});

// Full screen widget
view.ui.add(
  new Fullscreen({
    view: view,
    element: viewDiv
    //element: viewDiv // if you change element to viewDiv, only viewDiv panel is fully expanded
    // this is good for demonstration, as this removes header and chart panels.
  }),
  "top-right"
);

// Compass
var compassWidget = new Compass({
  view: view
});
view.ui.add(compassWidget, "top-right");
});