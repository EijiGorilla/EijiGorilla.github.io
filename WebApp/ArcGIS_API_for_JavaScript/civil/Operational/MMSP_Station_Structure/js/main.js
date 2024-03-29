require([
  "esri/Basemap",
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/support/FeatureFilter",
  "esri/layers/SceneLayer",
  "esri/layers/Layer",
  "esri/layers/TileLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/support/LabelClass",
  "esri/symbols/LabelSymbol3D",
  "esri/WebMap",
  "esri/WebScene",
  "esri/portal/PortalItem",
  "esri/portal/Portal",
  "esri/widgets/TimeSlider",
  "esri/widgets/Legend",
  "esri/widgets/LayerList",
  "esri/widgets/Fullscreen",
  "esri/rest/geometryService",
  "esri/rest/support/Query",
  "esri/rest/support/StatisticDefinition",
  "esri/symbols/WebStyleSymbol",
  "esri/TimeExtent",
  "esri/widgets/Expand",
  "esri/widgets/Editor",
  "esri/renderers/UniqueValueRenderer",
  "esri/widgets/support/DatePicker",
  "esri/widgets/FeatureTable",
  "esri/widgets/Compass",
  "esri/layers/ElevationLayer",
  "esri/Ground",
  "esri/widgets/BasemapToggle"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground, BasemapToggle) {

let chartLayerView;
////////////////////////////////////////////////////

var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "3a62040541b84f528da3ac7b80cf4a63" 
      }
    })
  ]
});

// Add custom DEM to the default elevation layer of esri
const worldElevation = new ElevationLayer({
  url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
  });
  

  const dem = new ElevationLayer({
    portalItem: {
         id: "dd2e85411a504182adb99215aa98ab68",
          portal: {
              url: "https://gis.railway-sector.com/portal"
          }
      }
  });

  var map = new Map({
        basemap: basemap, // "streets-night-vector", basemap, topo-vector
        ground: new Ground({
          layers: [worldElevation, dem]
        })
  });
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.1;
   
  var view = new SceneView({
      map: map,
      container: "viewDiv",
      viewingMode: "local",
      camera: {
          position: {
              x: 121.0322874,
              y: 14.6750462,
              z: 1000
              },
              tilt: 65
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

  const toggle = new BasemapToggle({
    view: view,
    nextBaseMap: "hybrid"
  });

  view.ui.add(toggle, "top-right");
  

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

  //
  function shiftCamera(deg) {
    var camera = view.camera.clone();
    camera.position.longitude += deg;
    return camera;
  }

  function catchAbortError(error) {
    if (error.name != "AbortError") {
      console.error(error);
    }
  }

  // Setup UI
  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");
  var applicationDiv = document.getElementById("applicationDiv");



//*******************************//
// Label Class Property Settings //
//*******************************//
// site photo labels
var sitePhotoLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "orange"
          },
          size: 15,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 40,
        maxWorldLength: 200,
        minWorldLength: 20
      },
      callout: {
        type: "line",
        size: 0.5,
        color: [0, 0, 0],
        border: {
          color: [255, 255, 255, 0.7]
        }
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: 'DefaultValue($feature.Description, "no data")'
    }
  });

  // Station labels
  var stationLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "white"
          },
          size: 15,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 40,
        maxWorldLength: 100,
        minWorldLength: 20
      },

    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: 'DefaultValue($feature.Station, "no data")'
    }
  });

  // Excavation SPot Label
  var excaspotlabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "#98E600"
          },
          size: 10,
          halo: {
                size: 0.8,
                color: "black"
              },
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 100,
        maxWorldLength: 200,
        minWorldLength: 30
      },
      callout: {
        type: "line",
        size: 0.5,
        color: [0, 0, 0],
        border: {
          color: [255, 255, 255, 0.7]
        }
      }

    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      value: "Excavation"
    }
  });

//*****************************//
//      Renderer Settings      //
//*****************************// 
// Photo Symbol
function getUniqueValueSymbol(name, color, sizeS, util) {
// The point symbol is visualized with an icon symbol. To clearly see the location of the point
// we displace the icon vertically and add a callout line. The line connects the offseted symbol with the location
// of the point feature.
if (util == "Existing") {
return {
type: "point-3d", // autocasts as new PointSymbol3D()
symbolLayers: [
  {
    type: "icon", // autocasts as new IconSymbol3DLayer()
    resource: {
      href: name
    },
    size: sizeS,
    outline: {
      color: "white",
      size: 2
    }
  }
],
verticalOffset: {
  screenLength: 40,
  maxWorldLength: 100,
  minWorldLength: 20
},
callout: {
  type: "line", // autocasts as new LineCallout3D()
  color: [128,128,128,0.1],
  size: 0.2,
  border: {
    color: "grey"
  }
}
};
} else {
return {
type: "point-3d", // autocasts as new PointSymbol3D()
symbolLayers: [
  {
    type: "icon", // autocasts as new IconSymbol3DLayer()
    resource: {
      href: name
    },
    size: sizeS,
    outline: {
      color: "white",
      size: 2
    }
  }
],
verticalOffset: {
  screenLength: 40,
  maxWorldLength: 100,
  minWorldLength: 20
},
callout: {
  type: "line",
  size: 0.5,
  color: [0, 0, 0],
  border: {
    color: [255, 255, 255, 0.7]
  }
}
};
}
}

var photoSymbolRenderer = {
type: "unique-value",
valueExpression: "When($feature.Description == 'PHOTO','PHOTO',$feature.Description)",
uniqueValueInfos: [
{
value: "PHOTO",
label: "Photo Spot",
symbol: getUniqueValueSymbol(
  "https://EijiGorilla.github.io/Symbols/Photo_symbol.png",
          "#D13470",
          20,
          "Relocation"
)
}
]
};


// Station Symbol
function stationsSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle",//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }


// Excavation Spot Symbol
  function excaspotSymbol(name) { // Excavation Spot 
    return {
      type: "web-style",
      name: name,
      styleName: "EsriRealisticTransportationStyle"
    };
  }

// Station Renderer
  var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Name",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };

// Excavatin Spot Renderer
  var excaspotRenderer = {
    type: "unique-value",
    field: "OBJECTID",
    defaultSymbol: excaspotSymbol("Backhoe"),
    visualVariables: [
      {
        type: "size",
        minDateValue: 0,
        maxDataValue: 10,
        minSize: 8,
        maxSize: 8
      }
    ]
  };

// Legend Color for Structure Layer        
  const colors = {
    1: [225, 225, 225, 0], // To be Constructed (white)
    2: [130, 130, 130, 0.3], // Under Construction
    3: [255, 0, 0, 0.6], // Delayed
    4: [0, 197, 255, 0.5], // Completed
  };

//*******************************//
// Import Layers                 //
//*******************************//
// TBM Alignment reference line:--------------
let defaultTBMAlign = {
          type: "simple-line",
          color: [211, 211, 211, 0.8],
          style: "solid",
          width: 1
};


// Station point feature
var stationLayer = new SceneLayer({
    portalItem: {
      id: "6d8d606fee5841ea80fa133adbb028fc",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      },
    },
       labelingInfo: [stationLabelClass],
       renderer: stationsRenderer,
       definitionExpression: "sector = 'MMSP'",
       popupEnabled: false,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer);

// Excavation machine
/*
  var excaSpot = new FeatureLayer({
    portalItem: {
      id: "1bc7404021644b3ba6e28b815e4e200a",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    labelingInfo: [excaspotlabelClass],
    renderer: excaspotRenderer,
    screenSizePerspectiveEnabled: false,
    title: "Excavation Spot"
  });
  excaSpot.listMode = "hide";
  view.map.add(excaSpot);
*/

// Structure Layer
  var structureLayer = new SceneLayer({ //structureLayer
    portalItem: {
      id: "09f1e6d86cf34567bebcd22afcad8b4b",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    popupTemplate: {
title: "<h5>{Status}</h5>",
lastEditInfoEnabled: false,
outFields: ["*"],
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Type",
       label: "Type of Structure"
     },
     {
       fieldName: "ID",
       label: "Structure ID",
     },
     {
       fieldName: "Status",
       label: "Construction Status"
     }
   ]
 }
]
},
      elevationInfo: {
          mode: "absolute-height",
          offset: 0
      },
      title: "Station Structure"
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
  });
  structureLayer.listMode = "hide";
  map.add(structureLayer, 1);

  function renderStructureLayer() {
    const renderer = new UniqueValueRenderer({
      field: "Status"
    });

    for (let property in colors) {
      if (colors.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: colors[property],
                  colorMixMode: "replace"
                },
                edges: {
                  type: "solid", // autocasts as new SolidEdges3D()
                  color: [225, 225, 225, 0.8]
                  }
              }
            ]
           }
        });
      }
    }

    structureLayer.renderer = renderer;
  }

  renderStructureLayer();


// TBM Tunnel used as a reference
  var transitLayer = new FeatureLayer({
  portalItem: {
    id: "af9539f5e41e4bd8b694973972e3faf4",
    portal: {
  url: "https://gis.railway-sector.com/portal"
}
  },
  layerId: 2,
  elevationInfo: {
    mode: "absolute-height",//"on-the-ground", relative-to-ground, absolute-height
    offset: -2
  },
   //renderer: roundTubeSymbol,
   title: "TBM Segment",
   //definitionExpression: "sens='Aller'",
   outFields: ["*"],
   popupEnabled: false
  });
  map.add(transitLayer);

  const options = {
    profile: "circle",
    cap: "butt", // butt
    join: "miter",
    width: 5,
    height: 5,
    color: [200, 200, 200, 0.3],
    profileRotation: "all"
  };

  /* The colors used for the each transit line */
  const colorsTBM = {
    0: [225, 225, 225, 0.2], // To be Constructed
    1: [225, 225, 225, 0.2], // Completed
    2: [225, 225, 225, 0.2], // Delayed
  };

  function renderTransitLayer() {
    const renderer = new UniqueValueRenderer({
      field: "status"
    });

    for (let property in colorsTBM) {
      if (colorsTBM.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "line-3d",
            symbolLayers: [
              {
                type: "path",
                profile: options.profile,
                material: {
                  color: colorsTBM[property]
                },
                width: options.width,
                height: options.height,
                join: options.join,
                cap: options.cap,
                anchor: "bottom",
                profileRotation: options.profileRotation
              }
            ]
          }
        });
      }
    }

    transitLayer.renderer = renderer;
  }

  renderTransitLayer();

  // photo points
var photoLayer = new FeatureLayer({
portalItem: {
id: "bdbfa1159b6c4ef3a94e0c87462bc625",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
//labelingInfo: [sitePhotoLabelClass],
renderer: photoSymbolRenderer,
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
expression: "Geometry($feature).z * 0"
},
unit: "meters"
},
popupTemplate: {
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "media",
  mediaInfos: [
    {
      title: "{Title}",
      type: "image",
      caption: "As of {DateTime}",
      value: {
        sourceURL: "{ImageURL}"
      }
    }
  ]
}
]
}

});
map.add(photoLayer,1);

// Radio Button Selection //        
// Selection of 'D-Wall' or 'Station Box' only for visualization (not chart)
let structureLayerView;


//*******************************//
//      Progress Chart           //
//*******************************//

// Total progress //
function perStationProgress() {
var total_complete = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_complete",
statisticType: "sum"
};

var total_obs = {
onStatisticField: "Status",
outStatisticFieldName: "total_obs",
statisticType: "count"
};
var query = structureLayer.createQuery();
query.outStatistics = [total_complete, total_obs];
query.returnGeometry = true;
structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_complete = stats.total_complete;
const total_obs = stats.total_obs;
document.getElementById("totalProgress").innerHTML = ((total_complete/total_obs)*100).toFixed(1) + " %";
});
}
perStationProgress();

/* Function for zooming to selected layers */
function zoomToLayer(layer) {
return layer.queryExtent().then(function(response) {
view.goTo(response.extent, { //response.extent
speedFactor: 2
}).catch(function(error) {
if (error.name != "AbortError") {
  console.error(error);
}
});
});
}

//////////////

const DropdownValue = document.getElementById("valSelect");

// Create Bar chart to show progress of station structure
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default selection = 'None'
structureLayer.definitionExpression = null;
zoomToLayer(structureLayer);
updateChart();
summaryStats().then(MonthlyProgressChart);


function getValues() {
var testArray = [];
var query = structureLayer.createQuery();
query.outFields = ["Station1"];
structureLayer.returnGeometry = true;
return structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features;
stats.forEach((result, index) => {
var attributes = result.attributes;
const values = attributes.Station1;
testArray.push(values);
});
return testArray;
});
}

function getUniqueValues(values) {
var uniqueValues = [];
values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
      //headerTitleDiv.innerHTML = uniqueValues;
  }
});
return uniqueValues;
}

function addToSelect(values) {
DropdownValue.options.length = 0;
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  DropdownValue.add(option);
});
}
getValues()
.then(getUniqueValues)
.then(addToSelect)

// click event handler for choices
DropdownValue.addEventListener("click", filterByTest);
function filterByTest(event) {
const selectedID = event.target.value;

//filterStructureStation(selectedID);

if (selectedID === "None") {
structureLayer.definitionExpression = null;
zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();
} else {
structureLayer.definitionExpression = "Station1 = '" + selectedID + "'";
zoomToLayer(structureLayer);
updateChart();
perStationProgress();
}

/*
if (selectedID === "Quirino Highway") {
structureLayer.definitionExpression = "Station = 2";
zoomToLayer(structureLayer);
updateChart();
perStationProgress();

} else if (selectedID === "Tandang Sora") {
structureLayer.definitionExpression = "Station = 3";
zoomToLayer(structureLayer);
updateChart();
perStationProgress();

} else if (selectedID === "North Avenue") {
structureLayer.definitionExpression = "Station = 4";
zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();

} else if (selectedID === "Quezon Avenue") {
structureLayer.definitionExpression = "Station = 5";

zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();   

} else if (selectedID === "East Avenue") {
structureLayer.definitionExpression = "Station = 6";

zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();

} else if (selectedID === "Anonas") {
structureLayer.definitionExpression = "Station = 7";

zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();   

} else if (selectedID === "None") {
structureLayer.definitionExpression = null;
chartTitleDiv.innerHTML = chartTitleLabel + "<p>" + "All Stations" + "</p>";
zoomToLayer(structureLayer);
updateChart(); 
perStationProgress();
}
*/
} // End of filterByTest


// Obtain summary statiscis for stacked barchart 
const years = [2021,2022];
const months = [1,2,3,4,5,6,7,8,9,10,11,12];
const typesN = [1,2,3,4,5];

const dwall_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const dwall_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const column_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const column_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const slab_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const slab_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const kingpost_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const kingpost_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const secantp_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const secantp_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

const columnHead_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
const columnHead_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};

// Length of Year and Month array
var ylength = years.length;
var mlength = months.length;
var arr = new Array();

// Compile Year and Month in an empty Array
for(var i=years[0]; i<=years[ylength-1]; i++){
for(var j=months[0]; j<=months[mlength-1]; j++){
var ym = i.toString() + "-" + j.toString();
arr.push(new Date(ym).toLocaleDateString('en-ZA'));
}
}

// OPTION 1:
function summaryStats(){
var total_count = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_count",
statisticType: "sum"
}

var query = structureLayer.createQuery();
query.where = "Year IS NOT NULL";
query.outStatistics = [total_count];
//query.orderByFields = ["Type Year Month"];
query.groupByFieldsForStatistics = ["Type", "Year", "Month"];

return structureLayer.queryFeatures(query).then(function(response) {
stats = response.features;

stats.forEach((result, index) => {
const attributes = result.attributes;
const TYPE = attributes.Type;
const YEAR = attributes.Year;
const MONTH = attributes.Month;
//const DATE = attributes.end_date;
const VALUE = attributes.total_count;

// Type = 1 (Bored Piles)
if(TYPE === 1 && YEAR === 2021){
  dwall_2021[MONTH].push(VALUE);

} else if (TYPE === 1 && YEAR === 2022){
  dwall_2022[MONTH].push(VALUE);

} else if (TYPE === 2 && YEAR === 2021){
  column_2021[MONTH].push(VALUE);

} else if (TYPE === 2 && YEAR === 2022){
  column_2022[MONTH].push(VALUE);
  
} else if (TYPE === 3 && YEAR === 2021){
  slab_2021[MONTH].push(VALUE);
  
} else if (TYPE === 3 && YEAR === 2022){
  slab_2022[MONTH].push(VALUE);
  
} else if (TYPE === 4 && YEAR === 2021){
  kingpost_2021[MONTH].push(VALUE);
  
} else if (TYPE === 4 && YEAR === 2022){
  kingpost_2022[MONTH].push(VALUE);
  
} else if (TYPE === 5 && YEAR === 2021){
  secantp_2021[MONTH].push(VALUE);
  
} else if (TYPE === 5 && YEAR === 2022){
  secantp_2022[MONTH].push(VALUE);

} else if (TYPE === 6 && YEAR === 2021){
  columnHead_2021[MONTH].push(VALUE);

} else if (TYPE === 6 && YEAR === 2022){
  columnHead_2022[MONTH].push(VALUE);
}

});
return [dwall_2021, dwall_2022,
      column_2021, column_2022,
      slab_2021, slab_2022,
      kingpost_2021, kingpost_2022,
      secantp_2021, secantp_2022,
      columnHead_2021, columnHead_2022];
});
}


//////

//////////////////////////////////// Time line bar charts //////////////////////////////////
const monthlyProgressChartDiv = document.getElementById("monthlyProgressChartDiv");

function MonthlyProgressChart([dwall_2021, dwall_2022,
      column_2021, column_2022,
      slab_2021, slab_2022,
      kingpost_2021, kingpost_2022,
      secantp_2021, secantp_2022,
      columnHead_2021, columnHead_2022]){

// Create chart instance
var chart = am4core.create("monthlyProgressChartDiv", am4charts.XYChart);



// Add data
chart.data = [
{
date: new Date(2020, 12), // Jan. 2021
value1: dwall_2021[1],
value2: column_2021[1],
value3: slab_2021[1],
value4: kingpost_2021[1],
value5: secantp_2022[1],
value6: columnHead_2021[1]

},
{
date: new Date(2021, 1),
value1: dwall_2021[2],
value2: column_2021[2],
value3: slab_2021[2],
value4: kingpost_2021[2],
value5: secantp_2021[2],
value6: columnHead_2021[2]
},
{
date: new Date(2021, 2),
value1: dwall_2021[3],
value2: column_2021[3],
value3: slab_2021[3],
value4: kingpost_2021[3],
value5: secantp_2021[3],
value6: columnHead_2021[3]
},
{
date: new Date(2021, 3),
value1: dwall_2021[4],
value2: column_2021[4],
value3: slab_2021[4],
value4: kingpost_2021[4],
value5: secantp_2021[4],
value6: columnHead_2021[4]
},
{
date: new Date(2021, 4),
value1: dwall_2021[5],
value2: column_2021[5],
value3: slab_2021[5],
value4: kingpost_2021[5],
value5: secantp_2021[5],
value6: columnHead_2021[5]
},
{
date: new Date(2021, 5),
value1: dwall_2021[6],
value2: column_2021[6],
value3: slab_2021[6],
value4: kingpost_2021[6],
value5: secantp_2021[6],
value6: columnHead_2021[6]
},
{
date: new Date(2021, 6),
value1: dwall_2021[7],
value2: column_2021[7],
value3: slab_2021[7],
value4: kingpost_2021[7],
value5: secantp_2021[7],
value6: columnHead_2021[7]
},
{
date: new Date(2021, 7),
value1: dwall_2021[8],
value2: column_2021[8],
value3: slab_2021[8],
value4: kingpost_2021[8],
value5: secantp_2021[8],
value6: columnHead_2021[8]
},
{
date: new Date(2021, 8),
value1: dwall_2021[9],
value2: column_2021[9],
value3: slab_2021[9],
value4: kingpost_2021[9],
value5: secantp_2021[9],
value6: columnHead_2021[9]
},
{
date: new Date(2021, 9),
value1: dwall_2021[10],
value2: column_2021[10],
value3: slab_2021[10],
value4: kingpost_2021[10],
value5: secantp_2021[10],
value6: columnHead_2021[10]
},
{
date: new Date(2021, 10),
value1: dwall_2021[11],
value2: column_2021[11],
value3: slab_2021[11],
value4: kingpost_2021[11],
value5: secantp_2021[11],
value6: columnHead_2021[11]
},
{
date: new Date(2021, 11),
value1: dwall_2021[12],
value2: column_2021[12],
value3: slab_2021[12],
value4: kingpost_2021[12],
value5: secantp_2021[12],
value6: columnHead_2021[12]
},
{
date: new Date(2021, 12),
value1: dwall_2022[1],
value2: column_2022[1],
value3: slab_2022[1],
value4: kingpost_2022[1],
value5: secantp_2022[1],
value6: columnHead_2022[1]
},
{
date: new Date(2022, 1),
value1: dwall_2022[2],
value2: column_2022[2],
value3: slab_2022[2],
value4: kingpost_2022[2],
value5: secantp_2022[2],
value6: columnHead_2022[2]
},
{
date: new Date(2022, 2),
value1: dwall_2022[3],
value2: column_2022[3],
value3: slab_2022[3],
value4: kingpost_2022[3],
value5: secantp_2022[3],
value6: columnHead_2022[3]
},
{
date: new Date(2022, 3),
value1: dwall_2022[4],
value2: column_2022[4],
value3: slab_2022[4],
value4: kingpost_2022[4],
value5: secantp_2022[4],
value6: columnHead_2022[4]
},
{
date: new Date(2022, 4),
value1: dwall_2022[5],
value2: column_2022[5],
value3: slab_2022[5],
value4: kingpost_2022[5],
value5: secantp_2022[5],
value6: columnHead_2022[5]
},
{
date: new Date(2022, 5),
value1: dwall_2022[6],
value2: column_2022[6],
value3: slab_2022[6],
value4: kingpost_2022[6],
value5: secantp_2022[6],
value6: columnHead_2022[6]
},
{
date: new Date(2022, 6),
value1: dwall_2022[7],
value2: column_2022[7],
value3: slab_2022[7],
value4: kingpost_2022[7],
value5: secantp_2022[7],
value6: columnHead_2022[7]
},
{
date: new Date(2022, 7),
value1: dwall_2022[8],
value2: column_2022[8],
value3: slab_2022[8],
value4: kingpost_2022[8],
value5: secantp_2022[8],
value6: columnHead_2022[8]
},
{
  date: new Date(2022, 8),
  value1: dwall_2022[9],
  value2: column_2022[9],
  value3: slab_2022[9],
  value4: kingpost_2022[9],
  value5: secantp_2022[9],
  value6: columnHead_2022[9]
},
{
  date: new Date(2022, 9),
  value1: dwall_2022[10],
  value2: column_2022[10],
  value3: slab_2022[10],
  value4: kingpost_2022[10],
  value5: secantp_2022[10],
  value6: columnHead_2022[10]
},
{
  date: new Date(2022, 10),
  value1: dwall_2022[11],
  value2: column_2022[11],
  value3: slab_2022[11],
  value4: kingpost_2022[11],
  value5: secantp_2022[11],
  value6: columnHead_2022[11]
},
{
  date: new Date(2022, 11),
  value1: dwall_2022[12],
  value2: column_2022[12],
  value3: slab_2022[12],
  value4: kingpost_2022[12],
  value5: secantp_2022[12],
  value6: columnHead_2022[12]
}
];

const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;


var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 16;
markerTemplate.height = 16;

// Create axes
var categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
categoryAxis.dataFields.category = "date";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 10;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.baseInterval = {
"timeUnit": "month",
"count": 1
};
var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.disabled = true;
valueAxis.min = 0;

// Create series
function createSeries(field, name) {

// Set up series
var series = chart.series.push(new am4charts.ColumnSeries());
series.name = name;
series.dataFields.valueY = field;
series.dataFields.dateX = "date";
series.sequencedInterpolation = true;



// Make it stacked
series.stacked = true;

// Configure columns
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";

// Add label
/*
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
labelBullet.label.text = "{valueY}";
labelBullet.locationY = 0.5;
labelBullet.label.hideOversized = true;
*/
return series;
}

createSeries("value1", "D-Wall");
createSeries("value2", "Column");
createSeries("value3", "Slab");
createSeries("value4", "King Post");
createSeries("value5", "Secant Pile");
createSeries("values6", "Column Head");
// Create scrollbars
//chart.scrollbarX = new am4core.Scrollbar();
//chart.scrollbarY = new am4core.Scrollbar();

}

////////////////////////////






// For Monitoring Chart
function updateChart() {
var total_dwall_tobeC = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_dwall_tobeC",
statisticType: "sum"
};

var total_dwall_underC = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_dwall_underC",
statisticType: "sum"
};
var total_dwall_done = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_dwall_done",
statisticType: "sum"
};   
var total_dwall_delayed = {
onStatisticField: "CASE WHEN (Type = 1 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_dwall_delayed",
statisticType: "sum"
};

// Column
var total_column_tobeC = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_column_tobeC",
statisticType: "sum"
};

var total_column_underC = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_column_underC",
statisticType: "sum"
};
var total_column_done = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_column_done",
statisticType: "sum"
};   
var total_column_delayed = {
onStatisticField: "CASE WHEN (Type = 2 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_column_delayed",
statisticType: "sum"
};

// Slab
var total_slab_tobeC = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_slab_tobeC",
statisticType: "sum"
};

var total_slab_underC = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_slab_underC",
statisticType: "sum"
};
var total_slab_done = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_slab_done",
statisticType: "sum"
};   
var total_slab_delayed = {
onStatisticField: "CASE WHEN (Type = 3 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_slab_delayed",
statisticType: "sum"
};

// King's Post
var total_kingpost_tobeC = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_kingpost_tobeC",
statisticType: "sum"
};

var total_kingpost_underC = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_kingpost_underC",
statisticType: "sum"
};
var total_kingpost_done = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_kingpost_done",
statisticType: "sum"
};   
var total_kingpost_delayed = {
onStatisticField: "CASE WHEN (Type = 4 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_kingpost_delayed",
statisticType: "sum"
};

// Secant Pile
var total_secant_tobeC = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_secant_tobeC",
statisticType: "sum"
};

var total_secant_underC = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_secant_underC",
statisticType: "sum"
};
var total_secant_done = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_secant_done",
statisticType: "sum"
};   
var total_secant_delayed = {
onStatisticField: "CASE WHEN (Type = 5 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_secant_delayed",
statisticType: "sum"
};

// Column Head
var total_columnhead_tobeC = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_columnhead_tobeC",
statisticType: "sum"
};

var total_columnhead_underC = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_columnhead_underC",
statisticType: "sum"
};
var total_columnhead_done = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_columnhead_done",
statisticType: "sum"
};   
var total_columnhead_delayed = {
onStatisticField: "CASE WHEN (Type = 6 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_columnhead_delayed",
statisticType: "sum"
};

var query = structureLayer.createQuery();
query.outStatistics = [total_dwall_tobeC, total_dwall_underC, total_dwall_done, total_dwall_delayed,
                 total_column_tobeC, total_column_underC, total_column_done, total_column_delayed,
                 total_slab_tobeC, total_slab_underC, total_slab_done, total_slab_delayed,
                 total_kingpost_tobeC, total_kingpost_underC, total_kingpost_done, total_kingpost_delayed,
                 total_secant_tobeC, total_secant_underC, total_secant_done, total_secant_delayed,
                total_columnhead_tobeC, total_columnhead_underC, total_columnhead_done, total_columnhead_delayed];
query.returnGeometry = true;

structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

// D-wall
const dwall_tobeC = stats.total_dwall_tobeC;
const dwall_underC = stats.total_dwall_underC;
const dwall_done = stats.total_dwall_done;
const dwall_delayed = stats.total_dwall_delayed;

// Column
const column_tobeC = stats.total_column_tobeC;
const column_underC = stats.total_column_underC;
const column_done = stats.total_column_done;
const column_delayed = stats.total_column_delayed;

// Slab
const slab_tobeC = stats.total_slab_tobeC;
const slab_underC = stats.total_slab_underC;
const slab_done = stats.total_slab_done;
const slab_delayed = stats.total_slab_delayed;

// King's Post
const kingpost_tobeC = stats.total_kingpost_tobeC;
const kingpost_underC = stats.total_kingpost_underC;
const kingpost_done = stats.total_kingpost_done;
const kingpost_delayed = stats.total_kingpost_delayed;

// Secant pile
const secant_tobeC = stats.total_secant_tobeC;
const secant_underC = stats.total_secant_underC;
const secant_done = stats.total_secant_done;
const secant_delayed = stats.total_secant_delayed;

// Secant pile
const columnhead_tobeC = stats.total_columnhead_tobeC;
const columnhead_underC = stats.total_columnhead_underC;
const columnhead_done = stats.total_columnhead_done;
const columnhead_delayed = stats.total_columnhead_delayed;

// Chart //
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.responsive.enabled = true;
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data = [
{
category: "Secant Pile",
value1: secant_done,
value2: secant_underC,
value3: secant_delayed,
value4: secant_tobeC
},
{
category: "Kings Post",
value1: kingpost_done,
value2: kingpost_underC,
value3: kingpost_delayed,
value4: kingpost_tobeC
},
{
category: "Slab",
value1: slab_done,
value2: slab_underC,
value3: slab_delayed,
value4: slab_tobeC
},
{
category: "Column",
value1: column_done,
value2: column_underC,
value3: column_delayed,
value4: column_tobeC
},
{
category: "D-Wall",
value1: dwall_done,
value2: dwall_underC,
value3: dwall_delayed,
value4: dwall_tobeC
},
{
category: "Column Head",
value1: columnhead_done,
value2: columnhead_underC,
value3: columnhead_delayed,
value4: columnhead_tobeC
}
]; // End of chart

chart.colors.step = 2;
chart.padding(10, 10, 10, 10);

// Legend
const LegendFontSizze = 14;
chart.legend = new am4charts.Legend();

chart.legend.valueLabels.template.align = "right"
chart.legend.valueLabels.template.textAlign = "end";  

chart.legend.position = "bottom";
chart.legend.labels.template.fontSize = LegendFontSizze;
chart.legend.labels.template.fill = "#ffffff";
chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
chart.legend.valueLabels.template.fontSize = LegendFontSizze;

var marker = chart.legend.markers.template.children.getIndex(0);
var markerTemplate = chart.legend.markers.template;
marker.cornerRadius(12, 12, 12, 12);
marker.strokeWidth = 1;
marker.strokeOpacity = 1;
marker.stroke = am4core.color("#ccc");

// Change size of legend marker
markerTemplate.width = 16;
markerTemplate.height = 16;

// Add chart title
var title = chart.titles.create();
title.text = "Construction Progress"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 27;
title.fontWeight = "bold";
title.fill = am4core.color("#ffffff");
title.marginTop = 3;
title.marginBottom = 10;

// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 20;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.grid.template.strokeOpacity = 1;
categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFFFF");
categoryAxis.renderer.grid.template.strokeWidth = 1.5;
categoryAxis.renderer.line.strokeOpacity = 1;
categoryAxis.renderer.line.strokeWidth = 0;
categoryAxis.renderer.line.stroke = am4core.color("#FFFFFFFF");

// Value axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 14;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.line.strokeOpacity = 1;
valueAxis.renderer.line.strokeWidth = 0;
valueAxis.renderer.line.stroke = am4core.color("#FFFFFF");

function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;

// Bar chart line color and width
series.columns.template.stroke = am4core.color("#ffffff");
series.columns.template.strokeWidth = 0.1;
series.name = name;

var labelBullet = series.bullets.push(new am4charts.LabelBullet());

if (name == "To be Constructed"){
series.fill = am4core.color("#000000");

labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
//labelBullet.label.fill = am4core.color("#00FFFFFF");
labelBullet.label.fill = am4core.color("#000000");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;

} else if (name == "Under Construction"){
series.fill = am4core.color("#c2c2c2");
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;
labelBullet.locationX = 0.5;

} else if (name == "Completed"){
series.fill = am4core.color("#0070ff");
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 30;
labelBullet.locationX = 0.5;

} else {
series.fill = am4core.color("#ff0000"); // delayed
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;

}
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:20px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"

// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");

series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;

// D-Wall
if (selectedP == "D-Wall" && selectedC == "To be Constructed") {
selectedLayer = 1;
selectedStatus = 1;
} else if (selectedP == "D-Wall" && selectedC == "Under Construction") {
selectedLayer = 1;
selectedStatus = 2;
} else if (selectedP == "D-Wall" && selectedC == "Delayed") {
selectedLayer = 1;
selectedStatus = 3;
} else if (selectedP == "D-Wall" && selectedC == "Completed") {
selectedLayer = 1;
selectedStatus = 4;

// Column
} else if (selectedP == "Column" && selectedC == "To be Constructed") {
selectedLayer = 2;
selectedStatus = 1;
} else if (selectedP == "Column" && selectedC == "Under Construction") {
selectedLayer = 2;
selectedStatus = 2;
} else if (selectedP == "Column" && selectedC == "Delayed") {
selectedLayer = 2;
selectedStatus = 3;
} else if (selectedP == "Column" && selectedC == "Completed") {
selectedLayer = 2;
selectedStatus = 4;

// Slab
} else if (selectedP == "Slab" && selectedC == "To be Constructed") {
selectedLayer = 3;
selectedStatus = 1;
} else if (selectedP == "Slab" && selectedC == "Under Construction") {
selectedLayer = 3;
selectedStatus = 2;
} else if (selectedP == "Slab" && selectedC == "Delayed") {
selectedLayer = 3;
selectedStatus = 3;
} else if (selectedP == "Slab" && selectedC == "Completed") {
selectedLayer = 3;
selectedStatus = 4;

// Kings Post
} else if (selectedP == "Kings Post" && selectedC == "To be Constructed") {
selectedLayer = 4;
selectedStatus = 1;
} else if (selectedP == "Kings Post" && selectedC == "Under Construction") {
selectedLayer = 4;
selectedStatus = 2;
} else if (selectedP == "Kings Post" && selectedC == "Delayed") {
selectedLayer = 4;
selectedStatus = 3;
} else if (selectedP == "Kings Post" && selectedC == "Completed") {
selectedLayer = 4;
selectedStatus = 4;


// Secant Pile
} else if (selectedP == "Secant Pile" && selectedC == "To be Constructed") {
selectedLayer = 5;
selectedStatus = 1;
} else if (selectedP == "Secant Pile" && selectedC == "Under Construction") {
selectedLayer = 5;
selectedStatus = 2;
} else if (selectedP == "Secant Pile" && selectedC == "Delayed") {
selectedLayer = 5;
selectedStatus = 3;
} else if (selectedP == "Secant Pile" && selectedC == "Completed") {
selectedLayer = 5;
selectedStatus = 4;

// Column Head
} else if (selectedP == "Column Head" && selectedC == "To be Constructed") {
selectedLayer = 6;
selectedStatus = 1;
} else if (selectedP == "Column Head" && selectedC == "Under Construction") {
selectedLayer = 6;
selectedStatus = 2;
} else if (selectedP == "Column Head" && selectedC == "Delayed") {
selectedLayer = 6;
selectedStatus = 3;
} else if (selectedP == "Column Head" && selectedC == "Completed") {
selectedLayer = 6;
selectedStatus = 4;

} else {
selectedLayer = null;
}



chartLayerView.filter = {
where: "Type = " + selectedLayer
//where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
};

} // End of filterByChart

view.whenLayerView(structureLayer).then(function (layerView) {
chartLayerView = layerView;

chartElement.style.visibility = "visible";

// Listen to the click event on the map view and resets to default 
view.on("click", function() {
chartLayerView.filter = null;
});
});


} // End of createSeries function

createSeries("value1", "Completed");
createSeries("value2", "Under Construction");
createSeries("value3", "Delayed");
createSeries("value4", "To be Constructed");

}); // End of queryFeatures function
}
am4core.options.autoDispose = true;
}); // End of am4Core.ready()

/////////////////// EDITOR widget ////////////////
/*
view.when(function () {
    view.popup.autoOpenEnabled = true; //disable popups

    // Create the Editor
    let editor = new Editor({
      view: view
    });

    // Add widget to top-right of the view
    view.ui.add(editor, "bottom-right");
  });
*/



///////////////////////////////////////////////
// LayerList and Add legend to the LayerList
  // On-off feature layer tab
var layerList = new LayerList({
view: view,
listItemCreatedFunction: function(event) {
const item = event.item;
if (item.title === "Chainage" || item.title === "ROW" || item.title === "OpenStreetMap 3D Buildings"){
item.visible = false
}
}
});
var layerListExpand = new Expand ({
view: view,
content: layerList,
expandIconClass: "esri-icon-visible",
group: "top-right"
});
view.ui.add(layerListExpand, {
position: "top-right"
});


var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
{
  layer: structureLayer,
  title: "Station Structure"
}
]
});

var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "bottom-right"
});
view.ui.add(legendExpand, {
position: "top-right"
});

var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "bottom-left"
  });
  view.ui.add(layerListExpand, {
      position: "top-left"
  });

  view.ui.empty("top-left");

  // Compass
  var compass = new Compass({
    view: view});
    // adds the compass to the top left corner of the MapView
  view.ui.add(compass, "top-left");

  // See-through-Ground        
    view.when(function() {
    // allow navigation above and below the ground
    map.ground.navigationConstraint = {
      type: "none"
    };
    // the webscene has no basemap, so set a surfaceColor on the ground
    map.ground.surfaceColor = "#fff";
    // to see through the ground, set the ground opacity to 0.4
    map.ground.opacity = 0.5;
  });
    
  // Full screen logo
  view.ui.add(
      new Fullscreen({
          view: view,
          element: applicationDiv
      }),
      "top-left"
  );
  
  // See through Gound
  document
    .getElementById("opacityInput")
    .addEventListener("change", function(event) {
      map.ground.opacity = event.target.checked ? 0.1 : 0.6;
    });

  view.ui.add("menu", "bottom-left");

});