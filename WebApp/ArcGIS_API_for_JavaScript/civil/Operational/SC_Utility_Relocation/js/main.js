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
  "esri/layers/BuildingSceneLayer",
  "esri/widgets/BuildingExplorer",
  "esri/widgets/Slice",
  "esri/analysis/SlicePlane",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/MeshSymbol3D",
  "esri/symbols/edges/SolidEdges3D",
  "esri/layers/GroupLayer",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Search"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal,
            TimeSlider, Legend, LayerList, Fullscreen,
            geometryService, Query,
            StatisticDefinition, WebStyleSymbol,
            TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
            FeatureTable, Compass, ElevationLayer, Ground,
            BuildingSceneLayer, BuildingExplorer, Slice, SlicePlane,
            SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer,
            BasemapToggle, Search) {


////////////////////////////////////////////////////
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "8a9ef2a144e8423786f6139408ac3424" 
      }
    })
  ]
});

var map = new Map({
basemap: basemap, // "streets-night-vector", 
ground: "world-elevation"
});

var view = new SceneView({
      map: map,
      container: "viewDiv",
      viewingMode: "local",
      camera: {
          position: {
              x: 120.97930,
              y: 14.61,
              z: 500
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

// Basemap Toggle
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



// Setup UI
var chartTitleDiv = document.getElementById("chartTitleDiv");
var headerDiv = document.getElementById("headerDiv");
var headerTitleDiv = document.getElementById("headerTitleDiv");
var applicationDiv = document.getElementById("applicationDiv");


//*******************************//
// Label Class Property Settings //
//*******************************//
// Pier No
var pierNoLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "white"
          },
          size: 10,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            //weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 100,
        maxWorldLength: 100,
        minWorldLength: 20
      },
      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: "white",
        size: 0.7,
        border: {
          color: "grey"
        }
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.PIER"
      //value: "{TEXTSTRING}"
  }
  });


// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KmSpot"},
symbol: {
type: "text",
color: [85, 255, 0],
size: 25
}
});

// Station Label
var labelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "orange"
          },
          size: 30,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            //weight: "bold"
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
      //value: "{TEXTSTRING}"
  }
  });

// Utility Point Label
var labelUtilPtSymbol = {
type: "label-3d", // autocasts as new LabelSymbol3D()
labelPlacement: "above-center",
labelExpressionInfo: {
//value: "{Company}",
expression: "When($feature.Status >= 0, DomainName($feature, 'Comp_Agency'), '')" //$feature.Comp_Agency
},
symbolLayers: [
{
type: "text", // autocasts as new TextSymbol3DLayer()
material: {
  color: "black"
},
halo: {
  color: [255, 255, 255, 0.7],
  size: 2
},
size: 10
}
],

};

// Utility Line Label

var testLineLabelClass = {
type: "label-3d", // autocasts as new LabelSymbol3D()
labelPlacement: "above-center", // Polyline has not choice
labelExpressionInfo: {
expression: "When($feature.Status >= 0, DomainName($feature, 'Comp_Agency'), '')"
},
symbolLayers: [
{
type: "text", // autocasts as new TextSymbol3DLayer()
material: {
  color: "black"
},
halo: {
  color: [255, 255, 255, 0.7],
  size: 2
},
size: 10
}
],
};

//*****************************//
// 3D Web Symbo Style Settings //
//*****************************//

// Esri Icon Symbol
  function IconSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }

// Utility Point Symbol
/// https://developers.arcgis.com/javascript/latest/guide/esri-web-style-symbols-3d/
function utilPtSymbolInfra(name) {
return {
type: "web-style",
name: name,
styleName: "EsriInfrastructureStyle"
};
}

function utilPtSymbolStreet(name) {
return {
type: "web-style",
name: name,
styleName: "EsriRealisticStreetSceneStyle"
};
}

function utilPtSymbolIcons(name) {
return {
type: "web-style",
name: name,
styleName: "EsriIconsStyle"
};
}

/* custom 3D Web Style for Utility Pole */
// Choice: 3D_Electric_Pole, 3D_Drain_Box, 3D_Water_Valve, 3D_Telecom_BTS, 3D_TelecomCATV_Pole

function customSymbol3D(name) {
return {
type: "web-style",
portal: "https://www.maps.arcgis.com",

// IMPORTANT: Your browser needs to be able to open the following link. It will say insecure so need to go to advanced.
styleUrl: "https://www.maps.arcgis.com/sharing/rest/content/items/c04d4d4145f64f8fa38407dd5331dd1f/data",
name: name
};
}


/* Company and Utilty Relocation Status Symbols with Callout */
var verticalOffsetExisting = {
screenLength: 10,
maxWorldLength: 10,
minWorldLength: 15
};

var verticalOffsetRelocation = {
screenLength: 10,
maxWorldLength: 30,
minWorldLength: 35
};


    // Function that automatically creates the symbol for the points of interest
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

      verticalOffset: verticalOffsetExisting,

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

      verticalOffset: verticalOffsetRelocation,

      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: [128,128,128,0.1],
        size: 0.2,
        border: {
          color: "grey"
        }
      }
    };
    }

  }


//*****************************//
//      Renderer Settings      //
//*****************************//
// Pier Heand Pier Column
let pierHeadColRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill" },  // autocasts as new SimpleFillSymbol()
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "Pier_Column",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [78, 78, 78, 0.5],
}
},
{
// All features with value of "North" will be blue
value: "Pier_Head",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [169, 169, 169, 0.7]
}
}
]
};

// Station Box
let stationBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "00_Platform",
symbol: {
  type: "simple-fill",
  color: [160, 160, 160],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "00_Platform 10car",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "cross",
  outline: {
    width: 1,
    color: "black",
    style: "short-dash"
  }
}
},
{
value: "00_Station",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0],
  outline: {
    width: 2,
    color: [115, 0, 0]
  }
}
}
]
};


// Chainage symbol
var chainageRenderer = {
type: "simple",
symbol: {
type: "simple-marker",
size: 5,
color: [255, 255, 255, 0.9],
outline: {
  width: 0.2,
  color: "black"
}
}
};

// Station
var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Station",
    defaultSymbol: IconSymbol("Train"),//Backhoe, Train
  };

// Utility Point
/* 3D Web Style */
var utilTypePtRenderer = {
    type: "unique-value", //"unique-value", "simple"
    //Field: "UtilType2",
    //defaultSymbol: ,
    //valueExpression: "When($feature.UtilType == 1, 'Telecom', $feature.UtilType == 2, 'Water',$feature.UtilType == 3, 'Power', $feature.UtilType)",
    valueExpression: "When($feature.UtilType2 == 1, 'Telecom Pole (BTS)', \
                           $feature.UtilType2 == 2, 'Telecom Pole (CATV)', \
                           $feature.UtilType2 == 3, 'Water Meter', \
                           $feature.UtilType2 == 4, 'Water Valve', \
                           $feature.UtilType2 == 5, 'Manhole', \
                           $feature.UtilType2 == 6, 'Drain Box', \
                           $feature.UtilType2 == 7, 'Electric Pole', \
                           $feature.UtilType2 == 8, 'Street Light', \
                           $feature.UtilType2 == 9, 'Junction Box', \
                           $feature.UtilType2 == 10, 'Coupling', \
                           $feature.UtilType2 == 11, 'Fitting', \
                           $feature.UtilType2 == 12, 'Transformer', \
                           $feature.UtilType2 == 13, 'Truss Guy', \
                           $feature.UtilType2 == 14, 'Concrete Pedestal', \
                           $feature.UtilType2 == 15, 'Ground', \
                           $feature.UtilType2 == 16, 'Down Guy', \
                           $feature.UtilType2 == 17, 'Entry/Exit Pit', \
                           $feature.UtilType2 == 18, 'Handhole', \
                           $feature.UtilType2 == 19, 'Transmission Tower', \
                           $feature.UtilType)",
    uniqueValueInfos: [
      {
        value: "Telecom Pole (BTS)",
        symbol: customSymbol3D("3D_Telecom_BTS")
      },
      {
        value: "Telecom Pole (CATV)",
        symbol: customSymbol3D("3D_TelecomCATV_Pole")
      },
      {
        value: "Manhole",
        symbol: utilPtSymbolStreet("Storm_Drain")
      },
      {
        value: "Electric Pole",
        //symbol: utilPtSymbolInfra("Powerline_Pole")
        symbol: customSymbol3D("3D_Electric_Pole")
      },
      {
        value: "Street Light",
        symbol: utilPtSymbolStreet("Overhanging_Street_and_Sidewalk_-_Light_on")
      },
      {
        value: "Junction Box",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Coupling",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Fitting",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Transformer",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Truss Guy",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Concrete Pedestal",
        symbol: customSymbol3D("Concrete Pedestal")
      },
      {
        value: "Ground",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Down Guy",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Entry/Exit Pit",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Handhole",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Transmission Tower",
        symbol: utilPtSymbolInfra("Powerline_Pole")
      }
    ],
    visualVariables: [
      {
        type: "size",
        axis: "height",
        field: "SIZE",
        valueUnit: "meters"
      },
      {
        type: "rotation",
        field: "ROTATION"
      },
      /*
      {
        type: "opacity",
         valueExpression: "($feature.Status * $feature.LAYER) / 2",
        // when utility is demolished, it becomes transparent
        //valueExpression: "When($feature.Status == 1 && $feature.LAYER == 1, 0, 1)",
        //field: "SIZE",
        stops: [
          {value: 0, opacity: 0.005}, //  want to delete
          {value: 1, opacity: 1}, // want to visualize
        ],
        legendOptions: {
          showLegend: false
        }
      }
*/
    ]
  };

/* Company and Utilty Relocation Status Symbols with Callout */
/// Symbol for Utility Existing feature layer
var utilExistSymbolRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Company",
    uniqueValueInfos: [
      {
        value: "Meralco",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Meralco_Gray.png",
          "#D13470",
          10,
          "Existing"
        )
      },
      {
        value: "Globe",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/GlobeGray.png",
          "#D13470",
          10,
          "Existing"
          )
      }
    ],
    visualVariables: [         
      {
        type: "opacity",
        field: "SIZE",
        stops: [
          {value: 0, opacity: 0.5},
          {value: 20, opacity: 0.5},
        ],
        legendOptions: {
          showLegend: false
        }
      }
      
    ]
  };
//IsEmpty($feature.LAYER)
/// Symbol for Utility Relocated feature layer
var utilReloSymbolRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    valueExpression: "When($feature.Remarks == 'pending', 'NoAction', \
                           $feature.Status == 1 && $feature.LAYER == 1, 'DemolishComplete',\
                           $feature.Status == 0 && $feature.LAYER == 1, 'DemolishIncomplete',\
                           $feature.Status == 0 && $feature.LAYER == 2, 'RelocIncomplete', \
                           $feature.Status == 1 && $feature.LAYER == 2, 'RelocComplete', \
                           $feature.Status == 0 && $feature.LAYER == 3, 'NewlyAdded', \
                           $feature.Status == 1 && $feature.LAYER == 3, 'NewlyAddedComplete',$feature.Comp_Agency)", 
    //field: "Company",
    uniqueValueInfos: [
      {
        value: "DemolishIncomplete",
        label: "To be Demolished",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Demolished.png",
          "#D13470",
          20,
          "Relocation"
        )
      },
      {
        value: "DemolishComplete",
        label: "Demolision Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
          "#D13470",
          25,
          "Relocation"
          )
      },
      {
        value: "RelocIncomplete",
        label: "Proposed Relocation",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Relocatd.png",
          "#D13470",
          30,
          "Relocation"
          )
      },
      {
        value: "RelocComplete",
        label: "Relocation Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Utility_Relocated_Completed_Symbol.png",
          "#D13470",
          30,
          "Relocation"
          )
      },
      {
        value: "NewlyAdded",
        label: "Add New Utility",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/NewlyAdded.png",
          "#D13470",
          35,
          "Relocation"
          )
      },
      {
        value: "NewlyAddedComplete",
        label: "New Utility Added",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/NewlyAdded_Completed.png",
          "#D13470",
          35,
          "Relocation"
          )
      },
      {
        value: "NoAction",
        label: "Require Data Checking",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Unknown_v2.png",
          "#D13470",
          35,
          "Relocation"
          )
      }
    ]
  };


// Existing Points

// Utility Line
/* UniqueValueRenderer for line3D: color, width, and line type*/
const options = { // Circle
    profile: "circle",
    cap: "none",
    join: "miter",
    width: 0.5,
    height: 0.5,
    //color: [200, 200, 200],
    profileRotation: "all"
  };

const options1 = { // rectangular
profile: "quad",
cap: "none",
join: "miter",
width: 0.5,
height: 0.5,
color: [200, 200, 200],
profileRotation: "heading"
};

/* The colors used for the each transit line */

const colorsRelocation = {
1: [32,178,170, 0.5], //Telecom Line
2: [112,128,144, 0.5], // Internet Cable Line
3: [0, 128, 255, 0.5], // Water Distribution Pipe
4: [224, 224, 224, 0.5], // Sewage
5: [105,105,105, 0.5], // Drainage
6: [205,133,63, 0.5], // Canal
7: [139,69,19, 0.5], // Creek
8: [211,211,211, 0.5] // Elecric Line
};

const colorsExisting = {
1: [229, 229, 229, 0.1], //Telecom/CA (Utility TYpe)
2: [229, 229, 229, 0.1], // Water
3: [229, 229, 229, 0.1], // Power
}; 




/////////////////////////////////////////////////////////////////////////////////////////////////

//*****************************//
//      Layer Import           //
//*****************************//
// Station box
var stationBoxLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
renderer: stationBoxRenderer,
elevationInfo: {
mode: "on-the-ground"
},
title: "Station Box",
outFields: ["*"],
popupEnabled: false
});
map.add(stationBoxLayer,0);

// Pier No. (point feature)
var PierNoLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
labelingInfo: [pierNoLabelClass],
elevationInfo: {
    mode: "on-the-ground" //absolute-height, relative-to-ground
  },
title: "Pier No",
outFields: ["*"],
popupEnabled: false
});
map.add(PierNoLayer, 1);

// Pier head and column
var pierHeadColumnLayerLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Pier Head/Column",
outFields: ["*"],
renderer: pierHeadColRenderer,
elevationInfo: {
mode: "on-the-ground"
},
popupEnabled: false
});
//pierHeadColumnLayerLayer.listMode = "hide";
map.add(pierHeadColumnLayerLayer, 1);


// Centerline and chainage
var chainageLayer = new FeatureLayer ({
portalItem: {
id: "d3926383cf3548569372216edb808996",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
title: "Chainage",
elevationInfo: {
mode: "relative-to-ground"
},
labelingInfo: [labelChainage],
renderer: chainageRenderer,
outFields: ["*"],
popupEnabled: false

});
//chainageLayer.listMode = "hide";
map.add(chainageLayer, 1);

// ROW //
var rowLayer = new FeatureLayer ({
portalItem: {
id: "c5ea14dd99a94dd38b3d88c261b854e1", // use a hosted temporarily. This hosed layer is merged layer using SC_PROW version 5.0.2
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
//layerId: 1,
elevationInfo: {
mode: "on-the-ground"
},
title: "ROW",
definitionExpression: "Extension = 'SC'",
popupEnabled: false
});
map.add(rowLayer,2);

// DPWH Road for NGCP: Site 7
let ngcpDpwhRoadRenderer = {
type: "simple",
symbol: {
type: "simple-fill",
color: [255, 255, 0],
style: "backward-diagonal",
outline: {
  color: "#FFFF00",
  width: 0.7
}
}
}

var ngcpDpwhRoad = new FeatureLayer({
portalItem: {
id: "aab3f0c3c351477084ba43ac2d829d47",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 8,
renderer: ngcpDpwhRoadRenderer,
elevationInfo: {
mode: "on-the-ground"
},
popupEnabled: false,
title: "DPWH Road for NGCP"
});
map.add(ngcpDpwhRoad);

// Pole Working Area for NGCP: Site 6
let ngcpPoleWARenderer = {
type: "simple",
symbol: {
type: "simple-fill",
color: [197, 0, 255],
style: "backward-diagonal",
outline: {
  color: "#C500FF",
  width: 0.7
}
}
}

var ngcpPoleWA = new FeatureLayer({
portalItem: {
id: "aab3f0c3c351477084ba43ac2d829d47",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
renderer: ngcpPoleWARenderer,
elevationInfo: {
mode: "on-the-ground"
},
layerId: 7,
title: "Pole Working Area for NGCP"
});
map.add(ngcpPoleWA);

// PROW (Corridor) for NGCP Site 6
const bufferColor = ["#55FF00", "#FFFF00", "#E1E1E1"]
/// Symbol for 15m-line buffer
const buffer15 = {
type: "simple-line",
color: bufferColor[0],
width: "3px",
style: "dash"
};

/// Symbol for 20m-line buffer
const buffer20 = {
type: "simple-line",
color: bufferColor[1],
width: "3px",
style: "dash"
};

const otherSym = {
type: "simple-line",
color: bufferColor[2],
width: "3px",
style: "solid"
};

const ngcpRowRenderer = {
type: "unique-value",
legendOptions: {
title: "Proposed ROW (Corridor)"
},
field: "Type",
uniqueValueInfos: [
{
value: "15m",
symbol: buffer15,
label: "15m Buffer"
},
{
value: "20m",
symbol: buffer20,
label: "20m Buffer"
}
]
};
// Symbol for 20m-buffer


var ngcpPROW = new FeatureLayer({
portalItem: {
id: "aab3f0c3c351477084ba43ac2d829d47",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
elevationInfo: {
mode: "on-the-ground"
},
renderer: ngcpRowRenderer,
layerId: 11,
title: "PROW Site 6 for NGCP"
});
map.add(ngcpPROW);

// Station
var stationLayer = new SceneLayer({
      portalItem: {
          id: "87903f4d1859454a837d68e18a27ad4c",
          portal: {
            url: "https://gis.railway-sector.com/portal"
          }
      },
      title: "Station",
       labelingInfo: [labelClass],
       renderer: stationsRenderer,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           }
       //definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  //stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Utility Point
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-scene"
// If basemap elevatio layer is off, use "absolute-height"
/* 3D Web Style */

var testUtilPt = new FeatureLayer({
portalItem: {
id: "30057ee7ebf64a8580e8ffe905035ea4",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Relocation Plan (Point)",
outFields: ["*"],
renderer: utilTypePtRenderer,
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
popupTemplate: {
title: "<h5>{Comp_Agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Id"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "CP"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});
testUtilPt.listMode = "hide";
map.add(testUtilPt, 3);

/* Symbols with callout */
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-scene"
// If basemap elevatio layer is off, use "absolute-height"

var testUtilPt1 = new FeatureLayer({
portalItem: {
id: "30057ee7ebf64a8580e8ffe905035ea4",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Utility 3D Render Test",
outFields: ["*"],
renderer: utilReloSymbolRenderer,
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
title: "Relocation Plan (Point)",
labelingInfo: [labelUtilPtSymbol],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Id"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "CP"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});

map.add(testUtilPt1);

// Utility Line
var testLine = new FeatureLayer({
portalItem: {
id: "30057ee7ebf64a8580e8ffe905035ea4",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
title: "Relocation Plan (Line)",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated-line",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Id"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "CP"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});
testLine.listMode = "hide";
map.add(testLine, 4);

/* Utility Line rendnerer*/
function lineSizeShapeSymbolLayers(profile, cap, join, width, height, profileRotation, property){
return {
      type: "line-3d",
      symbolLayers: [
          {
              type: "path",
                profile: profile,
                material: {
                  color: colorsRelocation[property]
                },
                width: width,
                height: height,
                join: join,
                cap: cap,
                anchor: "bottom",
                profileRotation: profileRotation
          }
      ]
}
}
  function rendertestLine() {
    const renderer = new UniqueValueRenderer({
      field: "utiltype2"
    });

    for (let property in colorsRelocation) { // For each utility type 2
      if (property == 1) { // If utility type2 === Telecom Line
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.5,0.5,"all", property)
        });

      } else if (property == 2) { // "Internet Cable Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.4,0.4,"all", property)
        });

      } else if (property == 3) { // "Water Distributin Pipe"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1, "all", property)
        });

      } else if (property == 4) { // "Sewerage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 5) { // "Drainage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });
      
      } else if (property == 6) { // "Canal"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 2, 2,"all", property)
        });

      } else if (property == 7) { // "Creek"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 8) { // "Electric Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.3, 0.3,"all", property)
        });

      } else {// end of 'property == '1'
        renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 0.3, 0.3,"all", property)

        });
      }
      

    }

    testLine.renderer = renderer;
  }

  rendertestLine();

/*Line for Symbols */
var testLine1 = new FeatureLayer({
portalItem: {
id: "30057ee7ebf64a8580e8ffe905035ea4",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
title: "testLine",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
title: "Relocation Plan (Line)",
outFields: ["*"],
renderer: utilReloSymbolRenderer,
labelingInfo: [testLineLabelClass],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated-line",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Id"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "CP"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});
map.add(testLine1);

// Viaduct Layer
const colorsViaduct = {
    1: [225, 225, 225, 0.1], // To be Constructed (white)
    2: [130, 130, 130, 0.5], // Under Construction
    3: [255, 0, 0, 0.8], // Delayed
    4: [0, 112, 255, 0.8], // Bored Pile
    5: [0, 112, 255, 0.8], // Pile cap
    6: [0, 112, 255, 0.8], // Pier
    7: [0, 112, 255, 0.8], // Pier head
    8: [0, 112, 255, 0.8], // Pre-cast
  };

var viaductLayer = new SceneLayer({
portalItem: {
      id: "a17403d9c7de46b282437f30b66bfdca",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
   // popupTemplate: viadTemplate,
    elevationInfo: {
    mode: "absolute-height" //absolute-height, relative-to-ground
  },
      title: "Viaduct",
      outFields: ["*"],
      popupTemplate: {
title: "<h5>{Status1}</h5>",
lastEditInfoEnabled: false,
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
       fieldName: "PierNumber",
       Label: "Pier No."
     }
   ]
 }
]
}     
    });
    map.add(viaductLayer);

    function renderViaductLayer() {
    const renderer = new UniqueValueRenderer({
      field: "Status1"
    });

    for (let property in colorsViaduct) {
      if (colorsViaduct.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: colorsViaduct[property],
                  colorMixMode: "replace"
                },
                edges: {
                  type: "solid", // autocasts as new SolidEdges3D()
                  color: [225, 225, 225, 0.3]
                  }
              }
            ]
           }
        });
      }
    }

    viaductLayer.renderer = renderer;
  }

  renderViaductLayer();

/////
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


//***********************************************************************//
//*******************************CHART***********************************//
//***********************************************************************//
const totalProgressTitleDiv = document.getElementById("totalProgressTitleDiv");
const totalProgressDiv = document.getElementById("totalProgressDiv");


am4core.ready(function() {
am4core.useTheme(am4themes_animated);
//totalProgressTitleDiv.innerHTML = "Total Progress";
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();

////
// Total progress for both points and lines combined
function totalProgressPt() {
var total_util_number = {
onStatisticField: "Status",
outStatisticFieldName: "total_util_number",
statisticType: "count"
};

var total_prog_util = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_prog_util",
statisticType: "sum"
};

var query = testUtilPt.createQuery();
query.outStatistics = [total_util_number, total_prog_util];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const progress = stats.total_prog_util;
const total = stats.total_util_number;
const perc = (progress/total)*100;

const compileArray = [total, progress];
return compileArray;
});

}

function totalProgressLine(compileArray) {
var total_util_number = {
onStatisticField: "Status",
outStatisticFieldName: "total_util_number",
statisticType: "count"
};

var total_prog_util = {
onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
outStatisticFieldName: "total_prog_util",
statisticType: "sum"
};

var query = testLine.createQuery();
query.outStatistics = [total_util_number, total_prog_util];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;
const progress = stats.total_prog_util;
const total = stats.total_util_number;
const perc = (progress/total)*100;

const totalAll = total + compileArray[0];
const progressAll = progress + compileArray[1];

const totalperc = (progressAll/totalAll)*100;
totalProgressDiv.innerHTML = totalperc.toFixed(1) + " %";
});
}

function totalProgressAll(){
totalProgressPt().then(totalProgressLine)
};
totalProgressAll();

// Define drop-down list select
var cpSelect = document.getElementById("valSelect");
var companySelect = document.getElementById("companySelect");
var typeSelect = document.getElementById("typeSelect");


view.when(function() {
return testUtilPt.when(function() {
  var query = testUtilPt.createQuery();
  return testUtilPt.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

// newValue1: CP
// newValue2: Type
// newValue3: Company

function queryForLotGeometries() {
var lotQuery = testUtilPt.createQuery();

return testUtilPt.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});

}

/////////////////////////////////////////////////////////////////////////
// 2. Get values and Return to list
//Return an array of all the values in the 'CP' field'
/// 2.1. CP
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.CP;
});
return values;
}

// Return an array of unique values in the 'CP' field of Utililty Point
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
  }
});
return uniqueValues;
}

// Add the unique values to the cpSelect element. this will allow the user
// to filter Utility Point by CP.
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  cpSelect.add(option);
});
//return setMunicipalExpression(municipalSelect.value);
}

/// 2.2. Company
// Filter Company List when CP list changes

//******************************************************************
// Insert my custom code to add companies from both point and line
function filterUtilPointLineCP(cpValue) {
var compArray = [];
var compArray1 = [];

// Query for Utility Point
function utilPointQuery() {
var query = testUtilPt.createQuery();
// CP: All, Type: All, Provider: All
if (cpValue === undefined || cpValue === 'None') {
query.where = "1=1";

// CP: !None, Type: All
} else if (cpValue !== 'None') {
query.where = "CP = '" + cpValue + "'";
}

return testUtilPt.queryFeatures(query).then(function(response) {
stats = response.features;
stats.forEach((result, index) => {
  const attributes = result.attributes;
  const COMPANY = attributes.Company;
  compArray.push(COMPANY);
});
return compArray;
}); // end of query features 
} // end of utility point query

// Query for Utility Line
function utilLineQuery(compArray){
var query2 = testLine.createQuery();

// CP: All, Type: All, Provider: All
if (cpValue === undefined || cpValue === 'None') {
query2.where = "1=1";

// CP: !None, Type: All
} else if (cpValue !== 'None') {
query2.where = "CP = '" + cpValue + "'";
}


return testLine.queryFeatures(query2).then(function(response) {
stats = response.features;
stats.forEach(result => {
  const attributes = result.attributes;
  const COMPANY = attributes.Company;
  compArray1.push(COMPANY);
});
const allArray = compArray.concat(compArray1);
return allArray;
});
} // end of Utility line query

function getUniqueValues2(values2) {
var uniqueValues2 = [];
values2.forEach(function(item, i) {
  if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
      uniqueValues2.push(item);
  }
});
return uniqueValues2;
}

// Add the unique values to the second select element (Company)
function addToSelectQuery2(query2Values) {
companySelect.options.length = 0;
query2Values.sort();
query2Values.unshift('None');
query2Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
companySelect.add(option);
});

//return setLotBarangayExpression(barangaySelect.value);
}
utilPointQuery()
.then(utilLineQuery)
.then(getUniqueValues)
.then(addToSelectQuery2)
.then(totalProgressAll);
} // end of filterUtilPointLineCP
filterUtilPointLineCP();

////////////////////////////////////////////////////////////////////////////////

/// 2.3. Type
/// Inser my custom functin to get Type from point and line
function filterUtilPointLineType(cpValue, companyValue) {

var Array = [];
var Array1 = [];

// Query for Utility Point
function utilPointQuery3() {
var query = testUtilPt.createQuery();

// CP: undefined, Company: undefined
if (cpValue === undefined && companyValue === undefined) {
query.where = "1=1";

// CP: None, Company: !None
} else if (cpValue === 'None' && companyValue !== 'None') {
query.where = "Company = '" + companyValue + "'";

// CP: None, Company: None
} else if (cpValue === 'None' && companyValue === 'None') {
query.where = "1=1";

// CP: !None, Company: None
} else if (cpValue !== 'None' && companyValue === 'None') {
query.where = "CP = '" + cpValue + "'";

// CP: !None, Company: !None
} else if (cpValue !== 'None' && companyValue !== 'None') {
query.where = "CP = '" + cpValue + "'" + " AND " + "Company = '" + companyValue + "'";
}

return testUtilPt.queryFeatures(query).then(function(response) {
stats = response.features;
stats.forEach((result, index) => {
  const attributes = result.attributes;
  const TYPE = attributes.Type;
  Array.push(TYPE);
});
return Array;
}); // end of query features 
} // end of utility point query

// Query for Utility Line
function utilLineQuery3(compArray){
var query2 = testLine.createQuery();

// CP: undefined, Company: undefined
if (cpValue === undefined && companyValue === undefined) {
query.where = "1=1";

// CP: None, Company: !None
} else if (cpValue === 'None' && companyValue !== 'None') {
query2.where = "Company = '" + companyValue + "'";

// CP: None, Company: None
} else if (cpValue === 'None' && companyValue === 'None') {
query2.where = "1=1";

// CP: !None, Company: None
} else if (cpValue !== 'None' && companyValue === 'None') {
query2.where = "CP = '" + cpValue + "'";

// CP: !None, Company: !None
} else if (cpValue !== 'None' && companyValue !== 'None') {
query2.where = "CP = '" + cpValue + "'" + " AND " + "Company = '" + companyValue + "'";
}


return testLine.queryFeatures(query2).then(function(response) {
stats = response.features;
stats.forEach(result => {
  const attributes = result.attributes;
  const TYPE = attributes.Type;
  Array1.push(TYPE);
});
const allArray = Array.concat(Array1);
return allArray;
});
} // end of Utility line query

function getUniqueValues3(values2) {
var uniqueValues2 = [];
values2.forEach(function(item, i) {
  if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
      uniqueValues2.push(item);
  }
});
return uniqueValues2;
}

// Add the unique values to the second select element (Company)
function addToSelectQuery3(query2Values) {
typeSelect.options.length = 0;
query2Values.sort();
query2Values.unshift('None');
query2Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
typeSelect.add(option);
});
return query2Values;

//return setLotBarangayExpression(barangaySelect.value);
}
utilPointQuery3()
.then(utilLineQuery3)
.then(getUniqueValues3)
.then(addToSelectQuery3)
.then(ZoomToLayerQuery)
.then(totalProgressAll);
} // end of filterUtilPointLineCP
filterUtilPointLineType();

// Define zoomTo
// This is necessary, as some companies have only points or lines, or both.
// Use correct zoomToLayer
function ZoomToLayerQuery(values) {
var regex = /\b(?:Point|Line)\b/gi;
var subject = values.toString();
let result = subject.match(regex);

// both Point and Line
if (result.length === 3) {
  zoomToLayer(testUtilPt);

} else if (result[0] === "Point") {
  zoomToLayer(testUtilPt);

} else {
  zoomToLayer(testLine);
}
}
///////////////////////////////////////////////////////////////////////
// Set the definition expression on the Utility Point layer
// to reflect the selecction of the user
// Only for CP
function setLotMunicipalOnlyExpression(newValue) {
//chartTitleDiv.innerHTML = chartTitleLabel;

if (newValue === 'None') {
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = null;
testLine1.definitionExpression = null;
viaductLayer.definitionExpression = null;

} else {
testUtilPt.definitionExpression = "CP = '" + newValue + "'";
testUtilPt1.definitionExpression = "CP = '" + newValue + "'";
testLine.definitionExpression = "CP = '" + newValue + "'";
testLine1.definitionExpression = "CP = '" + newValue + "'";
viaductLayer.definitionExpression = "CP = '" + newValue + "'";

}

zoomToLayer(testUtilPt);

return queryForLotGeometries();
}

function setLotDefinitionExpression(newValue1, newValue2, newValue3){
// newValue: CP
// newValue2: Utility Type
// newValue3: Company

//1   
if(newValue1 == 'None' && newValue2 == 'None' && newValue3 == 'None'){
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = null;
testLine1.definitionExpression = null;
//2
} else if (newValue1 == 'None' && newValue2 == 'None' && newValue3 !== 'None') {
testUtilPt.definitionExpression = "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "Company = '" + newValue3 + "'";

testLine.definitionExpression = "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "Company = '" + newValue3 + "'";

//3
} else if(newValue1 == 'None' && newValue2 == "Point" && newValue3 == 'None'){
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
//4
} else if(newValue1 == 'None' && newValue2 == "Point" && newValue3 !== 'None'){
testUtilPt.definitionExpression = "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "Company = '" + newValue3 + "'";
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
//5
} else if(newValue1 == 'None' && newValue2 == "Line" && newValue3 == 'None'){
testLine.definitionExpression = null;
testLine1.definitionExpression = null;
testUtilPt.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt1.definitionExpression = "Type = '" + newValue2 + "'";
//6
} else if(newValue1 == 'None' && newValue2 == "Line" && newValue3 !== 'None'){
testLine.definitionExpression = "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "Company = '" + newValue3 + "'";
testUtilPt.definitionExpression = "Type = '" + newValue2 + "'"
testUtilPt1.definitionExpression = "Type = '" + newValue2 + "'"
//7
} else if(newValue1 !== 'None' && newValue2 == 'None' && newValue3 == 'None'){
testLine.definitionExpression = "CP = '" + newValue1 + "'";
testLine1.definitionExpression = "CP = '" + newValue1 + "'";
testUtilPt.definitionExpression = "CP = '" + newValue1 + "'";
testUtilPt1.definitionExpression = "CP = '" + newValue1 + "'"; 
//8
} else if(newValue1 !== 'None' && newValue2 == 'None' && newValue3 !== 'None'){
testLine.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
//9
} else if(newValue1 !== 'None' && newValue2 == 'Point' && newValue3 == 'None'){
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt.definitionExpression = "CP = '" + newValue1 + "'";
testUtilPt1.definitionExpression = "CP = '" + newValue1 + "'";
//10
} else if(newValue1 !== 'None' && newValue2 == 'Point' && newValue3 !== 'None'){
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
//11
} else if(newValue1 !== 'None' && newValue2 == 'Line' && newValue3 == 'None'){
testLine.definitionExpression = "CP = '" + newValue1 + "'";
testLine1.definitionExpression = "CP = '" + newValue1 + "'";
testUtilPt.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt1.definitionExpression = "Type = '" + newValue2 + "'";
//12
} else if(newValue1 !== 'None' && newValue2 == 'Line' && newValue3 !== 'None'){
testLine.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "CP = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt1.definitionExpression = "Type = '" + newValue2 + "'";

// When a comapny is first selected over CP,
} else if (newValue1 == 'None' && newValue2 == '' && newValue3 !== 'None') {
testUtilPt.definitionExpression = "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "Company = '" + newValue3 + "'";

testLine.definitionExpression = "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "Company = '" + newValue3 + "'";
}
return queryForLotGeometries();
}


// 3. When a company selected, the company may only have


/////////////////////////////////////////

function filterUtilPt() {
var query2 = testUtilPt.createQuery();
query2.where = testUtilPt.definitionExpression; // use filtered municipality. is this correct?

}

function filterUtilPt1() {
var query2 = testUtilPt1.createQuery();
query2.where = testUtilPt1.definitionExpression; // use filtered municipality. is this correct?

}

function filterUtilLine() {
var query2 = testLine.createQuery();
query2.where = testLine.definitionExpression; // use filtered municipality. is this correct?

}

function filterUtilLine1() {
var query2 = testLine1.createQuery();
query2.where = testLine1.definitionExpression; // use filtered municipality. is this correct?

}

// When CP is changed, Type is reset to 'None'
const changeSelected = (e) => {
const $select = document.querySelector('#typeSelect');
$select.value = 'None'
};

// Dropdown List
// Select CP from dropdown list
cpSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

var companyValue = companySelect.value;

//document.getElementById("orange").selected = true;
filterUtilPointLineCP(type);
filterUtilPointLineType(type, companyValue);

setLotMunicipalOnlyExpression(type);
changeSelected();

totalProgressAll();

var typeS = typeSelect.value;

waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();



filterUtilPt();
filterUtilPt1();
filterUtilLine();
filterUtilLine1();

});

// Provider dropdown list 
companySelect.addEventListener("change", function(event) {
const companyValue = event.target.value;

changeSelected();

var cpValue = cpSelect.value;
filterUtilPointLineType(cpValue, companyValue);

setLotDefinitionExpression(cpSelect.value, typeSelect.value, companySelect.value);

// If a provider selected does not have both point or line,
const typeS = typeSelect.value;

if (typeS === 'Point') {
chartPointWater();
chartPointPower();
chartPointSewage();
chartPointTelecom();
chartPointOilGas();

} else if (typeS === 'Line') {
chartLineWater();
chartLinePower();
chartLineSewage();
chartLineTelecom();
chartLineOilGas();

} else if (typeS === 'None') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();

// When a comapny is first selected over CP,
} else if (typeS === '') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
}


totalProgressAll();

filterUtilPt();
filterUtilPt1();
filterUtilLine();
filterUtilLine1();

});


// Utility Type: Point or Line
typeSelect.addEventListener("change", async function(event) {
const typeS = event.target.value;

setLotDefinitionExpression(cpSelect.value, typeS, companySelect.value);

if (typeS === 'Point') {
chartPointWater();
chartPointPower();
chartPointSewage();
chartPointTelecom();
chartPointOilGas();

} else if (typeS === 'Line') {
chartLineWater();
chartLinePower();
chartLineSewage();
chartLineTelecom();
chartLineOilGas();

} else if (typeS === 'None') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
}


totalProgressAll();

filterUtilPt();
filterUtilPt1();
filterUtilLine();
filterUtilLine1();

//zoomToLayer(testUtilPt1);
//zoomToLayer(testLine1);

});
// Click event handler for choices



///
let chartLayerView;
const chartWaterDiv = document.getElementById("chartWaterDiv");

// Chart ********************************

// 1. Water
// 1.1. Point
function chartPointWater() {
var total_water_incomp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_incomp",
statisticType: "sum"
};

var total_water_comp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_water_incomp, total_water_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const water_incomp = stats.total_water_incomp;
  const water_comp = stats.total_water_comp;

  var chart = am4core.create("chartWaterDiv", am4charts.XYChart);
  
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
      if (target.pixelWidth <= 400) {
        return true;
      }
      return false;
    },
    state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

// Create a separate state for background
// target.setStateOnChildren = true;
// var bgstate = target.background.states.create(stateId);
// bgstate.properties.fill = am4core.color("#fff");
// bgstate.properties.fillOpacity = 0;

return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});


  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Water",
          value1: water_comp,
          value2: water_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (water_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 2;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 2;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testUtilPt).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
                  testUtilPt.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testUtilPt.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testUtilPt1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartWater


// 1.2. Line
function chartLineWater() {

var total_water_incomp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_incomp",
statisticType: "sum"
};

var total_water_comp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_water_incomp, total_water_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const water_incomp = stats.total_water_incomp;
  const water_comp = stats.total_water_comp;

  var chart = am4core.create("chartWaterDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Water",
          value1: water_comp,
          value2: water_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF");
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (water_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 2;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 2;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testLine).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testLine1.definitionExpression = sqlExpression;
                  testLine.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testLine.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });

                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testLine1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartWater

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointWaterForCompile() {
var total_water_incomp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_incomp",
statisticType: "sum"
};

var total_water_comp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_water_incomp, total_water_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const water_incomp = stats.total_water_incomp;
  const water_comp = stats.total_water_comp;
  const waterPointValues = [water_incomp, water_comp];

return waterPointValues;
}); // end of queryFeatures
} // end of updateChartWater

/// 1.3.2. Line for compiled
function chartLineWaterForCompile(waterPointValues) {
var total_water_incomp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_incomp",
statisticType: "sum"
};

var total_water_comp = {
onStatisticField: "CASE WHEN (UtilType = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_water_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_water_incomp, total_water_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const water_incomp = stats.total_water_incomp;
  const water_comp = stats.total_water_comp;

  const waterIncompTotal = water_incomp + waterPointValues[0];
  const waterCompTotal = water_comp + waterPointValues[1];
  const waterTotalValues = [waterIncompTotal, waterCompTotal];

return waterTotalValues;
}); // end of queryFeatures
} // end of updateChartWater

/// 1.3.3. Point + Line
//
function waterCompiledChart(waterTotalValues) {
var chart = am4core.create("chartWaterDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = waterTotalValues;

chart.data = [
{
category: "Water",
value1: waterTotalValues[1],
value2: waterTotalValues[0]
}
];

// Define chart setting
chart.colors.step = 2;
chart.padding(0, 0, 0, 0);
  
// Axis Setting
/// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 0;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeWidth = 0;
  
/// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.grid.template.strokeWidth = 0;
  
//valueAxis.disabled = true;
//categoryAxis.disabled = true;
let arrLviews = [];

// Layerview and Expand
function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;
      
// Bar chart line color and width
series.columns.template.stroke = am4core.color("#FFFFFF");
series.columns.template.strokeWidth = 0.5;
series.name = name;
      
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
if (name == "Incomplete"){
series.fill = am4core.color("#FF000000");
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#FFFFFFFF");
labelBullet.label.fontSize = 0;

} else {
// When completed value is zero, show no labels.
if (waterTotalValues[1] === 0) {
  labelBullet.label.text = "";
} else {
  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
};

series.fill = am4core.color("#00B0F0"); // Completed
//labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.label.fontSize = 20;
}
labelBullet.locationX = 0.5;
labelBullet.interactionsEnabled = false;
series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);

function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;
          
// Layer
if (selectedP == "Water" && selectedC === "Incomplete") {
  selectedLayer = 2;
  selectedStatus = 0;
} else if (selectedP == "Water" && selectedC === "Complete") {
  selectedLayer = 2;
  selectedStatus = 1;
} else {
  selectedLayer = null;
}

//
               
// Query view using compiled arrays
for(var i = 0; i < arrLviews.length; i++) {
  arrLviews[i].filter = {
    where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
  }
}
} // End of filterByChart
  // LayerView for point 2
view.whenLayerView(testLine1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testLine).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

view.whenLayerView(testUtilPt).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testUtilPt1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

// End of LayerView


} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}

async function waterAllChart() {
chartPointWaterForCompile()
.then(chartLineWaterForCompile)
.then(waterCompiledChart);
}

// 2. Seweage
// 1.1. Point
function chartPointSewage() {
var total_sewage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_incomp",
statisticType: "sum"
};

var total_sewage_comp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_sewage_incomp, total_sewage_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const sewage_incomp = stats.total_sewage_incomp;
  const sewage_comp = stats.total_sewage_comp;

  var chart = am4core.create("chartSewageDiv", am4charts.XYChart);
  
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
      if (target.pixelWidth <= 400) {
        return true;
      }
      return false;
    },
    state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

// Create a separate state for background
// target.setStateOnChildren = true;
// var bgstate = target.background.states.create(stateId);
// bgstate.properties.fill = am4core.color("#fff");
// bgstate.properties.fillOpacity = 0;

return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});


  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Sewage",
          value1: sewage_comp,
          value2: sewage_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (sewage_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 3;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 3;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testUtilPt).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
                  testUtilPt.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testUtilPt.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testUtilPt1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartSewage


// 1.2. Line
function chartLineSewage() {

var total_sewage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_incomp",
statisticType: "sum"
};

var total_sewage_comp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_sewage_incomp, total_sewage_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const sewage_incomp = stats.total_sewage_incomp;
  const sewage_comp = stats.total_sewage_comp;

  var chart = am4core.create("chartSewageDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Sewage",
          value1: sewage_comp,
          value2: sewage_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF");
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (sewage_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 3;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 3;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testLine).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testLine1.definitionExpression = sqlExpression;
                  testLine.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testLine.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });

                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testLine1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartSewage

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointSewageForCompile() {
var total_sewage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_incomp",
statisticType: "sum"
};

var total_sewage_comp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_sewage_incomp, total_sewage_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const sewage_incomp = stats.total_sewage_incomp;
  const sewage_comp = stats.total_sewage_comp;
  const sewagePointValues = [sewage_incomp, sewage_comp];

return sewagePointValues;
}); // end of queryFeatures
} // end of updateChartSewage

/// 1.3.2. Line for compiled
function chartLineSewageForCompile(sewagePointValues) {
var total_sewage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_incomp",
statisticType: "sum"
};

var total_sewage_comp = {
onStatisticField: "CASE WHEN (UtilType = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_sewage_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_sewage_incomp, total_sewage_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const sewage_incomp = stats.total_sewage_incomp;
  const sewage_comp = stats.total_sewage_comp;

  const sewageIncompTotal = sewage_incomp + sewagePointValues[0];
  const sewageCompTotal = sewage_comp + sewagePointValues[1];
  const sewageTotalValues = [sewageIncompTotal, sewageCompTotal];

return sewageTotalValues;
}); // end of queryFeatures
} // end of updateChartSewage

/// 1.3.3. Point + Line
//
function sewageCompiledChart(sewageTotalValues) {
var chart = am4core.create("chartSewageDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = sewageTotalValues;

chart.data = [
{
category: "Sewage",
value1: sewageTotalValues[1],
value2: sewageTotalValues[0]
}
];

// Define chart setting
chart.colors.step = 2;
chart.padding(0, 0, 0, 0);
  
// Axis Setting
/// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 0;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeWidth = 0;
  
/// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.grid.template.strokeWidth = 0;
  
//valueAxis.disabled = true;
//categoryAxis.disabled = true;
let arrLviews = [];

// Layerview and Expand
function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;
      
// Bar chart line color and width
series.columns.template.stroke = am4core.color("#FFFFFF");
series.columns.template.strokeWidth = 0.5;
series.name = name;
      
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
if (name == "Incomplete"){
series.fill = am4core.color("#FF000000");
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#FFFFFFFF");
labelBullet.label.fontSize = 0;

} else {
// When completed value is zero, show no labels.
if (sewageTotalValues[1] === 0) {
  labelBullet.label.text = "";
} else {
  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
};

series.fill = am4core.color("#00B0F0"); // Completed
//labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.label.fontSize = 20;
}
labelBullet.locationX = 0.5;
labelBullet.interactionsEnabled = false;

series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);

function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;
          
// Layer
if (selectedP == "Sewage" && selectedC === "Incomplete") {
  selectedLayer = 3;
  selectedStatus = 0;
} else if (selectedP == "Sewage" && selectedC === "Complete") {
  selectedLayer = 3;
  selectedStatus = 1;
} else {
  selectedLayer = null;
}

//
               
// Query view using compiled arrays
for(var i = 0; i < arrLviews.length; i++) {
  arrLviews[i].filter = {
    where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
  }
}
} // End of filterByChart
  // LayerView for point 2
view.whenLayerView(testLine1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testLine).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

view.whenLayerView(testUtilPt).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testUtilPt1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

// End of LayerView


} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}

async function sewageAllChart() {
chartPointSewageForCompile()
.then(chartLineSewageForCompile)
.then(sewageCompiledChart);
}




// 3. Power
function chartPointPower() {
var total_power_incomp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_incomp",
statisticType: "sum"
};

var total_power_comp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_power_incomp, total_power_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const power_incomp = stats.total_power_incomp;
  const power_comp = stats.total_power_comp;

  var chart = am4core.create("chartPowerDiv", am4charts.XYChart);
  
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
      if (target.pixelWidth <= 400) {
        return true;
      }
      return false;
    },
    state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

// Create a separate state for background
// target.setStateOnChildren = true;
// var bgstate = target.background.states.create(stateId);
// bgstate.properties.fill = am4core.color("#fff");
// bgstate.properties.fillOpacity = 0;

return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});


  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Power",
          value1: power_comp,
          value2: power_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (power_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 4;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 4;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testUtilPt).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
                  testUtilPt.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testUtilPt.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testUtilPt1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartPower


// 1.2. Line
function chartLinePower() {

var total_power_incomp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_incomp",
statisticType: "sum"
};

var total_power_comp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_power_incomp, total_power_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const power_incomp = stats.total_power_incomp;
  const power_comp = stats.total_power_comp;

  var chart = am4core.create("chartPowerDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Power",
          value1: power_comp,
          value2: power_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF");
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (power_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 4;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 4;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testLine).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testLine1.definitionExpression = sqlExpression;
                  testLine.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testLine.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });

                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testLine1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartPower

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointPowerForCompile() {
var total_power_incomp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_incomp",
statisticType: "sum"
};

var total_power_comp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_power_incomp, total_power_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const power_incomp = stats.total_power_incomp;
  const power_comp = stats.total_power_comp;
  const powerPointValues = [power_incomp, power_comp];

return powerPointValues;
}); // end of queryFeatures
} // end of updateChartPower

/// 1.3.2. Line for compiled
function chartLinePowerForCompile(powerPointValues) {
var total_power_incomp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_incomp",
statisticType: "sum"
};

var total_power_comp = {
onStatisticField: "CASE WHEN (UtilType = 4 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_power_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_power_incomp, total_power_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const power_incomp = stats.total_power_incomp;
  const power_comp = stats.total_power_comp;

  const powerIncompTotal = power_incomp + powerPointValues[0];
  const powerCompTotal = power_comp + powerPointValues[1];
  const powerTotalValues = [powerIncompTotal, powerCompTotal];

return powerTotalValues;
}); // end of queryFeatures
} // end of updateChartPower

/// 1.3.3. Point + Line
//
function powerCompiledChart(powerTotalValues) {
var chart = am4core.create("chartPowerDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = powerTotalValues;

chart.data = [
{
category: "Power",
value1: powerTotalValues[1],
value2: powerTotalValues[0]
}
];

// Define chart setting
chart.colors.step = 2;
chart.padding(0, 0, 0, 0);
  
// Axis Setting
/// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 0;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeWidth = 0;
  
/// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.grid.template.strokeWidth = 0;
  
//valueAxis.disabled = true;
//categoryAxis.disabled = true;
let arrLviews = [];

// Layerview and Expand
function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;
      
// Bar chart line color and width
series.columns.template.stroke = am4core.color("#FFFFFF");
series.columns.template.strokeWidth = 0.5;
series.name = name;
      
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
if (name == "Incomplete"){
series.fill = am4core.color("#FF000000");
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#FFFFFFFF");
labelBullet.label.fontSize = 0;

} else {
// When completed value is zero, show no labels.
if (powerTotalValues[1] === 0) {
  labelBullet.label.text = "";
} else {
  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
};

series.fill = am4core.color("#00B0F0"); // Completed
//labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.label.fontSize = 20;
}
labelBullet.locationX = 0.5;
labelBullet.interactionsEnabled = false;

series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);

function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;
          
// Layer
if (selectedP == "Power" && selectedC === "Incomplete") {
  selectedLayer = 4;
  selectedStatus = 0;
} else if (selectedP == "Power" && selectedC === "Complete") {
  selectedLayer = 4;
  selectedStatus = 1;
} else {
  selectedLayer = null;
}

//
               
// Query view using compiled arrays
for(var i = 0; i < arrLviews.length; i++) {
  arrLviews[i].filter = {
    where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
  }
}
} // End of filterByChart
  // LayerView for point 2
view.whenLayerView(testLine1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testLine).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

view.whenLayerView(testUtilPt).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testUtilPt1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

// End of LayerView


} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}

async function powerAllChart() {
chartPointPowerForCompile()
.then(chartLinePowerForCompile)
.then(powerCompiledChart);
}



// 4. Telecom/CATV
// 1.1. Point
function chartPointTelecom() {
var total_telecom_incomp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_incomp",
statisticType: "sum"
};

var total_telecom_comp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_telecom_incomp, total_telecom_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const telecom_incomp = stats.total_telecom_incomp;
  const telecom_comp = stats.total_telecom_comp;

  var chart = am4core.create("chartTelecomDiv", am4charts.XYChart);
  
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
      if (target.pixelWidth <= 400) {
        return true;
      }
      return false;
    },
    state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

// Create a separate state for background
// target.setStateOnChildren = true;
// var bgstate = target.background.states.create(stateId);
// bgstate.properties.fill = am4core.color("#fff");
// bgstate.properties.fillOpacity = 0;

return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});


  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Telecom",
          value1: telecom_comp,
          value2: telecom_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (telecom_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 1;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 1;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testUtilPt).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
                  testUtilPt.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testUtilPt.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testUtilPt1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartTelecom


// 1.2. Line
function chartLineTelecom() {

var total_telecom_incomp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_incomp",
statisticType: "sum"
};

var total_telecom_comp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_telecom_incomp, total_telecom_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const telecom_incomp = stats.total_telecom_incomp;
  const telecom_comp = stats.total_telecom_comp;

  var chart = am4core.create("chartTelecomDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Telecom",
          value1: telecom_comp,
          value2: telecom_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF");
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (telecom_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 1;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 1;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testLine).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testLine1.definitionExpression = sqlExpression;
                  testLine.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testLine.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });

                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testLine1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartTelecom

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointTelecomForCompile() {
var total_telecom_incomp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_incomp",
statisticType: "sum"
};

var total_telecom_comp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_telecom_incomp, total_telecom_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const telecom_incomp = stats.total_telecom_incomp;
  const telecom_comp = stats.total_telecom_comp;
  const telecomPointValues = [telecom_incomp, telecom_comp];

return telecomPointValues;
}); // end of queryFeatures
} // end of updateChartTelecom

/// 1.3.2. Line for compiled
function chartLineTelecomForCompile(telecomPointValues) {
var total_telecom_incomp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_incomp",
statisticType: "sum"
};

var total_telecom_comp = {
onStatisticField: "CASE WHEN (UtilType = 1 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_telecom_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_telecom_incomp, total_telecom_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const telecom_incomp = stats.total_telecom_incomp;
  const telecom_comp = stats.total_telecom_comp;

  const telecomIncompTotal = telecom_incomp + telecomPointValues[0];
  const telecomCompTotal = telecom_comp + telecomPointValues[1];
  const telecomTotalValues = [telecomIncompTotal, telecomCompTotal];

return telecomTotalValues;
}); // end of queryFeatures
} // end of updateChartTelecom

/// 1.3.3. Point + Line
//
function telecomCompiledChart(telecomTotalValues) {
var chart = am4core.create("chartTelecomDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = telecomTotalValues;

chart.data = [
{
category: "Telecom",
value1: telecomTotalValues[1],
value2: telecomTotalValues[0]
}
];

// Define chart setting
chart.colors.step = 2;
chart.padding(0, 0, 0, 0);
  
// Axis Setting
/// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 0;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeWidth = 0;
  
/// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.grid.template.strokeWidth = 0;
  
//valueAxis.disabled = true;
//categoryAxis.disabled = true;
let arrLviews = [];

// Layerview and Expand
function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;
      
// Bar chart line color and width
series.columns.template.stroke = am4core.color("#FFFFFF");
series.columns.template.strokeWidth = 0.5;
series.name = name;
      
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
if (name == "Incomplete"){
series.fill = am4core.color("#FF000000");
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#FFFFFFFF");
labelBullet.label.fontSize = 0;

} else {
// When completed value is zero, show no labels.
if (telecomTotalValues[1] === 0) {
  labelBullet.label.text = "";
} else {
  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
};

series.fill = am4core.color("#00B0F0"); // Completed
//labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.label.fontSize = 20;
}
labelBullet.locationX = 0.5;
labelBullet.interactionsEnabled = false;

series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);

function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;
          
// Layer
if (selectedP == "Telecom" && selectedC === "Incomplete") {
  selectedLayer = 1;
  selectedStatus = 0;
} else if (selectedP == "Telecom" && selectedC === "Complete") {
  selectedLayer = 1;
  selectedStatus = 1;
} else {
  selectedLayer = null;
}

//
               
// Query view using compiled arrays
for(var i = 0; i < arrLviews.length; i++) {
  arrLviews[i].filter = {
    where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
  }
}
} // End of filterByChart
  // LayerView for point 2
view.whenLayerView(testLine1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testLine).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

view.whenLayerView(testUtilPt).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testUtilPt1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

// End of LayerView


} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}

async function telecomAllChart() {
chartPointTelecomForCompile()
.then(chartLineTelecomForCompile)
.then(telecomCompiledChart);
}

//5. Oil & Gas
// 4. OilGas/CATV
// 1.1. Point
function chartPointOilGas() {
var total_oilgas_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_oilgas_incomp, total_oilgas_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const oilgas_incomp = stats.total_oilgas_incomp;
  const oilgas_comp = stats.total_oilgas_comp;

  var chart = am4core.create("chartOilGasDiv", am4charts.XYChart);
  
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
      if (target.pixelWidth <= 400) {
        return true;
      }
      return false;
    },
    state: function(target, stateId) {

if (target instanceof am4charts.Chart) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 15;
state.properties.paddingBottom = 5;
state.properties.paddingLeft = 15;
return state;
}


if (target instanceof am4charts.Legend) {
var state = target.states.create(stateId);
state.properties.paddingTop = 0;
state.properties.paddingRight = 0;
state.properties.paddingBottom = 0;
state.properties.paddingLeft = 0;
state.properties.marginLeft = 0;
return state;
}

if (target instanceof am4charts.AxisRendererY) {
var state = target.states.create(stateId);
state.properties.inside = false;
state.properties.maxLabelPosition = 0.99;
return state;
}

if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
var state = target.states.create(stateId);
state.properties.dy = 0;
state.properties.paddingTop = 3;
state.properties.paddingRight = 5;
state.properties.paddingBottom = 3;
state.properties.paddingLeft = 5;

// Create a separate state for background
// target.setStateOnChildren = true;
// var bgstate = target.background.states.create(stateId);
// bgstate.properties.fill = am4core.color("#fff");
// bgstate.properties.fillOpacity = 0;

return state;
}

// if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
//   var state = target.states.create(stateId);
//   state.properties.fill = am4core.color("#f00");
//   state.properties.fillOpacity = 0.5;
//   return state;
// }

return null;
}
});


  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "OilGas",
          value1: oilgas_comp,
          value2: oilgas_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (oilgas_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 5;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 5;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testUtilPt).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testUtilPt1.definitionExpression = sqlExpression;
                  testUtilPt.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testUtilPt.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });
                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testUtilPt1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartOilGas


// 1.2. Line
function chartLineOilGas() {

var total_oilgas_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_oilgas_incomp, total_oilgas_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const oilgas_incomp = stats.total_oilgas_incomp;
  const oilgas_comp = stats.total_oilgas_comp;

  var chart = am4core.create("chartOilGasDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "OilGas",
          value1: oilgas_comp,
          value2: oilgas_incomp
      }
  ];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF");
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (oilgas_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;

      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
          const selectedC = ev.target.dataItem.component.name;
          const selectedP = ev.target.dataItem.categoryY;
          
          // Layer
          if (selectedC === "Incomplete") {
              selectedLayer = 5;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 5;
              selectedStatus = 1;
          } else {
              selectedLayer = null;
          }
          
          // Point 1:
          view.when(function() {
              view.whenLayerView(testLine).then(function (layerView) {
                  chartLayerView = layerView;
                  arrLviews.push(layerView);
                  chartElement.style.visibility = "visible";
                  
                  //testLine1.definitionExpression = sqlExpression;
                  testLine.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      let objID = [];
                      for (var i=0; i < rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      var queryExt = new Query({
                          objectIds: objID
                      });
                      
                      testLine.queryExtent(queryExt).then(function(result) {
                          if (result.extent) {
                              view.goTo(result.extent)
                          }
                      });

                      
                      view.on("click", function() {
                          layerView.filter = null;
                      });
                  }); // end of query features   
              }); // end of when layerview

          // Point: 2
          view.whenLayerView(testLine1).then(function (layerView) {
              chartLayerView = layerView;
              arrLviews.push(layerView);
              chartElement.style.visibility = "visible";
              
              view.on("click", function() {
                  layerView.filter = null;
              });
          }); // end of when layerview
      }); // end of view.when

      // Query view using compiled arrays
      for(var i = 0; i < arrLviews.length; i++) {
          arrLviews[i].filter = {
              where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
          }
      }
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}); // end of queryFeatures
} // end of updateChartOilGas

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointOilGasForCompile() {
var total_oilgas_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_oilgas_incomp, total_oilgas_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const oilgas_incomp = stats.total_oilgas_incomp;
  const oilgas_comp = stats.total_oilgas_comp;
  const oilgasPointValues = [oilgas_incomp, oilgas_comp];

return oilgasPointValues;
}); // end of queryFeatures
} // end of updateChartOilGas

/// 1.3.2. Line for compiled
function chartLineOilGasForCompile(oilgasPointValues) {
var total_oilgas_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_oilgas_incomp, total_oilgas_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const oilgas_incomp = stats.total_oilgas_incomp;
  const oilgas_comp = stats.total_oilgas_comp;

  const oilgasIncompTotal = oilgas_incomp + oilgasPointValues[0];
  const oilgasCompTotal = oilgas_comp + oilgasPointValues[1];
  const oilgasTotalValues = [oilgasIncompTotal, oilgasCompTotal];

return oilgasTotalValues;
}); // end of queryFeatures
} // end of updateChartOilGas

/// 1.3.3. Point + Line
//
function oilGasCompiledChart(oilgasTotalValues) {
var chart = am4core.create("chartOilGasDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = oilgasTotalValues;

chart.data = [
{
category: "OilGas",
value1: oilgasTotalValues[1],
value2: oilgasTotalValues[0]
}
];

// Define chart setting
chart.colors.step = 2;
chart.padding(0, 0, 0, 0);
  
// Axis Setting
/// Category Axis
var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.labels.template.fontSize = 0;
categoryAxis.renderer.labels.template.fill = "#ffffff";
categoryAxis.renderer.minGridDistance = 5; //can change label
categoryAxis.renderer.grid.template.strokeWidth = 0;
  
/// Value Axis
var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 100;
valueAxis.strictMinMax = true;
valueAxis.calculateTotals = true;
valueAxis.renderer.minWidth = 50;
valueAxis.renderer.labels.template.fontSize = 0;
valueAxis.renderer.labels.template.fill = "#ffffff";
valueAxis.renderer.grid.template.strokeWidth = 0;
  
//valueAxis.disabled = true;
//categoryAxis.disabled = true;
let arrLviews = [];

// Layerview and Expand
function createSeries(field, name) {
var series = chart.series.push(new am4charts.ColumnSeries());
series.calculatePercent = true;
series.dataFields.valueX = field;
series.dataFields.categoryY = "category";
series.stacked = true;
series.dataFields.valueXShow = "totalPercent";
series.dataItems.template.locations.categoryY = 0.5;
      
// Bar chart line color and width
series.columns.template.stroke = am4core.color("#FFFFFF");
series.columns.template.strokeWidth = 0.5;
series.name = name;
      
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
if (name == "Incomplete"){
series.fill = am4core.color("#FF000000");
labelBullet.label.text = "";
labelBullet.label.fill = am4core.color("#FFFFFFFF");
labelBullet.label.fontSize = 0;

} else {
// When completed value is zero, show no labels.
if (oilgasTotalValues[1] === 0) {
  labelBullet.label.text = "";
} else {
  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
};

series.fill = am4core.color("#00B0F0"); // Completed
//labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
labelBullet.label.fill = am4core.color("#ffffff");
labelBullet.label.fontSize = 20;
}
labelBullet.locationX = 0.5;
labelBullet.interactionsEnabled = false;

series.columns.template.width = am4core.percent(60);
series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
// Click chart and filter, update maps
const chartElement = document.getElementById("chartPanel");
series.columns.template.events.on("hit", filterByChart, this);

function filterByChart(ev) {
const selectedC = ev.target.dataItem.component.name;
const selectedP = ev.target.dataItem.categoryY;
          
// Layer
if (selectedP == "OilGas" && selectedC === "Incomplete") {
  selectedLayer = 5;
  selectedStatus = 0;
} else if (selectedP == "OilGas" && selectedC === "Complete") {
  selectedLayer = 5;
  selectedStatus = 1;
} else {
  selectedLayer = null;
}

//
               
// Query view using compiled arrays
for(var i = 0; i < arrLviews.length; i++) {
  arrLviews[i].filter = {
    where: "UtilType = " + selectedLayer + " AND " +  "Status = " + selectedStatus
  }
}
} // End of filterByChart
  // LayerView for point 2
view.whenLayerView(testLine1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testLine).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

view.whenLayerView(testUtilPt).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});

});

view.whenLayerView(testUtilPt1).then(function (layerView) {
chartLayerView = layerView;
arrLviews.push(layerView);

chartElement.style.visibility = "visible";


view.on("click", function() {
layerView.filter = null;
});
});

// End of LayerView


} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Incomplete");

}

async function oilGasAllChart() {
chartPointOilGasForCompile()
.then(chartLineOilGasForCompile)
.then(oilGasCompiledChart);
}
am4core.options.autoDispose = true;
}); // End of am4core.ready



// Popup Setting
//*****************************//
//      PopUp Settig           //
//*****************************//
// Utility Point
var highlightSelect;
view.when(function() {
var popup = view.popup;
popup.viewModel.on("trigger-action", function(event) {
if (event.action.id == "find-relocated") {
var attributes = popup.viewModel.selectedFeature.attributes;
var info = attributes.Id;
var infoObjId = attributes.OBJECTID; //1

view.whenLayerView(testUtilPt).then(function(layerView) {
testUtilPt.queryFeatures().then(function(results) {
    const ggg = results.features;
    const rowN = ggg.length; //7         
    var i;
    let objID = [];
      for (i=0; i < rowN; i++) {
        if (results.features[i].attributes.Id == info) {
            if (results.features[i].attributes.OBJECTID == infoObjId) {
                continue;
            }
            var obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }
      }

var queryExt = new Query({
  //objectIds: [1,2,3,4,5]
  //objectIds: objID
  objectIds: objID
});

testUtilPt1.queryExtent(queryExt).then(function(result) {
  if (result.extent) {
    view.goTo(result.extent.expand(200))
  }
});

if (highlightSelect) {
  highlightSelect.remove();
}
highlightSelect = layerView.highlight(objID);

view.on("click", function() {
  highlightSelect.remove();
});
}); // End of queryFeatures()
}); // End of layerView

} // End of if (event.action.id...)
});
}); // End of view.when()

// Utility Line
view.when(function() {
var popup = view.popup;
popup.viewModel.on("trigger-action", function(event) {
if (event.action.id == "find-relocated-line") {
var attributes = popup.viewModel.selectedFeature.attributes;
var info = attributes.Id;
var infoObjId = attributes.OBJECTID; //1

view.whenLayerView(testLine).then(function(layerView) {
  testLine.queryFeatures().then(function(results) {
    const ggg = results.features;
    const rowN = ggg.length; //7
    //var rrr = results.features[0].attributes.Id;
    //var rrr = results.features[6].attributes.Id; // return Id of 7th row
    
    var i;
    let objID = [];
      for (i=0; i < rowN; i++) {
        if (results.features[i].attributes.Id == info) {
            if (results.features[i].attributes.OBJECTID == infoObjId) {
                continue;
            }
            var obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }
      }

var queryExt = new Query({
  //objectIds: [1,2,3,4,5]
  //objectIds: objID
  objectIds: objID
});

testLine1.queryExtent(queryExt).then(function(result) {
  if (result.extent) {
    view.goTo(result.extent)
  }
});

if (highlightSelect) {
  highlightSelect.remove();
}
highlightSelect = layerView.highlight(objID);

view.on("click", function() {
  highlightSelect.remove();
});
}); // End of queryFeatures()
}); // End of layerView
} // End of if (event.action.id...)
});
}); // End of view.when()


// Layer List
var layerList = new LayerList({
view: view,
listItemCreatedFunction: function(event) {
  const item = event.item;
  if (item.title === "Chainage" ||
      item.title === "Viaduct" ||
      item.title === "Pier No" ||
      item.title === "OpenStreetMap 3D Buildings"){
      item.visible = false
  }
}
});

var legend = new Legend({
view: view,
container: document.getElementById("legendDiv"),
layerInfos: [
{
layer: ngcpPROW,
title: "ROW for NGCP: Site 6 and 7"
},
{
layer: ngcpDpwhRoad,
title: "DWPH Road for NGCP: Site 7"

},
{
layer: ngcpPoleWA,
title: "Pole Working Area for NGCP: Site 6 and 7"
},
{
layer: testUtilPt,
title: "UL Point"
},
{
layer: testLine,
title: "UL Line"
},
{
layer: testUtilPt1,
title: "UL Status"
},
{
layer: rowLayer,
title: "PROW"
},
{
layer: stationBoxLayer,
title: "Station Box"
},
]
});

var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "top-right"
});
view.ui.add(legendExpand, {
position: "top-right"
});

view.ui.empty("top-left");

var layerListExpand = new Expand ({
view: view,
content: layerList,
expandIconClass: "esri-icon-visible",
group: "top-right"
});
view.ui.add(layerListExpand, {
position: "top-right"
});

// Full screen logo
fullscreen = new Fullscreen({
view: view,
});
view.ui.add(fullscreen, "top-right");



// Compass
var compass = new Compass({
view: view});
view.ui.add(compass, "top-right");


//*****************************//
//      Search Widget          //
//*****************************//
var searchWidget = new Search({
view: view,
locationEnabled: false,
allPlaceholder: "Chainage or Utility ID",
includeDefaultSources: false,
sources: [
{
layer: PierNoLayer,
searchFields: ["PIER"],
displayField: "PIER",
exactMatch: false,
outFields: ["PIER"],
name: "Pier No",
zoomScale: 1000,
placeholder: "example: P-288"
},
{
layer: chainageLayer,
searchFields: ["KmSpot"],
displayField: "KmSpot",
exactMatch: false,
outFields: ["*"],
zoomScale: 1000,
name: "Main KM",
placeholder: "example: 80+400"
},
{
layer: testUtilPt,
searchFields: ["Id"],
displayField: "Id",
exactMatch: false,
outFields: ["Id"],
name: "Unique ID (Point)",
placeholder: "example: MER0001-X01"
},
{
layer: testLine1,
searchFields: ["Id"],
displayField: "Id",
exactMatch: false,
outFields: ["Id"],
name: "Unique ID (Line)",
placeholder: "example: MER0001-X01"
}
]
});

const searchExpand = new Expand({
view: view,
content: searchWidget,
expandIconClass: "esri-icon-search",
group: "top-right"
});
view.ui.add(searchExpand, {
position: "top-right"
});

searchExpand.watch("expanded", function() {
if(!searchExpand.expanded) {
searchWidget.searchTerm = null;
}
});


// See-through-Ground        
view.when(function() {
// allow navigation above and below the ground
map.ground.navigationConstraint = {
  type: "none"
};
// the webscene has no basemap, so set a surfaceColor on the ground
map.ground.surfaceColor = "#fff";
// to see through the ground, set the ground opacity to 0.4
map.ground.opacity = 0.9; //
});
    
document
.getElementById("opacityInput")
.addEventListener("change", function(event) {
//map.ground.opacity = event.target.checked ? 0.1 : 0.9;
map.ground.opacity = event.target.checked ? 0.1 : 0.6;
});
view.ui.add("menu", "bottom-right");

//view.ui.padding = { top: 100, left: 0, right: 0, bottom: 0 };


});