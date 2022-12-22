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
  if (event.state == "complete") {
    sketchGeometry = event.graphic.geometry;

    // get pixel values
    const params = new ImageHistogramParameters({
      geometry: sketchGeometry
    });

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
      console.log(pixelValCount);
    })
    .catch(function(error){
      console.log(error)
    })

  }
});


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