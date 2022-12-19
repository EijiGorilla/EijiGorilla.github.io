require([
  "esri/Map",
  "esri/views/MapView",
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
], (Map, MapView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend, ImageHistogramParameters, Query, FeatureLayer, MapImageLayer,
    Slider, reactiveUtils, Expand, Fullscreen, ImageryLayerView, LayerList,
    Graphic, Circle, promiseUtils) => {

// Add Map and MapView
      const map = new Map({
        basemap: "satellite",
        //layers: [layer, layerLoss]
      })

      const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [12.8867418, 48.6382704],
        zoom: 10
      });

      // Sentinel 10m Land Use/Lad Cover Time Series
      var sentinelImage = new ImageryLayer({
        url: "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer",
        title: "Land Cover (2021, Sentinel-2)",
        definitionExpression: "Year = 2021",
        //pixelFilter: testfilter,
        format: "lerc"
      });
      map.add(sentinelImage);
      sentinelImage.opacity = 0.5;

// Refer to this link: https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-clientside/
var temp = [];
view.whenLayerView(sentinelImage).then(layerLoaded);
      function layerLoaded(layerView) {
        layerView.watch("updating", (value) => {
          if (!value) {
            pixelData = layerView.pixelData;
            //var numP = pixelData.pixelBlock.pixels[0];
            //const currentExtent = pixelData.extent;
            //const xmin = currentExtent.xmin;

            // Get all pixels
            const pixelBlock = pixelData.pixelBlock;
            const pixels = pixelBlock.pixels[0];
            console.log(pixels);
          }
        });
      }

     // console.log(temp);

  view.ui.empty("top-left");

  // Layer List
  var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event) {
      const item = event.item;
      if (item.title === "Land Use Cover (2021)"){
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
      position: "top-left"
    });
 /**************************
   * Add image layer to map
   *************************/

  var legend = new Legend({
    view: view,
    container: document.getElementById("legendDiv"),
    layerInfos: [
      {
        layer: sentinelImage,
        title: "Sentinel-2 Image"
      }
    ]
  });
view.ui.add(legend, {
  position: "bottom-right"
});
  
});