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

      const layerLoss = new ImageryLayer({
        url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
        bandIds: 1,
        //pixelFilter: filter,
        //renderingRule: colorRF,
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
layer.renderer = renderer;

// loss year
    let remapRF = new RasterFunction();
    remapRF.functionName = "Remap";
    remapRF.functionArguments = {
      InputRanges: [1,19],
      OutputValues: [1],
      Raster: "$$"
  };
  remapRF.outputPixelType = "u8";

  let colorRF = new RasterFunction();
  colorRF.functionName = "Colormap";
  colorRF.functionArguments = {
    Colormap: [
      [1, 255, 0, 0]
    ],
    Raster: remapRF
  };
  layerLoss.renderingRule = colorRF;



   
    let pixelSize = {
      x:view.resolution,
      y:view.resolution,
      spatialReference: view.spatialReference
    }

    let params = new ImageHistogramParameters({
      pixelSize: pixelSize
    });


    // request for histograms and statistics for the specified parameters
    layerLoss.computeStatisticsHistograms(params).then(function(results){
      // results are returned and process it as needed.
      const histogram = results.histograms[0];
      const stats = results.statistics[0];
      console.log("histograms and stats", results);
    })
   

    function filter(pixelData) {
      var serviceInfo = layer.serviceRasterInfo;
      var stats = serviceInfo.statistics[1]; // 0: layer.1, 1: layer.2
      let numPixels1 = serviceInfo.width * serviceInfo.height;
      let pixelSizeX = serviceInfo.pixelSize.x;
      let pixelSizeY = serviceInfo.pixelSize.y;
      let pixelSize = pixelSizeX * pixelSizeY;

      // Get list of all pixel values (range: 0 - 19)

      console.log(serviceInfo);
      


      // The pixelBlock stores the values of all pixels visible in the view
      let pixelBlock = pixelData.pixelBlock;

      // Get the min and max values of the data in the current view
      let minValue = pixelBlock.statistics[0].minValue;
      let maxValue = pixelBlock.statistics[0].maxValue;
    
      // The mask is an array that determines which pixels are visible to the client
      let mask = pixelBlock.mask;
    
      // The pixels visible in the view
      let pixels = pixelBlock.pixels;
    
      // The number of pixels in the pixelBlock
      let numPixels = pixelBlock.width * pixelBlock.height;
      let band1 = pixels[0];

      console.log(pixelBlock.statistics);


      let tempValue = [];
      for (i = 0; i < numPixels; i++) {
        let temp = band1[i];
        if (temp > 0) {
          tempValue.push(temp)
        }
      }

     // console.log(tempValue);

    }

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