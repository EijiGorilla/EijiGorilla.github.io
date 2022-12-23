require([
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/ImageryLayer",
  "esri/layers/ImageryTileLayer",
  "esri/layers/support/RasterFunction",
  "esri/layers/support/RasterInfo",
  "esri/renderers/RasterStretchRenderer",
  "esri/renderers/UniqueValueRenderer",
  "esri/rest/support/MultipartColorRamp",
  "esri/widgets/Legend",
  "esri/rest/support/ImageHistogramParameters",
  "esri/rest/support/Query",
  "esri/layers/FeatureLayer",
  "esri/layers/MapImageLayer",
  "esri/widgets/Slider",
  "esri/core/reactiveUtils",
  "esri/widgets/Expand",
  "esri/widgets/Fullscreen",
  "esri/views/layers/ImageryLayerView",
  "esri/widgets/LayerList",
  "esri/Graphic",
  "esri/geometry/Circle",
  "esri/core/promiseUtils",
  "esri/layers/support/TileInfo",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/layers/GraphicsLayer",
], (Map, MapView,SceneView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend, ImageHistogramParameters, Query, FeatureLayer, MapImageLayer,
    Slider, reactiveUtils, Expand, Fullscreen, ImageryLayerView, LayerList,
    Graphic, Circle, promiseUtils, TileInfo, SketchViewModel,
    GraphicsLayer) => {

const headerTitleDiv = document.getElementById("headerTitleDiv");
headerTitleDiv.innerHTML = "Land Use (2021)";
const landUseViewFilter = document.getElementById("landUseViewFilter");
const landUseChangeViewFilter = document.getElementById("landUseChangeViewFilter");

// Add Map and MapView
      const map = new Map({
        basemap: "hybrid",
        //layers: [layer, layerLoss]
      })

      const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [12.8867418, 48.6382704],
        zoom: 10
      });

      // "Sentinel-2 10m Land Use/Land Cover Time Series"

      var landUseImage = new ImageryLayer({
        url: "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer",
        title: "Land Cover (2021, Sentinel-2)",
        definitionExpression: "Year = 2021",
        //pixelFilter: testfilter,
        format: "lerc"
      });
      map.add(landUseImage);
      landUseImage.opacity = 0.5;

      // Sentinel-2 for land cover change
      var landUseChangeImage = new ImageryLayer({
        url: "https://env1.arcgis.com/arcgis/rest/services/Sentinel_2_10m_Land_Cover_Change/ImageServer",
        title: "Land Cover Change (2018-2021)",
        format: "lerc"
      });
      map.add(landUseChangeImage);
      landUseChangeImage.opacity = 0.9;

// Refer to this link: https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-clientside/
// https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=featurelayerview-query-geometry
// Default Display
function defaultDisplay() {
  landUseImage.visible = true;
  landUseChangeImage.visible = false;
}
defaultDisplay();

// Sketch polygon
const sketchLayer = new GraphicsLayer();
view.map.add(sketchLayer);

// Create a text symbol for drawing the point
let sketchGeometry = null;
const sketchViewModel = new SketchViewModel({
  view: view,
  layer: sketchLayer,
  polygonSymbol: {
    type: "simple-fill",
    symbolLayers: [
      {
        type: "fill",
        material: {
          color: [255, 255, 255, 0.8]
        },
        outline: {
          color: [211, 132, 80, 0.7],
          size: "10px"
        }
      }
    ]
  },
});

// Draw polygon and get geometry
sketchViewModel.on(["create"], (event) => {
  // update the filter every time the user finishes drawing the filtergeometry
    // chart

  if (event.state == "complete") {
    sketchGeometry = event.graphic.geometry;

    const param = {
      geometry: sketchGeometry,
      returnFirstValueOnly: true,
      // resolution - unit of the view's spatial reference
    };

    landUseImage.getSamples(param).then((results) => {
      //console.log(results.samples[0].pixelValue[0]);
      const pixels = results.samples;
      
      let sketchPixelValues = [];
      for (let i = 0; i < pixels.length; i++) {
        let pixelValue;
        pixelValue = pixels[i].pixelValue[0];
        sketchPixelValues.push(pixelValue);
      }

      pixelValCount = {};
      for (let i = 0; i < sketchPixelValues.length; i++) {
        pixelValCount[sketchPixelValues[i]] = 1 + (pixelValCount[sketchPixelValues[i]] || 0);
      }
      landUseChart(pixelValCount);

        }); // getSamples(param)  
  } // if (event.state == "complete")
}); // sketchViewModel.on

function landUseChart(pixelValCount) {
  am4core.ready(function() {
    am4core.useTheme(am4themes_animated);
          // Class
          // 1. Water, 2. Trees, 4. Flooded Vegetation, 5. Crops, 7. Built Area, 8. Bare Ground, 9. Snow/Ice, 10. Clouds, 11. Rangeland
          const pixelArea = 100; // 10m x 10m
          const hectare = 10000; // 10000m2
  
          const water = pixelValCount[1] === undefined ? 0 : pixelValCount[1] * pixelArea / hectare;
          const trees = pixelValCount[2] === undefined ? 0 : pixelValCount[2] * pixelArea / hectare;
          const floodVeg = pixelValCount[4] === undefined ? 0 : pixelValCount[4] * pixelArea / hectare;
          const crops = pixelValCount[5] === undefined ? 0 : pixelValCount[5] * pixelArea / hectare;
          const builtArea = pixelValCount[7] === undefined ? 0 : pixelValCount[7] * pixelArea / hectare;
          const bareG = pixelValCount[8] === undefined ? 0 : pixelValCount[8] * pixelArea / hectare;
          const snowIce = pixelValCount[9] === undefined ? 0 : pixelValCount[9] * pixelArea / hectare;
          const clouds = pixelValCount[10] === undefined ? 0 : pixelValCount[10] * pixelArea / hectare;
          const rangeLand = pixelValCount[11] === undefined ? 0 : pixelValCount[11] * pixelArea / hectare;
  
          //console.log("Water: " + water + ", Trees: " + trees + ", Crops: " + crops + ", Built Area: " + builtArea);
  
          // Chart
          var chart = am4core.create("chartdiv", am4charts.PieChart);
          // Add data
          chart.data = [
            {
              "class": "Water",
              "value": water,
              "color": am4core.color("#1A5BAB")
            },          
            {
              "class": "Trees",
              "value": trees,
              "color": am4core.color("#358221")
            },
            {
              "class": "Flooded Vegetation",
              "value": floodVeg,
              "color": am4core.color("#87D19E")
              },          
            {
              "class": "Crops",
              "value": crops,
              "color": am4core.color("#FFDB5C")
            },
            {
              "class": "Built Area",
              "value": builtArea,
              "color": am4core.color("#ED022A")
            },
            {
              "class": "Bare Ground",
              "value": bareG,
              "color": am4core.color("#EDE9E4")
            },
            {
              "class": "Snow/Ice",
              "value": snowIce,
              "color": am4core.color("#F2FAFF")
            },
            {
              "class": "Clouds",
              "value": clouds,
              "color": am4core.color("#C8C8C8")
            },
            {
              "class": "Rangeland",
              "value": rangeLand,
              "color": am4core.color("#EFCFA8")
            },
          ];
  
          // Set inner radius
          chart.innerRadius = am4core.percent(30);
  
          // Chart Title
          let title = chart.titles.create();
          title.text = "Land Cover Types (ha)";
          title.fontSize = 20;
          title.fontWeight = "bold";
          title.fill = am4core.color("#ffffff");
          title.marginTop = 7;
  
          function createSlices(field, status) {
            var pieSeries = chart.series.push(new am4charts.PieSeries());
            pieSeries.dataFields.value = field;
            pieSeries.dataFields.category = status;
  
            pieSeries.slices.template.propertyFields.fill = "color";
            pieSeries.slices.template.stroke = am4core.color("#fff");
            pieSeries.slices.template.strokeWidth = 1;
            pieSeries.slices.template.strokeOpacity = 1;
            pieSeries.slices.template
  
            pieSeries.labels.template.disabled = true;
            pieSeries.labels.template.radius = 3;
            pieSeries.labels.template.padding(0,0,0,0);
            pieSeries.labels.template.fontSize = 9;
            pieSeries.labels.template.fill = "#ffffff";
  
            // Ticks (a straight line)
            //pieSeries.ticks.template.disabled = true;
            pieSeries.ticks.template.fill = "#ffff00";
  
            // Add a legend
            const LEGEND_FONT_SIZE = 13;
            chart.legend = new am4charts.Legend();
            chart.legend.valueLabels.template.align = "left"
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
  
            // Responsive code for chart
            chart.responsive.enabled = true;
            chart.responsive.useDefault = false
  
            chart.responsive.rules.push({
            relevant: function(target) {
            if (target.pixelWidth <= 600) {
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
  
  
          } // End of createSlices function
          createSlices("value", "class");
  
          // Add and configure Series
          //var pieSeries = chart.series.push(new am4charts.PieSeries());
          //pieSeries.dataFields.value = "value";
          //pieSeries.dataFields.category = "class";
  
          am4core.options.autoDispose = true;
        }); // end of am4core
}



//////////
sketchViewModel.on(["update"], (event) => {
  const eventInfo = event.toolEventInfo;
  // update the filter every time the user moves the filtergeometry
  if (event.toolEventInfo && event.toolEventInfo.type.includes("stop")) {
      sketchGeometry = event.graphics[0].geometry;
  }
});

// draw geometry buttons - use the selected geometry to sktech
document.getElementById("polygon-geometry-button").onclick = geometryButtonsClickHandler;
function geometryButtonsClickHandler(event) {
  const geometryType = event.target.value;
  clearFilter();
  sketchViewModel.create(geometryType);
}

// remove the filter
document.getElementById("clearFilter").addEventListener("click", clearFilter);

function clearFilter() {
  sketchGeometry = null;
  sketchLayer.removeAll();
}



let landUseViewFilterSelected = true;
landUseViewFilter.addEventListener("change", (event) => {
  landUseViewFilterSelected = !!event.target.checked;
  if (landUseViewFilterSelected === false) {
    landUseImage.visible = false;

  } else {
    landUseChangeViewFilter.checked = false;
    landUseImage.visible = true;
    landUseChangeImage.visible = false;
    headerTitleDiv.innerHTML = "Land Use (2021)";

  } 
});

let landUseChangeViewFilterSelected = true;
landUseChangeViewFilter.addEventListener("change", (event) => {
  landUseChangeViewFilterSelected = !!event.target.checked;
  if (landUseChangeViewFilterSelected === false) {
    landUseChangeImage.visible = false;

  } else {
    landUseViewFilter.checked = false;
    landUseChangeImage.visible = true;
    landUseImage.visible = false;
    headerTitleDiv.innerHTML = "Land Use Change (2018-2021)";

  }
});

// Draw Chart for skecthed geometry


  view.ui.empty("top-left");

  // Layer List
  /*
  var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event) {
      const item = event.item;
      if (item.title === "Land Cover Change (2018-2021)") {
        item.visible = false
      }
    }
  });

  var layerListExpand = new Expand ({
    view: view,
    content: layerList,
    expandIconClass: "esri-icon-visible",
    });
    
    view.ui.add(layerListExpand, {
      position: "top-right"
    });
*/
  // Full screen
  // Full screen logo
var fullscreen = new Fullscreen({
  view: view
  });
  view.ui.add(fullscreen, "top-right");
  
 /**************************
   * Add image layer to map
   *************************/
/*
  var legend = new Legend({
    view: view,
    container: document.getElementById("legendDiv"),
    layerInfos: [
      {
        layer: landUseChangeImage,
        title: "Land Use Change"
      }
    ]
  });
*/
  
});