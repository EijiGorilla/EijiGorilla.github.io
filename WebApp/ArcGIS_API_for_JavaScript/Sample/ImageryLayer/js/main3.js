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
], (Map, MapView, ImageryLayer, ImageryTileLayer,
    RasterFunction, RasterInfo, RasterStretchRenderer, UniqueValueRenderer,
    MultipartColorRamp,
    Legend, ImageHistogramParameters, Query, FeatureLayer, MapImageLayer,
    Slider, reactiveUtils, Expand, Fullscreen) => {

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


      const layer = new ImageryLayer({
        url: "https://gis.railway-sector.com/server/rest/services/sample_raster/ImageServer",
        //pixelFilter: colorize,
        bandIds: "layer.1",
        //renderer: renderer,
        format: "lerc" // server exports in either jpg or png format
      });
      map.add(layer);

      // Default rendering in 2000 (before loss year)
      let remapRF2 = new RasterFunction();
      remapRF2.functionName = "Remap";
      remapRF2.functionArguments = {
        InputRanges: [1, 1], // [1,19]
        OutputValues: [1], // [1]
        Raster: "$$"
    };
    remapRF2.outputPixelType = "u8";
  
    let colorRF2 = new RasterFunction();
    colorRF2.functionName = "Colormap";
    colorRF2.functionArguments = {
      Colormap: [
        [1, 255, 0, 0]
      ],
      Raster: remapRF2
    };

      const layerLoss = new ImageryLayer({
        url: "https://gis.railway-sector.com/server/rest/services/sample_raster2/ImageServer",
        //bandIds: 1,
        //RenderingRule: colorRF,
        pixelFilter: filter,
        //format: "lerc" // server exports in either jpg or png format,
        title: ""
      });
      map.add(layerLoss);
      layerLoss.renderingRule = colorRF2;

        // Slider to mask imagery layer based on its pixel values
        const pixelSlider = new Slider({
          container: "pixelSlider",
          min: 1,
          max: 19,
          steps: 1,
          values: [1, 19],
          visibleElements: {
            labels: true,
            rangeLabels: true
          }
        });
        view.ui.add("infoDiv", "bottom-left");
        pixelSlider.on(["thumb-drag", "thumb-change", "segment-drag"], updateYearFilter);      

        var forestLossYearLabel = document.getElementById("forestLossYearLabel");
        function updateYearFilter() {
          yearValue = pixelSlider.values[0];

          const YEAR_LABEL = 2000 + yearValue;
          forestLossYearLabel.innerHTML = "2001" + " - " + YEAR_LABEL;
  
          // Renderng Rule for layerLoss
          let remapRF = new RasterFunction();
            remapRF.functionName = "Remap";
            remapRF.functionArguments = {
              InputRanges: [1, yearValue], // [1,19]
              OutputValues: [1], // [1]
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
        }




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
// get the raster attribute table
// Source Link: https://developers.arcgis.com/javascript/latest/sample-code/layers-imagery-attribute-table/
// Study this codepen: https://codepen.io/pen?editors=1000
let fields;

layerLoss.when(() => {
  rasterAttributes = layerLoss.serviceRasterInfo.attributeTable.features;
  fields = rasterAttributes.filter((item, i) => {
    // get the objects storing field information for pixels classified as 1 -19
    let Value = item.attributes.Value;
    //console.log(Value);
    return Value;
  });
});

//console.log(temp);
var temp = [];
var yearlyLoss = [];


  function filter(pixelData) {
    am4core.ready(function() {
      am4core.useTheme(am4themes_animated);
      var serviceInfo = layerLoss.serviceRasterInfo;
      var stats = serviceInfo.statistics[1]; // 0: layer.1, 1: layer.2
      let numPixels1 = serviceInfo.width * serviceInfo.height;
      let pixelSizeX = serviceInfo.pixelSize.x;
      let pixelSizeY = serviceInfo.pixelSize.y;
      let pixelSize = pixelSizeX * pixelSizeY;

      let pixelBlock = pixelData.pixelBlock;

      const FACTOR = 1000000;

      // Compile all the counts for each Value (1-19)
      for (var i = 0; i < fields.length; i++) {
        var ttt = fields[i].attributes.Count; // fields[0] is "Value === 1"
        var loss = ttt * pixelSize * FACTOR;
        yearlyLoss.push(loss);
        temp.push(ttt);
      }

      // Compute the sum of Count (total cell numbers of loss area)
      let result = temp.reduce((a, b) => {
        return a + b;
      });

      // Compute total area of forest loss
      var totalLossArea = result * pixelSize * FACTOR; // this is wrong. check unit of cell size

      // Create a chart showing yearly loss of forest area
      var chart = am4core.create("forestLossChartDiv", am4charts.XYChart);
      //chart.scrollbarX = new am4core.Scrollbar();

      const YEAR = ["2001", "2002", "2003", "2004", "2005",
                    "2006", "2007", "2008", "2009", "2010",
                    "2011", "2012", "2013", "2014", "2015",
                    "2016", "2017", "2018", "2019"];
      // Add data
      chart.data = [
        {
          year: YEAR[0],
          value1: yearlyLoss[0]
        },
        {
          year: YEAR[1],
          value1: yearlyLoss[1]
        },
        {
          year: YEAR[2],
          value1: yearlyLoss[2]
        },
        {
          year: YEAR[3],
          value1: yearlyLoss[2]
        },
        {
          year: YEAR[4],
          value1: yearlyLoss[4]
        },
        {
          year: YEAR[5],
          value1: yearlyLoss[5]
        },
        {
          year: YEAR[6],
          value1: yearlyLoss[6]
        },
        {
          year: YEAR[7],
          value1: yearlyLoss[7]
        },
        {
          year: YEAR[8],
          value1: yearlyLoss[8]
        },
        {
          year: YEAR[9],
          value1: yearlyLoss[9]
        },
        {
          year: YEAR[10],
          value1: yearlyLoss[10]
        },
        {
          year: YEAR[11],
          value1: yearlyLoss[11]
        },
        {
          year: YEAR[12],
          value1: yearlyLoss[12]
        },
        {
          year: YEAR[13],
          value1: yearlyLoss[13]
        },
        {
          year: YEAR[14],
          value1: yearlyLoss[14]
        },
        {
          year: YEAR[15],
          value1: yearlyLoss[15]
        },
        {
          year: YEAR[16],
          value1: yearlyLoss[16]
        },
        {
          year: YEAR[17],
          value1: yearlyLoss[17]
        },
        {
          year: YEAR[18],
          value1: yearlyLoss[18]
        },
      ]

      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "year";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 30;
      categoryAxis.renderer.labels.template.horizontalCenter = "right";
      categoryAxis.renderer.labels.template.verticalCenter = "middle";
      categoryAxis.renderer.labels.template.rotation = 270;
      categoryAxis.renderer.labels.template.fontSize = 10;
      categoryAxis.renderer.labels.template.fill = "#ffffff";
      categoryAxis.tooltip.disabled = true;
      categoryAxis.renderer.minHeight = 110;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.minWidth = 50;
      valueAxis.renderer.inside = false;
      valueAxis.renderer.labels.template.disabled = false;
      valueAxis.min = 0;
      valueAxis.renderer.labels.template.fontSize = 10;
      valueAxis.renderer.labels.template.fill = "#ffffff";

      // Create series
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.sequencedInterpolation = true;
      series.dataFields.valueY = "value1";
      series.dataFields.categoryX = "year";
      series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
      series.columns.template.strokeWidth = 0;

      series.tooltip.pointerOrientation = "vertical";

      series.columns.template.column.cornerRadiusTopLeft = 10;
      series.columns.template.column.cornerRadiusTopRight = 10;
      series.columns.template.column.fillOpacity = 0.8;
      series.columns.template.fill = am4core.color("red");

      // on hover, make corner radiuses bigger
      var hoverState = series.columns.template.column.states.create("hover");
      hoverState.properties.cornerRadiusTopLeft = 0;
      hoverState.properties.cornerRadiusTopRight = 0;
      hoverState.properties.fillOpacity = 1;

      // Cursor
      chart.cursor = new am4charts.XYCursor();


  }); // end of am4core
  }
  view.ui.empty("top-left");

// Monthly Progress Chart 
const progressExpand = new Expand({
  view: view,
  content: document.getElementById("forestLossChartDiv"),
  expandIconClass: "esri-icon-chart"
});
view.ui.add(progressExpand, {
  position: "top-left"
});

  // Full screen widget
  view.ui.add(
    new Fullscreen({
      view: view,
      element: viewDiv
      //element: viewDiv // if you change element to viewDiv, only viewDiv panel is fully expanded
      // this is good for demonstration, as this removes header and chart panels.
    }),
    "top-right"
  );
 /**************************
   * Add image layer to map
   *************************/

  var legend = new Legend({
    view: view,
    container: document.getElementById("legendDiv"),
    layerInfos: [
      {
        layer: layer,
        title: "Tree Cover in 2000"
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