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
  "esri/rest/support/ImageHistogramParameters"
], (Map, MapView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend, ImageHistogramParameters) => {

      const layer = new ImageryLayer({
        url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
        //pixelFilter: colorize,
        bandIds: "layer.1",
        //renderer: renderer,
        format: "lerc" // server exports in either jpg or png format
      });

      let remapRF = new RasterFunction();
      remapRF.functionName = "Remap";
      remapRF.functionArguments = {
        InputRanges: [1,19], // [1,19]
        OutputValues: [1], // [1]
        Raster: "$$"
    };
    remapRF.outputPixelType = "u8";
  

      const layerLoss = new ImageryLayer({
        url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
        bandIds: 1,
        RenderingRule: remapRF,
        //pixelFilter: filter,
        //format: "lerc" // server exports in either jpg or png format
      });

      const view = new MapView({
        container: "viewDiv",
        map: new Map({
          basemap: "satellite",
          layers: [layer, layerLoss]
        }),
        center: [12.8867418, 48.6382704],
        zoom: 10
      });


  /********************
   * Create image layer
   ********************/
// Define colorRamp
const colorRamp = MultipartColorRamp.fromJSON({
  type: "multipart",
  colorRamps: [
    {
      fromColor: [0, 0, 0, 0],
      toColor: [76, 230, 0]
    }
  ]
});

const renderer = new RasterStretchRenderer({
  colorRamp: colorRamp,
  stretchType: "min-max",
  statistics: [{
    min: 0,//valueSlider.values[0],
    max: 100,//valueSlider.values[1],
    //avg: bandStat.avg,
    //stddev: bandStat.stddev
  }]
});
layer.renderer = renderer;

// loss year


  let colorRF = new RasterFunction();
  colorRF.functionName = "Colormap";
  colorRF.functionArguments = {
    Colormap: [
      [1, 255, 0, 0]
    ],
    Raster: remapRF
  };
  //layerLoss.renderingRule = remapRF;


    function filter(pixelData) {
      var serviceInfo = layerLoss.serviceRasterInfo;
      var stats = serviceInfo.statistics[1]; // 0: layer.1, 1: layer.2
      let numPixels1 = serviceInfo.width * serviceInfo.height;
      let pixelSizeX = serviceInfo.pixelSize.x;
      let pixelSizeY = serviceInfo.pixelSize.y;
      let pixelSize = pixelSizeX * pixelSizeY;

      let pixelBlock = pixelData.pixelBlock;
      console.log(pixelBlock);

      
    }

    ///



 /**************************
   * Add image layer to map
   *************************/


 

  var legend = new Legend({
    view: view,
    container: document.getElementById("legendDiv"),
    layerInfos: [
      {
        layer: layer,
        title: "Treecover 2000"
      },
      {
        layer: layerLoss,
        title: "Forest Loss (2001 - 2019)"
      }
    ]
  });
view.ui.add(legend, {
  position: "bottom-right"
});
  
});