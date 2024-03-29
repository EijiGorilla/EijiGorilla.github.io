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
        id: "f666b3fb303c47ddb9b0dae032f800f5"  // original 79bd8b0729b34aabb4c93fa43c59c897
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
        basemap: basemap, //basemap // "streets-night-vector", basemap, topo-vector, gray
        ground: new Ground({
          layers: [worldElevation, dem]
        })
  });
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.1;
   
   
var view = new SceneView ({
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
var headerDiv = document.getElementById("headerDiv");
var headerTitleDiv = document.getElementById("headerTitleDiv");
var referenceOnlyDiv = document.getElementById("referenceOnlyDiv");


//*******************************//
// Label Class Property Settings //
//*******************************//
// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KM_MAIN"},
symbol: {
type: "text",
color: [219,112,147,0.5],
size: 20
}
});

// Station Label
var stationLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "orange"
          },
          size: 20,
          color: "orange",
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
        minWorldLength: 50
      },

    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: 'DefaultValue($feature.Station1, "no data")'
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
size: 9
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
size: 9
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

  function stationsSymbol(name) {
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

function utilPtSymbolSignal(name) {
  return {
    type: "web-style",
    name: name,
    styleName: "EsriRealisticSignsandSignalsStyle"
  };
}

function utilPtSymbolIcons(name) {
return {
type: "web-style",
name: name,
styleName: "EsriIconsStyle"
};
}

function utilPtSymbolSafety(name) {
return {
  type: "web-style",
  name: name,
  styleName: "EsriRealisticSignsandSignalsStyle"
}
}

function utilPtSymbolOthers(name) {
return {
type: "web-style",
  name: name,
  styleName: "EsriThematicTreesStyle"
}
}


/* custom 3D Web Style for Utility Pole */
// Choice: 3D_Electric_Pole, 3D_Drain_Box, 3D_Water_Valve, 3D_Telecom_BTS, 3D_TelecomCATV_Pole
function customSymbol3D(name) {
return {
type: "web-style",
styleUrl: "https://www.maps.arcgis.com/sharing/rest/content/items/c04d4d4145f64f8fa38407dd5331dd1f/data", //https://www.maps.arcgis.com/sharing/rest/content/items/7cc86329dd2e46229c52d292e660957b/data
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
        color: "grey",
        size: 0.4,
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
        color: [128,128,128,0.1], //"grey",
        size: 0.1,
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
var BoundaryFillSymbol = {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: "red",
style: "solid",
outline: {  // autocasts as new SimpleLineSymbol()
color: [220,220,220, 1],
width: 2
}
};

// Construction boundary
let ConstructionBoundaryFill = {
          type: "unique-value",
          valueExpression: "When($feature.MappingBoundary == 1, 'Boundary',$feature.MappingBoundary)",
          uniqueValueInfos: [
              {
                  value: "Boundary",
                  symbol: {
                      type: "simple-fill",
                      color: [0, 0, 0,0],
                      outline: {
                          width: 2.5,
                          color: [220,220,220],
                          style: "short-dash"
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
size: 2,
color: [220,20,60,0.2],
outline: {
  width: 0.2,
  color: "black"
}
}
};

// Station Box
let poSectionBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "U-Shape Retaining Wall",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "Cut & Cover Box",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "TBM Shaft",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "TBM",
symbol: {
  type: "simple-fill",
  color: [178, 178, 178],
  style: "backward-diagonal",
  outline: {
    width: 0.5,
    color: "black"
  }
}
},
{
value: "Station Platform",
symbol: {
  type: "simple-fill",
  color: [240, 204, 230],
  style: "backward-diagonal",
  outline: {
    width: 0.4,
    color: "black"
  }
}
},
{
value: "Station Box",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0],
  outline: {
    width: 2,
    color: "red"
  }
}
}
]
};

// Statin Renderer
var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Name",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };



// Utility Point
/* 3D Web Style */
var utilTypePtRenderer = {
    type: "unique-value", //"unique-value", "simple"
    Field: "UtilType2",
    //valueExpression: "When($feature.UtilType == 1, 'Telecom', $feature.UtilType == 2, 'Water',$feature.UtilType == 3, 'Power', $feature.UtilType)",
    valueExpression: "When($feature.UtilType2 == 1, 'Telecom Pole (BTS)', \
                           $feature.UtilType2 == 2, 'Telecom Pole (CATV)', \
                           $feature.UtilType2 == 3, 'Telecom Pole', \
                           $feature.UtilType2 == 4, 'Sluice Gate', \
                           $feature.UtilType2 == 5, 'Air Valve', \
                           $feature.UtilType2 == 6, 'District Meter', \
                           $feature.UtilType2 == 7, 'Water Meter', \
                           $feature.UtilType2 == 8, 'Gate Valve', \
                           $feature.UtilType2 == 9, 'Valve', \
                           $feature.UtilType2 == 10, 'STC', \
                           $feature.UtilType2 == 11, 'Drain Box', \
                           $feature.UtilType2 == 12, 'Manhole', \
                           $feature.UtilType2 == 13, 'Electric Pole', \
                           $feature.UtilType2 == 14, 'Street Light', \
                           $feature.UtilType2 == 15, 'Traffic Light', \
                           $feature.UtilType2 == 16, 'Road Safety Signs', \
                           $feature.UtilType2 == 17, 'Junction Box', \
                           $feature.UtilType2 == 18, 'Pedestal', \
                           $feature.UtilType2 == 19, 'Transvault', \
                           $feature.UtilType2 == 20, 'Fire Hydrant', \
                           $feature.UtilType2 == 21, 'Handhole', $feature.UtilType)",
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
        value: "Telecom Pole",
        symbol: customSymbol3D("3D_TelecomCATV_Pole")
      },
      {
        value: "Sluice Gate", // update later
        symbol: utilPtSymbolStreet("Jersey_Barrier")
      },
      {
        value: "Air Valve", // update later
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "District Meter", // update later
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Water Meter", // update later
        symbol: customSymbol3D("3D_Water_Meter")
      },
      {
        value: "Gate Valve", // update later
        symbol: customSymbol3D("3D_Water_Valve")
      },
      {
        value: "Valve", // update later
        symbol: customSymbol3D("3D_Water_Valve")
      },
      {
        value: "STC", // update later
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Drain Box", // update later
        symbol: customSymbol3D("3D_Drain_Box")
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
        value: "Traffic Light",
        symbol: utilPtSymbolSignal("Traffic_Light_4")
      },
      {
          value: "Road Safety Signs",
          symbol: utilPtSymbolSafety("Pedestrian_Crossing")
      },
      {
        value: "Junction Box",
        symbol: customSymbol3D("3D_Drain_Box")
      },
      {
        value: "Pedestal",
        symbol: utilPtSymbolOthers("Sansevieria")
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
        //valueExpression: "($feature.Status * $feature.LAYER) / 2",
        // When utility point to be demolished is completed, the point SIZE becomes 0 else 1.
        valueExpression: "When($feature.Status == 1 && $feature.LAYER == 1, 0, 1)",
        field: "SIZE",
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
        valueExpression: "($feature.Status * $feature.LAYER) / 2",
        //field: "SIZE",
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

/// Symbol for Utility Relocated feature layer
var utilReloSymbolRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    // Note that 'Retained' status is always 'Complete'
    valueExpression: "When($feature.Checks == 1, 'NeedCheck',\
                           $feature.Status == 1 && $feature.LAYER == 1, 'DemolishComplete',\
                           $feature.Status == 0 && $feature.LAYER == 1, 'DemolishIncomplete',\
                           $feature.Status == 0 && $feature.LAYER == 2, 'RelocIncomplete', \
                           $feature.Status == 1 && $feature.LAYER == 2, 'RelocComplete', \
                           $feature.Status == 0 && $feature.LAYER == 3, 'NewlyAdded', \
                           $feature.Status == 1 && $feature.LAYER == 3, 'NewlyAddedComplete', \
                           $feature.Status == 1 && $feature.LAYER == 4, 'Retained', \
                           $feature.Status == 0 && $feature.LAYER == 5, 'Replaced', \
                           $feature.Status == 1 && $feature.LAYER == 5, 'ReplaceComplete', \
                           $feature.Status == 0 && $feature.LAYER == 6, 'TemporaryDivertIncomplete', \
                           $feature.Status == 1 && $feature.LAYER == 6, 'TemporaryDivertComplete', \
                           $feature.Status == 0 && $feature.LAYER == 7, 'ReturnedIncomplete', \
                           $feature.Status == 1 && $feature.LAYER == 7, 'ReturnedComplete', \
                           $feature.Comp_Agency)",
    //field: "Company",
    uniqueValueInfos: [
    {
        value: "NeedCheck",
        label: "Need to Check",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Unknown_v2.png",
          "#D13470",
          20,
          "Relocation"
        )
      },
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
        label: "Newly Utility Added",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/NewlyAdded_Completed.png",
          "#D13470",
          35,
          "Relocation"
          )
      },
      {
        value: "Replaced",
        label: "To be Replaced",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/UL_Replace_icomplete_symbol.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "ReplaceComplete",
        label: "Replacement Complete",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/UL_Replace_complete.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "Retained",
        label: "Retained",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/UL_Retained.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "TemporaryDivertIncomplete",
        label: "To be Temporary Diverted",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Temp_Diversion_Incomplete_Logo.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "TemporaryDivertComplete",
        label: "Temporary Diversion Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Temp_Diversion_Complete_Logo.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "ReturnedIncomplete",
        label: "To be Returned",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Returned_Incomplete_Logo.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "ReturnedComplete",
        label: "Returned Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Returned_Complete_Logo.png",
          "#D13470",
          30,
          "Relocation"
        )
      },
      {
        value: "NoAction",
        label: "Require Data Checking",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Unknown_v2.png",
          "#D13470",
          30,
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
2: [112,128,144, 0.5], // Internet Cable TV Line
3: [230, 0, 169, 0.5], // Duct Bank
4: [0, 128, 255, 0.5], // Water Distribution Pipe
5: [0, 197, 255, 0.5], // Main Line
6: [0, 197, 254, 0.5], // Sub-Main Line
7: [205,133,63, 0.5], // Canal
8: [224, 224, 224, 0.5], // Sewer Pipeline
9: [224, 224, 223, 0.5], // Sewer Drainage
10: [139,69,19, 0.5], // Creek
11: [211,211,211, 0.5], // Elecric Line
12: [105,105,105, 0.5], // Storm Drainage
13: [105,105,104, 0.5], // Drainage
14: [197,0,255,0.5] // Gas line
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
// Boundary Box for UL CP104
let symbol = {
    type: "mesh-3d",  // autocasts as new MeshSymbol3D()
    symbolLayers: [{
      type: "fill",  // autocasts as new FillSymbol3DLayer()
      material: {
        color: [255, 0, 0, 0.3],
        colorMixMode: "replace"
      },
      edges: {
        type: "solid",
        color: [0, 0, 0, 0]
      }
    }]
  };

let boundaryBoxRenderer = {
type: "simple",
symbol: symbol
}

var boundaryBox = new SceneLayer({
portalItem: {
id: "e1946dabd195494e82f438221f5a2ecd",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
title: "Boundary Box for UL",
elevationInfo:{
mode: "relative-to-ground"
},
renderer: boundaryBoxRenderer
});
map.add(boundaryBox);

// Construction Boundary
var constBoundary = new FeatureLayer({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
outFields: ["*"],
renderer: ConstructionBoundaryFill,
definitionExpression: "MappingBoundary = 1",
title: "Construction Boundary",
elevationInfo: {
mode: "on-the-ground",
},
popupEnabled: false
});
//constBoundary.listMode = "hide";
map.add(constBoundary);

// Station Box
var poSectionBoxLayer = new FeatureLayer ({
portalItem: {
id: "b0cf28b499a54de7b085725bca08deee",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 8,
renderer: poSectionBoxRenderer,
title: "PO Section",
outFields: ["*"],
popupEnabled: false
});
map.add(poSectionBoxLayer);

// Station Layer:-------------------
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

// Utility Point
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-ground"
// If basemap elevatio layer is off, use "absolute-height"
/* 3D Web Style */

// FILTER OUT CP 104
var testUtilPt = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Relocation Plan (Point)",
outFields: ["*"],
labelsVisible: false,
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
       Label: "Type"
     },
     {
       fieldName: "UtilType2",
       Label: "Type2"
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
       fieldName: "Station1"
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
map.add(testUtilPt);
testUtilPt.visible = true;

/* Symbols with callout */
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-ground"
// If basemap elevatio layer is off, use "absolute-height"

var testUtilPt1 = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Utility Point - Status Symbol",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],
renderer: utilReloSymbolRenderer,
labelingInfo: [labelUtilPtSymbol],
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
       Label: "Type"
     },
     {
      fieldName: "UtilType2",
       Label: "Type2"
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
       fieldName: "Station1"
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
testUtilPt1.visible = true;


// Utility Line
var testLine = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
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
title: "<h5>{Comp_Agency}</h5>",
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
       Label: "Type"
     },
     {
       fieldName: "UtilType2",
       Label: "Type2"
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
       fieldName: "Station1"
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
      field: "UtilType2"
    });

    for (let property in colorsRelocation) { // For each utility type 2
      if (property == 1) { // If utility type2 === Telecom Line
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.2,0.2,"all", property)
        });

      } else if (property == 2) { // "Internet Cable Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.2,0.2,"all", property)
        });

      } else if (property == 3) { // "Duct Bank"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.2,0.2,"all", property)
        });

      } else if (property == 4) { // "Water Distributin Pipe"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5, "all", property)
        });

      } else if (property == 5) { // "Main Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5, "all", property)
        });

      } else if (property == 6) { // "Sub-Main Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5, "all", property)
        });

      } else if (property == 7) { // "Canal"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 2, 2,"all", property)
        });

      } else if (property == 8) { // "Sewer Pipeline"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 9) { // "Sewer Drainage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 10) { // "Creek"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5,"all", property)
        });

      } else if (property == 11) { // "Electric Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.2, 0.2,"all", property)
        });

      } else if (property == 12) { // "Storm Drainage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5,"all", property)
        });
      
      } else if (property == 13) { // "Drainage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5,"all", property)
        });

      } else if (property == 14) { // "Gas line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.5, 0.5,"all", property)
        });              

      } else {// end of 'property == '1'
        renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 0.5, 0.5,"all", property)

        });
      }
    }
    testLine.renderer = renderer;
  }
  rendertestLine();

/*Line for Symbols */
var testLine1 = new FeatureLayer({
portalItem: {
id: "ff7177760e1c43478c1ad6088c48cfa8",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
title: "Utility Line - Status Symbol",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],
renderer: utilReloSymbolRenderer,
labelingInfo: [testLineLabelClass],
popupTemplate: {
title: "<h5>{Comp_Agency}</h5>",
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
       Label: "Type"
     },
     {
       fieldName: "UtilType2",
       Label: "Type2"
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
       fieldName: "Station1"
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

// Station Structure
const colors = {
    1: [225, 225, 225, 0], // To be Constructed (white)
    2: [130, 130, 130, 0.3], // Under Construction
    3: [255, 0, 0, 0.6], // Delayed
    4: [0, 197, 255, 0.5], // Completed
  };

var structureLayer = new SceneLayer({ //structureLayer
    portalItem: {
      id: "09f1e6d86cf34567bebcd22afcad8b4b",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
    elevationInfo: {
mode: "relative-to-ground",
//offset: 0
},
title: "Station Structure",
    popupTemplate: {
title: "<h5>{Status}</h5>",
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

/////////////////////////////////////////////////////////////////////////////////////
//*******************************//
//      Progress Chart           //
//*******************************//
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

//
const totalProgressDiv = document.getElementById("totalProgressDiv");
// Start of am4core
am4core.ready(function() {
am4core.useTheme(am4themes_animated);

// Default label

// As default, chart shows the progress of all the relocated layers (point + line)

waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
drainageAllChart();
safetyAllChart();


// Thousand separators function
function thousands_separators(num)
{
var num_parts = num.toString().split(".");
num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return num_parts.join(".");
}

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
totalProgressDiv.innerHTML = totalperc.toFixed(0) + " %";
});
}

function totalProgressAll(){
totalProgressPt().then(totalProgressLine)
};
totalProgressAll();



/////////////////////////////////// new statoin button //////////////
// Return an array of unique values in the 'Brangay' field of the lot Layer
// 1. Query all features from the lot layer
var stationSelect = document.getElementById("valSelect");
var companySelect = document.getElementById("companySelect");
var typeSelect = document.getElementById("typeSelect");

view.when(function() {
return constBoundary.when(function() {
  var query = constBoundary.createQuery();
  return constBoundary.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

// Query geometry
function queryForLotGeometries() {
var lotQuery = testUtilPt.createQuery();

return testUtilPt.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});

}

// 2. Get values and Return to list
//Return an array of all the values in the 'Station1' field'
/// 2.1. CP
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.Station1;
});
return values;
}

// Return an array of unique values in the 'Municipality' field of the lot Layer
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
  }
});
return uniqueValues;
}

// Add stations to the station list as element
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  stationSelect.add(option);
});
}

// 2.2. Company
// Filter Company List when station list changes
function filterUtilPointLineCP(stationValue) {
var compArray = [];
var compArray1 = [];

// Query for Utility Point
function utilPointQuery() {
var query = testUtilPt.createQuery();
// CP: All, Type: All, Provider: All
if (stationValue === undefined || stationValue === 'None') {
query.where = "1=1";

// CP: !None, Type: All
} else if (stationValue !== 'None') {
query.where = "Station1 = '" + stationValue + "'";
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
if (stationValue === undefined || stationValue === 'None') {
query2.where = "1=1";

// CP: !None, Type: All
} else if (stationValue !== 'None') {
query2.where = "Station1 = '" + stationValue + "'";
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

// 2.3. Type (Point, Line)
function filterUtilPointLineType(stationValue, companyValue) {

var Array = [];
var Array1 = [];

// Query for Utility Point
function utilPointQuery3() {
var query = testUtilPt.createQuery();

// CP: undefined, Company: undefined
if (stationValue === undefined && companyValue === undefined) {
query.where = "1=1";

// CP: None, Company: !None
} else if (stationValue === 'None' && companyValue !== 'None') {
query.where = "Company = '" + companyValue + "'";

// CP: None, Company: None
} else if (stationValue === 'None' && companyValue === 'None') {
query.where = "1=1";

// CP: !None, Company: None
} else if (stationValue !== 'None' && companyValue === 'None') {
query.where = "Station1 = '" + stationValue + "'";

// CP: !None, Company: !None
} else if (stationValue !== 'None' && companyValue !== 'None') {
query.where = "Station1 = '" + stationValue + "'" + " AND " + "Company = '" + companyValue + "'";
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
if (stationValue === undefined && companyValue === undefined) {
query2.where = "1=1";

// CP: None, Company: !None
} else if (stationValue === 'None' && companyValue !== 'None') {
query2.where = "Company = '" + companyValue + "'";

// CP: None, Company: None
} else if (stationValue === 'None' && companyValue === 'None') {
query2.where = "1=1";

// CP: !None, Company: None
} else if (stationValue !== 'None' && companyValue === 'None') {
query2.where = "Station1 = '" + stationValue + "'";

// CP: !None, Company: !None
} else if (stationValue !== 'None' && companyValue !== 'None') {
query2.where = "Station1 = '" + stationValue + "'" + " AND " + "Company = '" + companyValue + "'";
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

///

//////////////////////////////////////////////////////////////////////
// Set the definition expression on the lot layer
// to reflect the selecction of the user
function setLotMunicipalOnlyExpression(newValue) {
if (newValue === 'None') {
  testUtilPt.definitionExpression = null;
  testUtilPt1.definitionExpression = null;
  testLine.definitionExpression = null;
  testLine1.definitionExpression = null;
  structureLayer.definitionExpression = null;

} else {
  testUtilPt.definitionExpression = "Station1 = '" + newValue + "'";
  testUtilPt1.definitionExpression = "Station1 = '" + newValue + "'";
  testLine.definitionExpression = "Station1 = '" + newValue + "'";
  testLine1.definitionExpression = "Station1 = '" + newValue + "'";
  structureLayer.definitionExpression = "Station1 = '" + newValue + "'";
}

if (newValue === 'Ortigas' || newValue === 'Shaw') {
  referenceOnlyDiv.innerHTML = "REFERENCE ONLY for CP104";
} else {
  referenceOnlyDiv.innerHTML = "";
}

//zoomToLayer(testUtilPt);

return queryForLotGeometries();
}


function setLotDefinitionExpression(newValue1, newValue2, newValue3){
// newValue: Station
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
testLine.definitionExpression = "Station1 = '" + newValue1 + "'";
testLine1.definitionExpression = "Station1 = '" + newValue1 + "'";
testUtilPt.definitionExpression = "Station1 = '" + newValue1 + "'";
testUtilPt1.definitionExpression = "Station1 = '" + newValue1 + "'"; 
//8
} else if(newValue1 !== 'None' && newValue2 == 'None' && newValue3 !== 'None'){
testLine.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
//9
} else if(newValue1 !== 'None' && newValue2 == 'Point' && newValue3 == 'None'){
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt.definitionExpression = "Station1 = '" + newValue1 + "'";
testUtilPt1.definitionExpression = "Station1 = '" + newValue1 + "'";
//10
} else if(newValue1 !== 'None' && newValue2 == 'Point' && newValue3 !== 'None'){
testLine.definitionExpression = "Type = '" + newValue2 + "'";
testLine1.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testUtilPt1.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
//11
} else if(newValue1 !== 'None' && newValue2 == 'Line' && newValue3 == 'None'){
testLine.definitionExpression = "Station1 = '" + newValue1 + "'";
testLine1.definitionExpression = "Station1 = '" + newValue1 + "'";
testUtilPt.definitionExpression = "Type = '" + newValue2 + "'";
testUtilPt1.definitionExpression = "Type = '" + newValue2 + "'";
//12
} else if(newValue1 !== 'None' && newValue2 == 'Line' && newValue3 !== 'None'){
testLine.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
testLine1.definitionExpression = "Station1 = '" + newValue1 + "'" + " AND " + "Company = '" + newValue3 + "'";
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

function queryForLotGeometries() {
var lotQuery = testUtilPt.createQuery();

return testUtilPt.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});
}

///////////////////
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

// When Station1 is changed, Type is reset to 'None'
const changeSelected = (e) => {
const $select = document.querySelector('#typeSelect');
$select.value = 'None'
};

// Dropdown List
// Select station from dropdown list
stationSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;
var companyValue = companySelect.value;

filterUtilPointLineCP(type);
filterUtilPointLineType(type, companyValue);

setLotMunicipalOnlyExpression(type);
changeSelected();

totalProgressAll();

waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
drainageAllChart();
safetyAllChart();

filterUtilPt();
filterUtilPt1();
filterUtilLine();
filterUtilLine1();
});


// Provider dropdown list
companySelect.addEventListener("change", function(event) {
const companyValue = event.target.value;

changeSelected();

var stationValue = stationSelect.value;
filterUtilPointLineType(stationValue, companyValue);

setLotDefinitionExpression(stationSelect.value, typeSelect.value, companySelect.value);

// If a provider selected does not have both point or line,
const typeS = typeSelect.value;
if (typeS === 'Point') {
chartPointWater();
chartPointPower();
chartPointSewage();
chartPointTelecom();
chartPointOilGas();
chartPointDrainage();
chartPointSafety();

} else if (typeS === 'Line') {
chartLineWater();
chartLinePower();
chartLineSewage();
chartLineTelecom();
chartLineOilGas();
chartLineDrainage();
chartLineSafety();

} else if (typeS === 'None') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
drainageAllChart();
safetyAllChart();

// When a comapny is first selected over CP,
} else if (typeS === '') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
drainageAllChart();
safetyAllChart();
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

setLotDefinitionExpression(stationSelect.value, typeS, companySelect.value);

if (typeS === 'Point') {
chartPointWater();
chartPointPower();
chartPointSewage();
chartPointTelecom();
chartPointOilGas();
chartPointDrainage();
chartPointSafety();

} else if (typeS === 'Line') {
chartLineWater();
chartLinePower();
chartLineSewage();
chartLineTelecom();
chartLineOilGas();
chartLineDrainage();
chartLineSafety();

} else if (typeS === 'None') {
waterAllChart();
powerAllChart();
sewageAllChart();
telecomAllChart();
oilGasAllChart();
drainageAllChart();
safetyAllChart();
}

totalProgressAll();

filterUtilPt();
filterUtilPt1();
filterUtilLine();
filterUtilLine1();    
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

// 4. Drainage
function chartPointDrainage() {
var total_drainage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_incomp",
statisticType: "sum"
};

var total_drainage_comp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_drainage_incomp, total_drainage_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const drainage_incomp = stats.total_drainage_incomp;
  const drainage_comp = stats.total_drainage_comp;

  var chart = am4core.create("chartDrainageDiv", am4charts.XYChart);
  
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
          category: "Drainage",
          value1: drainage_comp,
          value2: drainage_incomp
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
        if (drainage_comp === 0) {
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
              selectedLayer = 6;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 6;
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
} // end of updateChartDrainage


// 1.2. Line
function chartLineDrainage() {

var total_drainage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_incomp",
statisticType: "sum"
};

var total_drainage_comp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_drainage_incomp, total_drainage_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const drainage_incomp = stats.total_drainage_incomp;
  const drainage_comp = stats.total_drainage_comp;

  var chart = am4core.create("chartDrainageDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Drainage",
          value1: drainage_comp,
          value2: drainage_incomp
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
        if (drainage_comp === 0) {
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
              selectedLayer = 6;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 6;
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
} // end of updateChartDrainage

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointDrainageForCompile() {
var total_drainage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_incomp",
statisticType: "sum"
};

var total_drainage_comp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_drainage_incomp, total_drainage_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const drainage_incomp = stats.total_drainage_incomp;
  const drainage_comp = stats.total_drainage_comp;
  const drainagePointValues = [drainage_incomp, drainage_comp];

return drainagePointValues;
}); // end of queryFeatures
} // end of updateChartDrainage

/// 1.3.2. Line for compiled
function chartLineDrainageForCompile(drainagePointValues) {
var total_drainage_incomp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_incomp",
statisticType: "sum"
};

var total_drainage_comp = {
onStatisticField: "CASE WHEN (UtilType = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_drainage_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_drainage_incomp, total_drainage_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const drainage_incomp = stats.total_drainage_incomp;
  const drainage_comp = stats.total_drainage_comp;

  const drainageIncompTotal = drainage_incomp + drainagePointValues[0];
  const drainageCompTotal = drainage_comp + drainagePointValues[1];
  const drainageTotalValues = [drainageIncompTotal, drainageCompTotal];

return drainageTotalValues;
}); // end of queryFeatures
} // end of updateChartDrainage

/// 1.3.3. Point + Line
//
function drainageCompiledChart(drainageTotalValues) {
var chart = am4core.create("chartDrainageDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = drainageTotalValues;

chart.data = [
{
category: "Drainage",
value1: drainageTotalValues[1],
value2: drainageTotalValues[0]
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
if (drainageTotalValues[1] === 0) {
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
if (selectedP == "Drainage" && selectedC === "Incomplete") {
  selectedLayer = 6;
  selectedStatus = 0;
} else if (selectedP == "Drainage" && selectedC === "Complete") {
  selectedLayer = 6;
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

async function drainageAllChart() {
chartPointDrainageForCompile()
.then(chartLineDrainageForCompile)
.then(drainageCompiledChart);
}


// 5. Safety
function chartPointSafety() {
var total_safety_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_incomp",
statisticType: "sum"
};

var total_safety_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_safety_incomp, total_safety_comp];
query.returnGeometry = true;

testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const safety_incomp = stats.total_safety_incomp;
  const safety_comp = stats.total_safety_comp;

  var chart = am4core.create("chartSafetyDiv", am4charts.XYChart);
  
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
          category: "Safety",
          value1: safety_comp,
          value2: safety_incomp
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
        if (safety_comp === 0) {
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
} // end of updateChartSafety


// 1.2. Line
function chartLineSafety() {

var total_safety_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_incomp",
statisticType: "sum"
};

var total_safety_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_safety_incomp, total_safety_comp];
query.returnGeometry = true;

testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const safety_incomp = stats.total_safety_incomp;
  const safety_comp = stats.total_safety_comp;

  var chart = am4core.create("chartSafetyDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0;

  chart.data = [
      {
          category: "Safety",
          value1: safety_comp,
          value2: safety_incomp
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
        if (safety_comp === 0) {
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
} // end of updateChartSafety

// 1.3. Point + Line
/// 1.3.1. Point for compiled


function chartPointSafetyForCompile() {
var total_safety_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_incomp",
statisticType: "sum"
};

var total_safety_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_comp",
statisticType: "sum"  
};

// Query
var query = testUtilPt.createQuery();
query.outStatistics = [total_safety_incomp, total_safety_comp];
query.returnGeometry = true;

return testUtilPt.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const safety_incomp = stats.total_safety_incomp;
  const safety_comp = stats.total_safety_comp;
  const safetyPointValues = [safety_incomp, safety_comp];

return safetyPointValues;
}); // end of queryFeatures
} // end of updateChartSafety

/// 1.3.2. Line for compiled
function chartLineSafetyForCompile(safetyPointValues) {
var total_safety_incomp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_incomp",
statisticType: "sum"
};

var total_safety_comp = {
onStatisticField: "CASE WHEN (UtilType = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_safety_comp",
statisticType: "sum"  
};

// Query
var query = testLine.createQuery();
query.outStatistics = [total_safety_incomp, total_safety_comp];
query.returnGeometry = true;

return testLine.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  const safety_incomp = stats.total_safety_incomp;
  const safety_comp = stats.total_safety_comp;

  const safetyIncompTotal = safety_incomp + safetyPointValues[0];
  const safetyCompTotal = safety_comp + safetyPointValues[1];
  const safetyTotalValues = [safetyIncompTotal, safetyCompTotal];

return safetyTotalValues;
}); // end of queryFeatures
} // end of updateChartSafety

/// 1.3.3. Point + Line
//
function safetyCompiledChart(safetyTotalValues) {
var chart = am4core.create("chartSafetyDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0;

//headerTitleDiv.innerHTML = safetyTotalValues;

chart.data = [
{
category: "Safety",
value1: safetyTotalValues[1],
value2: safetyTotalValues[0]
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
if (safetyTotalValues[1] === 0) {
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
if (selectedP == "Safety" && selectedC === "Incomplete") {
  selectedLayer = 5;
  selectedStatus = 0;
} else if (selectedP == "Safety" && selectedC === "Complete") {
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

async function safetyAllChart() {
chartPointSafetyForCompile()
.then(chartLineSafetyForCompile)
.then(safetyCompiledChart);
}



//6. Gas
// 1.1. Point
function chartPointOilGas() {
var total_oilgas_incomp = {
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 1) THEN 1 ELSE 0 END",
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
              selectedLayer = 7;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 7;
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
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 1) THEN 1 ELSE 0 END",
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
              selectedLayer = 7;
              selectedStatus = 0;
          } else if (selectedC === "Complete") {
              selectedLayer = 7;
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
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 1) THEN 1 ELSE 0 END",
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
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 0) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_oilgas_incomp",
statisticType: "sum"
};

var total_oilgas_comp = {
onStatisticField: "CASE WHEN (UtilType = 7 and Status = 1) THEN 1 ELSE 0 END",
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
  selectedLayer = 7;
  selectedStatus = 0;
} else if (selectedP == "OilGas" && selectedC === "Complete") {
  selectedLayer = 7;
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

view.whenLayerView(testUtilPt1).then(function(layerView) {
testUtilPt1.queryFeatures().then(function(results) {
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

//



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

view.whenLayerView(testLine1).then(function(layerView) {
  testLine1.queryFeatures().then(function(results) {
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

// Layer List
var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Chainage" ||
            item.title === "Utility Point - Status Symbol" ||
            item.title === "Utility Line - Status Symbol" ||
            item.title === "ROW" ||
            item.title === "Boundary Box for UL" ||
            item.title === "Station Structure" ||
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
layer: poSectionBoxLayer,
title: "Station Box"
},
{
layer: boundaryBox,
title: "UL - Reference Boundary Box"
}
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

//view.ui.padding = { top: 100, left: 0, right: 0, bottom: 0 };
});