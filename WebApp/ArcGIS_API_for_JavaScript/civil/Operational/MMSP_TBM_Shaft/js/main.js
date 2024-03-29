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
  "esri/widgets/BasemapToggle",
  "esri/popup/content/ImageMediaInfo",
  "esri/popup/content/AttachmentsContent",
  "esri/widgets/ElevationProfile"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground, BasemapToggle,
            ImageMediaInfo, AttachmentsContent, ElevationProfile) {

let chartLayerView;
////////////////////////////////////////////////////


var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "79bd8b0729b34aabb4c93fa43c59c897" // Original: 3a62040541b84f528da3ac7b80cf4a63
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
              x: 121.0173144,
              y: 14.6871275,
              z: 700
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
              },
              popup: {
                dockEnabled: true,
                dockOptions: {
                  buttonEnabled: false,
                  breakpoint: false
                }
              }
  });

  const toggle = new BasemapToggle({
    view: view,
    nextBaseMap: "hybrid"
  });

  view.ui.add(toggle, "top-right");
  
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
  const StructureTypesButton = document.getElementById("dataTypeInput");



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
      value: "Excavating"
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

// Boundary
let defaultLotSymbolBoundary = {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
              style: "dash",
          color: [215, 215, 158],
          width: 1.5
      }
};

let BoundaryFillSymbol = {
type: "unique-value",
field: "StatusNVS3",
defaultSymbol: defaultLotSymbolBoundary,
}

// TBM Alignment line
let defaultTBMAlign = {
          type: "simple-line",
          color: [211, 211, 211, 0.5],
          style: "solid",
          width: 0.5
};

let tbmAlignRenderer = {
type: "unique-value",
field: "LAYER",
defaultSymbol: defaultTBMAlign
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
        axis: "height",
        field: "SIZE",
        minDateValue: 0,
        maxDataValue: 10,
        minSize: 8,
        maxSize: 8
      },{
        type: "rotation",
        field: "ROTATION",
      }
    ]
  };

const colorP = ["#FFE1E1E1", "#80FF0000", "#4D", "#4D", "#80", "#80", "#80", "#80"]
// Legend Color for Structure Layer        
  const colors = {
    1: [225, 225, 225, 0], // 0% (To be Constructed)
    2: [208, 209, 230, 1], // 1 - >25%
    3: [166, 189, 219, 1], // 25 - >50%
    4: [116, 169, 207, 1], // 50 - >75%
    5: [43, 140, 190, 1], // 75%<
    6: [4, 90, 141, 1], // 100% (Completed)
    //7: [255, 0, 0, 0.5], // Delayed
  };
  
//*******************************//
// Import Layers                 //
//*******************************//
// Construction boundary
var constBoundary = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
//renderer: BoundaryFillSymbol,
elevationInfo: {
mode: "on-the-ground"
},
popupEnabled: false
});
constBoundary.listMode = "hide";
map.add(constBoundary);

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



view
.when()
.then(() => {
return photoLayer.when();
})
.then((layer) => {
return view.whenLayerView(layer);
})
.then((layerView) => {
view.on("click", eventHandler);

function eventHandler(event){
const opts = {
include: photoLayer
};
view.hitTest(event,opts).then(getGraphics);
//headerTitleDiv.innerHTML = event;
}

function getGraphics(response) {
if (response.results.length) {
const graphic = response.results[0].graphic;
const attributes = graphic.attributes;
const objid = attributes.OBJECTID;

}
}

})
// Station point feature

  var stationLayer = new SceneLayer({
      portalItem: {
          id: "6d8d606fee5841ea80fa133adbb028fc",
          portal: {
              url: "https://gis.railway-sector.com/portal"
          }
      },
      popupEnabled: false,
      definitionExpression: "Project = 'MMSP'",
       labelingInfo: [stationLabelClass],
       renderer: stationsRenderer,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer,3);

// Excavation machine
/*
  var excaSpot = new FeatureLayer({
    portalItem: {
      id: "ab9057c50b21429a9ff40cf060ff7d45",
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
  //view.map.add(excaSpot);
*/

// Structure Layer
  var structureLayer = new SceneLayer({ //structureLayer
    portalItem: {
      id: "0bba3bc8c087412b89a3d72a47a1c6aa",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    popupTemplate: {
title: "Percent Progress: {PercentProgress}%",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Status",
       label: "<h5>Construction Status</h5>"
     },
     {
       fieldName: "Type",
       label: "Type of Structure"
     },
     {
       fieldName: "StartDate",
       label: "Commencement Date"
     },
     {
       fieldName: "TargetDate",
       label: "Target Date"
     }
   ]
 }
]
},
      elevationInfo: {
          mode: "absolute-height",
          offset: 0
      },
      title: "TBM Shaft"
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
  });
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
                  color: [225, 225, 225, 0.8], //225, 225, 225, 0.3
                  size: 1
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

//
const colorsCC = {
    1: [225, 225, 225, 0], // To be Constructed (white)
    2: [130, 130, 130, 0.3], // Under Construction
    3: [255, 0, 0, 0.5], // Delayed
    4: [0, 197, 255, 0.5] // Complete [0, 197, 255]
  };
  
var ccLayer = new SceneLayer({
portalItem: {
  id: "fbb56dc7963e4bef980c0b4c7c728491",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
},
title: "Cut & Cover",
outFields: ["*"],
popupTemplate: {
title: "Basic Information",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Status",
       label: "<h5>Construction Status</h5>"
     },
     {
       fieldName: "Type2",
       label: "Type of Structure"
     },
     {
       fieldName: "TargetDate",
       label: "Target Date"
     }
   ]
 }
]
},
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
  });
  map.add(ccLayer);

  function renderCCLayer() {
    const rendererCC = new UniqueValueRenderer({
      field: "Status"
    });

    for (let property in colorsCC) {
      if (colorsCC.hasOwnProperty(property)) {
        rendererCC.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: colorsCC[property],
                  colorMixMode: "replace"
                },
                edges: {
                  type: "solid", // autocasts as new SolidEdges3D()
                  color: [225, 225, 225, 0.8], //225, 225, 225, 0.3
                  size: 1
                  }
              }
            ]
           }
        });
      }
    }

    ccLayer.renderer = rendererCC;
  }

  renderCCLayer();


// TBM Shaft/Cut and Cover Progress layer of Construction process
/*
var progressLayer = new FeatureLayer({
portalItem: {
  id: "32109a10777d4324ac00c4dea7c9d9b8",
  portal: {
      url: "https://gis.railway-sector.com/portal"
  }
}
});
map.add(progressLayer);
*/


// TBM Alignment reference line:--------------
var tbmAlign = new FeatureLayer({
portalItem: {
id: "ea9eb839b97a42988bfb32d10a3c1141",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
renderer: tbmAlignRenderer,
elevationInfo: {
      mode: "on-the-ground",
      offset: 0
    },
title: "TBM Alignment",
popupEnabled: false

});
map.add(tbmAlign, 0);

// Radio Button Selection //        
// Selection of 'Retaining Wall' or 'Station Box' only for visualization (not chart)


//*******************************//
//      Progress Chart           //
//*******************************//

// Total progress //
function toalProgressShaft() {
var averageProgress = {
onStatisticField: "PercentProgress",
outStatisticFieldName: "averageProgress",
statisticType: "avg"
};

var query = structureLayer.createQuery();
query.outStatistics = [averageProgress];
query.returnGeometry = true;
structureLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const averageProgress = stats.averageProgress;
document.getElementById("totalProgress").innerHTML = averageProgress.toFixed(1) + " %";
});
}

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



// Total progress for Cut and Cover
function totalProgressCC(){
var total_cc_comp = {
onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_cc_comp",
statisticType: "sum"
};

var total_cc_count = {
onStatisticField: "Layer",
outStatisticFieldName: "total_cc_count",
statisticType: "count"
};

var query = ccLayer.createQuery();
query.outStatistics = [total_cc_comp, total_cc_count];
query.returnGeometry = true;

ccLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const total_N = stats.total_cc_count;
const comp = stats.total_cc_comp;
const perc = ((comp/total_N)*100).toFixed(1);

document.getElementById("totalProgress").innerHTML = perc + " %";
});


}

// Default


// Create Bar chart to show progress of station structure
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

if (document.getElementById("TBM Shaft").checked = true) {
//structureLayer.visible = true;
//ccLayer.visible = false;

percentProgressValues().then(updateChartShaft);
zoomToLayer(structureLayer);

toalProgressShaft();

}


// click event handler for choices
StructureTypesButton.addEventListener("click", filterByTest);
function filterByTest(event) {
const selectedType = event.target.id; // TBM Shaft, Cut & Cover....


if(selectedType == "TBM Shaft") {
//structureLayer.visible = true;
//ccLayer.visible = false;
legend.visible = true;

zoomToLayer(structureLayer);
percentProgressValues().then(updateChartShaft);
toalProgressShaft();

} else if (selectedType == "Cut & Cover") {
//structureLayer.visible = false;
//ccLayer.visible = true;
legend.visible = false;

zoomToLayer(ccLayer);
updateChartCC();
totalProgressCC();


}
}

// Make sure that the attribute table has Type in the following order:
//
function percentProgressValues() {
var query = structureLayer.createQuery();
query.where = "Type > 0";
query.outFields = ["Type", "PercentProgress"];

return structureLayer.queryFeatures(query).then(function(response) {
const ggg = response.features;
const rowN = ggg.length;

let progArray = [];
let temp = [];
let compiled = [];
for (var i =0; i < rowN; i++) {
var type = response.features[i].attributes.Type;
 compiled.push(type);

 var perc = response.features[i].attributes.PercentProgress;
 compiled.push(perc);

}
return compiled;
});
}

/*
function showValue(progArray){
headerTitleDiv.innerHTML = progArray;
}
percentProgressValues().then(showValue);
*/

function updateChartShaft(compiled) {
//headerTitleDiv.innerHTML = compiled;
/*
for (var i=0; i<10; i++) {
if (compiled[i] == 1) {
bottom_slab = compiled[i+1];
} else if (compiled[i] == 2) {
retain_wall = compiled[i+1];
} else if (compiled[i] == 3) {
inner_wall = compiled[i+1];
} else if (compiled[i] == 4) {
top_slab = compiled[i+1];
} else if (compiled[i] == 5) {
pump_pit = compiled[i+1];
}
}
*/
for (var i=8; i>=0; i=i-2) {
if (compiled[i] == 1) {
bottom_slab = compiled[i+1];
} else if (compiled[i] == 2) {
retain_wall = compiled[i+1];
} else if (compiled[i] == 3) {
inner_wall = compiled[i+1];
} else if (compiled[i] == 4) {
top_slab = compiled[i+1];
} else if (compiled[i] == 5) {
pump_pit = compiled[i+1];
}
}


//headerTitleDiv.innerHTML = bottom_slab + "," + retain_wall;
// Completed
const botslab_done = bottom_slab;
const rewall_done = retain_wall;
const inwall_done = inner_wall;
const topslab_done = top_slab;
const pumpit_done = pump_pit;

// Non-Completed
const botslab_none = 100 - botslab_done;
const rewall_none = 100 - rewall_done;
const inwall_none = 100 - inwall_done;
const topslab_none = 100 - topslab_done;
const pumpit_none = 100 - pumpit_done;


// Chart //
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data = [
{
category: "Pump Pit",
value1: pumpit_done,
value2: pumpit_none
},
{
category: "Top Slab",
value1: topslab_done,
value2: topslab_none
},
{
category: "Inner Wall",
value1: inwall_done,
value2: inwall_none
},
{
category: "Retaining Wall",
value1: rewall_done,
value2: rewall_none
},
{
category: "Bottom Slab",
value1: botslab_done,
value2: botslab_none
}
]; // End of chart

chart.colors.step = 2;
chart.padding(10, 10, 10, 10);

// Legend
const LegendFontSizze = 15;
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

// Chart Title
var title = chart.titles.create();
title.text = "TBM Shaft"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 25;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 6;
title.marginBottom = 10;

// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 20;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label

var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 17;
valueAxis.renderer.labels.template.fill = "#ffffff";

function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;


series.name = name;
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
if (name == "Incomplete"){
series.fill = am4core.color("#000000");

labelBullet.locationX = 0.5;
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#ffffffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;
labelBullet.locationX = 0.5;

} else if (name == "Completed"){
series.fill = am4core.color("#045A8D"); //00C5FF

labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 30;
labelBullet.locationX = 0.5;

}
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')}%"
series.columns.template.stroke = am4core.color("#ffffff");
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");

series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
//const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;

// Bottom Slab
if (selectedP == "Bottom Slab") {
selectedLayer = 1;

// Retaining Wall
} else if (selectedP == "Retaining Wall") {
selectedLayer = 2;

// Inner Wall
} else if (selectedP == "Inner Wall") {
selectedLayer = 3;

// Top Slab
} else if (selectedP == "Top Slab") {
selectedLayer = 4;

// Pump pit
} else if (selectedP == "Pump Pit") {
selectedLayer = 5;

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
createSeries("value2", "Incomplete");


} // End of updateChartShaft()


function updateChartCC() {
// Bottom Slab
var total_bottomslab_tobeC = {
onStatisticField: "CASE WHEN (Type2 = 1 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_bottomslab_tobeC",
statisticType: "sum"
};
var total_bottomslab_underC = {
onStatisticField: "CASE WHEN (Type2 = 1 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_bottomslab_underC",
statisticType: "sum"
};
var total_bottomslab_done = {
onStatisticField: "CASE WHEN (Type2 = 1 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_bottomslab_done",
statisticType: "sum"
};   
var total_bottomslab_delayed = {
onStatisticField: "CASE WHEN (Type2 = 1 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_bottomslab_delayed",
statisticType: "sum"
};

// Retaining Wall
var total_retainwall_tobeC = {
onStatisticField: "CASE WHEN (Type2 = 2 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_retainwall_tobeC",
statisticType: "sum"
};
var total_retainwall_underC = {
onStatisticField: "CASE WHEN (Type2 = 2 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_retainwall_underC",
statisticType: "sum"
};
var total_retainwall_done = {
onStatisticField: "CASE WHEN (Type2 = 2 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_retainwall_done",
statisticType: "sum"
};   
var total_retainwall_delayed = {
onStatisticField: "CASE WHEN (Type2 = 2 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_retainwall_delayed",
statisticType: "sum"
};

// Inner Wall
var total_innerwall_tobeC = {
onStatisticField: "CASE WHEN (Type2 = 3 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_innerwall_tobeC",
statisticType: "sum"
};
var total_innerwall_underC = {
onStatisticField: "CASE WHEN (Type2 = 3 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_innerwall_underC",
statisticType: "sum"
};
var total_innerwall_done = {
onStatisticField: "CASE WHEN (Type2 = 3 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_innerwall_done",
statisticType: "sum"
};   
var total_innerwall_delayed = {
onStatisticField: "CASE WHEN (Type2 = 3 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_innerwall_delayed",
statisticType: "sum"
};

// Top Slab
// Inner Wall
var total_topslab_tobeC = {
onStatisticField: "CASE WHEN (Type2 = 4 and Status = 1) THEN 1 ELSE 0 END",  // D-Wall and to be Constructed
outStatisticFieldName: "total_topslab_tobeC",
statisticType: "sum"
};
var total_topslab_underC = {
onStatisticField: "CASE WHEN (Type2 = 4 and Status = 2) THEN 1 ELSE 0 END",  // D-Wall and Under construction
outStatisticFieldName: "total_topslab_underC",
statisticType: "sum"
};
var total_topslab_done = {
onStatisticField: "CASE WHEN (Type2 = 4 and Status = 4) THEN 1 ELSE 0 END",  // D-Wall and Complete
outStatisticFieldName: "total_topslab_done",
statisticType: "sum"
};   
var total_topslab_delayed = {
onStatisticField: "CASE WHEN (Type2 = 4 and Status = 3) THEN 1 ELSE 0 END",  // D-Wall and Delayed
outStatisticFieldName: "total_topslab_delayed",
statisticType: "sum"
};

var query = ccLayer.createQuery();
query.outStatistics = [total_bottomslab_tobeC, total_bottomslab_underC, total_bottomslab_delayed, total_bottomslab_done,
                 total_retainwall_tobeC, total_retainwall_underC, total_retainwall_delayed, total_retainwall_done,
                 total_innerwall_tobeC, total_innerwall_underC, total_innerwall_delayed, total_innerwall_done,
                 total_topslab_tobeC, total_topslab_underC, total_topslab_delayed, total_topslab_done]


query.returnGeometry = true;

ccLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

// Bottom Slab
const bottomslab_tobeC = stats.total_bottomslab_tobeC;
const bottomslab_underC = stats.total_bottomslab_underC;
const bottomslab_delayed = stats.total_bottomslab_delayed;
const bottomslab_done = stats.total_bottomslab_done;

// Retaining Wall
const retainwall_tobeC = stats.total_retainwall_tobeC;
const retainwall_underC = stats.total_retainwall_underC;
const retainwall_delayed = stats.total_retainwall_delayed;
const retainwall_done = stats.total_retainwall_done;

// Inner Wall
const innerwall_tobeC = stats.total_innerwall_tobeC;
const innerwall_underC = stats.total_innerwall_underC;
const innerwall_delayed = stats.total_innerwall_delayed;
const innerwall_done = stats.total_innerwall_done;

// Top Slab
const topslab_tobeC = stats.total_topslab_tobeC;
const topslab_underC = stats.total_topslab_underC;
const topslab_delayed = stats.total_topslab_delayed;
const topslab_done = stats.total_topslab_done;

// CHART
var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data = [
{
category: "Top Slab",
value1: topslab_done,
value2: topslab_underC,
value3: topslab_delayed,
value4: topslab_tobeC,
},
{
category: "Inner Wall",
value1: innerwall_done,
value2: innerwall_underC,
value3: innerwall_delayed,
value4: innerwall_tobeC,
},
{
category: "Retaining Wall",
value1: retainwall_done,
value2: retainwall_underC,
value3: retainwall_delayed,
value4: retainwall_tobeC,
},
{
category: "Bottom Slab",
value1: bottomslab_done,
value2: bottomslab_underC,
value3: bottomslab_delayed,
value4: bottomslab_tobeC,
}
]; // End of Chart

chart.colors.step = 2;
chart.padding(10,10,10,10);

// Legend
const LegendFontSizze = 15;
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

// Chart Title
var title = chart.titles.create();
title.text = "Cut & Cover"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
title.fontSize = 25;
title.fontWeight = "bold";
title.fill = "#ffffff";
title.marginTop = 6;
title.marginBottom = 10;

// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 20;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label

// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 17;
valueAxis.renderer.labels.template.fill = "#ffffff";

//
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
series.columns.template.strokeWidth = 0.5;
series.name = name;

var labelBullet = series.bullets.push(new am4charts.LabelBullet());

if (name == "To be Constructed"){
series.fill = am4core.color("#000000");

labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
//labelBullet.label.fill = am4core.color("#00FFFFFF");
labelBullet.label.fill = am4core.color("#ff000000");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 0;
labelBullet.locationX = 0.5;

} else if (name == "Under Construction"){
series.fill = am4core.color("#c2c2c2");
labelBullet.locationX = 0.5;
labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.interactionsEnabled = false;
labelBullet.label.fontSize = 18;
labelBullet.locationX = 0.5;

} else if (name == "Completed"){
series.fill = am4core.color("#0070ff");
labelBullet.locationX = 0.5;
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
labelBullet.label.fontSize = 18;
labelBullet.locationX = 0.5;

}
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')}"
//labelBullet.label.text = "{valueX.value.formatNumber('#.')}";

// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");

series.columns.template.events.on("hit", filterByChart, this);
function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;

// Bottom Slab
if (selectedP == "Bottom Slab" && selectedC == "To be Constructed") {
selectedLayer = 1;
selectedStatus = 1;
} else if (selectedP == "Bottom Slab" && selectedC == "Under Construction") {
selectedLayer = 1;
selectedStatus = 2;
} else if (selectedP == "Bottom Slab" && selectedC == "Delayed") {
selectedLayer = 1;
selectedStatus = 3;
} else if (selectedP == "Bottom Slab" && selectedC == "Completed") {
selectedLayer = 1;
selectedStatus = 4;

// Retaining Wall
} else if (selectedP == "Retaining Wall" && selectedC == "To be Constructed") {
selectedLayer = 2;
selectedStatus = 1;
} else if (selectedP == "Retaining Wall" && selectedC == "Under Construction") {
selectedLayer = 2;
selectedStatus = 2;
} else if (selectedP == "Retaining Wall" && selectedC == "Delayed") {
selectedLayer = 2;
selectedStatus = 3;
} else if (selectedP == "Retaining Wall" && selectedC == "Completed") {
selectedLayer = 2;
selectedStatus = 4;

// Inner Wall
} else if (selectedP == "Inner Wall" && selectedC == "To be Constructed") {
selectedLayer = 3;
selectedStatus = 1;
} else if (selectedP == "Inner Wall" && selectedC == "Under Construction") {
selectedLayer = 3;
selectedStatus = 2;
} else if (selectedP == "Inner Wall" && selectedC == "Delayed") {
selectedLayer = 3;
selectedStatus = 3;
} else if (selectedP == "Inner Wall" && selectedC == "Completed") {
selectedLayer = 3;
selectedStatus = 4;

// Top Slab
} else if (selectedP == "Top Slab" && selectedC == "To be Constructed") {
selectedLayer = 4;
selectedStatus = 1;
} else if (selectedP == "Top Slab" && selectedC == "Under Construction") {
selectedLayer = 4;
selectedStatus = 2;
} else if (selectedP == "Top Slab" && selectedC == "Delayed") {
selectedLayer = 4;
selectedStatus = 3;
} else if (selectedP == "Top Slab" && selectedC == "Completed") {
selectedLayer = 4;
selectedStatus = 4;

} else {
selectedLayer = null;
}

chartLayerView.filter = {
where: "Type2 = " + selectedLayer
//where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
};

} // End of filterByChart

view.whenLayerView(ccLayer).then(function (layerView) {
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

// Editor
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
        if (item.title === "Chainage" || item.title === "ROW"){
          item.visible = false
        }
      }
    });

var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
{
layer: structureLayer,
title: "Construction Progress (TBM Shaft ONLY)"
}
]
});


/*
var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "bottom-right"
});
view.ui.add(legendExpand, {
position: "bottom-right"
});
*/

  var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "bottom-left"
  });
  view.ui.add(layerListExpand, {
      position: "bottom-left"
  });
  // End of LayerList

  view.ui.empty("top-left");
  view.ui.add(legend, "top-left"); 

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