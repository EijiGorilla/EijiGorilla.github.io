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




//*******************************//
// Import Layers                 //
//*******************************//
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
});


// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
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



// Tree Cutting
var treeLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
elevationInfo: {
      mode: "on-the-ground"
    },
outFields: ["*"],
title: "Status of Tree Cutting",

});


// Utility Relocation (Point)
var utilPointLayer = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "Utility Point",
outFields: ["*"],
elevationInfo: {
      mode: "on-the-ground"
    }
});

// Utility Relocation (Line)
var utilLineLayer = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
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

var informationDiv = document.getElementById("informationDiv");

//informationDiv.innerHTML =  "<br>" + "<b>" + "Note:" + "</b>" + "<br>" + "<br>" + "* Each gauge shows percent progress of each CP in the sliced chart.";
informationDiv.innerHTML =  `<b>Note:</b><br>
                             <p>1. The sliced areas in gauges show percent progress of CPs.</p>
                             2. <b>Click</b> the title of gauges to access individual web mapping applications for more detailed information.`

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

// Legend
// 
function legendCP() {
  var total_n01_lot = {
  onStatisticField: "CASE WHEN CP = 'N-01' THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_n01_lot",
  statisticType: "sum"
  };
  
  var total_n02_lot = {
  onStatisticField: "CASE WHEN CP = 'N-02' THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_n02_lot",
  statisticType: "sum"
  };
  
  var total_n03_lot = {
  onStatisticField: "CASE WHEN CP = 'N-03' THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_n03_lot",
  statisticType: "sum"
  };
  
  var total_n04_lot = {
  onStatisticField: "CASE WHEN CP = 'N-04' THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_n04_lot",
  statisticType: "sum"
  };
  
  var total_n05_lot = {
  onStatisticField: "CASE WHEN CP = 'N-05' THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_n05_lot",
  statisticType: "sum"
  };
  
  
  var query = lotLayer.createQuery();
  query.outStatistics = [total_n01_lot,
                         total_n02_lot, 
                         total_n03_lot, 
                         total_n04_lot,
                         total_n05_lot];
  query.returnGeometry = true;
  
  return lotLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const n01 = stats.total_n01_lot;
  const n02 = stats.total_n02_lot;
  const n03 = stats.total_n03_lot;
  const n04 = stats.total_n04_lot;
  const n05 = stats.total_n05_lot;
  
  var chart = am4core.create("legendChartDiv", am4charts.PieChart);
  
  
  // Add data
  chart.data = [
  {
    "CP": "CP N-01 (%)",
    "status": n01,
    "color": am4core.color("#ffa500")
  },
  {
    "CP": "CP N-02 (%)",
    "status": n02,
    "color": am4core.color("#00ff00")
  },
  {
    "CP": "CP N-03 (%)",
    "status": n03,
    "color": am4core.color("#00c5ff")   
  },
  {
    "CP": "CP N-04 (%)",
    "status": n04,
    "color": am4core.color("#FFFF00") 
  },
  {
    "CP": "CP N-05 (%)",
    "status": n05,
    "color": am4core.color("#BF40BF")
  }
  ];
  
  // Set inner radius
  chart.innerRadius = am4core.percent(0);
  chart.radius = am4core.percent(0);
  // Add and configure Series
  
  function createSlices(field, status){
  var pieSeries = chart.series.push(new am4charts.PieSeries());
  pieSeries.dataFields.value = field;
  pieSeries.dataFields.category = status;
  pieSeries.disabled = true;
  pieSeries.slices.template.propertyFields.fill = "color";
  pieSeries.slices.template.stroke = am4core.color("#fff");
  pieSeries.slices.template.strokeWidth = 0;
  pieSeries.slices.template.strokeOpacity = 1;
  
  pieSeries.slices.template
  // change the cursor on hover to make it apparent the object can be interacted with
  .cursorOverStyle = [
  {
  "property": "cursor",
  "value": "pointer"
  }
  ];
  
  
  // Add a legend
  const LegendFontSizze = "1em";
  chart.legend = new am4charts.Legend();
  
  chart.legend.valueLabels.template.align = "right"
  chart.legend.valueLabels.template.textAlign = "end";  

  
  //chart.legend.position = "bottom";
  chart.legend.labels.template.fontSize = LegendFontSizze;
  chart.legend.labels.template.fill = "#ffffff";
  chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 

  //pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
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
  //var title = chart.titles.create();
  //title.text = "Land"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
  //title.fontSize = 20;
  //title.fontWeight = "bold";
  //title.fill = "#ffffff";
  //title.marginTop = 5;
  
  var marker = chart.legend.markers.template.children.getIndex(0);
  var markerTemplate = chart.legend.markers.template;
  //marker.cornerRadius(12, 12, 12, 12); round legend marker
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

  
  } // End of createSlices function
  
  createSlices("status", "CP");
  
  }); // End of queryFeatures
  } // End of updateChartLot()
  legendCP();
  
// Calculate Statistcis
// Land, Structure, and ISF

//////////////////////////////////////////

//////////////////////////////////////////

/// 1. Land
function lotTotalArea() {
var total_affected_area = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_affected_area",
statisticType: "sum"
}

var total_handover_area = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_handover_area",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_affected_area, total_handover_area];

return lotLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalAffected = stats.total_affected_area;
const totalHandedOver = stats.total_handover_area;
//const LOT_HANDOVER_PERC = (handedOver/affected)*100;
return totalAffected;
});
}


function lotSummary(totalAffected) {
var total_affected_area = {
onStatisticField: "AffectedArea",
outStatisticFieldName: "total_affected_area",
statisticType: "sum"
}

var total_handover_area = {
onStatisticField: "HandOverArea",
outStatisticFieldName: "total_handover_area",
statisticType: "sum"
};

var query = lotLayer.createQuery();
query.outStatistics = [total_affected_area, total_handover_area];
query.returnGeometry = true;
query.groupByFieldsForStatistics = ["CP"];

var cpN01 = [];
var cpN01_a = [];

var cpN02 = [];
var cpN02_a = [];

var cpN03 = [];
var cpN03_a = [];

var cpN04 = [];
var cpN04_a = [];

var cpN05 = [];
var cpN05_a = [];

return lotLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const affected = attributes.total_affected_area;
const handedOver = attributes.total_handover_area;
const LOT_HANDOVER_PERC = (handedOver/totalAffected)*100;
const lot_handedover = (handedOver/affected)*100;

if (cpPackage === 'N-01') {
  cpN01.push(LOT_HANDOVER_PERC);
  cpN01_a.push(lot_handedover);

} else if (cpPackage === 'N-02') {
  cpN02.push(LOT_HANDOVER_PERC);
  cpN02_a.push(lot_handedover);

} else if (cpPackage === 'N-03') {
  cpN03.push(LOT_HANDOVER_PERC);
  cpN03_a.push(lot_handedover);

} else if (cpPackage === 'N-04') {
  cpN04.push(LOT_HANDOVER_PERC);
  cpN04_a.push(lot_handedover);

} else if (cpPackage === 'N-05') {
  cpN05.push(LOT_HANDOVER_PERC);
  cpN05_a.push(lot_handedover);
}


});
return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});

} // End of lotSummary function

var axis1TickColor = "#C5C5C5";

function laFigureLot([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a);
var n02 = Number(cpN02_a);
var n03 = Number(cpN03_a);
var n04 = Number(cpN04_a);
var n05 = Number(cpN05_a);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01.toFixed(0),
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02.toFixed(0),
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03.toFixed(0),
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04.toFixed(0),
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05.toFixed(0),
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("landChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//'<a href="https://google.com"}">More info</a>'

//title.text = "[bold]LAND";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/N2_Land_Structure2/index2.html" target="_blank">LAND</a>';
title.fontSize = "1.7em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

//var sourceLabel = chart.createChild(am4core.Label);
//sourceLabel.html = '<a href="https://google.com">Test</a>';

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]HANDED-OVER AREA";
//label.html = '<a href="https://google.com">HANDED-OVER AREA</a>';
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7;



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1; // default 0.8 fill-color of 
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)

}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%";
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}
lotTotalArea()
.then(lotSummary)
.then(laFigureLot);

/// 2. Structure
function strucTotalArea() {
var total_number_struc = {
onStatisticField: "StrucID",
outStatisticFieldName: "total_number_struc",
statisticType: "count"
};

var query = structureLayer.createQuery();
query.outStatistics = [total_number_struc];

return structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalNumberStruc = stats.total_number_struc;
//const LOT_HANDOVER_PERC = (handedOver/affected)*100;
return totalNumberStruc;
});
}


function strucSummary(totalNumberStruc) {
  var total_number_struc = {
    onStatisticField: "StrucID",
    outStatisticFieldName: "total_number_struc",
    statisticType: "count"
  }

var total_dismantle_struc = {
  onStatisticField: "CASE WHEN StatusStruc = 1 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_dismantle_struc",
  statisticType: "sum"
}

var query = structureLayer.createQuery();
query.outStatistics = [total_number_struc, total_dismantle_struc];
query.returnGeometry = true;
query.groupByFieldsForStatistics = ["CP"];

var cpN01 = [];
var cpN01_a = [];

var cpN02 = [];
var cpN02_a = [];

var cpN03 = [];
var cpN03_a = [];

var cpN04 = [];
var cpN04_a = [];

var cpN05 = [];
var cpN05_a = [];

return structureLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const dismantled = attributes.total_dismantle_struc;
const totalN = attributes.total_number_struc;

const STRUC_DISMANTLE_PERC = (dismantled/totalNumberStruc)*100;
const dismantled_struc = (dismantled/totalN)*100;

if (cpPackage === 'N-01') {
  cpN01.push(STRUC_DISMANTLE_PERC);
  cpN01_a.push(dismantled_struc);

} else if (cpPackage === 'N-02') {
  cpN02.push(STRUC_DISMANTLE_PERC);
  cpN02_a.push(dismantled_struc);

} else if (cpPackage === 'N-03') {
  cpN03.push(STRUC_DISMANTLE_PERC);
  cpN03_a.push(dismantled_struc);

} else if (cpPackage === 'N-04') {
  cpN04.push(STRUC_DISMANTLE_PERC);
  cpN04_a.push(dismantled_struc);

} else if (cpPackage === 'N-05') {
  cpN05.push(STRUC_DISMANTLE_PERC);
  cpN05_a.push(dismantled_struc);
}
});
return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});

} // End of strucSummary function

function laFigureStruc([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a).toFixed(0);
var n02 = Number(cpN02_a).toFixed(0);
var n03 = Number(cpN03_a).toFixed(0);
var n04 = Number(cpN04_a).toFixed(0);
var n05 = Number(cpN05_a).toFixed(0);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01,
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02,
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03,
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04,
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05,
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("structureChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//title.text = "[bold]EXISTING STRUCTURE";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/N2_Land_Structure2/index2.html" target="_blank">EXISTING STRUCTURE</a>';
title.fontSize = "2em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]DISMANTLED";
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7; // 0.3 // category labels: N-01, N-02,....



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1;
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)
}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%";
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}
strucTotalArea()
.then(strucSummary)
.then(laFigureStruc);



/// 3. ISF
function isfTotalArea() {
var total_number_isf = {
onStatisticField: "StrucID",
outStatisticFieldName: "total_number_isf",
statisticType: "count"
};

var query = reloISFLayer.createQuery();
query.outStatistics = [total_number_isf];

return reloISFLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const totalNumberISF = stats.total_number_isf;
//const LOT_HANDOVER_PERC = (handedOver/affected)*100;
return totalNumberISF;
});
}


function isfSummary(totalNumberISF) {
  var total_number_isf = {
    onStatisticField: "StrucID",
    outStatisticFieldName: "total_number_isf",
    statisticType: "count"
  }

var total_relocation_isf = {
  onStatisticField: "CASE WHEN StatusRC = 1 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_relocation_isf",
  statisticType: "sum"
}

var query = reloISFLayer.createQuery();
query.outStatistics = [total_number_isf, total_relocation_isf];
query.returnGeometry = true;
query.groupByFieldsForStatistics = ["CP"];

var cpN01 = [];
var cpN01_a = [];

var cpN02 = [];
var cpN02_a = [];

var cpN03 = [];
var cpN03_a = [];

var cpN04 = [];
var cpN04_a = [];

var cpN05 = [];
var cpN05_a = [];

return reloISFLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const relocated = attributes.total_relocation_isf;
const totalISF = attributes.total_number_isf;
const ISF_RELOCATED_PERC = (relocated/totalNumberISF)*100;
const isf_relocated = (relocated/totalISF)*100;


if (cpPackage === 'N-01') {
  cpN01.push(ISF_RELOCATED_PERC);
  cpN01_a.push(isf_relocated);

} else if (cpPackage === 'N-02') {
  cpN02.push(ISF_RELOCATED_PERC);
  cpN02_a.push(isf_relocated);

} else if (cpPackage === 'N-03') {
  cpN03.push(ISF_RELOCATED_PERC);
  cpN03_a.push(isf_relocated);

} else if (cpPackage === 'N-04') {
  cpN04.push(ISF_RELOCATED_PERC);
  cpN04_a.push(isf_relocated);

} else if (cpPackage === 'N-05') {
  cpN05.push(ISF_RELOCATED_PERC);
  cpN05_a.push(isf_relocated);
}
});
return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});

} // End of isfSummary function

function laFigureIsf([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a);
var n02 = Number(cpN02_a);
var n03 = Number(cpN03_a);
var n04 = Number(cpN04_a);
var n05 = Number(cpN05_a);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01.toFixed(0),
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02.toFixed(0),
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03.toFixed(0),
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04.toFixed(0),
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05.toFixed(0),
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("isfChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//title.text = "[bold]INFORMAL SETTLERS";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/N2_Land_Structure2/index2.html" target="_blank">INFORMAL SETTLERS</a>';
title.fontSize = "2em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]RELOCATED";
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7;



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1;
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)
}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%";
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}
isfTotalArea()
.then(isfSummary)
.then(laFigureIsf);


// Tree

/// 1. Tree Cutting
function treeCuttingTotal() {
var total_number_tree = {
onStatisticField: "CommonName",
outStatisticFieldName: "total_number_tree",
statisticType: "count"
};

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree];

return treeLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const totalNumber = stats.total_number_tree;
//const LOT_HANDOVER_PERC = (handedOver/affected)*100;
return totalNumber;
});
}


function treeCutSummary(totalNumber) {
  var total_number_tree = {
    onStatisticField: "CommonName",
    outStatisticFieldName: "total_number_tree",
    statisticType: "count"
    };

var total_cutearthballed_tree = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cutearthballed_tree",
statisticType: "sum"
}

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree, total_cutearthballed_tree];
query.returnGeometry = true;
query.groupByFieldsForStatistics = ["CP"];

var cpN01 = [];
var cpN01_a = [];

var cpN02 = [];
var cpN02_a = [];

var cpN03 = [];
var cpN03_a = [];

var cpN04 = [];
var cpN04_a = [];

var cpN05 = [];
var cpN05_a = [];

return treeLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const cutEarthballed = attributes.total_cutearthballed_tree;
const totalCutEarth = attributes.total_number_tree;
const TREE_CUT_PERC = (cutEarthballed/totalNumber)*100;
const tree_cutEarth = (cutEarthballed/totalCutEarth)*100;

if (cpPackage === 'N-01') {
  cpN01.push(TREE_CUT_PERC);
  cpN01_a.push(tree_cutEarth);

} else if (cpPackage === 'N-02') {
  cpN02.push(TREE_CUT_PERC);
  cpN02_a.push(tree_cutEarth);

} else if (cpPackage === 'N-03') {
  cpN03.push(TREE_CUT_PERC);
  cpN03_a.push(tree_cutEarth);

} else if (cpPackage === 'N-04') {
  cpN04.push(TREE_CUT_PERC);
  cpN04_a.push(tree_cutEarth);

} else if (cpPackage === 'N-05') {
  cpN05.push(TREE_CUT_PERC);
  cpN05_a.push(tree_cutEarth);
}
});
return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});

} // End of treeCutSummary function

function treeCuttingFigure([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a);
var n02 = Number(cpN02_a);
var n03 = Number(cpN03_a);
var n04 = Number(cpN04_a);
var n05 = Number(cpN05_a);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01.toFixed(0),
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02.toFixed(0),
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03.toFixed(0),
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04.toFixed(0),
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05.toFixed(0),
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("treeCuttingChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//title.text = "[bold]TREE CUTTING";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/N2_Tree_Cutting/index.html" target="_blank">TREE CUTTING</a>';
title.fontSize = "2em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]CUT/EARTHBALLED";
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7;



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1;
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)
}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%";
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}
treeCuttingTotal()
.then(treeCutSummary)
.then(treeCuttingFigure);

// Tree Compensation
function treeCompenTotal() {
var total_number_tree = {
onStatisticField: "CASE WHEN Compensation >= 2 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_number_tree",
statisticType: "sum"
};

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree];

return treeLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const totalNumber = stats.total_number_tree;

return totalNumber;
});
}


function treeCompenSummary(totalNumber) {
  var total_number_tree = {
    onStatisticField: "CASE WHEN Compensation >= 2 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_number_tree",
    statisticType: "sum"
    };

var total_compensated_tree = {
onStatisticField: "CASE WHEN Compensation = 3 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_compensated_tree",
statisticType: "sum"
}

var query = treeLayer.createQuery();
query.outStatistics = [total_number_tree, total_compensated_tree];
query.returnGeometry = true;
query.groupByFieldsForStatistics = ["CP"];

var cpN01 = [];
var cpN01_a = [];

var cpN02 = [];
var cpN02_a = [];

var cpN03 = [];
var cpN03_a = [];

var cpN04 = [];
var cpN04_a = [];

var cpN05 = [];
var cpN05_a = [];

return treeLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const compensated = attributes.total_compensated_tree;
const totalCompen = attributes.total_number_tree;
const TREE_COMPEN_PERC = (compensated/totalNumber)*100;
const tree_compen = (compensated/totalCompen)*100;

if (cpPackage === 'N-01') {
  cpN01.push(TREE_COMPEN_PERC);
  cpN01_a.push(tree_compen);

} else if (cpPackage === 'N-02') {
  cpN02.push(TREE_COMPEN_PERC);
  cpN02_a.push(tree_compen);

} else if (cpPackage === 'N-03') {
  cpN03.push(TREE_COMPEN_PERC);
  cpN03_a.push(tree_compen);

} else if (cpPackage === 'N-04') {
  cpN04.push(TREE_COMPEN_PERC);
  cpN04_a.push(0); // no applicable: all trees in N-04 are Non-Compensable (i.e., not subject to this)

} else if (cpPackage === 'N-05') {
  cpN05.push(TREE_COMPEN_PERC);
  cpN05_a.push(tree_compen);
}
});
return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});

} // End of treeCompenSummary function

function treeCompenFigure([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + 
                 Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a);
var n02 = Number(cpN02_a);
var n03 = Number(cpN03_a);
var n04 = Number(cpN04_a);
var n05 = Number(cpN05_a);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01.toFixed(0),
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02.toFixed(0),
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03.toFixed(0),
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04.toFixed(0),
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05.toFixed(0),
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("treeCompenChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//title.text = "[bold]TREE COMPENSATION";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/N2_Tree_Cutting/index.html" target="_blank">TREE COMPENSATION</a>';
title.fontSize = "2em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]COMPENSATED";
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7;



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1;
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)
}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%"; //data.score.toFixed(0).toString() + "%"
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}
treeCompenTotal()
.then(treeCompenSummary)
.then(treeCompenFigure);


// Utility Point + Line Total Number
function utilityPointTotal() {
var total_number_utilPoint = {
onStatisticField: "LAYER",
outStatisticFieldName: "total_number_utilPoint",
statisticType: "count"
};

var query = utilPointLayer.createQuery();
query.outStatistics = [total_number_utilPoint];

return utilPointLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const totalNumberPoint = stats.total_number_utilPoint;
return totalNumberPoint;
});
}

function utilityLineTotal(totalNumberPoint) {
var total_number_utilLine = {
onStatisticField: "LAYER",
outStatisticFieldName: "total_number_utilLine",
statisticType: "count"
};

var query = utilLineLayer.createQuery();
query.outStatistics = [total_number_utilLine];

return utilLineLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const totalNumberLine = stats.total_number_utilLine;
const grandTotal = Number(totalNumberPoint) + Number(totalNumberLine);
return grandTotal;
});
}

// Utility Point + Line Total Completed
function utilityPointCompleted(grandTotal) {
  var total_number_utilPoint = {
    onStatisticField: "LAYER",
    outStatisticFieldName: "total_number_utilPoint",
    statisticType: "count"
    };

var total_completed_utilPoint = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_completed_utilPoint",
statisticType: "sum"
};

var query = utilPointLayer.createQuery();
query.outStatistics = [total_number_utilPoint, total_completed_utilPoint];
query.groupByFieldsForStatistics = ["CP"];

var point_cpN01 = [];
var point_cpN01_a = [];

var point_cpN02 = [];
var point_cpN02_a = [];

var point_cpN03 = [];
var point_cpN03_a = [];

var point_cpN04 = [];
var point_cpN04_a = [];

var point_cpN05 = [];
var point_cpN05_a = [];

return utilPointLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const completed = attributes.total_completed_utilPoint;
const totalUtilPoint = attributes.total_number_utilPoint;

if (cpPackage === 'N-01') {
  point_cpN01.push(completed);
  point_cpN01_a.push(totalUtilPoint);

} else if (cpPackage === 'N-02') {
  point_cpN02.push(completed);
  point_cpN02_a.push(totalUtilPoint);

} else if (cpPackage === 'N-03') {
  point_cpN03.push(completed);
  point_cpN03_a.push(totalUtilPoint);

} else if (cpPackage === 'N-04') {
  point_cpN04.push(completed);
  point_cpN04_a.push(totalUtilPoint);

} else if (cpPackage === 'N-05') {
  point_cpN05.push(completed);
  point_cpN05_a.push(totalUtilPoint);
}
});
return [point_cpN01, point_cpN02, point_cpN03, point_cpN04, point_cpN05, point_cpN01_a, point_cpN02_a, point_cpN03_a, point_cpN04_a, point_cpN05_a, grandTotal];
});
}


function utilityLineCompleted([point_cpN01, point_cpN02, point_cpN03, point_cpN04, point_cpN05, point_cpN01_a, point_cpN02_a, point_cpN03_a, point_cpN04_a, point_cpN05_a, grandTotal]) {
  var total_number_utilLine = {
    onStatisticField: "LAYER",
    outStatisticFieldName: "total_number_utilLine",
    statisticType: "count"
    };

  var total_completed_utilLine = {
  onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_completed_utilLine",
  statisticType: "sum"
};

var query = utilLineLayer.createQuery();
query.outStatistics = [total_number_utilLine, total_completed_utilLine];
query.groupByFieldsForStatistics = ["CP"];

// Numeric
const point_n01 = Number(point_cpN01);
const point_n02 = Number(point_cpN02);
const point_n03 = Number(point_cpN03);
const point_n04 = Number(point_cpN04);
const point_n05 = Number(point_cpN05);
const gTotal = Number(grandTotal);
//

var totalCompleted_cpN01 = [];
var totalCompleted_cpN02 = [];
var totalCompleted_cpN03 = [];
var totalCompleted_cpN04 = [];
var totalCompleted_cpN05 = [];

var totalUtil_cpN01 = [];
var totalUtil_cpN02 = [];
var totalUtil_cpN03 = [];
var totalUtil_cpN04 = [];
var totalUtil_cpN05 = [];

return utilLineLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const cpPackage = result.attributes.CP;
const completed = attributes.total_completed_utilLine;
const totalUtilLine = attributes.total_number_utilLine;

const completedLine = Number(completed);

//const LINE_COMPLETED_PERC = (completed/totalCompen)*100;

if (cpPackage === 'N-01') {
  const tempComp_n01 = completedLine + point_n01;
  totalCompleted_cpN01.push(tempComp_n01);

  const totalCount_n01 = totalUtilLine + Number(point_cpN01_a);
  //headerTitleDiv.innerHTML = totalUtilLine + "; " + point_cpN01_a + " = " + totalCount_n01;
  totalUtil_cpN01.push(totalCount_n01);

} else if (cpPackage === 'N-02') {
  const tempComp_n02 = completedLine + point_n02;
  totalCompleted_cpN02.push(tempComp_n02);

  const totalCount_n02 = totalUtilLine +  Number(point_cpN02_a);
  totalUtil_cpN02.push(totalCount_n02);

} else if (cpPackage === 'N-03') {
  const tempComp_n03 = completedLine + point_n03;
  totalCompleted_cpN03.push(tempComp_n03);

  const totalCount_n03 = totalUtilLine +  Number(point_cpN03_a);
  totalUtil_cpN03.push(totalCount_n03);

} else if (cpPackage === 'N-04') {
  const tempComp_n04 = completedLine + point_n04;
  totalCompleted_cpN04.push(tempComp_n04);

  const totalCount_n04 = totalUtilLine +  Number(point_cpN04_a);
  totalUtil_cpN04.push(totalCount_n04);

} else if (cpPackage === 'N-05') {
  const tempComp_n05 = completedLine + point_n05;
  totalCompleted_cpN05.push(tempComp_n05);

  const totalCount_n05 = totalUtilLine +  Number(point_cpN05_a);
  totalUtil_cpN05.push(totalCount_n05);
}
});
const cpN01 = (totalCompleted_cpN01/gTotal)*100;
const cpN02 = (totalCompleted_cpN02/gTotal)*100;
const cpN03 = (totalCompleted_cpN03/gTotal)*100;
const cpN04 = (totalCompleted_cpN04/gTotal)*100;
const cpN05 = (totalCompleted_cpN05/gTotal)*100;

const cpN01_a = (totalCompleted_cpN01/totalUtil_cpN01)*100;
const cpN02_a = (totalCompleted_cpN02/totalUtil_cpN02)*100;
const cpN03_a = (totalCompleted_cpN03/totalUtil_cpN03)*100;
const cpN04_a = (totalCompleted_cpN04/totalUtil_cpN04)*100;
const cpN05_a = (totalCompleted_cpN05/totalUtil_cpN05)*100;



return [cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a];
});
}

// Utility Progress Chart
function utilityChart([cpN01, cpN02, cpN03, cpN04, cpN05, cpN01_a, cpN02_a, cpN03_a, cpN04_a, cpN05_a]) {
var totalScore = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var N01 = Number(cpN01);
var N02 = Number(cpN01) + Number(cpN02);
var N03 = Number(cpN01) + Number(cpN02) + Number(cpN03);
var N04 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04);
var N05 = Number(cpN01) + Number(cpN02) + Number(cpN03) + Number(cpN04) + Number(cpN05);

var n01 = Number(cpN01_a);
var n02 = Number(cpN02_a);
var n03 = Number(cpN03_a);
var n04 = Number(cpN04_a);
var n05 = Number(cpN05_a);

var chartMin = 0;
var chartMax = 100;

// #ffea8c|#b3ab60|#4b595e|#6693c8|#aadbff
// const colors = ["#ffea8c", "#b3ab60", "#4b595e", "#6693c8", "#aadbff"];

var data = {
score: totalScore,
gradingData: [
{
  title: n01.toFixed(0),
  color: "#ffa500",
  lowScore: 0,
  highScore: N01
},
{
  title: n02.toFixed(0),
  color: "#00ff00",
  lowScore: N01,
  highScore: N02
},
{
  title: n03.toFixed(0),
  color: "#00c5ff",
  lowScore: N02,
  highScore: N03
},
{
  title: n04.toFixed(0),
  color: "#FFFF00",
  lowScore: N03,
  highScore: N04
},
{
  title: n05.toFixed(0),
  color: "#BF40BF",
  lowScore: N04,
  highScore: N05
},
{
  title: "",
  color: "#C5C5C5",
  lowScore: N05,
  highScore: 100
}
]
};

/**
Grading Lookup
*/
function lookUpGrade(lookupScore, grades) {
// Only change code below this line
for (var i = 0; i < grades.length; i++) {
if (
  grades[i].lowScore < lookupScore &&
  grades[i].highScore >= lookupScore
) {
  return grades[i];
}
}
return null;
}

// create chart
var chart = am4core.create("utilityPointChartDiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(80);
chart.resizable = true;
chart.responsive.enabled = true;
/**
* Chart Title
*/
// Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");

var title = chart.titles.create();
//title.text = "[bold]UTILITY";
title.html = '<a href="https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/N2_Utility_Relocation/index.html" target="_blank">UTILITY</a>';
title.fontSize = "2em";
title.align = "center";
title.marginBottom = -10;
title.marginTop = 0;
title.fill = TOP_TITLE_COL;

// Add bottom label
var label = chart.chartContainer.createChild(am4core.Label);
label.text = "[bold]COMPLETED";
label.fontSize = "1.4em";
label.align = "center";
label.marginTop = 0;
label.fill = BOTTOM_LABEL_COL;

/**
* Normal axis
*/

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = chartMin;
axis.max = chartMax;
axis.strictMinMax = true;
axis.renderer.radius = am4core.percent(80);
axis.renderer.inside = true;
axis.renderer.line.strokeOpacity = 0.5; // line opacity inside curve line
axis.renderer.ticks.template.disabled = false;
axis.renderer.ticks.template.strokeOpacity = 1;
//axis.renderer.ticks.template.strokeWidth = 1;
axis.renderer.ticks.template.length = 10;
axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
//axis.renderer.grid.template.disabled = true;
axis.renderer.labels.template.radius = am4core.percent(40);
axis.renderer.labels.template.fontSize = "1.2em"; // default: 1.2em inner radius axis percent labels (0 to 100%)
axis.renderer.labels.template.fill = am4core.color(axis1TickColor);

/**
* Axis for ranges
*/

var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
axis2.min = chartMin;
axis2.max = chartMax;
axis2.strictMinMax = true;
axis2.renderer.labels.template.disabled = true;
axis2.renderer.ticks.template.disabled = true;
axis2.renderer.grid.template.disabled = true; // when true inside tick marks will disappear
axis2.renderer.grid.template.opacity = 0.5;
axis2.renderer.labels.template.bent = true;
axis2.renderer.labels.template.fill = am4core.color("#000");
axis2.renderer.labels.template.fontWeight = "bold";
axis2.renderer.labels.template.fillOpacity = 0.7;



/**
Ranges
*/

for (let grading of data.gradingData) {
var range = axis2.axisRanges.create();
range.axisFill.fill = am4core.color(grading.color);
range.axisFill.fillOpacity = 1;
range.axisFill.zIndex = -1;
range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
range.grid.strokeOpacity = 0; // changes opacity of inside tick mark
range.stroke = am4core.color(grading.color).lighten(-0.1);
range.label.inside = true;
range.label.text = grading.title.toUpperCase();
range.label.inside = true;
range.label.location = 0.5;
range.label.inside = true;
range.label.radius = am4core.percent(10);
range.label.paddingBottom = -5; // ~half font size
range.label.fontSize = "1.4em"; // category label (i.e., N-01, N-02, ....)
}

var matchingGrade = lookUpGrade(data.score, data.gradingData);

/**
* Label 1 (total Percent)
*/

var label = chart.radarContainer.createChild(am4core.Label);
label.isMeasured = false;
label.fontSize = "3.5em";
label.x = am4core.percent(50);
label.y = am4core.percent(100);
label.paddingBottom = -5;
label.horizontalCenter = "middle";
label.verticalCenter = "bottom";
//label.dataItem = data;
label.text = data.score.toFixed(0).toString() + "%";
//label.text = "{score}";
//label.fill = am4core.color(matchingGrade.color);
label.fill =  am4core.color("#00C3FF");

/**
* Label 2
*/

/*
var label2 = chart.radarContainer.createChild(am4core.Label);
label2.isMeasured = false;
label2.fontSize = "2em";
label2.horizontalCenter = "middle";
label2.verticalCenter = "bottom";
label2.text = matchingGrade.title.toUpperCase();
//label2.fill = am4core.color(matchingGrade.color);
label2.fill =  am4core.color("#00C3FF");
*/
/**
* Hand
*/

var hand = chart.hands.push(new am4charts.ClockHand());
hand.axis = axis2;
hand.innerRadius = am4core.percent(55);
hand.startWidth = 8;
hand.pin.disabled = true;
hand.value = data.score;
hand.fill = am4core.color("#000000"); // inner color of needle
//hand.stroke = am4core.color("#000");
hand.fillOpacity = 0.5;

/*
hand.events.on("positionchanged", function(){
label.text = axis2.positionToValue(hand.currentPosition).toFixed(0).toString() + "%";
var value2 = axis.positionToValue(hand.currentPosition);
var matchingGrade = lookUpGrade(axis.positionToValue(hand.currentPosition), data.gradingData);
label2.text = matchingGrade.title.toUpperCase();
label2.fill = am4core.color(matchingGrade.color);
label2.stroke = am4core.color(matchingGrade.color);  
label.fill = am4core.color(matchingGrade.color);
})
*/
/*
setInterval(function() {
var value = chartMin + Math.random() * (chartMax - chartMin);
hand.showValue(value, 1000, am4core.ease.cubicOut);
}, 2000);
*/

}

utilityPointTotal()
.then(utilityLineTotal)
.then(utilityPointCompleted)
.then(utilityLineCompleted)
.then(utilityChart)

}); // end am4core.ready()



});