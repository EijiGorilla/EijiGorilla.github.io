require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/TileLayer",
  "esri/Graphic",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/layers/GroupLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/rest/support/Query",
  "esri/widgets/Fullscreen",
  "esri/symbols/TextSymbol",
  "esri/views/SceneView",
  "esri/widgets/LayerList",
  "esri/widgets/BasemapToggle",
  "esri/layers/SceneLayer",
  "esri/Basemap",
  "esri/layers/VectorTileLayer",
], function(
  Map,
  MapView,
  TileLayer,
  Graphic,
  FeatureLayer,
  GraphicsLayer,
  GroupLayer,
  Expand,
  Legend,
  Query,
  Fullscreen,
  TextSymbol,
  SceneView,
  LayerList,
  BasemapToggle,
  SceneLayer,
  Basemap,
  VectorTileLayer

) {

  
  // Add Map
  var map = new Map({
    basemap: "satellite", // "streets-night-vector"
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
        x: 32.1021672,
        y: 48.7944170,
        z: 5500
      },
      tilt: 90
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
  

 // https://developers.arcgis.com/javascript/latest/sample-code/effect-blur-shadow/
  // Ukraine - hospital layer

const labelClass = {  // autocasts as new LabelClass()
    symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "white",
        //haloColor: "blue",
        //haloSize: 1,
        font: {  // autocast as new Font()
            size: 20,
            weight: "bold"
        }
    },
    labelPlacement: "above-right",
    labelExpressionInfo: {
        expression: "$feature.Name"
    },
    maxScale: 0,
    minScale: 25000000
};

// Military front line
var frontLine = new FeatureLayer({
    portalItem: {
        id: "5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Military Frontline",
    layerId: 85,
    popupEnabled: false
});
map.add(frontLine);


// Hospital Damage Rating
var hospitalLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Hospital Damage Rating",
    layerId: 4,
    outFields: ["*"],
    popupTemplate: {
        title: "Damage Status: {Damage} <br>Restoration Cost: {Cost}</br>",
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "amenity",
                label: "Amenity"
              }
            ]
          }
        ]
    },
});
map.add(hospitalLayer);

// Hospital Restoration Cost
var hospitalCostLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Hospital Restoration Cost",
    layerId: 36,
    outFields: ["*"],
    popupTemplate: {
        title: "Restoration Cost for this hospital is ${Cost}",
        returnGeometry: true
    },
});
map.add(hospitalCostLayer);

// Bridge Damage Rating
var bridgeLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Bridge Damage Rating",
    layerId: 33,
    outFields: ["*"],
    popupTemplate: {
        title: "Damage Status of ths Bridge: {Damage}",
        returnGeometry: true
    },
    definitionExpression: "note = 'International'"
});
map.add(bridgeLayer);

// Populated places layer
const populationLabel = {  // autocasts as new LabelClass()
    symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        haloColor: "white",
        haloSize: 0.7,
        font: {  // autocast as new Font()
            size: 15,
            weight: "bold"
        }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
        expression: "$feature.ADM4_EN"
    },
    where: "ADM4_EN = 'Kyiv'"
};

const populationLabel2 = {  // autocasts as new LabelClass()
    symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        haloColor: "white",
        haloSize: 0.7,
        font: {  // autocast as new Font()
            size: 10,
            weight: "bold"
        }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
        expression: "$feature.ADM4_EN"
    },
    where: "ADM4_EN <> 'Kyiv'",
    minScale: 8000000
};

var populatedPlaceLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Major City",
    layerId: 37,
    outFields: ["*"],
    popupTemplate: {
        title: "{name_EN}",
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Population_HDX_2001",
                label: "Population"
              },
              {
                fieldName: "Admin 1 Pcode",
                label: "Admin 1 Pcode"
              },
              {
                fieldName: "Admin 1 Name EN",
                label: "Admin 1 Name"
              }
            ]
          }
        ]
    },
    labelingInfo: [populationLabel, populationLabel2],
    definitionExpression: "Place_Classification = 'national capital'" + " OR " + "Place_Classification = 'major city'",
});
map.add(populatedPlaceLayer);

// Population
var populationLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Population",
    layerId: 32,
    outFields: ["*"],
    popupTemplate: {
        title: "Total population in this Admin {admin1Name_en}: {SUM_Population_HDX_2001}",
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "admin1Pcode",
                label: "Admin 1 Pcode"
              }
            ]
          }
        ]
    }
});
map.add(populationLayer);

// Major Road network
var majorRoadLayer = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Major Road",
    layerId: 84,
    outFields: ["*"],
    popupEnabled: false
});
map.add(majorRoadLayer);

// Coundary Boundary
var ukrainBoundary = new FeatureLayer({
    portalItem: {
        id:"5707eb58d6a7452cbc783ee458ea6b8a"
    },
    title: "Boundary",
    //labelingInfo: [textSymbol],
    layerId: 1,
    outFields: ["*"],
    labelsVisible: false,
    popupEnabled: false
});
ukrainBoundary.listMode = "hide";
map.add(ukrainBoundary);

//
//ukrainBoundary.renderer = {
//type: "simple", // autocasts as new SimpleRenderer()
//symbol: textSymbol
//};

// this layer is only used to query for the intersecting country when the map is clicked
const countries = new FeatureLayer({
    portalItem: {
        id: "53a1e68de7e4499cad77c80daba46a94"
    },
    outFields: ["*"],
    popupEnabled: false
});
countries.listMode = "hide";
map.add(countries);


// Pier Chart to summarize damage ratings of hospitals in Ukraine
let chartLayerView;
var highlightSelect;

var titleDiv = document.getElementById("titleDiv");
const chartPanelDiv = document.getElementById("chartPanelDiv");

// Damage List
var damageFactorList = document.getElementById("damageFactorList");
var ttt = damageFactorList.getElementsByClassName("test");


/* Function for zooming to selected layers */
function zoomToLayer(layer) {
    return layer.queryExtent().then((response) => {
      view.goTo(response.extent).catch((error) => {
        console.error(error);
      });
    });
  }

// Call amCharts 4
am4core.ready(function() {
am4core.useTheme(am4themes_animated);
hospitalLayer.visible = true;
hospitalCostLayer.visible = true;
bridgeLayer.visible = false;
updateChart();


for(var i = 0; i < ttt.length; i ++) {
ttt[i].addEventListener("click", filterByP);
}

function filterByP(event) {
var current = document.getElementsByClassName("active");
current[0].className = current[0].className.replace(" active","");
this.className += " active";

const selectedID = event.target.id;
if(selectedID == "Hospital") {
hospitalLayer.visible = true;
hospitalCostLayer.visible = true;
bridgeLayer.visible = false;
zoomToLayer(ukrainBoundary);
updateChart();

} else if (selectedID == "Bridge") {
hospitalLayer.visible = false;
hospitalCostLayer.visible = false;
bridgeLayer.visible = true;
zoomToLayer(ukrainBoundary);
updateChartBridge();

} 
}

// Hospital Damage Chart
async function updateChart() {
function DamageRating(){
return {
1: "Total Destruction",
2: "Damaged Beyond Repair",
3: "Seriously Damaged-Not Repairable",
4: "Seriously Damaged-Repairable",
5: "No Damage"
}
}

  var total_destruction = {
      onStatisticField: "CASE WHEN Damage = 1 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_destruction",
      statisticType: "sum"
  }

  var total_damaged = {
      onStatisticField: "CASE WHEN Damage = 2 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_damaged",
      statisticType: "sum"
  }
  
  var total_nonrepair = {
      onStatisticField: "CASE WHEN Damage = 3 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_nonrepair",
      statisticType: "sum"
  }

  var total_repair = {
      onStatisticField: "CASE WHEN Damage = 4 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_repair",
      statisticType: "sum"
  }

  var total_notdamaged = {
      onStatisticField: "CASE WHEN Damage = 5 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_notdamaged",
      statisticType: "sum"
  }

  var query = hospitalLayer.createQuery();
  query.outStatistics = [total_destruction, total_damaged, total_nonrepair, 
                         total_repair, total_notdamaged];

  query.returnGeometry = true;

  hospitalLayer.queryFeatures(query).then(function(response){
      var stats = response.features[0].attributes;

      const TOTAL_DESTRUCTION = stats.total_destruction;
      const DAMAGED_NOREPAIR = stats.total_damaged;
      const DAMAGED_SERIOUS = stats.total_nonrepair;
      const DAMAGED_REPAIRABLE = stats.total_repair;
      const NO_DAMAGE = stats.total_notdamaged;
      
      var chart = am4core.create("chartdiv", am4charts.PieChart);
          // Add data
chart.data = [
{
  "Damage": DamageRating()[1],
  "status": TOTAL_DESTRUCTION,
  "color": am4core.color("#000000")
},
{
  "Damage": DamageRating()[2],
  "status": DAMAGED_NOREPAIR,
  "color": am4core.color("#C500FF")   
},
{
  "Damage": DamageRating()[3],
  "status": DAMAGED_SERIOUS,
  "color": am4core.color("#FF0000") 
},
{
  "Damage": DamageRating()[4],
  "status": DAMAGED_REPAIRABLE,
  "color": am4core.color("#FFAA00")
},
{
 "Damage": DamageRating()[5],
  "status": NO_DAMAGE,
  "color": am4core.color("#89CD66")    
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

// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Add a legend
const LEGEND_FONT_SIZE = 17;
chart.legend = new am4charts.Legend();
chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.labels.template.fontWeight = "bold";

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
      
// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
  const SELECTED = ev.target.dataItem.category;
  if (SELECTED == DamageRating()[1]) {
    selectedStatus = 1;
  } else if (SELECTED == DamageRating()[2]) {
    selectedStatus = 2;
  } else if (SELECTED == DamageRating()[3]) {
    selectedStatus = 3;
  } else if (SELECTED == DamageRating()[4]) {
    selectedStatus = 4;
  } else if (SELECTED == DamageRating()[5]) {
    selectedStatus = 5;
  } else {
    selectedStatus = null;
  }
  
  view.when(function() {
    view.whenLayerView(hospitalLayer).then(function (layerView) {
      chartLayerView = layerView;
      chartPanelDiv.style.visibility = "visible";
      
      hospitalLayer.queryFeatures().then(function(results) {
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

        hospitalLayer.queryExtent(queryExt).then(function(result) {
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
        where: "Damage = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart

} // End of createSlices function

createSlices("status", "Damage");

  }); // End of queryFeatures
} // End of updateChart()


// Hospital Damage Chart
async function updateChartBridge() {
    function DamageRating(){
        return {
            1: "Total Destruction",
            2: "Damaged Beyond Repair",
            3: "Seriously Damaged-Not Repairable",
            4: "Seriously Damaged-Repairable",
            5: "No Damage"
        }
    }

  var total_destruction = {
      onStatisticField: "CASE WHEN Damage = 1 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_destruction",
      statisticType: "sum"
  }

  var total_damaged = {
      onStatisticField: "CASE WHEN Damage = 2 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_damaged",
      statisticType: "sum"
  }
  
  var total_nonrepair = {
      onStatisticField: "CASE WHEN Damage = 3 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_nonrepair",
      statisticType: "sum"
  }

  var total_repair = {
      onStatisticField: "CASE WHEN Damage = 4 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_repair",
      statisticType: "sum"
  }

  var total_notdamaged = {
      onStatisticField: "CASE WHEN Damage = 5 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_notdamaged",
      statisticType: "sum"
  }

  var query = bridgeLayer.createQuery();
  query.outStatistics = [total_destruction, total_damaged, total_nonrepair, 
                         total_repair, total_notdamaged];

  query.returnGeometry = true;

  bridgeLayer.queryFeatures(query).then(function(response){
      var stats = response.features[0].attributes;

      const TOTAL_DESTRUCTION = stats.total_destruction;
      const DAMAGED_NOREPAIR = stats.total_damaged;
      const DAMAGED_SERIOUS = stats.total_nonrepair;
      const DAMAGED_REPAIRABLE = stats.total_repair;
      const NO_DAMAGE = stats.total_notdamaged;
      
      var chart = am4core.create("chartdiv", am4charts.PieChart);
          // Add data
chart.data = [
{
  "Damage": DamageRating()[1],
  "status": TOTAL_DESTRUCTION,
  "color": am4core.color("#000000")
},
{
  "Damage": DamageRating()[2],
  "status": DAMAGED_NOREPAIR,
  "color": am4core.color("#C500FF")   
},
{
  "Damage": DamageRating()[3],
  "status": DAMAGED_SERIOUS,
  "color": am4core.color("#FF0000") 
},
{
  "Damage": DamageRating()[4],
  "status": DAMAGED_REPAIRABLE,
  "color": am4core.color("#FFAA00")
},
{
 "Damage": DamageRating()[5],
  "status": NO_DAMAGE,
  "color": am4core.color("#89CD66")    
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

// Create hover state
var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

// Slightly shift the shadow and make it more prominent on hover
var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
hoverShadow.opacity = 0.7;
hoverShadow.blur = 5;

// Add a legend
const LEGEND_FONT_SIZE = 17;
chart.legend = new am4charts.Legend();
chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";

//chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.labels.template.fontWeight = "bold";

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
      
// Click chart and filter, update maps
pieSeries.slices.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
  const SELECTED = ev.target.dataItem.category;
  if (SELECTED == DamageRating()[1]) {
    selectedStatus = 1;
  } else if (SELECTED == DamageRating()[2]) {
    selectedStatus = 2;
  } else if (SELECTED == DamageRating()[3]) {
    selectedStatus = 3;
  } else if (SELECTED == DamageRating()[4]) {
    selectedStatus = 4;
  } else if (SELECTED == DamageRating()[5]) {
    selectedStatus = 5;
  } else {
    selectedStatus = null;
  }
  
  view.when(function() {
    view.whenLayerView(bridgeLayer).then(function (layerView) {
      chartLayerView = layerView;
      chartPanelDiv.style.visibility = "visible";
      
      bridgeLayer.queryFeatures().then(function(results) {
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

        bridgeLayer.queryExtent(queryExt).then(function(result) {
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
        where: "Damage = " + selectedStatus
      }
    }); // End of view.whenLayerView
  }); // End of view.when
} // End of filterByChart

} // End of createSlices function

createSlices("status", "Damage");

  }); // End of queryFeatures
} // End of updateChart()

}); // End of am4core.ready

/////////////////////////////////////////////////////////
view.ui.empty("top-left");

// Full screen logo
view.ui.add(
    new Fullscreen({
        view: view,
        element: viewDiv
    }),
    "bottom-left"
);


var legend = new Legend({
    view: view,
    container: legendDiv,
    layerInfos: [
        {
            layer: frontLine,
            title: "Military Frontline"
        },
        {
            layer: hospitalLayer,
            title: "Hospital Damage Rating"
        },
        {
            layer: bridgeLayer,
            title: "Bridge Damage Rating"
        },
        {
            layer: hospitalCostLayer,
            title: "Hospital Restoration Cost"
        },
        {
            layer: populationLayer,
            title: "Population"
        },
        {
            layer: majorRoadLayer,
            title: "Major Road"
        },
        {
            layer: populatedPlaceLayer,
            title: "Populated Place Layer"
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
position: "bottom-left"
});
*/

// Layer list
var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Bridge Damage Rating"){
            item.visible = false
        }
        if (item.layer.type !== "group"){
            // don't show legend twice
            item.panel = {
                content: "legend",
                open: true
            };
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

});