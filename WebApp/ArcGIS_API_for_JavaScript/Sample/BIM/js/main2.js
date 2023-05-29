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
        //view.ui.add(buildingExplorer, "top-right");

        const buildingExplorerExpand = new Expand({
          view,
          content: buildingExplorer,
          expandIconClass: "esri-icon-expand",
          group: "top-right",
        });
        view.ui.add(buildingExplorerExpand,{
          position: "top-right"
        })

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
  



  ////////////// Animation begings
var routeLyr = new GraphicsLayer();

// Setup the route parameters
var routeParams = new RouteParameters({
stops: new FeatureSet(),
outSpatialReference: { // autocasts as new SpatialReference()
  wkid: 3857
}
});
  
// Define the symbology used to display the stops
var stopSymbol = new SimpleMarkerSymbol({
style: "cross",
ize: 0, // 15
outline: { // autocasts as new SimpleLineSymbol()
  width: 0 // 4
}
});
  
// Define the symbology used to display the route
var routeSymbol = new SimpleLineSymbol({
color: [0, 0, 255, 0], // [0, 0, 255, 0.5]
width: 5
});



  // Add animation
  /*
view.on("click", function() {
  addStop();
  animation.play();
  });
  */
  
  function addStop(event) {
  var stop1 = new Graphic({
    geometry: new Point(
      {x: polylinePoints[0][0], 
       y: polylinePoints[0][1],
       z: polylinePoints[0][2],
       spatialReference: SpatialReference.WebMercator}),
  symbol: stopSymbol
  });
  routeLyr.add(stop1);
  
  const lengthAnimeLine = polylinePoints.length;
  var stop2 = new Graphic({
    geometry: new Point(
      {x: polylinePoints[lengthAnimeLine - 1][0],
       y: polylinePoints[lengthAnimeLine - 1][1],
       z: polylinePoints[lengthAnimeLine - 1][2],
       spatialReference: SpatialReference.WebMercator }),
  symbol: stopSymbol
  });
  routeLyr.add(stop2);
  
  routeParams.stops.features.push(stop1);
  routeParams.stops.features.push(stop2);
  
  // Execute the route task if 2 or more stops are input
  //routeParams.stops.features.push(stop);
  if (routeParams.stops.features.length >= 2) {
      //routeTask.solve(routeParams).then(showRoute);
      showRoute();
  }
  }
  
  // Adds the solved route to the map as a graphic
  function showRoute(data) {
  
  //var routeResult = data.routeResults[0].route;
  
  var polyline = new Polyline(polylinePoints);
  polyline.spatialReference = SpatialReference.WebMercator;
  
  var routeResult = new Graphic({
      geometry: polyline,
      symbol: routeSymbol
  });
  routeResult.symbol = routeSymbol;
  
  routeLyr.add(routeResult);
  
  // the speed of the object becomes low with maximum segment of length
  var pl = geometryEngine.densify(routeResult.geometry, 0.3, "meters");
  // register the external renderer
  const myExternalRenderer = new skeletonRenderer(view, pl);
  externalRenderers.add(view, myExternalRenderer);
  
  }
  // Disable lighting based on the current camera position.
  // We want to display the lighting according to the current time of day.
  //view.environment.lighting.cameraTrackingEnabled = false;
  
  // Create our custom external renderer
  //////////////////////////////////////////////////////////////////////////////////////
  //https://github.nicogis.it/externalRendererSkeleton/
  var skeletonRenderer = Accessor.createSubclass({ // if '|| {}' is not added beside null,
  // you will receive the following error 'Cannot destructure property of xx of 'null' as it is null'
  view: null,
  //pl: null,
  renderer: null,     // three.js renderer
  camera: null,       // three.js camera
  scene: null,        // three.js scene
  vertexIdx: 0,
  ambient: null,      // three.js ambient light source
  sun: null,          // three.js sun light source
  mixer: null,
  mixer2: null,
  clock: null,
  clips: null,
  animate: null,
  light: null,
  iss: null, 
  iss2: null,                                                   // ISS model
  issScale: 2,                                     // scale for the iss model
  path: null,
  count: null,
  up: null,
  timeDelta: null,
  markerMaterial: null,    // material for the markers left by the ISS
  markerGeometry: null,    // geometry for the markers left by the ISS
  //issMaterial: new THREE.MeshLambertMaterial({ color: 0x2194ce, transparent: true, opacity: 0.1 }), 
  
  cameraPositionInitialized: false, // we focus the view on the ISS once we receive our first data point
  positionHistory: [],
  
  constructor: function (view, pl) {
    this.view = view;
      this.path = pl.paths[0]; //pl.paths[0];
  },
  /**
   * Setup function, called once by the ArcGIS JS API.
   */
  setup: function (context) {
  
      // initialize the three.js renderer
      /////////////////////////////////////////////////////////////////////////////////////
      this.renderer = new THREE.WebGLRenderer({
          context: context.gl,
          premultipliedAlpha: false
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);
      this.renderer.setViewport(0, 0, view.width, view.height);
  
      // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
      this.renderer.autoClearDepth = false;
      this.renderer.autoClearStencil = false;
      this.renderer.autoClearColor = false;
  
      // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
      // We have to inject this bit of code into the three.js runtime in order for it to bind those
      // buffers instead of the default ones.
      var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
      this.renderer.setRenderTarget = function (target) {
          originalSetRenderTarget(target);
          if (target == null) {
              context.bindRenderTarget();
          }
      }
  
      // setup the three.js scene
      //////////////////////////////////////////////////////////////////////////////////////         
      this.scene = new THREE.Scene();
  
      // setup the camera
      this.camera = new THREE.PerspectiveCamera();
  
      // setup scene lighting
      this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(this.ambient);
  
      this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      this.hemiLight.position.set( 0, 300, 0 );
      this.scene.add( this.hemiLight );
  
      this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
      this.scene.add(this.sun);
  
    // setup markers
      this.markerGeometry = new THREE.SphereBufferGeometry(12*1000, 16, 16);
      this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe03110, transparent: true, opacity: 0.5});
  
      this.clock = new THREE.Clock();
  
      var issMeshUrl = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Locomotive.glb"; 
      var loaderGLTF = new THREE.GLTFLoader(); // check this: https://qgenhate.hatenablog.com/ [object not an instance of THREE.Object3D]
      let example = new THREE.Object3D();
  
      loaderGLTF.load(issMeshUrl,
      function(gltf) {
          console.log("ISS mesh loaded.");
         
          example = gltf.scene;
          this.iss = example;
          
          // apply ISS material to all nodes in the geometry
          //this.iss.traverse( function ( child ) {
          //  if ( child instanceof THREE.Mesh ) {
          //    child.material = this.issMaterial;
          //  }
          //}.bind(this));
         
          // set the specified scale for the model
          this.iss.scale.set(this.issScale, this.issScale, this.issScale);
          
          // add the model
          this.scene.add(this.iss); // original: this.iss
          console.log("ISS mesh added.");
  
          // Mixer for animation
          this.mixer = new THREE.AnimationMixer(this.iss);
          this.mixer.clipAction(gltf.animations[0]).play();
  
      }.bind(this), undefined, function(error) {
          console.error("Error loading ISS mesh. ", error);
      });
  
      this.light = new THREE.DirectionalLight(0xffffff, 1);
      this.light.position.set(0, 1, 0);
      this.scene.add(this.light);
    
    // rotation 
        this.up = new THREE.Vector3(0, 0, 1); // used with lookAt: look at the next point at x-axis
        this.axis = new THREE.Vector3();
        this.n  = new THREE.Vector3( ); // normal,
        this.b  = new THREE.Vector3( ); // binormal
        this.M3 = new THREE.Matrix3( );
        this.M4 = new THREE.Matrix4( );
        this.pp = new THREE.Vector3( );
        this.quaternion = new THREE.Quaternion();
  
      // cleanup after ourselfs
      context.resetWebGLState();
  },
  render: function (context) {
  
      // update camera parameters
      ///////////////////////////////////////////////////////////////////////////////////
      var cam = context.camera;
  
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
  
      // Projection matrix can be copied directly
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
    
      if (this.iss) {
               
          // Add this.mixer.update first; otherwise, the object will not be animated.s
          if (this.mixer) {
              var scale = 0.0001; //this.gui.getTimeScale();
              var delta = this.clock.getDelta();
  
            this.mixer.update(delta);         
          }
  
              if (this.path.length == (this.vertexIdx + 1))
          {
              this.vertexIdx = 0;
          }
        
          var p = this.path[this.vertexIdx]; // vertexIdx = 0
        var p1 = this.path[this.vertexIdx + 1];
        
      
        // Define Z:
        // It is important that the same Z values are set for both current (pt) and next points (pt1)
        // Otherwise, the object will be tilted.
        const changeZ = 0;
        const offset = 0;
        const offsetZ = 0;
  
          var pt = new Point({
              x: p[0] + offset, // longitude
              y: p[1], // latitude
              z: p[2] + offsetZ
          });
  
          pt.spatialReference = SpatialReference.WebMercator;
  
          //z = offsetZ; // view.basemapTerrain.getElevation(p);
  
          pos = [pt.x, pt.y, pt.z];
  
          this.vertexIdx++;
  
          if (this.path.length == (this.vertexIdx)) {
              this.vertexIdx--;
          }
        
  
          var transform = new THREE.Matrix4();
          transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, pos, SpatialReference.WebMercator, new Array(16)));
  
         this.iss.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
        
        this.count ++;
          if (this.count === 1) {
            console.log(transform.elements[12], transform.elements[13], transform.elements[14]);
          }
  
          var p0;
          var p1;
  
          if ((this.path.length - 1) == (this.vertexIdx))
          {
              p0 = this.path[--this.vertexIdx];
              p1 = this.path[this.vertexIdx];
          }
          else
          {
              p0 = this.path[this.vertexIdx];
              p1 = this.path[++this.vertexIdx];
          }
        
       // Option 1: use lookAt 
        
        var rotation = new THREE.Matrix4();
        
          var pt1 = new Point({
              x: p1[0] + offset, // longitude
              y: p1[1], // latitude
              z: p1[2] + offsetZ
          });
        posR = [pt1.x, pt1.y, pt1.z];
        rotation.fromArray(externalRenderers.renderCoordinateTransformAt(view, posR, SpatialReference.WebMercator, new Array(16)));
        // https://answers.unity.com/questions/36255/lookat-to-only-rotate-on-y-axis-how.html
        // how to use '.up' with lookAt?
        //geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
        this.iss.up = this.up;
        
        this.iss.lookAt(rotation.elements[12], rotation.elements[13], rotation.elements[14]);
      }
  
      // update lighting
      //view.environment.lighting.date = Date.now();
      var l = context.sunLight;
      this.sun.position.set(
        l.direction[0],
        l.direction[1],
        l.direction[2]
      );
      this.sun.intensity = l.diffuse.intensity;
      this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);
  
      this.ambient.intensity = l.ambient.intensity;
      this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);
  
      // draw the scene
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      this.renderer.resetState();
      context.bindRenderTarget();
      this.renderer.render(this.scene, this.camera);
      externalRenderers.requestRender(view);
  
      // cleanup
      context.resetWebGLState();
  },
  })
  externalRenderers.add(view, skeletonRenderer);
  // End of externalRenderers
  
  
  // Anime.js for Airplane and others
  var scale = 20;
  
  var graphicsLayer = new GraphicsLayer({
  elevationInfo: {
    mode: "relative-to-ground"
  },
  title: "Moving Points"
  });
  
  // Graphic
  var plane = new Graphic({
  geometry: {...pointA, z: 100, type: "point"}
  });
  
  // Symbol
  (async () => {
  var webStyleSymbol = new WebStyleSymbol({
  name: "Airplane_Large_Passenger_With_Wheels",
  styleName: "EsriRealisticTransportationStyle"
  });
  
  var webStyleSymbol2 = new WebStyleSymbol({
  name: "Standing Circle",
  styleName: "EsriIconsStyle"
  });
  
  var symbol = await webStyleSymbol.fetchSymbol();
  symbol.symbolLayers.items[0].heading = 22;
  symbol.symbolLayers.items[0].height *= scale;
  symbol.symbolLayers.items[0].depth *= scale;
  symbol.symbolLayers.items[0].width *= scale;
  
  plane.symbol = symbol;
  
  graphicsLayer.add(plane);
  })();
  
  (async () => {
  await view.when();
  view.map.basemap.referenceLayers = [];
  view.map.add(graphicsLayer);
  view.environment.atmosphere.quality = "high";
  })();
  
  var point = plane.geometry.clone();
  
  // Airplane
  var animation = anime
  .timeline({
    autoplay: false,
    targets: point,
    loop: true,
    duration: 15000,
    update: function() {
      plane.geometry = point.clone();
    }
  })
  .add({
      ...pointB,
      easing: "linear"
    })
    .add(
      {
        z: 0,
        easing: "easeOutSine"
      },
      0
    )
    .add({
      ...pointC,
      easing: "easeOutSine"
    });

    play.onclick = initialization;
    async function initialization() {
      addStop();
      animation.play();
    }
  
  
  
  ///////////////////////////////////////////////////////
  view.ui.empty("top-left");

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