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
  "esri/layers/support/TileInfo",
], (Map, MapView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend, ImageHistogramParameters, Query, FeatureLayer, MapImageLayer,
    Slider, reactiveUtils, Expand, Fullscreen, ImageryLayerView, LayerList,
    Graphic, Circle, promiseUtils, TileInfo) => {

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

      // "Sentinel-2 10m Land Use/Lad Cover Time Series"

      var sentinelImage = new ImageryLayer({
        url: "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer",
        //
        title: "Land Cover (2021, Sentinel-2)",
        definitionExpression: "Year = 2021",
        //pixelFilter: testfilter,
        format: "lerc"
      });
      map.add(sentinelImage);
      sentinelImage.opacity = 0.5;

// Refer to this link: https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-clientside/
const graphic = new Graphic({
  geometry: null,
  symbol: {
    type: "simple-fill",
    color: null,
    style: "solid",
    outline: {
      color: "blue",
      width: 2
    }
  }
});
view.graphics.add(graphic);

view.whenLayerView(sentinelImage).then(layerLoaded);
      function layerLoaded(layerView) {
        layerView.watch("updating", (value) => {
          if (!value) {
            pixelData = layerView.pixelData;
            //var numP = pixelData.pixelBlock.pixels[0];
            //const currentExtent = pixelData.extent;
            //const xmin = currentExtent.xmin;

            // Get all pixels
            //const pixelBlock = pixelData.pixelBlock;
            //const pixels = pixelBlock.pixels[0];
          }
        });

        removeChartEvents = view.on(["drag", "click"], (event) => {
          if (pixelData){
            event.stopPropagation();
            getLandCoverPixelInfo(event);
          }
        })
      }

const getLandCoverPixelInfo = promiseUtils.debounce((event) => {
  am4core.ready(function() {
    am4core.useTheme(am4themes_animated);
  
    const currentExtent = pixelData.extent;
  const pixelBlock = pixelData.pixelBlock;
  const height = pixelBlock.height;
  const width = pixelBlock.width;

  const point = view.toMap({
    x: event.x,
    y: event.y
  });

        // pointer x, y in pixels
        const reqX = Math.ceil(event.x);
        const reqY = Math.ceil(event.y);

        // calculate how many meters are represented by 1 pixel.
        const pixelSizeX = Math.abs(currentExtent.xmax - currentExtent.xmin) / width;

        // calculate how many pixels represent one mile
        const bufferDim = Math.ceil(1609 / pixelSizeX);

        // figure out 2 mile extent around the pointer location
        const xmin = (reqX - bufferDim < 0) ? 0 : reqX - bufferDim;
        const ymin = (reqY - bufferDim < 0) ? 0 : reqY - bufferDim;
        const startPixel = ymin * width + xmin;
        const bufferlength = bufferDim * 2;
        const pixels = pixelBlock.pixels[0];
        const radius2 = bufferDim * bufferDim;
        let oneMilePixelValues = [];

        // cover pixels within to 2 mile rectangle
        if (bufferlength) {
          for (let i = 0; i <= bufferlength; i++) {
            for (let j = 0; j <= bufferlength; j++) {
              // check if the given pixel location is in within one mile of the pointer
              // add its value to pixelValue.
              let pixelValue;
              if ((Math.pow(i - bufferDim, 2) + Math.pow(j - bufferDim, 2)) <= radius2){
                pixelValue = pixels[Math.floor(startPixel + i * width + j)];
              }
              if (pixelValue !== undefined) {
                oneMilePixelValues.push(pixelValue);
              }
            }
          }
        } else {
          oneMilePixelValues.push(pixels[startPixel]);
        }

        pixelValCount = {};
        // get the count of each land type returned within one mile raduis
        for (let i = 0; i < oneMilePixelValues.length; i++) {
          pixelValCount[oneMilePixelValues[i]] = 1 + (pixelValCount[oneMilePixelValues[i]] || 0);
        }

        const circle = new Circle({
          center: point,
          radius: bufferDim * pixelSizeX
        });

        graphic.geometry = circle;

        // Class
        // 1. Water, 2. Trees, 4. Flooded Vegetation, 5. Crops, 7. Built Area, 8. Bare Ground, 9. Snow/Ice, 10. Clouds, 11. Rangeland
        const trees = pixelValCount[2];
        const crops = pixelValCount[5];
        const builtArea = pixelValCount[7];

        console.log("Trees: " + trees + ", Crops: " + crops + ", Built Area: " + builtArea);

        // Chart
        var chart = am4core.create("chartdiv", am4charts.PieChart);
        // Add data
        chart.data = [
          {
          "class": "Trees",
          "value": trees,
          "color": am4core.color("#358221")
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
          }
        ];

        // Set inner radius
        chart.innerRadius = am4core.percent(30);

        // Chart Title
        let title = chart.titles.create();
        title.text = "Land Use Area";
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
          const LEGEND_FONT_SIZE = 15;
          chart.legend = new am4charts.Legend();
          chart.legend.valueLabels.template.align = "right"
          chart.legend.valueLabels.template.textAlign = "end";

          //chart.legend.position = "bottom";
          chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
          chart.legend.labels.template.fill = "#ffffff";
          chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
          chart.legend.valueLabels.template.fontSize = LEGEND_FONT_SIZE; 
          pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
          //pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";

        } // End of createSlices function
        createSlices("value", "class");

        // Add and configure Series
        //var pieSeries = chart.series.push(new am4charts.PieSeries());
        //pieSeries.dataFields.value = "value";
        //pieSeries.dataFields.category = "class";

        am4core.options.autoDispose = true;

      }); // end of am4core
});

// Turn on/off Chart widget
let chartEnabled = true;
let removeChartEvents;
const enableChartButton = document.getElementById("enableChart");
view.ui.add(enableChartButton, "top-right");
enableChartButton.addEventListener("click", () =>{
  chartEnabled = chartEnabled ? false : true;
  if (chartEnabled) {
    enableChartButton.classList.add("esri-icon-pie-chart");
    enableChartButton.classList.remove("esri-icon-pan");
    removeChartEvents = view.on(["drag", "click"], (event) => {
      if (pixelData){
        event.stopPropagation();
        getLandCoverPixelInfo(event);
      }
    });
  } else{
    removeChartEvents.remove();
    removeChartEvents = null;
    enableChartButton.classList.remove("esri-icon-pie-chart");
    enableChartButton.classList.add("esri-icon-pan");
    graphic.geometry = null;
  }
});

// Turn on/off chartdiv when sentinel image layer is hidden or on
reactiveUtils.when(() => sentinelImage.visible === false, () => document.getElementById("chartdiv").style.display = 'none');
reactiveUtils.when(() => sentinelImage.visible === true, () => document.getElementById("chartdiv").style.display = 'block');

  view.ui.empty("top-left");

  // Layer List
  var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event) {
      const item = event.item;
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