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
    "esri/Camera",
    "esri/core/Accessor",
    "esri/geometry/Polyline",
    "esri/views/3d/externalRenderers",
    "esri/geometry/SpatialReference",
    "esri/rest/route",
    "esri/rest/support/RouteParameters",
    "esri/rest/support/FeatureSet",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/geometry/geometryEngine",
    "esri/core/urlUtils",
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
              SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer, Point, Camera,
              Accessor, Polyline, externalRenderers, SpatialReference, route,
              RouteParameters, FeatureSet, GraphicsLayer, Graphic,
              SimpleMarkerSymbol, SimpleLineSymbol, Color, geometryEngine,
              urlUtils,
              on,
              query) {
  
  
  ////////////////////////////////////////////////////
// The stops and route result will be stored in this layer

const webscene = new WebScene({
  portalItem: {
    id: "2ca15415294c47d397cc458b2cb86f43"
  }
});

//webscene.ground.surfaceColor = "#FFFF";
//webscene.ground.opacity = 0.5;

const view = new SceneView({
  container: "viewDiv",
  viewingMode: "local",
  map: webscene
});
// https://developers.arcgis.com/javascript/latest/sample-code/highlight-point-features/?search=FeatureLayerView


var n03BIM = null;
var allStationsBIM = null;

view.when(function() {
    // get the BuildingSceneLayer from the webscene
    webscene.allLayers.forEach(function(layer) {
      if (layer.title === "Clark Station") {
        n03BIM = layer;
        // This only allows buildingExplorer widget for the specific buildingSceneLayer
        // explore components in the layer using the BuildingExplorer widget
        const buildingExplorer = new BuildingExplorer({
          view: view,
          layers: [layer],
        });
        view.ui.add(buildingExplorer, "top-right");

      } else if (layer.title === "N2 Station Structures") {
        allStationsBIM = layer;

        const buildingExplorer2 = new BuildingExplorer({
          view: view,
          layers: [layer],
        });
        view.ui.add(buildingExplorer2, "top-right");

      }
    });
    
  });





// Summary Statistics: Architectural and Structural
// 1. Architectural


// 2. Structural
  
// Widget: LayerList, See-through, and FullScreen
    // See-through-Ground        
    view.when(function() {
      // allow navigation above and below the ground
      webscene.ground.navigationConstraint = {
        type: "none"
      };
      // the webscene has no basemap, so set a surfaceColor on the ground
      webscene.ground.surfaceColor = "#fff";
      // to see through the ground, set the ground opacity to 0.4
      webscene.ground.opacity = 0.9; //
    });
  
  // See through Gound
  document
  .getElementById("opacityInput")
  .addEventListener("change", function(event) {
    //webscene.ground.opacity = event.target.checked ? 0.1 : 0.9;
    webscene.ground.opacity = event.target.checked ? 0 : 1;
  });
  
  view.ui.add("menu", "bottom-left");
  
  
  ///////////////////////////////////////////////////////
  var layerList = new LayerList({
        view: view,
        selectionEnabled: true,
        /*
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.title === "OpenStreetMap 3D Buildings" ||
              item.title === "Viaduct"){
            item.visible = false
          }
        }
        */
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