require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/ImageryLayer",
  "esri/layers/ImageryTileLayer"
], (Map, MapView, ImageryLayer, ImageryTileLayer) => {
  /********************
   * Create image layer
   ********************/

  const layer = new ImageryLayer({
    url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
    pixelFilter: colorize,
    //format: "jpgpng" // server exports in either jpg or png format
  });
  layer.opacity = 0.5;

  function colorize(pixelData) {
    // If there isn't pixelData, a pixelBlock, nor pixels, exit the function
    if (pixelData === null || pixelData.pixelBlock === null || pixelData.pixelBlock.pixels === null) {
      return;
    }
  
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
  
    // Calculate the factor by which to determine the red and blue
    // values in the colorized version of the layer
    let factor = 255.0 / (maxValue - minValue);
  
    // Get the pixels containing temperature values in the only band of the data
    let band1 = pixels[0];
  
    // Create empty arrays for each of the RGB bands to set on the pixelBlock
    let rBand = [];
    let gBand = [];
    let bBand = [];
  
    // Loop through all the pixels in the view
    for (i = 0; i < numPixels; i++) {
      // Get the pixel value recorded at the pixel location
      let tempValue = band1[i];
      // Calculate the red value based on the factor
      let red = (tempValue - minValue) * factor;
  
      /*
      // Sets a color between blue (lowest) and red (highest) in each band
      rBand[i] = red;
      gBand[i] = 0;
      bBand[i] = 255 - red;
*/
      // only forest area (red: highest forest area, blue: lowest forest area)
      rBand[i] = 0;
      gBand[i] = red;
      bBand[i] = 255 - red;

    }
  
    // Set the new pixel values on the pixelBlock (now three bands)
    pixelData.pixelBlock.pixels = [rBand, gBand, bBand];
    pixelData.pixelBlock.pixelType = "u8"; // u8 is used for color
  }

  /**************************
   * Add image layer to map
   *************************/

  const map = new Map({
    basemap: "satellite",
    layers: [layer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [12.8867418, 48.6382704],
    zoom: 10
  });

  
});