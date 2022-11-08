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
    "esri/geometry/Point",
    "esri/Camera"
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
              SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer, Point, Camera) {
  
  
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
    basemap: "satellite", // basemap, // "streets-night-vector", 
    ground: "world-elevation"
}); 

var view = new SceneView({
    map: map,
    container: "viewDiv",
    viewingMode: "local",
    camera: {
        position: {
            x: 120.582465,
            y: 15.1702704,
            z: 500
        },
        tilt: 40
    },
    qualityProfile: "low",
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

// Viaduct
const colors = {
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
    id: "01ce59e532d148bfa74f50301ea8124a"
  },
  elevationInfo: {
    mode: "absolute-height" //absolute-height, relative-to-ground
  },
  title: "Viaduct",
  outFields: ["*"],   
});
map.add(viaductLayer);
  
function renderViaductLayer() {
  // Obtain unique values from Status1
  const renderer = new UniqueValueRenderer({
  field: "Status1"
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
   
// Label Class
// Station labels
var labelClass = new LabelClass({
    symbol: {
        type: "label-3d",// autocasts as new LabelSymbol3D()
        symbolLayers: [
          {
            type: "text", // autocasts as new TextSymbol3DLayer()
            material: {
              color: [255, 170, 0]
            },
            size: 20,
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
        expression: "$feature.Station"
        //value: "{TEXTSTRING}"
    }
});
  
// Station Symbol
function stationsSymbol(name) {
    return {
        type: "web-style", // autocasts as new WebStyleSymbol()
        name: name,
        styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
}
  
// Station Renderer
var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Station",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
};
    
// Station Layer
var stationLayer = new SceneLayer({
    portalItem: {
        id: "212904618a1f44c1a78e2446d905e679"
    },
    labelingInfo: [labelClass],
    renderer: stationsRenderer,
    elevationInfo: {
        // this elevation mode will place points on top of
        // buildings or other SceneLayer 3D objects
        mode: "relative-to-ground"
    },
    definitionExpression: "Extension = 'N2'"
          //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
    });
    stationLayer.listMode = "hide";
    map.add(stationLayer, 0);
  
  // Station structures
  const buildingLayer = new BuildingSceneLayer({
    portalItem: {
        id: "b617bbe93201443bae67fc562a73f063",
    },
    outFields: ["*"],
    title: "N2 Station Structures"
});
map.add(buildingLayer);
  
view.ui.empty("top-left");
  
const buildingExplorer = new BuildingExplorer({
    view: view,
    layers: [buildingLayer]
});
view.ui.add(buildingExplorer, "bottom-right");
  
// only display the building levels filter
buildingExplorer.visibleElements = {
    phases: false,
    disciplines: false
};

// Main Title
const headerTitleDiv = document.getElementById("headerTitleDiv");
  
// Layer Definition:
/// Discipline: Architectural
var caseworkLayer = null;
var ceilingsLayer = null;
var curtainWallMullionsLayer = null;
var curtainWallPanelsLayer = null;
var doorsLayer = null;
var entourageLayer = null;
var floorsLayer = null;
var furnitureLayer = null;
var furnitureSystemLayer = null;
var genericModelLayer = null;
var parkingLayer = null;
var plumbingFixturesLayer = null;
var roofsLayer = null;
var roomsLayer = null;
var siteLayer = null;
var specialityEquipmentLayer = null;
var stairsLayer = null;
var wallsLayer = null;
var windowsLayer = null;
  
/// Discipline: Structural
var stFramingLayer = null;
var stColumnLayer = null;
var stFoundationLayer = null;
  
buildingLayer.when(() => {
    buildingLayer.allSublayers.forEach((layer) => {
        // modelName is standard accross all BuildingSceneLayer,
        // use it to identify a certain layer
        switch (layer.modelName) {
            // Because of performance reasons, the Full Model view is
            // by default set to false. In this scene the Full Model should be visible.
            case "FullModel":
                layer.visible = true;
                break;
              
            case "Architectural":
              layer.visible = true;
              break;

            case "Structural":
              layer.visible = false;
              break;

            case "Casework":
                caseworkLayer = layer;
                break;
            
            case "Ceilings":
                ceilingsLayer = layer;
                break;

            case "CurtainWallMullions":
                curtainWallMullionsLayer = layer;
                break;

            case "CurtainWallPanels":
                curtainWallPanelsLayer = layer;
                break;

            case "Doors":
                doorsLayer = layer;
                break;

            case "Entourage":
                entourageLayer = layer;
                break;

            case "Floors":
                floorsLayer = layer;
                break;

            case "Furniture":
                furnitureLayer = layer;
                break;

            case "FurnitureSystem":
                furnitureSystemLayer = layer;
                break;

            case "GenericModel":
                genericModelLayer = layer;
                genericModelLayer.visible = false;
                break;

            case "Parking":
                parkingLayer = layer;
                break;

            case "PlumbingFixtures":
                plumbingFixturesLayer = layer;
                break;

            case "Roofs":
                roofsLayer = layer;
                break;

            case "Rooms":
                roomsLayer = layer;
                break;

            case "Site":
                siteLayer = layer;
                break;

            case "SpecialityEquipment":
                specialityEquipmentLayer = layer;
                break;

            case "Stairs":
                stairsLayer = layer;
                break;

            case "Walls":
                wallsLayer = layer;
                break;

            case "Windows":
                windowsLayer = layer;
                break;
          
            case "StructuralFraming":
                stFramingLayer = layer;
                break;
    
            case "StructuralColumns":
                stColumnLayer = layer;
                break;
    
            case "StructuralFoundation":
                stFoundationLayer = layer;
                break;
      
            default:
                layer.visible = true;
        }
    });
});
  
 
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
  
  
// Rotate Tool
let abort = false;
let center = null;
function rotate() {
    if (!view.interacting && !abort) {
        play.style.display = "none";
        pause.style.display = "block";
      
        center = center || view.center;
      
        view.goTo({
            heading: view.camera.heading + 0.2,
            center
        }, {animate: false});
        
        requestAnimationFrame(rotate);
    } else {
        abort = false;
        center = null;
        play.style.display = "block";
        pause.style.display = "none";
    }
} // end
  
play.onclick = rotate;
pause.onclick = function() {
    abort = true;
};

  
  //////////////////////////////////////////////////////////////////////////////////////
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
  
  // See through Gound
  document
  .getElementById("opacityInput")
  .addEventListener("change", function(event) {
    //map.ground.opacity = event.target.checked ? 0.1 : 0.9;
    map.ground.opacity = event.target.checked ? 0.1 : 0.6;
  });
  
  view.ui.add("menu", "bottom-right");
  
  
  ///////////////////////////////////////////////////////
  var layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.title === "OpenStreetMap 3D Buildings" ||
              item.title === "Viaduct"){
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
  
  // Full screen logo
  view.ui.add(
    new Fullscreen({
    view: view,
    element: viewDiv
  }),
  "top-right"
  );
  });