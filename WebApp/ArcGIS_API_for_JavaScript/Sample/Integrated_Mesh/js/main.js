require([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/IntegratedMeshLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Weather",
  "esri/widgets/Daylight",
  "esri/geometry/Polyline",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/views/3d/externalRenderers",
  "esri/geometry/SpatialReference",
  "esri/rest/route",
  "esri/rest/support/RouteParameters",
  "esri/rest/support/FeatureSet",
  "esri/core/Accessor",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/geometry/geometryEngine",
  "esri/Basemap",
  "esri/layers/VectorTileLayer",
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/widgets/Fullscreen",
], (
  WebScene,
  SceneView,
  IntegratedMeshLayer,
  LayerList,
  Legend,
  Weather,
  Daylight,
  Polyline,
  GraphicsLayer,
  Graphic,
  Point,
  externalRenderers,
  SpatialReference,
  route,
  RouteParameters,
  FeatureSet,
  Accessor,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  geometryEngine,
  Basemap,
  VectorTileLayer,
  Map,
  FeatureLayer,
  Fullscreen

) => {
    const spatialReference = SpatialReference.WebMercator;

    // Route Layer for animatioin
    // The stops and route result will be stored in this layer
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
        size: 0, // 15
        outline: { // autocasts as new SimpleLineSymbol()
            width: 0 // 4
        }
    });

    // Define the symbology used to display the route
    var routeSymbol = new SimpleLineSymbol({
        color: [0, 0, 255, 0], // [0, 0, 255, 0.5]
        width: 5
    });
//

  /*************************************
   * Load webscene with other layers
   * (lakes, points of interest, roads)
   *************************************/
    // Basemap
    
    // Add Map
    var map = new Map({
      basemap: "satellite", // "streets-night-vector"
      ground: "world-elevation" // ground: "no"
    }); 

  /*************************************
   * Create IntegratedMeshLayer layer
   * and add it to the webscene
   ***********************************/
   const layer = new IntegratedMeshLayer({
     url: "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/Buildings_Frankfurt_2021/SceneServer",
     // Frankfurt integrated mesh data provided by Aerowest GmbH
     copyright: "Aerowest GmbH",
     title: "Integrated Mesh Frankfurt"
  });

  map.add(layer);

  const view = new SceneView({
    container: "viewDiv",
    viewingMode: "global",
    map: map,
    qualityProfile: "high",
    camera: {
      position: {
        x: 8.6943272,
        y: 50.0977821,
        z: 1000
      },
      tilt: 65
    },
    environment: {
      weather: {
        type: "cloudy",
        cloudCover: 0.3
      },
      lighting: {
        waterReflectionEnabled: true,
        ambientOcclusionEnabled: true
      }
    }
  });

  const floodLayer = new FeatureLayer({
    portalItem: {
      id: "ce5ce7edbc2d4fd9a8973c319e86c130"
    },
    title: "Flood Area (100 year)",
    elevationInfo: {
      mode: "absolute-height",
      offset: 3,
    },
    layerId: 6,
    renderer: {
      type: "simple",
      symbol: {
          type: "polygon-3d",
          symbolLayers: [
              {
                  type: "water",
                  waveDirection: 260,
                  color: "#005B66", //#005B66, #25427c
                  waveStrength: "moderate",
                  waterbodySize: "medium"
              }
          ]
      }
  }
  });
  map.add(floodLayer, 0);

  const buildingFlood = new FeatureLayer({
    portalItem: {
      id: "ce5ce7edbc2d4fd9a8973c319e86c130"
    },
    layerId: 11,
    title: "Buildings Flooded Height",
  });
  map.add(buildingFlood);

  const layerList = new LayerList({
    view: view,
    
  });
  view.ui.add(layerList, "top-right");

  view.ui.empty("top-left");

// Full Screen Widget
view.ui.add(
  new Fullscreen({
    view: view,
  }),
  "bottom-right"
  );
  ////// Train Animation using externalRenderers
  
      // Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
      //on(view, "click", addStop);
      view.on("click", function() {
        addStop();

    });

    function addStop(event) {

        // Add a point at the location of the map click
        //var stop = new Graphic({
        //    geometry: event.mapPoint,
        //    symbol: stopSymbol
        //});

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
      var pl = geometryEngine.densify(routeResult.geometry, 0.2, "meters");
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
        issScale: 1,                                     // scale for the iss model
        issScale2: 10,
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
              this.up = new THREE.Vector3(1, 0, 1); // used with lookAt: look at the next point at x-axis
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
            /////////////////////////////////////////////////////////////////////////////////////////////////////
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




});