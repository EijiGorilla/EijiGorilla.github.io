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
  "esri/tasks/GeometryService",
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
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            GeometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground,
            GraphicsLayer, Search) {

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
        basemap: basemap, //"gray-vector", // "streets-night-vector", basemap
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




//*******************************//
// Import Layers                 //
//*******************************//
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
  labelsVisible: false,
});


// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "ec9dac0c16af4797bb917a0babc735e9",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
  title: "Status of Structure",
  outFields: ["*"]
});


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
  title: "Status for Relocation (ISF)"
});
//reloISFLayer.listMode = "hide";

// ISF
var isfLayer = new FeatureLayer ({
portalItem: {
  id: "a2e32eb82db84b3a8006e1c1e2cd7874",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
},
title: "ISF",
outFields: ["*"]
});

// Tree Cutting
var treeLayer = new FeatureLayer ({
portalItem: {
id: "30cdb9f9775146308a05dd17cfbfa87a",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
elevationInfo: {
      mode: "on-the-ground"
    },
outFields: ["*"],
title: "Status of Tree Cutting",

});


// Utility Relocation (Point)
var utilPointLayer = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Utility Point",
outFields: ["*"],
elevationInfo: {
      mode: "on-the-ground"
    }
});

// Utility Relocation (Line)
var utilLineLayer = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
title: "Utility Line",
elevationInfo: {
mode: "relative-to-scene",
featureExpressionInfo: {
 expression: "$feature.height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],

});


/////////////////////////////////////////////////////////////////////
var applicationDiv = document.getElementById("applicationDiv");

var headerDiv = document.getElementById("headerDiv");
var headerTitleDiv = document.getElementById("headerTitleDiv");

// Land, structure, and ISF
var landChartDiv = document.getElementById("landChartDiv");
var structureChartDiv = document.getElementById("structureChartDiv");
var isfChartDiv = document.getElementById("isfChartDiv");

// Tree cutting and tree compensation
var treeCuttingChartDiv = document.getElementById("treeCuttingChartDiv");
var treeCompenChartDiv = document.getElementById("treeCompenChartDiv");

// Utitlity Relocation
var utilityPointChartDiv = document.getElementById("utilityPointChartDiv");
var utilityLineChartDiv = document.getElementById("utilityLineChartDiv");


// Thousand separators function
function thousands_separators(num)
{
var num_parts = num.toString().split(".");
num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return num_parts.join(".");
}

////////// Chart Begins //////////////////
am4core.ready(function() {

// Bottom Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

// Gauge Needle (hand) length
const NEEDLE_LENGTH = am4core.percent(70);


// Themes begin
am4core.useTheme(am4themes_animated);

// Calculate Statistcis
// Land, Structure, and ISF

//////////////////////////////////////////

//////////////////////////////////////////

/// 1. Land
function laFigureLot() {
var total_number_lot = {
onStatisticField: "StatusNVS3",
outStatisticFieldName: "total_number_lot",
statisticType: "count"
};

var total_handover_lot = {
onStatisticField: "CASE WHEN HandedOver = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_handover_lot",
statisticType: "sum"
};


var query = lotLayer.createQuery();
query.outStatistics = [total_number_lot, total_handover_lot];
query.returnGeometry = true;

lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalNumber = stats.total_number_lot;
const handedOver = stats.total_handover_lot;
const LOT_HANDOVER_PERC = (handedOver/totalNumber)*100;

// create chart
var chart = am4core.create("landChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = LOT_HANDOVER_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = LOT_HANDOVER_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = LOT_HANDOVER_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = LOT_HANDOVER_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]LAND";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]HANDED-OVER";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;

});
}
laFigureLot();

/// 2. Structure
function laFigureStruc() {
var total_number_struc = {
onStatisticField: "Id",
outStatisticFieldName: "total_number_struc",
statisticType: "count"
};

var total_handover_struc = {
onStatisticField: "CASE WHEN Demolished_ = 'Demolished' THEN 1 ELSE 0 END",
outStatisticFieldName: "total_handover_struc",
statisticType: "sum"
};


var query = structureLayer.createQuery();
query.outStatistics = [total_number_struc, total_handover_struc];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalnumberStruc = stats.total_number_struc;
const handoverStruc = stats.total_handover_struc;

const STRUC_DISMANTLED_PERC = (handoverStruc/totalnumberStruc)*100;

// create chart
var chart = am4core.create("structureChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = STRUC_DISMANTLED_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = STRUC_DISMANTLED_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = STRUC_DISMANTLED_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = STRUC_DISMANTLED_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]STRUCTURE";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]DISMANTLED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;



});

}
laFigureStruc();

/// 3. ISF
function IsfFigure() {
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
const ISF_RELOCATED_PERC = (ISF_RELO/ISF_TOTAL)*100;

// create chart
var chart = am4core.create("isfChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = ISF_RELOCATED_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = ISF_RELOCATED_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = ISF_RELOCATED_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = ISF_RELOCATED_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]ISF";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]RELOCATED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;


});
}
IsfFigure();


// Tree

/// 1. Tree Cutting
function treeCuttingFigure() {
var total_number_tree = {
onStatisticField: "ID",
outStatisticFieldName: "total_number_tree",
statisticType: "count"
};

var total_cutearthballed_tree = {
onStatisticField: "CASE WHEN (TCP_Proces = 5 or TCP_Proces = 6) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cutearthballed_tree",
statisticType: "sum"
};

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree, total_cutearthballed_tree];
query.returnGeometry = true;

treeLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalnumberTree = stats.total_number_tree;
const cutearthballedTree = stats.total_cutearthballed_tree;
const TREE_CUT_PERC = (cutearthballedTree/totalnumberTree)*100;

// create chart
var chart = am4core.create("treeCuttingChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = TREE_CUT_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = TREE_CUT_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = TREE_CUT_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = TREE_CUT_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]TREE CUTTING";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]CUT/EARTHBALLED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;

});
}
treeCuttingFigure();

/// 2. Tree Compensation
function treeCompensationFigure() {
var total_number_tree = {
onStatisticField: "CASE WHEN Tree_Compe <= 7 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_number_tree",
statisticType: "sum"
};

var total_compensated_tree = {
onStatisticField: "CASE WHEN Tree_Compe = 5 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_compensated_tree",
statisticType: "sum"
};

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree, total_compensated_tree];
query.returnGeometry = true;

treeLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalnumberTree = stats.total_number_tree;
const compensatedTree = stats.total_compensated_tree;

const TREE_COMPENSATED_PERC = (compensatedTree/totalnumberTree)*100;

// create chart
var chart = am4core.create("treeCompenChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = TREE_COMPENSATED_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = TREE_COMPENSATED_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = TREE_COMPENSATED_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = TREE_COMPENSATED_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]TREE COMPENSATION";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]COMPENSATED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;

});
}
treeCompensationFigure();


// Utility Relocation

/// 1. Utility Point
function utilityPointFigure() {
var total_number_utilpoint = {
onStatisticField: "LAYER",
outStatisticFieldName: "total_number_utilpoint",
statisticType: "count"
};
var total_completed_utilpoint = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_completed_utilpoint",
statisticType: "sum"
};

var query = utilPointLayer.createQuery();
query.outStatistics = [total_number_utilpoint, total_completed_utilpoint];
query.returnGeometry = true;

utilPointLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalnumber = stats.total_number_utilpoint;
const totalcomplete = stats.total_completed_utilpoint;

const UTIL_PT_COMPLETED_PERC = (totalcomplete/totalnumber)*100;

// create chart
var chart = am4core.create("utilityPointChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = UTIL_PT_COMPLETED_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = UTIL_PT_COMPLETED_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = UTIL_PT_COMPLETED_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = NEEDLE_LENGTH;
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = UTIL_PT_COMPLETED_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]UTILITY POINT";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]COMPLETED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;

});
}
utilityPointFigure();


/// 2. Utility Line

function utilityLineFigure() {
var total_number_utilline = {
onStatisticField: "LAYER",
outStatisticFieldName: "total_number_utilline",
statisticType: "count"
};
var total_completed_utilline = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_completed_utilline",
statisticType: "sum"
};

var query = utilLineLayer.createQuery();
query.outStatistics = [total_number_utilline, total_completed_utilline];
query.returnGeometry = true;

utilLineLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalnumber = stats.total_number_utilline;
const totalcomplete = stats.total_completed_utilline;

const UTIL_LINE_COMPLETED_PERC = (totalcomplete/totalnumber)*100;

// create chart
var chart = am4core.create("utilityLineChartDiv", am4charts.GaugeChart);
chart.innerRadius = am4core.percent(82);
chart.responsive.enabled = true;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.ticks.template.disabled = false
axis.renderer.ticks.template.strokeOpacity = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = 40;
axis.renderer.labels.template.adapter.add("text", function(text) {
return text + "";
})

/**
* Axis for ranges
*/

var colorSet = new am4core.ColorSet();

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = 0;
axis2.max = 100;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true;

var range0 = axis2.axisRanges.create();
range0.value = 0;
range0.endValue = UTIL_LINE_COMPLETED_PERC;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = am4core.color("#00C3FF");

var range1 = axis2.axisRanges.create();
range1.value = UTIL_LINE_COMPLETED_PERC;
range1.endValue = 100;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = am4core.color("#C5C5C5");
range1.axisFill.fillOpacity = 0.3;

/**
* Label
*/
var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = 45;
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";

const LABEL_TEXT = UTIL_LINE_COMPLETED_PERC.toFixed(0).toString() + "%";
label.text = LABEL_TEXT;
label.fill =  am4core.color("#00C3FF");


/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(70);
hand.startWidth = 10;
hand.pin.disabled = true;
hand.value = UTIL_LINE_COMPLETED_PERC;
hand.fill = am4core.color("#000000");
hand.fillOpacity = 0.5;


// Add chart title
var title = chart.titles.create();
title.text = "[bold]UTILITY LINE";
title.fontSize = 20;
title.align = "center";
title.marginBottom = -15;
title.marginTop = 10;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]COMPLETED";
label.fontSize = 15;
label.align = "center";
label.fill = BOTTOM_LABEL_COL;
label.marginTop = -10;
label.marginBottom = 0;


});
}
utilityLineFigure();

}); // end am4core.ready() 


});