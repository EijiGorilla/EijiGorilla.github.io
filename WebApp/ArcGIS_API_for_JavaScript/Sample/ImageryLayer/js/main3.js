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
  "esri/widgets/Legend"
], (Map, MapView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend) => {
  /********************
   * Create image layer
   ********************/
  // 
/*
  const stretchFunction = new RasterFunction({
    functionName: "Stretch",
      functionArguments: {
        StretchType: 5, // (0 = None, 3 = StandardDeviation, 4 = Histogram Equalization, 5 = MinMax, 6 = PercentClip, 9 = Sigmoid)
        Min: 0,
        Max: 255,
        Raster: "$1" // $$(default) refers to the entire image service, $2 refers to the second image of the image service
      },
      outputPixelType: "u8"
    });
    
    const colorFunction = new RasterFunction({
      functionName: "Colormap",
      functionArguments: {
        ColorrampName: "Temperature", // other examples: "Slope", "Surface", "Blue Bright"....
        Raster: stretchFunction // chaining multiple rasterfunctions
      }
    });
    //layer.renderingRule = colorFunction;
*/
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

    const layer = new ImageryLayer({
      url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
      //pixelFilter: colorize,
      bandIds: "layer.1",
      renderer: renderer,
      format: "lerc" // server exports in either jpg or png format
    });


    // loss year
const rendererLoss = {
  type: "unique-value",
  field: "pixelValues",
  uniqueValueInfos: [
    {
      value: 0,
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0]
      }
    },
    {
      value: 1,
      symbol: {
        type: "simple-fill",
        color: [255, 0, 0]
      }
    }
  ]
}
     
    const layerLoss = new ImageryLayer({
      url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
      //pixelFilter: colorize,
      bandIds: "layer.2",
      renderer: rendererLoss,
      format: "lerc" // server exports in either jpg or png format
    });
    
  // Use pixelFilter to colorize pixels
  function colorize(pixelData) {
    // The pixelBlock stores the values of all pixels visible in the view
    let pixelBlock = pixelData.pixelBlock;
  
    // Get the min and max values of the data in the current view
    let minValue = pixelBlock.statistics[0].minValue;
    let maxValue = pixelBlock.statistics[0].maxValue;

    // Service Raster
    let serviceRaster = layer.serviceRasterInfo;

    let bandProperties = serviceRaster.keyProperties;
    let pixelSizeX = serviceRaster.pixelSize.x;
    let pixelSizeY = serviceRaster.pixelSize.y;
    let pixelType = serviceRaster.pixelType; // current type is 'f32'

    //
  }

  
//





 /**************************
   * Add image layer to map
   *************************/

  const map = new Map({
    basemap: "satellite",
    layers: [layerLoss, layer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [12.8867418, 48.6382704],
    zoom: 10
  });

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
        title: "Forest Loss"
      }
    ]
  });
view.ui.add(legend, {
  position: "bottom-right"
});
  
});