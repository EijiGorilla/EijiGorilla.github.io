require([
    "esri/core/Accessor",
    "esri/Basemap",
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/TileLayer",
      "esri/layers/FeatureLayer",
      "esri/widgets/Expand",
      "esri/widgets/Legend",
      "esri/rest/support/Query",
      "esri/widgets/Fullscreen",
      "esri/symbols/TextSymbol",
      "esri/views/SceneView",
      "esri/widgets/LayerList",
      "esri/layers/VectorTileLayer",
      "esri/widgets/BasemapToggle",
      "esri/layers/SceneLayer",
      "esri/layers/support/LabelClass",
      "esri/layers/GraphicsLayer",
      "esri/widgets/Search",
      "esri/widgets/Home",
      "esri/Graphic",
      "esri/symbols/WebStyleSymbol",
      "esri/core/reactiveUtils",
      "esri/widgets/Weather",
      "esri/widgets/Daylight",
      "esri/Camera",
      "esri/geometry/Point",
      "esri/core/promiseUtils",
      "esri/geometry/geometryEngineAsync",
      "esri/geometry/support/webMercatorUtils",
      "esri/geometry/SpatialReference",
      "esri/geometry/Polyline",
      "esri/renderers/SimpleRenderer",
      "esri/geometry/Mesh",
      "esri/views/3d/externalRenderers",
      "esri/rest/route",
      "esri/rest/support/RouteParameters",
      "esri/rest/support/FeatureSet",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/Color",
      "esri/geometry/geometryEngine",
      "esri/core/urlUtils",
      "dojo/on",
      "dojo/query",
      "dojo/domReady!"

    ], function(
    Accessor,
      Basemap,
      Map,
      MapView,
      TileLayer,
      FeatureLayer,
      Expand,
      Legend,
      Query,
      Fullscreen,
      TextSymbol,
      SceneView,
      LayerList,
      VectorTileLayer,
      BasemapToggle,
      SceneLayer,
      LabelClass,
      GraphicsLayer,
      Search,
      Home,
      Graphic,
      WebStyleSymbol,
      reactiveUtils,
      Weather,
      Daylight,
      Camera,
      Point,
      promiseUtils,
      geometryEngine,
      webMercatorUtils,
      SpatialReference,
      Polyline,
      SimpleRenderer,
      Mesh,
      externalRenderers,
      route,
      RouteParameters,
      FeatureSet,
      SimpleMarkerSymbol,
      SimpleLineSymbol,
      Color,
      geometryEngine,
      urlUtils,
      on,
      query


    ) {
      const spatialReference = SpatialReference.WebMercator;

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
                size: 15,
                outline: { // autocasts as new SimpleLineSymbol()
                    width: 4
                }
            });

            // Define the symbology used to display the route
            var routeSymbol = new SimpleLineSymbol({
                color: [0, 0, 255, 0.5],
                width: 5
            });
// Add Map
var map = new Map({
    basemap: {
              baseLayers: [
                new TileLayer({
                  portalItem: {
                    id: "1b243539f4514b6ba35e7d995890db1d" // world hillshade
                  }
                }),
                new VectorTileLayer({
                  portalItem: {
                    id: "0a0d74b5fbc0431fa0f6c938d0b04505" // community style vector tiles
                  },
                  blendMode: "multiply"
                })
              ]
            },
            ground: "world-elevation",
            optimizePanAnimation: false
    
    }); 
    map.ground.surfaceColor = '#004C73';
    //map.ground.opacity = 0.5;
    
    
    // Add scene view
    var view = new SceneView({
    map: map,
    container: "viewDiv",
    viewingMode: "local",
    qualityProfile: "high",
    environment: {
      background: {
        type: "color", // autocasts as new ColorBackground()
        color: [0, 0, 0, 1]
      },
      
      // disable stars
      starsEnabled: true,
            
      //disable atmosphere
      atmosphereEnabled: false
    },
    camera: {
      position: {
        x: 120.9777186,//120.9777186,
        y: 14.5600295,//14.5600295,
        z: 2000
      },
      tilt: 65,
      heading: 0
    }
    });
    
    
    // Basemap Toggle
    
    const toggle = new BasemapToggle({
    view: view,
    nextBaseMap: "hybrid"
    });
    view.ui.add(toggle, "top-right");
    
    function catchAbortError(error) {
    if (error.name != "AbortError") {
      console.error(error);
    }
    }
    
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
          color: [225, 225, 225, 0.5]
        }
    }
    ]
    };
    
    
    var osm3D = new SceneLayer({
    portalItem: {
      id: "ca0470dbbddb4db28bad74ed39949e25"
    },
    title: "OpenStreetMap 3D Buildings",
    popupEnabled: false
    });
    map.add(osm3D);
    osm3D.renderer = {
    type: "simple",
    symbol: osmSymbol
    }
    
    /////////////
    view.on("click", function() {
        addStop();

    });

    function addStop(event) {
        var stop1 = new Graphic({
            geometry: new Point({x: 13469575.3585, y: 1649533.7111999989, z: 21.16139999999723, spatialReference: SpatialReference.WebMercator}),
            symbol: stopSymbol
        });
        routeLyr.add(stop1);

        var stop2 = new Graphic({
            geometry: new Point({x: 13471126.350699998, y: 1646410.0546999983, z: 13.592399999994086, spatialReference: SpatialReference.WebMercator }),
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

        var polyline = new Polyline([[13469575.3585, 1649533.7111999989, 21.16139999999723],
                                    [13469517.177299999, 1649452.3819999993, 21.662200000006123],
                                    [13469462.6138, 1649368.5907000005, 22.032200000001467],
                                    [13469411.4529, 1649282.6744999997, 23.198199999998906],
                                    [13469366.358199999, 1649193.454599999, 24.243799999996554],
                                    [13469327.1789, 1649101.4737000018, 25.11699999999837],
                                    [13469289.526099999, 1649008.8414999992, 24.763300000005984],
                                    [13469252.229600001, 1648916.0727999993, 24.345900000000256],
                                    [13469215.639600001, 1648823.0133000016, 24.027799999996205],
                                    [13469177.880199999, 1648730.4162000008, 23.522299999996903],
                                    [13469139.278099999, 1648638.1697000004, 22.862800000002608],
                                    [13469100.214699998, 1648546.1151, 22.119000000006054],
                                    [13469061.620099999, 1648453.8638999984, 21.054099999993923],
                                    [13469038.695, 1648357.1246999986, 20.441500000000815],
                                    [13469065.903299998, 1648263.3403000012, 20.424299999998766],
                                    [13469144.7067, 1648204.3044999987, 20.09560000000056],
                                    [13469242.369600002, 1648186.8368999995, 20.54979999999341],
                                    [13469342.191799998, 1648191.8176999986, 21.047999999995227],
                                    [13469442.1105, 1648195.8489999995, 20.908599999995204],
                                    [13469541.9173, 1648201.681400001, 19.959499999997206],
                                    [13469640.8721, 1648215.5634000003, 18.65230000000156],
                                    [13469739.4844, 1648232.1649000011, 17.730999999999767],
                                    [13469837.858199999, 1648250.0203999989, 16.952000000004773],
                                    [13469935.678800002, 1648270.7840999998, 16.503200000006473],
                                    [13470033.6433, 1648290.8564999998, 15.766399999993155],
                                    [13470132.547699999, 1648304.5978999995, 14.420800000007148],
                                    [13470229.403499998, 1648285.9233000018, 12.92949999999837],
                                    [13470296.2749, 1648214.9356000014, 12.732000000003609],
                                    [13470309.913800001, 1648117.1636000015, 12.041100000002189],
                                    [13470315.3264, 1648017.4151999988, 11.437200000000303],
                                    [13470337.365600001, 1647919.9013999999, 12.074200000002747],
                                    [13470359.2408, 1647822.3264999986, 12.400899999993271],
                                    [13470380.528099999, 1647724.6185000017, 12.622300000002724],
                                    [13470422.9219, 1647634.9787999988, 12.103799999997136],
                                    [13470494.081999999, 1647565.0769999996, 10.455100000006496],
                                    [13470567.1897, 1647497.4769000001, 9.226399999999558],
                                    [13470608.044300001, 1647407.2828000002, 8.659599999999045],
                                    [13470620.272300001, 1647308.1361000016, 8.791200000006938],
                                    [13470631.954100002, 1647208.8209999986, 8.793999999994412],
                                    [13470642.974, 1647109.430300001, 9.376300000003539],
                                    [13470651.462299999, 1647009.8035000004, 9.229999999995925],
                                    [13470671.927900001, 1646912.296500001, 8.51469999999972],
                                    [13470715.079799999, 1646822.3751999997, 8.895000000004075],
                                    [13470778.3026, 1646745.511500001, 8.884999999994761],
                                    [13470854.4679, 1646680.7698, 9.085600000005797],
                                    [13470931.9063, 1646617.5044, 10.341799999994691],
                                    [13470999.112799998, 1646543.4552000016, 11.210699999995995],
                                    [13471067.5634, 1646470.5571000017, 12.460999999995693],
                                    [13471126.350699998, 1646410.0546999983, 13.592399999994086]]);
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
        clock: null,
        clips: null,
        animate: null,
        light: null,
        iss: null,                                                    // ISS model
        issScale: 5,                                     // scale for the iss model
        path: null,
      count: null,
      up: null,
      timeDelta: null,

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
            //////////////////////////////////////////////////////////////////////////////////////
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

            this.clock = new THREE.Clock();

            var issMeshUrl = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Truck.gltf";
            var loaderGLTF = new THREE.GLTFLoader(); // check this: https://qgenhate.hatenablog.com/ [object not an instance of THREE.Object3D]
            let example = new THREE.Object3D();

            loaderGLTF.load(issMeshUrl,
            function(gltf) {
                console.log("ISS mesh loaded.");
               
                example = gltf.scene;
                this.iss = example;

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
            this.light.position.set(2,2,5);
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

              const offsetZ = 3;

                var pt = new Point({
                    x: p[0], // longitude
                    y: p[1], // latitude
                    z: p[2] + offsetZ
                });

                pt.spatialReference = SpatialReference.WebMercator;
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
                    x: p1[0], // longitude
                    y: p1[1], // latitude
                    z: p1[2] + offsetZ
                });
              posR = [pt1.x, pt1.y, pt1.z];
              rotation.fromArray(externalRenderers.renderCoordinateTransformAt(view, posR, SpatialReference.WebMercator, new Array(16)));
              this.iss.up = this.up;                     
              this.iss.lookAt(rotation.elements[12], rotation.elements[13], rotation.elements[14]);
      
            }

            // update lighting
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


/////////////////////////////////////////////////////////////////////////


    ///////////////
    // Add graphicsLayer
    var graphicsLayer = new GraphicsLayer({
      elevationInfo: {
        mode: "relative-to-ground"
      },
      title: "Moving Points"
    });
    
    // Add a 3D point graphics
    var democar1 = new Graphic({
      geometry: { ...point1, z: 0, type: "point" }
    });
    
    var democar2 = new Graphic({
      geometry: { ...pointB1, z: 0, type: "point" }
    });
    
    var democar3 = new Graphic({
      geometry: { ...pointB10, z: 0, type: "point" }
    });
    
    var democar4 = new Graphic({
      geometry: { ...pointD1, z: 0, type: "point" }
    });
    
    var democar5 = new Graphic({
      geometry: { ...pointE1, z: 0, type: "point" }
    });
    
    // Promise 3D web sybmol properties and wait until the properties are finished
    // using async and await
    (async () => {
    
    // user Defined
    //var symbol = customSymbol3D("3D_Telecom_BTS");
    //var symbol = getUniqueValueSymbol("https://EijiGorilla.github.io/Symbols/Demolished.png", 50);
    
    var scale = 1.5;
    var webStyleSymbol = new WebStyleSymbol({
    name: "Standing Circle",
    styleName: "EsriIconsStyle"
    });
    
    var symbol = await webStyleSymbol.fetchSymbol();
    symbol.symbolLayers.items[0].heading = 80;
    symbol.symbolLayers.items[0].height *= scale;
    symbol.symbolLayers.items[0].depth *= scale;
    symbol.symbolLayers.items[0].width *= scale;
    symbol.symbolLayers.items[0].material.color *= "white";
    symbol.symbolLayers.items[0].size *= 0.5;
    
    // Attache the above properties to all the points
    democar1.symbol = symbol;
    democar2.symbol = symbol;
    democar3.symbol = symbol;
    democar4.symbol = symbol;
    democar5.symbol = symbol;
    
    // Add the points to graphicsLayer
    graphicsLayer.addMany([democar1, democar2, democar3, democar4, democar5]);
    })();
    
    // Promise and wait until map is added
    (async () => {
    await view.when();
    view.map.basemap.referenceLayers = [];
    view.map.add(graphicsLayer);
    view.environment.atmosphere.quality = "high";
    })();
    
    // Initila clone (copy) of all the points
    var pointSymbol = democar1.geometry.clone();
    var pointSymbol2 = democar2.geometry.clone();
    var pointSymbol3 = democar3.geometry.clone();
    var pointSymbol4 = democar4.geometry.clone();
    var pointSymbol5 = democar4.geometry.clone();
    
    // Define duration: determines the speed
    var total_time = 5000
    var opacity_time = 4500
    
    //--------Define anime.timeline for each point------------
    // You must define anime.timeline for each point 
    
    // 1. First point
    var animation = anime.timeline({
    autoplay: true,
    direction: 'alternate',
    targets: pointSymbol,
    loop: true,
    duration: total_time,
    update: function() {
      democar1.geometry = pointSymbol.clone(); // clone new position. Without clone, position is not updated
    }
    });
    
    // 2. Second 
    var animation2 = anime.timeline({
    autoplay: true,
    direction: 'alternate',
    targets: pointSymbol2,
    loop: true,
    duration: opacity_time,
    update: function() {
      democar2.geometry = pointSymbol2.clone();
    }
    });
    
    // 3. Third
    var animation3 = anime.timeline({
    autoplay: true,
    direction: 'alternate',
    targets: pointSymbol3,
    loop: true,
    duration: total_time,
    update: function() {
      democar3.geometry = pointSymbol3.clone();
    }
    });
    
    // 4. Fourth point
    var animation4 = anime.timeline({
    autoplay: true,
    direction: 'alternate',
    targets: pointSymbol4,
    loop: true,
    duration: total_time,
    update: function() {
      democar4.geometry = pointSymbol4.clone();
    }
    });
    
    // 4. Fifth point
    var animation5 = anime.timeline({
    autoplay: true,
    direction: 'alternate',
    targets: pointSymbol5,
    loop: true,
    duration: total_time,
    update: function() {
      democar5.geometry = pointSymbol5.clone();
    }
    });
    
    // Add coordination to each point
    /// 1st point
    animation.add({...point1, easing: 'linear'})
    .add({...point2, easing: 'linear'})
    .add({...point3, easing: 'linear'})
    .add({...point4, easing: 'linear'})
    .add({...point5, easing: 'linear'})
    .add({...point6, easing: 'linear'})
    .add({...point7, easing: 'linear'})
    .add({...point8, easing: 'linear'})
    .add({...point9, easing: 'linear'})
    .add({...point10, easing: 'linear'})
    .add({...point11, easing: 'linear'})
    .add({...point12, easing: 'linear'})
    .add({...point13, easing: 'linear'})
    .add({...point14, easing: 'linear'})
    .add({...point15, easing: 'linear'})
    .add({...point16, easing: 'linear'})
    .add({...point17, easing: 'linear'})
    .add({...point18, easing: 'linear'})
    .add({...point19, easing: 'linear'})
    .add({...point20, easing: 'linear'})
    .add({...point21, easing: 'linear'})
    .add({...point22, easing: 'linear'})
    .add({...point23, easing: 'linear'})
    .add({...point24, easing: 'linear'})
    .add({...point25, easing: 'linear'})
    .add({...point26, easing: 'linear'})
    .add({...point27, easing: 'linear'})
    .add({...point28, easing: 'linear'})
    .add({...point29, easing: 'linear'})
    .add({...point30, easing: 'linear'})
    .add({...point31, easing: 'linear'})
    .add({...point32, easing: 'linear'})
    .add({...point33, easing: 'linear'})
    .add({...point34, easing: 'linear'})
    .add({...point35, easing: 'linear'})
    .add({...point36, easing: 'linear'})
    .add({...point37, easing: 'linear'})
    .add({...point38, easing: 'linear'})
    .add({...point39, easing: 'linear'})
    .add({...point40, easing: 'linear'})
    .add({...point41, easing: 'linear'})
    .add({...point42, easing: 'linear'})
    .add({...point43, easing: 'linear'})
    .add({...point44, easing: 'linear'})
    .add({...point45, easing: 'linear'})
    .add({...point46, easing: 'linear'})
    .add({...point47, easing: 'linear'})
    .add({...point48, easing: 'linear'})
    .add({...point49, easing: 'linear'})
    .add({...point50, easing: 'linear'})
    .add({...point51, easing: 'linear'})
    .add({...point52, easing: 'linear'})
    .add({...point53, easing: 'linear'})
    .add({...point54, easing: 'linear'})
    .add({...point55, easing: 'linear'})
    .add({...point56, easing: 'linear'})
    .add({...point57, easing: 'linear'})
    .add({...point58, easing: 'linear'})
    .add({...point59, easing: 'linear'})
    .add({...point60, easing: 'linear'})
    .add({...point61, easing: 'linear'})
    .add({...point62, easing: 'linear'})
    .add({...point63, easing: 'linear'})
    .add({...point64, easing: 'linear'})
    .add({...point65, easing: 'linear'})
    .add({...point66, easing: 'linear'})
    .add({...point67, easing: 'linear'})
    .add({...point68, easing: 'linear'})
    .add({...point69, easing: 'linear'})
    .add({...point70, easing: 'linear'})
    .add({...point71, easing: 'linear'})
    .add({...point72, easing: 'linear'})
    .add({...point73, easing: 'linear'})
    .add({...point74, easing: 'linear'})
    .add({...point75, easing: 'linear'})
    .add({...point76, easing: 'linear'})
    .add({...point77, easing: 'linear'})
    .add({...point78, easing: 'linear'})
    .add({...point79, easing: 'linear'})
    .add({...point80, easing: 'linear'})
    .add({...point81, easing: 'linear'})
    .add({...point82, easing: 'linear'})
    .add({...point83, easing: 'linear'})
    .add({...point84, easing: 'linear'})
    .add({...point85, easing: 'linear'})
    .add({...point86, easing: 'linear'})
    .add({...point87, easing: 'linear'})
    .add({...point88, easing: 'linear'})
    .add({...point89, easing: 'linear'})
    .add({...point90, easing: 'linear'})
    .add({...point91, easing: 'linear'})
    .add({...point92, easing: 'linear'})
    .add({...point93, easing: 'linear'})
    .add({...point94, easing: 'linear'})
    .add({...point95, easing: 'linear'})
    .add({...point96, easing: 'linear'})
    .add({...point97, easing: 'linear'})
    .add({...point98, easing: 'linear'})
    .add({...point99, easing: 'linear'})
    .add({...point100, easing: 'linear'})
    .add({...point101, easing: 'linear'})
    .add({...point102, easing: 'linear'})
    .add({...point103, easing: 'linear'})
    .add({...point104, easing: 'linear'})
    .add({...point105, easing: 'linear'})
    .add({...point106, easing: 'linear'})
    .add({...point107, easing: 'linear'})
    .add({...point108, easing: 'linear'})
    .add({...point109, easing: 'linear'})
    .add({...point110, easing: 'linear'})
    .add({...point111, easing: 'linear'})
    .add({...point112, easing: 'linear'})
    .add({...point113, easing: 'linear'})
    .add({...point114, easing: 'linear'})
    .add({...point115, easing: 'linear'})
    .add({...point116, easing: 'linear'})
    .add({...point117, easing: 'linear'})
    .add({...point118, easing: 'linear'})
    .add({...point119, easing: 'linear'})
    .add({...point120, easing: 'linear'})
    .add({...point121, easing: 'linear'})
    .add({...point122, easing: 'linear'})
    .add({...point123, easing: 'linear'})
    .add({...point124, easing: 'linear'})
    .add({...point125, easing: 'linear'})
    .add({...point126, easing: 'linear'})
    .add({...point127, easing: 'linear'})
    .add({...point128, easing: 'linear'})
    .add({...point129, easing: 'linear'})
    .add({...point130, easing: 'linear'})
    .add({...point131, easing: 'linear'})
    .add({...point132, easing: 'linear'})
    .add({...point133, easing: 'linear'})
    .add({...point134, easing: 'linear'})
    .add({...point135, easing: 'linear'})
    .add({...point136, easing: 'linear'})
    .add({...point137, easing: 'linear'})
    .add({...point138, easing: 'linear'})
    .add({...point139, easing: 'linear'})
    .add({...point140, easing: 'linear'})
    .add({...point141, easing: 'linear'})
    .add({...point142, easing: 'linear'})
    .add({...point143, easing: 'linear'})
    .add({...point144, easing: 'linear'})
    .add({...point145, easing: 'linear'})
    .add({...point146, easing: 'linear'})
    .add({...point147, easing: 'linear'})
    .add({...point148, easing: 'linear'})
    .add({...point149, easing: 'linear'})
    .add({...point150, easing: 'linear'})
    .add({...point151, easing: 'linear'})
    .add({...point152, easing: 'linear'})
    .add({...point153, easing: 'linear'})
    .add({...point154, easing: 'linear'})
    .add({...point155, easing: 'linear'})
    .add({...point156, easing: 'linear'})
    .add({...point157, easing: 'linear'})
    .add({...point158, easing: 'linear'})
    .add({...point159, easing: 'linear'})
    .add({...point160, easing: 'linear'})
    .add({...point161, easing: 'linear'})
    .add({...point162, easing: 'linear'})
    .add({...point163, easing: 'linear'})
    .add({...point164, easing: 'linear'})
    .add({...point165, easing: 'linear'})
    .add({...point166, easing: 'linear'})
    .add({z: 0, easing: 'easeOutSine'},0)
    
    /// 2nd point
    animation2.add({...pointB1, easing: 'linear'})
    .add({...pointB1, easing: 'linear'})
    .add({...pointB2, easing: 'linear'})
    .add({...pointB3, easing: 'linear'})
    .add({...pointB4, easing: 'linear'})
    .add({...pointB5, easing: 'linear'})
    .add({...pointB6, easing: 'linear'})
    .add({...pointB7, easing: 'linear'})
    .add({...pointB8, easing: 'linear'})
    .add({...pointB9, easing: 'linear'})
    .add({...pointB10, easing: 'linear'})
    .add({...pointB11, easing: 'linear'})
    .add({...pointB12, easing: 'linear'})
    .add({...pointB13, easing: 'linear'})
    .add({...pointB14, easing: 'linear'})
    .add({...pointB15, easing: 'linear'})
    .add({...pointB16, easing: 'linear'})
    .add({...pointB17, easing: 'linear'})
    .add({...pointB18, easing: 'linear'})
    .add({...pointB19, easing: 'linear'})
    .add({...pointB20, easing: 'linear'})
    .add({...pointB21, easing: 'linear'})
    .add({...pointB22, easing: 'linear'})
    .add({...pointB23, easing: 'linear'})
    .add({...pointB24, easing: 'linear'})
    .add({...pointB25, easing: 'linear'})
    .add({...pointB26, easing: 'linear'})
    .add({...pointB27, easing: 'linear'})
    .add({...pointB28, easing: 'linear'})
    .add({...pointB29, easing: 'linear'})
    .add({...pointB30, easing: 'linear'})
    .add({...pointB31, easing: 'linear'})
    .add({...pointB32, easing: 'linear'})
    .add({...pointB33, easing: 'linear'})
    .add({...pointB34, easing: 'linear'})
    .add({...pointB35, easing: 'linear'})
    .add({...pointB36, easing: 'linear'})
    .add({...pointB37, easing: 'linear'})
    .add({...pointB38, easing: 'linear'})
    .add({...pointB39, easing: 'linear'})
    .add({...pointB40, easing: 'linear'})
    .add({...pointB41, easing: 'linear'})
    .add({...pointB42, easing: 'linear'})
    .add({...pointB43, easing: 'linear'})
    .add({...pointB44, easing: 'linear'})
    .add({...pointB45, easing: 'linear'})
    .add({...pointB46, easing: 'linear'})
    .add({...pointB47, easing: 'linear'})
    .add({...pointB48, easing: 'linear'})
    .add({...pointB49, easing: 'linear'})
    .add({...pointB50, easing: 'linear'})
    .add({...pointB51, easing: 'linear'})
    .add({...pointB52, easing: 'linear'})
    .add({...pointB53, easing: 'linear'})
    .add({...pointB54, easing: 'linear'})
    .add({...pointB55, easing: 'linear'})
    .add({...pointB56, easing: 'linear'})
    .add({...pointB57, easing: 'linear'})
    .add({...pointB58, easing: 'linear'})
    .add({...pointB59, easing: 'linear'})
    .add({...pointB60, easing: 'linear'})
    .add({...pointB61, easing: 'linear'})
    .add({...pointB62, easing: 'linear'})
    .add({...pointB63, easing: 'linear'})
    .add({...pointB64, easing: 'linear'})
    .add({...pointB65, easing: 'linear'})
    .add({...pointB66, easing: 'linear'})
    .add({...pointB67, easing: 'linear'})
    .add({...pointB68, easing: 'linear'})
    .add({...pointB69, easing: 'linear'})
    .add({...pointB70, easing: 'linear'})
    .add({...pointB71, easing: 'linear'})
    .add({...pointB72, easing: 'linear'})
    .add({...pointB73, easing: 'linear'})
    .add({...pointB74, easing: 'linear'})
    .add({...pointB75, easing: 'linear'})
    .add({...pointB76, easing: 'linear'})
    .add({...pointB77, easing: 'linear'})
    .add({...pointB78, easing: 'linear'})
    .add({...pointB79, easing: 'linear'})
    .add({...pointB80, easing: 'linear'})
    .add({...pointB81, easing: 'linear'})
    .add({...pointB82, easing: 'linear'})
    .add({...pointB83, easing: 'linear'})
    .add({...pointB84, easing: 'linear'})
    .add({...pointB85, easing: 'linear'})
    .add({...pointB86, easing: 'linear'})
    .add({...pointB87, easing: 'linear'})
    .add({...pointB88, easing: 'linear'})
    .add({...pointB89, easing: 'linear'})
    .add({...pointB90, easing: 'linear'})
    .add({...pointB91, easing: 'linear'})
    .add({...pointB92, easing: 'linear'})
    .add({...pointB93, easing: 'linear'})
    .add({...pointB94, easing: 'linear'})
    .add({...pointB95, easing: 'linear'})
    .add({...pointB96, easing: 'linear'})
    .add({...pointB97, easing: 'linear'})
    .add({...pointB98, easing: 'linear'})
    .add({...pointB99, easing: 'linear'})
    .add({...pointB100, easing: 'linear'})
    .add({...pointB101, easing: 'linear'})
    .add({...pointB102, easing: 'linear'})
    .add({...pointB103, easing: 'linear'})
    .add({...pointB104, easing: 'linear'})
    .add({...pointB105, easing: 'linear'})
    .add({...pointB106, easing: 'linear'})
    .add({...pointB107, easing: 'linear'})
    .add({...pointB108, easing: 'linear'})
    .add({...pointB109, easing: 'linear'})
    .add({...pointB110, easing: 'linear'})
    .add({...pointB111, easing: 'linear'})
    .add({...pointB112, easing: 'linear'})
    .add({...pointB113, easing: 'linear'})
    .add({...pointB114, easing: 'linear'})
    .add({...pointB115, easing: 'linear'})
    .add({...pointB116, easing: 'linear'})
    .add({...pointB117, easing: 'linear'})
    .add({...pointB118, easing: 'linear'})
    .add({...pointB119, easing: 'linear'})
    .add({...pointB120, easing: 'linear'})
    .add({...pointB121, easing: 'linear'})
    .add({...pointB122, easing: 'linear'})
    .add({...pointB123, easing: 'linear'})
    .add({...pointB124, easing: 'linear'})
    .add({...pointB125, easing: 'linear'})
    .add({...pointB126, easing: 'linear'})
    .add({...pointB127, easing: 'linear'})
    .add({...pointB128, easing: 'linear'})
    .add({...pointB129, easing: 'linear'})
    .add({...pointB130, easing: 'linear'})
    .add({...pointB131, easing: 'linear'})
    .add({...pointB132, easing: 'linear'})
    .add({...pointB133, easing: 'linear'})
    .add({...pointB134, easing: 'linear'})
    .add({...pointB135, easing: 'linear'})
    .add({...pointB136, easing: 'linear'})
    .add({...pointB137, easing: 'linear'})
    .add({...pointB138, easing: 'linear'})
    .add({...pointB139, easing: 'linear'})
    .add({...pointB140, easing: 'linear'})
    .add({...pointB141, easing: 'linear'})
    .add({...pointB142, easing: 'linear'})
    .add({...pointB143, easing: 'linear'})
    .add({...pointB144, easing: 'linear'})
    .add({...pointB145, easing: 'linear'})
    .add({...pointB146, easing: 'linear'})
    .add({...pointB147, easing: 'linear'})
    .add({...pointB148, easing: 'linear'})
    .add({...pointB149, easing: 'linear'})
    .add({...pointB150, easing: 'linear'})
    .add({...pointB151, easing: 'linear'})
    .add({...pointB152, easing: 'linear'})
    .add({...pointB153, easing: 'linear'})
    .add({...pointB154, easing: 'linear'})
    .add({...pointB155, easing: 'linear'})
    .add({...pointB156, easing: 'linear'})
    .add({...pointB157, easing: 'linear'})
    .add({...pointB158, easing: 'linear'})
    .add({...pointB159, easing: 'linear'})
    .add({...pointB160, easing: 'linear'})
    .add({...pointB161, easing: 'linear'})
    .add({...pointB162, easing: 'linear'})
    .add({...pointB163, easing: 'linear'})
    .add({...pointB164, easing: 'linear'})
    .add({...pointB165, easing: 'linear'})
    .add({...pointB166, easing: 'linear'})
    .add({...pointB167, easing: 'linear'})
    .add({...pointB168, easing: 'linear'})
    .add({...pointB169, easing: 'linear'})
    .add({...pointB170, easing: 'linear'})
    .add({...pointB171, easing: 'linear'})
    .add({...pointB172, easing: 'linear'})
    .add({...pointB173, easing: 'linear'})
    .add({...pointB174, easing: 'linear'})
    .add({...pointB175, easing: 'linear'})
    .add({...pointB176, easing: 'linear'})
    .add({...pointB177, easing: 'linear'})
    .add({...pointB178, easing: 'linear'})
    .add({...pointB179, easing: 'linear'})
    .add({...pointB180, easing: 'linear'})
    .add({...pointB181, easing: 'linear'})
    .add({...pointB182, easing: 'linear'})
    .add({...pointB183, easing: 'linear'})
    .add({...pointB184, easing: 'linear'})
    .add({...pointB185, easing: 'linear'})
    .add({...pointB186, easing: 'linear'})
    .add({...pointB187, easing: 'linear'})
    .add({...pointB188, easing: 'linear'})
    .add({...pointB189, easing: 'linear'})
    .add({z: 0, easing: 'easeOutSine'},0)
    
    /// 3rd point
    animation3.add({...pointB10, easing: 'linear'})
    .add({...pointB11, easing: 'linear'})
    .add({...pointB12, easing: 'linear'})
    .add({...pointB13, easing: 'linear'})
    .add({...pointB14, easing: 'linear'})
    .add({...pointB15, easing: 'linear'})
    .add({...pointB16, easing: 'linear'})
    .add({...pointB17, easing: 'linear'})
    .add({...pointB18, easing: 'linear'})
    .add({...pointB19, easing: 'linear'})
    .add({...pointB20, easing: 'linear'})
    .add({...pointB21, easing: 'linear'})
    .add({...pointB22, easing: 'linear'})
    .add({...pointB23, easing: 'linear'})
    .add({...pointB24, easing: 'linear'})
    .add({...pointB25, easing: 'linear'})
    .add({...pointB26, easing: 'linear'})
    .add({...pointB27, easing: 'linear'})
    .add({...pointB28, easing: 'linear'})
    .add({...pointB29, easing: 'linear'})
    .add({...pointB30, easing: 'linear'})
    .add({...pointB31, easing: 'linear'})
    .add({...pointB32, easing: 'linear'})
    .add({...pointB33, easing: 'linear'})
    .add({...pointB34, easing: 'linear'})
    .add({...pointB35, easing: 'linear'})
    .add({...pointB36, easing: 'linear'})
    .add({...pointB37, easing: 'linear'})
    .add({...pointB38, easing: 'linear'})
    .add({...pointB39, easing: 'linear'})
    .add({...pointB40, easing: 'linear'})
    .add({...pointB41, easing: 'linear'})
    .add({...pointB42, easing: 'linear'})
    .add({...pointB43, easing: 'linear'})
    .add({...pointB44, easing: 'linear'})
    .add({...pointB45, easing: 'linear'})
    .add({...pointB46, easing: 'linear'})
    .add({...pointB47, easing: 'linear'})
    .add({...pointB48, easing: 'linear'})
    .add({...pointB49, easing: 'linear'})
    .add({...pointB50, easing: 'linear'})
    .add({...pointB51, easing: 'linear'})
    .add({...pointB52, easing: 'linear'})
    .add({...pointB53, easing: 'linear'})
    .add({...pointB54, easing: 'linear'})
    .add({...pointB55, easing: 'linear'})
    .add({...pointB56, easing: 'linear'})
    .add({...pointB57, easing: 'linear'})
    .add({...pointB58, easing: 'linear'})
    .add({...pointB59, easing: 'linear'})
    .add({...pointB60, easing: 'linear'})
    .add({...pointB61, easing: 'linear'})
    .add({...pointB62, easing: 'linear'})
    .add({...pointB63, easing: 'linear'})
    .add({...pointB64, easing: 'linear'})
    .add({...pointB65, easing: 'linear'})
    .add({...pointB66, easing: 'linear'})
    .add({...pointB67, easing: 'linear'})
    .add({...pointB68, easing: 'linear'})
    .add({...pointB69, easing: 'linear'})
    .add({...pointB70, easing: 'linear'})
    .add({...pointB71, easing: 'linear'})
    .add({...pointB72, easing: 'linear'})
    .add({...pointB73, easing: 'linear'})
    .add({...pointB74, easing: 'linear'})
    .add({...pointB75, easing: 'linear'})
    .add({...pointB76, easing: 'linear'})
    .add({...pointB77, easing: 'linear'})
    .add({...pointB78, easing: 'linear'})
    .add({...pointB79, easing: 'linear'})
    .add({...pointB80, easing: 'linear'})
    .add({...pointB81, easing: 'linear'})
    .add({...pointB82, easing: 'linear'})
    .add({...pointB83, easing: 'linear'})
    .add({...pointB84, easing: 'linear'})
    .add({...pointB85, easing: 'linear'})
    .add({...pointB86, easing: 'linear'})
    .add({...pointB87, easing: 'linear'})
    .add({...pointB88, easing: 'linear'})
    .add({...pointB89, easing: 'linear'})
    .add({...pointB90, easing: 'linear'})
    .add({...pointB91, easing: 'linear'})
    .add({...pointB92, easing: 'linear'})
    .add({...pointB93, easing: 'linear'})
    .add({...pointB94, easing: 'linear'})
    .add({...pointB95, easing: 'linear'})
    .add({...pointB96, easing: 'linear'})
    .add({...pointB97, easing: 'linear'})
    .add({...pointB98, easing: 'linear'})
    .add({...pointB99, easing: 'linear'})
    .add({...pointB100, easing: 'linear'})
    .add({...pointB101, easing: 'linear'})
    .add({...pointB102, easing: 'linear'})
    .add({...pointB103, easing: 'linear'})
    .add({...pointB104, easing: 'linear'})
    .add({...pointB105, easing: 'linear'})
    .add({...pointB106, easing: 'linear'})
    .add({...pointB107, easing: 'linear'})
    .add({...pointB108, easing: 'linear'})
    .add({...pointB109, easing: 'linear'})
    .add({...pointB110, easing: 'linear'})
    .add({...pointB111, easing: 'linear'})
    .add({...pointB112, easing: 'linear'})
    .add({...pointB113, easing: 'linear'})
    .add({...pointB114, easing: 'linear'})
    .add({...pointB115, easing: 'linear'})
    .add({...pointB116, easing: 'linear'})
    .add({...pointB117, easing: 'linear'})
    .add({...pointB118, easing: 'linear'})
    .add({...pointB119, easing: 'linear'})
    .add({...pointB120, easing: 'linear'})
    .add({...pointB121, easing: 'linear'})
    .add({...pointB122, easing: 'linear'})
    .add({...pointB123, easing: 'linear'})
    .add({...pointB124, easing: 'linear'})
    .add({...pointB125, easing: 'linear'})
    .add({...pointB126, easing: 'linear'})
    .add({...pointB127, easing: 'linear'})
    .add({...pointB128, easing: 'linear'})
    .add({...pointB129, easing: 'linear'})
    .add({...pointB130, easing: 'linear'})
    .add({...pointB131, easing: 'linear'})
    .add({...pointB132, easing: 'linear'})
    .add({...pointB133, easing: 'linear'})
    .add({...pointB134, easing: 'linear'})
    .add({...pointB135, easing: 'linear'})
    .add({...pointB136, easing: 'linear'})
    .add({...pointB137, easing: 'linear'})
    .add({...pointB138, easing: 'linear'})
    .add({...pointB139, easing: 'linear'})
    .add({...pointB140, easing: 'linear'})
    .add({...pointB141, easing: 'linear'})
    .add({...pointB142, easing: 'linear'})
    .add({...pointB143, easing: 'linear'})
    .add({...pointB144, easing: 'linear'})
    .add({...pointB145, easing: 'linear'})
    .add({...pointB146, easing: 'linear'})
    .add({...pointB147, easing: 'linear'})
    .add({...pointB148, easing: 'linear'})
    .add({...pointB149, easing: 'linear'})
    .add({...pointB150, easing: 'linear'})
    .add({...pointB151, easing: 'linear'})
    .add({...pointB152, easing: 'linear'})
    .add({...pointB153, easing: 'linear'})
    .add({...pointB154, easing: 'linear'})
    .add({...pointB155, easing: 'linear'})
    .add({...pointB156, easing: 'linear'})
    .add({...pointB157, easing: 'linear'})
    .add({...pointB158, easing: 'linear'})
    .add({...pointB159, easing: 'linear'})
    .add({...pointB160, easing: 'linear'})
    .add({...pointB161, easing: 'linear'})
    .add({...pointB162, easing: 'linear'})
    .add({...pointB163, easing: 'linear'})
    .add({...pointB164, easing: 'linear'})
    .add({...pointB165, easing: 'linear'})
    .add({...pointB166, easing: 'linear'})
    .add({...pointB167, easing: 'linear'})
    .add({...pointB168, easing: 'linear'})
    .add({...pointB169, easing: 'linear'})
    .add({...pointB170, easing: 'linear'})
    .add({...pointB171, easing: 'linear'})
    .add({...pointB172, easing: 'linear'})
    .add({...pointB173, easing: 'linear'})
    .add({...pointB174, easing: 'linear'})
    .add({...pointB175, easing: 'linear'})
    .add({...pointB176, easing: 'linear'})
    .add({...pointB177, easing: 'linear'})
    .add({...pointB178, easing: 'linear'})
    .add({...pointB179, easing: 'linear'})
    .add({...pointB180, easing: 'linear'})
    .add({...pointB181, easing: 'linear'})
    .add({...pointB182, easing: 'linear'})
    .add({...pointB183, easing: 'linear'})
    .add({...pointB184, easing: 'linear'})
    .add({...pointB185, easing: 'linear'})
    .add({...pointB186, easing: 'linear'})
    .add({...pointB187, easing: 'linear'})
    .add({...pointB188, easing: 'linear'})
    .add({...pointB189, easing: 'linear'})
    .add({z: 0, easing: 'easeOutSine'},0)
    
    // Fourth point
    animation4.add({...pointD1, easing: 'linear'})
    .add({...pointD2, easing: 'linear'})
    .add({...pointD3, easing: 'linear'})
    .add({...pointD4, easing: 'linear'})
    .add({...pointD5, easing: 'linear'})
    .add({...pointD6, easing: 'linear'})
    .add({...pointD7, easing: 'linear'})
    .add({...pointD8, easing: 'linear'})
    .add({...pointD9, easing: 'linear'})
    .add({...pointD10, easing: 'linear'})
    .add({...pointD11, easing: 'linear'})
    .add({...pointD12, easing: 'linear'})
    .add({...pointD13, easing: 'linear'})
    .add({...pointD14, easing: 'linear'})
    .add({...pointD15, easing: 'linear'})
    .add({...pointD16, easing: 'linear'})
    .add({...pointD17, easing: 'linear'})
    .add({...pointD18, easing: 'linear'})
    .add({...pointD19, easing: 'linear'})
    .add({...pointD20, easing: 'linear'})
    .add({...pointD21, easing: 'linear'})
    .add({...pointD22, easing: 'linear'})
    .add({...pointD23, easing: 'linear'})
    .add({...pointD24, easing: 'linear'})
    .add({...pointD25, easing: 'linear'})
    .add({...pointD26, easing: 'linear'})
    .add({...pointD27, easing: 'linear'})
    .add({...pointD28, easing: 'linear'})
    .add({...pointD29, easing: 'linear'})
    .add({...pointD30, easing: 'linear'})
    .add({...pointD31, easing: 'linear'})
    .add({...pointD32, easing: 'linear'})
    .add({...pointD33, easing: 'linear'})
    .add({...pointD34, easing: 'linear'})
    .add({z: 0, easing: 'easeOutSine'},0)
    
    animation5.add({...pointE1, easing: 'linear'})
    .add({...pointE2, easing: 'linear'})
    .add({...pointE3, easing: 'linear'})
    .add({...pointE4, easing: 'linear'})
    .add({...pointE5, easing: 'linear'})
    .add({...pointE6, easing: 'linear'})
    .add({...pointE7, easing: 'linear'})
    .add({...pointE8, easing: 'linear'})
    .add({...pointE9, easing: 'linear'})
    .add({...pointE10, easing: 'linear'})
    .add({...pointE11, easing: 'linear'})
    .add({...pointE12, easing: 'linear'})
    .add({...pointE13, easing: 'linear'})
    .add({...pointE14, easing: 'linear'})
    .add({...pointE15, easing: 'linear'})
    .add({...pointE16, easing: 'linear'})
    .add({...pointE17, easing: 'linear'})
    .add({...pointE18, easing: 'linear'})
    .add({...pointE19, easing: 'linear'})
    .add({...pointE20, easing: 'linear'})
    .add({...pointE21, easing: 'linear'})
    .add({...pointE22, easing: 'linear'})
    .add({...pointE23, easing: 'linear'})
    .add({...pointE24, easing: 'linear'})
    .add({...pointE25, easing: 'linear'})
    .add({...pointE26, easing: 'linear'})
    .add({...pointE27, easing: 'linear'})
    .add({...pointE28, easing: 'linear'})
    .add({...pointE29, easing: 'linear'})
    .add({...pointE30, easing: 'linear'})
    .add({...pointE31, easing: 'linear'})
    .add({...pointE32, easing: 'linear'})
    .add({...pointE33, easing: 'linear'})
    .add({...pointE34, easing: 'linear'})
    .add({z: 0, easing: 'easeOutSine'},0)
    
    
    
    // To add play and pause button
    document.querySelector("#toggle-play").onclick = () => {
    document.querySelector("#toggle-play").style.display = "none";
    document.querySelector("#toggle-pause").style.display = "";
    animation.play();
    animation2.play();
    animation3.play();
    animation4.play();
    animation5.play();
    };
    
    document.querySelector("#toggle-pause").onclick = () => {
    document.querySelector("#toggle-pause").style.display = "none";
    document.querySelector("#toggle-play").style.display = "";
    animation.pause();
    animation2.pause();
    animation3.pause();
    animation4.pause();
    animation5.pause();
    
    };
    
    /////////////////////////////////////////////
    // Major Road network
    const colorsRoad = ["#dc4b00", "#3c6ccc", "#d9dc00", "#91d900"];
    var majorRoadRenderer = {
    type: "unique-value",
    valueExpression: "When($feature.ROAD_SEC_CLASS == 'Primary', 'Primary', \
                             $feature.ROAD_SEC_CLASS == 'Secondary', 'Secondary', \
                             $feature.ROAD_SEC_CLASS)",
    uniqueValueInfos: [
      {// #00b3ff|#424038|#cccccc
    
        value: 'Primary',
        label: 'Primary',
        symbol: {
          type: "simple-line",
          color: colorsRoad[0],
          width: "3px",
          style: "solid"
        }
      },
      {
        value: 'Secondary',
        label: 'Secondary',
        symbol: {
          type: "simple-line",
          color: colorsRoad[1],
          width: "3px",
          style: "solid"
        }
      },
      {
        value: 'Tertiary',
        label: 'Tertiary',
        symbol: {
          type: "simple-line",
          color: colorsRoad[2],
          width: "1px",
          style: "solid"
        }
      }
    ]
    }
    var majorRoadLayer = new FeatureLayer({
    portalItem: {
                  id:"ab0e0cd5e38d471ba24c5177a4f7279a"
              },
              title: "Major Road",
              outFields: ["*"],
              popupEnabled: false,
              layerId: 1,
              elevationInfo: {
                mode: "on-the-ground"
              },
              renderer: majorRoadRenderer,
              minScale: 1200000,
      maxScale: 0,
              returnGeometry: true
    
    });
    map.add(majorRoadLayer);
    
    // Expressway
    var expressRoadRenderer = {
    type: "simple",
    symbol: {
          type: "simple-line",
          color: colorsRoad[3],
          width: "3px",
          style: "solid"
        }
    };
    
    var expressRoad = new FeatureLayer({
      portalItem: {
          id: "ab0e0cd5e38d471ba24c5177a4f7279a"
      },
      title: "Expressway",
      layerId: 2,
      elevationInfo: {
                mode: "on-the-ground"
              },
      outFields: ["*"],
      renderer: expressRoadRenderer,
      popupEnabled: false,
      returnGeometry: true,
      minScale: 1200000,
      maxScale: 0,
    });
    map.add(expressRoad);
    
    // Municipal Boundary
    // #353d45|#566068|#78838c|#f0f4f7
    
    var municialLabelClass = {
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
                maxWorldLength: 600,
                minWorldLength: 300
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
              expression: "$feature.MUNICIPALITY"
              //value: "{TEXTSTRING}"
          }
        }
    
        //NO__OF_BGYS_
    let municipalBoundaryRenderer = {
    type: "simple",
    symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0], //[0, 197, 255, 0.05]
        style: "solid",
        /*
        outline: {
          color: "#f0f4f7",
          width: 1.5,
          style: "short-dot"
        }
        */
      }
    }
    var municipalBoundary = new FeatureLayer({
      portalItem: {
          id: "ab0e0cd5e38d471ba24c5177a4f7279a"
      },
      title: "Municipal Boundary",
      layerId: 3,
      renderer: municipalBoundaryRenderer,
      outFields: ["*"],
      labelingInfo: [municialLabelClass],
      popupEnabled: false,
      returnGeometry: true
    });
    map.add(municipalBoundary,0);
    
    
    // Damage points
    var verticalOffset = {
    screenLength: 100,
    maxWorldLength: 700,
    minWorldLength: 100
    };
    
    
    
    function getUniqueValueSymbol(name, sizeS, damage) {
      if (damage === 'Major') {
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
              verticalOffset: verticalOffset,
    
              callout: {
                type: "line", // autocasts as new LineCallout3D()
                color: "#FF0000",
                size: 1.5,
                border: {
                  color: "#FF0000"
                }
              }
          }
    
      } else if (damage === "Moderate") {
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
              verticalOffset: verticalOffset,
    
              callout: {
                type: "line", // autocasts as new LineCallout3D()
                color: "#FFAA00",
                size: 1.5,
                border: {
                  color: "#FFAA00"
                }
              }
          }
      } else if (damage === "Minor") {
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
              verticalOffset: verticalOffset,
    
              callout: {
                type: "line", // autocasts as new LineCallout3D()
                color: "#FFFF00",
                size: 1.5,
                border: {
                  color: "#FFFF00"
                }
              }
          }
      } else if (damage === "Basic") {
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
              verticalOffset: verticalOffset,
    
              callout: {
                type: "line", // autocasts as new LineCallout3D()
                color: "#00B050",
                size: 1.5,
                border: {
                  color: "#00B050"
                }
              }
          }
      }
    }
    
    var damageRatingSymbol = {
      type: "unique-value",
      valueExpression: "When($feature.Rating == 1, 'Basic', \
                             $feature.Rating == 2, 'Minor', \
                             $feature.Rating == 3, 'Moderate', \
                             $feature.Rating == 4, 'Major', $feature.Rating)",
    
      uniqueValueInfos: [
          {
              value: "Basic",
              label: "Basic",
              symbol: getUniqueValueSymbol(
                  "https://EijiGorilla.github.io/Symbols/Warning Symbol/Basic.png",
                  30,
                  "Basic"
              )
          },
          {
              value: "Minor",
              label: "Minor",
              symbol: getUniqueValueSymbol(
                  "https://EijiGorilla.github.io/Symbols/Warning Symbol/Minor.png",
                  30,
                  "Minor"
              )
          },
          {
              value: "Moderate",
              label: "Moderate",
              symbol: getUniqueValueSymbol(
                  "https://EijiGorilla.github.io/Symbols/Warning Symbol/Moderate.png",
                  30,
                  "Moderate"
              )
          },
          {
              value: "Major",
              label: "Major",
              symbol: getUniqueValueSymbol(
                  "https://EijiGorilla.github.io/Symbols/Warning Symbol/Major.png",
                  30,
                  "Major"
              )
          }
      ]
    }
    
    
    var damagePoints = new FeatureLayer({
      portalItem: {
          id: "ab0e0cd5e38d471ba24c5177a4f7279a"
      },
      title: "Damage Ratings of Road",
      layerId: 0,
      renderer: damageRatingSymbol,
      outFields: ["*"],
      minScale: 1200000,
      maxScale: 0,
      returnGeometry: true,
      popupTemplate: {
        title: "<b>{Rating} damage</b>",
        lastEditInfoEnabled: false,
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Section ID",
                label: "ID Number"
              },
              {
                fieldName: "Municipality",
                label: "Municipality"
              },
              {
                fieldName: "Cost",
                label: "Repaire Cost"
              },
              {
                fieldName: "Repair_Status",
                label: "Repaire Status"
              },
              {
                fieldName: "Comment",
                label: "Comment"
              }
            ]
          }
        ]
      }
    })
    map.add(damagePoints,1);
    
    function lookAround() {
      if (!view.interacting) {
        const camera = view.camera.clone();
        camera.heading += 0.05;
        view.goTo(camera, { animate: false });
        requestAnimationFrame(lookAround);
      }
    }
    lookAround();
    
    //  
    // Pier Chart to summarize damage ratings of hospitals in Ukraine
    let chartLayerView;
    var highlightSelect;
    
    var titleDiv = document.getElementById("titleDiv");
    //var damageCountInViewDiv = document.getElementById("damageCountInViewDiv");
    
    titleDiv.innerHTML = "ROAD DAMAGE" + "<br>" + "<b>" + 
                       "\nSelect a road damage by street, damage ID, or road class from the list or click on the map." + "</b>"
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
    
    // Thousand separators function
    function thousands_separators(num)
    {
      var num_parts = num.toString().split(".");
      num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return num_parts.join(".");
    }
    
    // Chart
    // Call amCharts 4
    am4core.ready(function() {
    am4core.useTheme(am4themes_animated);
    
    // Default Setting
    //zoomToLayer(damagePoints);
    
    var applicationDiv = document.getElementById('applicationDiv');
    var informationDiv = document.getElementById("informationDiv");
    var chartdiv = document.getElementById('chartdiv');
    const chartPanelDiv = document.getElementById("chartPanelDiv");
    var listDiv = document.getElementById("listDiv");
    var detailInfoDiv = document.getElementById("detailInfoDiv");
    
    // Detaild Road Damage Information DIV
    var damageLabel = document.getElementById('damageLabel');
    var repaireStatusLabel = document.getElementById('repaireStatusLabel');
    var streetNameLabel = document.getElementById('streetNameLabel');
    var reportLabel = document.getElementById('reportLabel');
    var estimatedCostLabel = document.getElementById('estimatedCostLabel');
    
    
    // Image of damage
    var img1 = document.getElementById('img1');
    var infoButton = document.getElementById('infoButton');
    var informationScreenDiv = document.getElementById('informationScreenDiv');
    var information_panel = document.getElementById('information_panel');
    
    // Show information Bo
    infoButton.addEventListener('click', informationPopup);
    function informationPopup() {
    informationScreenDiv.style.display = 'block';
    information_panel.style.display = 'block';
    //applicationDiv.style.filter = 'blur(8px)'; 
    informationScreenDiv.innerHTML = "<br>" + "<b>" + "ABOUT THIS APP" + "</b>" + "<br>" +
                                     "<h6>" + "This Web App was created as a sample in request for visualizing road damages on the map and monitoring associated repairing cost." + 
                                      "The App is intended to spatially and temporally monitor the road repairement work that helps in making better planning and " +
                                      "guided decisions in a deveopping country." + "<br>" +
                                      "<br>" + "</h6>" +
                                      "<b>" + "USE THIS APP" +"</b>" +
                                     "<h6>" + "Individual road damages are listed and ordered by three major categories using the list: STREET, ID, and CLASS. " + 
                                      "STREET refers to the name of streets, ID unique ids assigned to each damage point, and class road classification. " +
                                      "Each damage in the list is clickable and zoomed in the clicked." + "<br>" +
                                      "<br>" + 
                                      "SUMMARY CHART button displays two summary charts for the number of damaged points by category and budget balance. " + 
                                      "The chart is clickable..." + "</h6>"
    }
    
    
    
    // Click 'CLOSE' button: 
    document.querySelector('#information_panel input').addEventListener('change', e => {
    informationScreenDiv.style.display = e.target.checked ? 'none' : 'block';
    information_panel.style.display = e.target.checked ? 'none' : 'block';
    document.querySelector('#information_panel input').checked = false;
    applicationDiv.setAttribute('style', '');
    //applicationDiv.style.display = 'block'; 
    });
    //
    
    // Default Setting: list
    chartPanelDiv.style.display = "none";
    detailInfoDiv.style.display = "none";
    
    // Click 'SUMMARY CHART': 
    document.querySelector('.chart_panel input').addEventListener('change', e => {
    listDiv.style.display = e.target.checked ? 'none' : 'block';
    chartPanelDiv.style.display = e.target.checked ? 'block' : 'none';
    detailInfoDiv.style.display = 'none';
    damageTypeChart();
    summaryCostStats().then(updateBudgetRepairChart);
    
    });
    
    // Click 'RETURN TO LIST' from Chart: 
    document.querySelector('.list_panel input').addEventListener('change', e => {
    chartPanelDiv.style.display = e.target.checked ? 'none' : 'block';
    listDiv.style.display = e.target.checked ? 'block' : 'none';
    detailInfoDiv.style.display = 'none';
    });
    
    // Click 'RETURN TO LIST' from detailed information: 
    document.querySelector('.list_panel2 input').addEventListener('change', e => {
    listDiv.style.display = e.target.checked ? 'block' : 'none';
    detailInfoDiv.style.display = e.target.checked ? 'none' : 'block';
    
    });
    
    //------------- list of Major Road Damage ------------------//
    
    //reloStatusLayer.outFields = ["Name", "StatusRC", "Status"];
    
    
    function damageRating() {
      return {
      1: "Basic",
      2: "Minor",
      3: "Moderate",
      4: "Major"
    }
    }
    
    function repairStatus() {
      return {
      1: "Repaired",
      2: "Not Repaired",
      3: "Pending"
    }
    }
    
    //
    //-------------- List of STREET ----------------------------------
    var majorRoadDamageList = document.getElementById("majorRoadDamageList");
    
    view.when(function() {
    view.whenLayerView(damagePoints).then(function(layerView) {
      layerView.watch("updating", function(val) {
        
        if (!val) {
          // Query for only Expropriation lots
          //var query = new Query();
          //query.geometry = true;
          //query.returnGeometry = true;
          //query.where = "Rating = 4";
          layerView.queryFeatures({
              // Display listed items only in display extent
              geometry: view.extent,
              returnGeometry: true,
              orderByFields: ["ROAD_NAME"]
          }).then(function(result) {
            majorRoadDamageList.innerHTML = "";
    
            // Count the number of listed items in display extent
            damageCountInViewDiv.innerHTML = result.features.length + "<b>" +" DAMAGES IN VIEW" + "</b>";
    
            result.features.forEach(function(feature) {
              var attributes = feature.attributes;
              var li = document.createElement("li");
              li.setAttribute("class", "panel-result");
    
              // Add Expropriation lots to list
              let rating = attributes.Rating;
              li.innerHTML = "<b>" + attributes.ROAD_NAME + "</b>" + "<br>" + damageRating()[rating].toUpperCase() + " DAMAGE";
    
              // Click an item in the list event
              li.addEventListener("click", function(event) {
                var target = event.target;
                var objectId = feature.attributes.OBJECTID;
                var queryExtent = new Query({
                  objectIds: [objectId]
                });
    
                // Switch to             
                listDiv.style.display = 'none';
                chartPanelDiv.style.display = 'none';
                detailInfoDiv.style.display = 'block';
    
                // Detailed Information for a selected road damage point
                var repair = attributes.Repair_Status;
                var street = attributes.ROAD_NAME;
                var reportComment = attributes.Comment;
                var repairCost = attributes.Cost;
    
                if (damageRating()[rating] === 'Major') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Major.png");
                
                } else if (damageRating()[rating] === 'Moderate') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Moderate.png");
    
                } else if (damageRating()[rating] === 'Minor') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Minor.png");
    
                } else if (damageRating()[rating] === 'Basic') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Basic.png");
                }
    
                damageLabel.innerHTML = "<h3>" + damageRating()[rating].toUpperCase() + "</h3>";             
                repaireStatusLabel.innerHTML = "REPAIREMENT" + "<br>" + "<h6>" + "STATUS" + "</h6>" + "<h3>" + repairStatus()[repair].toUpperCase() + "</h3>";
                streetNameLabel.innerHTML = "STREET" + "<br>" + "<h7>" + street + "</h7>";
                reportLabel.innerHTML = "REPORT" + "<br>" + "<h7>" + reportComment + "</h7>";
                estimatedCostLabel.innerHTML = "ESTIMATED REPAIRE COST" + "<br>" + "<h7>" + "P" + thousands_separators(repairCost.toFixed(1)) + "</h7>";
    
                // Reset to unchecked
                document.querySelector('.list_panel2 input').checked = false;
    
                // Go to the clicked spot
                // Query extent for selected expropriation lot in the list
                layerView.queryExtent(queryExtent).then(function(result) {
                  if (result.extent) {
                    view.goTo({
                      target: result.extent,
                      speedFactor: 2,
                      zoom: 17})
                      .catch(function(error) {
                        if (error.name != "AbortError") {
                          console.error(error);
                        }
                      }); // End of catch
                    } // End of if (result.extent)
                  }); // End of layerView.queryExtent
                  
                  // Highlight selected lots
                  if (highlightSelect) {
                    highlightSelect.remove();
                  }
                  highlightSelect = layerView.highlight([objectId]);
                  
                  view.on("click", function() {
                    layerView.filter = null;
                    highlightSelect.remove();
                  });
                
                }); // End of li.addEventListener
                majorRoadDamageList.appendChild(li);
    
                // Hover a mouse over the list and highlight
                li.addEventListener("mouseenter", function(event) {
                  var objectId = feature.attributes.OBJECTID;
                  
                  if (highlightSelect) {
                    highlightSelect.remove();
                  }
                  highlightSelect = layerView.highlight([objectId]);
    
                  view.on("click", function() {
                    layerView.filter = null;
                    highlightSelect.remove();
                  });
                });
              }); // End of result.features.forEach
            }); // End of layerView.queryFeatures
          }
       }); // End of layerView.watch
    }); // End of view.whenLayerView
    });
    
    //-------------- Stree ID ----------------------------------
    var roadIdList = document.getElementById("roadIdList");
    
    view.when(function() {
    view.whenLayerView(damagePoints).then(function(layerView) {
    layerView.watch("updating", function(val) {
      
      if (!val) {
        // Query for only Expropriation lots
        //var query = new Query();
        //query.geometry = true;
        //query.returnGeometry = true;
        //query.where = "Rating = 4";
        layerView.queryFeatures({
            // Display listed items only in display extent
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ["SECTION_ID"]
        }).then(function(result) {
          roadIdList.innerHTML = "";
    
          // Count the number of listed items in display extent
          damageCountInViewDiv.innerHTML = result.features.length + "<b>" +" DAMAGES IN VIEW" + "</b>";
    
          result.features.forEach(function(feature) {
            var attributes = feature.attributes;
            var li = document.createElement("li");
            li.setAttribute("class", "panel-result");
    
            // Add Expropriation lots to list
            let rating = attributes.Rating;
            li.innerHTML = "<b>" + attributes.SECTION_ID + "</b>" + "<br>" + damageRating()[rating].toUpperCase() + " DAMAGE";
    
            // Click an item in the list event
            li.addEventListener("click", function(event) {
              var target = event.target;
              var objectId = feature.attributes.OBJECTID;
              var queryExtent = new Query({
                objectIds: [objectId]
              });
    
                            // Switch to             
                            listDiv.style.display = 'none';
                chartPanelDiv.style.display = 'none';
                detailInfoDiv.style.display = 'block';
    
                // Detailed Information for a selected road damage point
                var repair = attributes.Repair_Status;
                var street = attributes.ROAD_NAME;
                var reportComment = attributes.Comment;
                var repairCost = attributes.Cost;
    
                if (damageRating()[rating] === 'Major') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Major.png");
                
                } else if (damageRating()[rating] === 'Moderate') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Moderate.png");
    
                } else if (damageRating()[rating] === 'Minor') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Minor.png");
    
                } else if (damageRating()[rating] === 'Basic') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Basic.png");
                }
    
                damageLabel.innerHTML = "<h3>" + damageRating()[rating].toUpperCase() + "</h3>";             
                repaireStatusLabel.innerHTML = "REPAIREMENT" + "<br>" + "<h6>" + "STATUS" + "</h6>" + "<h3>" + repairStatus()[repair].toUpperCase() + "</h3>";
                streetNameLabel.innerHTML = "STREET" + "<br>" + "<h7>" + street + "</h7>";
                reportLabel.innerHTML = "REPORT" + "<br>" + "<h7>" + reportComment + "</h7>";
                estimatedCostLabel.innerHTML = "ESTIMATED REPAIRE COST" + "<br>" + "<h7>" + "P" + thousands_separators(repairCost.toFixed(1)) + "</h7>";
    
                // Reset to unchecked
                document.querySelector('.list_panel2 input').checked = false;
    
    
              // Go to the clicked spot
              // Query extent for selected expropriation lot in the list
              layerView.queryExtent(queryExtent).then(function(result) {
                if (result.extent) {
                  view.goTo({
                    target: result.extent,
                    speedFactor: 2,
                    zoom: 17})
                    .catch(function(error) {
                      if (error.name != "AbortError") {
                        console.error(error);
                      }
                    }); // End of catch
                  } // End of if (result.extent)
                }); // End of layerView.queryExtent
                
                // Highlight selected lots
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                highlightSelect = layerView.highlight([objectId]);
                
                view.on("click", function() {
                    layerView.filter = null;
                  highlightSelect.remove();
                });
              
              }); // End of li.addEventListener
              roadIdList.appendChild(li);
              //majorRoadDamageList.appendChild(li);
    
              // Hover a mouse over the list and highlight
              li.addEventListener("mouseenter", function(event) {
                var objectId = feature.attributes.OBJECTID;
                
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                highlightSelect = layerView.highlight([objectId]);
    
                view.on("click", function() {
                    layerView.filter = null;
                  highlightSelect.remove();
                });
              });
            }); // End of result.features.forEach
          }); // End of layerView.queryFeatures
    
        }
     }); // End of layerView.watch
    }); // End of view.whenLayerView
    });
    
    //-------------- List by raod class ----------------------------------
    var roadSectionList = document.getElementById("roadSectionList");
    
    view.when(function() {
    view.whenLayerView(damagePoints).then(function(layerView) {
    layerView.watch("updating", function(val) {
      
      if (!val) {
        // Query for only Expropriation lots
        //var query = new Query();
        //query.geometry = true;
        //query.returnGeometry = true;
        //query.where = "Rating = 4";
        layerView.queryFeatures({
            // Display listed items only in display extent
            geometry: view.extent,
            returnGeometry: true,
            orderByFields: ["ROAD_SEC_CLASS"]
        }).then(function(result) {
          roadSectionList.innerHTML = "";
    
          // Count the number of listed items in display extent
          damageCountInViewDiv.innerHTML = result.features.length + "<b>" +" DAMAGES IN VIEW" + "</b>";
    
          result.features.forEach(function(feature) {
            var attributes = feature.attributes;
            var li = document.createElement("li");
            li.setAttribute("class", "panel-result");
    
            // Add Expropriation lots to list
            let rating = attributes.Rating;
            li.innerHTML = "<b>" + attributes.ROAD_SEC_CLASS + "</b>" + "<br>" + damageRating()[rating].toUpperCase() + " DAMAGE";
    
            // Click an item in the list event
            li.addEventListener("click", function(event) {
              var target = event.target;
              var objectId = feature.attributes.OBJECTID;
              var queryExtent = new Query({
                objectIds: [objectId]
              });
    
                            // Switch to             
                            listDiv.style.display = 'none';
                chartPanelDiv.style.display = 'none';
                detailInfoDiv.style.display = 'block';
    
                // Detailed Information for a selected road damage point
                var repair = attributes.Repair_Status;
                var street = attributes.ROAD_NAME;
                var reportComment = attributes.Comment;
                var repairCost = attributes.Cost;
    
                if (damageRating()[rating] === 'Major') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Major.png");
                
                } else if (damageRating()[rating] === 'Moderate') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Moderate.png");
    
                } else if (damageRating()[rating] === 'Minor') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Minor.png");
    
                } else if (damageRating()[rating] === 'Basic') {
                  img1.setAttribute('src', "https://EijiGorilla.github.io/Symbols/Warning Symbol/Basic.png");
                }
    
                damageLabel.innerHTML = "<h3>" + damageRating()[rating].toUpperCase() + "</h3>";             
                repaireStatusLabel.innerHTML = "REPAIREMENT" + "<br>" + "<h6>" + "STATUS" + "</h6>" + "<h3>" + repairStatus()[repair].toUpperCase() + "</h3>";
                streetNameLabel.innerHTML = "STREET" + "<br>" + "<h7>" + street + "</h7>";
                reportLabel.innerHTML = "REPORT" + "<br>" + "<h7>" + reportComment + "</h7>";
                estimatedCostLabel.innerHTML = "ESTIMATED REPAIRE COST" + "<br>" + "<h7>" + "P" + thousands_separators(repairCost.toFixed(1)) + "</h7>";
    
                // Reset to unchecked
                document.querySelector('.list_panel2 input').checked = false;
    
    
              // Go to the clicked spot
              // Query extent for selected expropriation lot in the list
              layerView.queryExtent(queryExtent).then(function(result) {
                if (result.extent) {
                  view.goTo({
                    target: result.extent,
                    speedFactor: 2,
                    zoom: 17})
                    .catch(function(error) {
                      if (error.name != "AbortError") {
                        console.error(error);
                      }
                    }); // End of catch
                  } // End of if (result.extent)
                }); // End of roadSectionLayerView.queryExtent
                
                // Highlight selected lots
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                highlightSelect = layerView.highlight([objectId]);
                
                view.on("click", function() {
                  layerView.filter = null;
                  highlightSelect.remove();
                });
              
              }); // End of li.addEventListener
              roadSectionList.appendChild(li);
              //majorRoadDamageList.appendChild(li);
    
              // Hover a mouse over the list and highlight
              li.addEventListener("mouseenter", function(event) {
                var objectId = feature.attributes.OBJECTID;
                
                if (highlightSelect) {
                  highlightSelect.remove();
                }
                highlightSelect = layerView.highlight([objectId]);
    
                view.on("click", function() {
                  layerView.filter = null;
                  highlightSelect.remove();
                });
              });
            }); // End of result.features.forEach
          }); // End of roadSectionLayerView.queryFeatures
    
        }
     }); // End of roadSectionLayerView.watch
    }); // End of view.whenLayerView
    });
    
    
    
    // Road Damage Chart:-------------------------------------------------------
    async function damageTypeChart() {
    function DamageRating(){
    return {
      1: "Basic",
      2: "Minor",
      3: "Moderate",
      4: "Major"
    }
    }
    
    var total_basic = {
              onStatisticField: "CASE WHEN Rating = 1 THEN 1 ELSE 0 END",
              outStatisticFieldName: "total_basic",
              statisticType: "sum"
          }
    
          var total_minor = {
              onStatisticField: "CASE WHEN Rating = 2 THEN 1 ELSE 0 END",
              outStatisticFieldName: "total_minor",
              statisticType: "sum"
          }
          
          var total_moderate = {
              onStatisticField: "CASE WHEN Rating = 3 THEN 1 ELSE 0 END",
              outStatisticFieldName: "total_moderate",
              statisticType: "sum"
          }
    
          var total_major = {
              onStatisticField: "CASE WHEN Rating = 4 THEN 1 ELSE 0 END",
              outStatisticFieldName: "total_major",
              statisticType: "sum"
          }
    
          var query = damagePoints.createQuery();
          query.outStatistics = [total_basic, total_minor, total_moderate, 
                                 total_major];
    
          query.returnGeometry = true;
    
          damagePoints.queryFeatures(query).then(function(response){
              var stats = response.features[0].attributes;
    
              const TOTAL_BASIC = stats.total_basic;
              const TOTAL_MINOR = stats.total_minor;
              const TOTAL_MODERATE = stats.total_moderate;
              const TOTAL_MAJOR = stats.total_major;
    
              const grandTotal = TOTAL_BASIC + TOTAL_MINOR + TOTAL_MODERATE + TOTAL_MAJOR;
              const p_TOTAL_BASIC = (TOTAL_BASIC / grandTotal * 100).toFixed(0);
              const p_TOTAL_MINOR = (TOTAL_MINOR / grandTotal * 100).toFixed(0);
              const p_TOTAL_MODERATE = (TOTAL_MODERATE / grandTotal * 100).toFixed(0);
              const p_TOTAL_MAJOR = (TOTAL_MAJOR / grandTotal * 100).toFixed(0);
              
              var chart = am4core.create("chartdiv", am4charts.XYChart);
    
              chart.data = [
        {
          category: "MAJOR",
          value: p_TOTAL_MAJOR
        },
        {
          category: "MODERATE",
          value: p_TOTAL_MODERATE
        },
       {
        category: "MINOR",
          value: p_TOTAL_MINOR
        },
        {
          category: "BASIC",
          value: p_TOTAL_BASIC
        }
      ]; // End of chart
    
    
      // Add chart title
      var title = chart.titles.create();
      title.text = grandTotal + " [white 100 font-size: 20px]DAMAGES IN TOTAL"; // [#00ff00]world[/], Hello [font-size: 30px]world[/], "Hello [red bold font-size: 30px]world[/]!"
      title.fontWeight = "bold";
      title.fontSize = 20;
      title.fill = "#FFA500";
    
    
      chart.hiddenState.properties.opacity = 0;
      chart.padding(20, 20, 20, 20);
    
      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.minGridDistance = 1;
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = true;
      categoryAxis.renderer.labels.template.fontSize = 16;
      categoryAxis.renderer.labels.template.fill = "#ffffff";
      categoryAxis.renderer.minGridDistance = 5; //can change label
      categoryAxis.renderer.grid.template.strokeOpacity = 1;
      categoryAxis.renderer.grid.template.stroke = am4core.color("#FFFFFF");
      categoryAxis.renderer.grid.template.strokeWidth = 1.5;
      
      // Width of Bar chart
      categoryAxis.renderer.cellStartLocation = 0.1;
      categoryAxis.renderer.cellEndLocation = 0.9;
    
      categoryAxis.renderer.line.strokeOpacity = 0;
      categoryAxis.renderer.line.strokeWidth = 3;
      categoryAxis.renderer.line.stroke = am4core.color("#FFFFFF");
    
      // Create value axis
      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
    valueAxis.max = 100;
    
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 200;
      valueAxis.renderer.labels.template.fontSize = 0;
      valueAxis.renderer.labels.template.fill = "#ffffff";
      valueAxis.renderer.line.strokeOpacity = 0;
      valueAxis.renderer.line.strokeWidth = 1.5;
      valueAxis.renderer.line.stroke = am4core.color("#FFFFFF");
    
    
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.categoryY = "category";
      series.dataFields.valueX = "value";
      series.tooltipText = "{valueX.value}"
    
      series.columns.template.strokeOpacity = 0;
    
      // Label Bullet
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.horizontalCenter = "left";
      labelBullet.label.dx = 10;
      labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}%"; 
    
    
    
      //labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}%"; //#.0as for 17k
    
      labelBullet.label.fill = am4core.color("#ffffff");
      labelBullet.interactionsEnabled = false;
      labelBullet.label.fontSize = 18;
    
    // Responsive code: 
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
        
            /*
            // Create a separate state for background
            target.setStateOnChildren = true;
            var bgstate = target.background.states.create(stateId);
            bgstate.properties.fill = am4core.color("#fff");
            bgstate.properties.fillOpacity = 0;
            */
        
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
    // Responsive code: END
    
    
    
      // Click chart and filer 
      series.columns.template.events.on("hit", filterByChart, this);
      function filterByChart(ev) {
        const SELECTED = ev.target.dataItem.categoryY;
    
        
        if (SELECTED == "BASIC") {
          selectedStatus = 1;
        } else if (SELECTED == "MINOR") {
          selectedStatus = 2;
        } else if (SELECTED == "MODERATE") {
          selectedStatus = 3;
        }  else if (SELECTED == "MAJOR") {
          selectedStatus = 4;
        }
    
        view.whenLayerView(damagePoints).then(function (layerView) {
          chartLayerView = layerView;
          chartPanelDiv.style.visibility = "visible";
    
          damagePoints.queryFeatures().then(function(results) {
            const RESULT_LENGTH= results.features;
            const ROW_N= RESULT_LENGTH.length;
    
            let objID = [];
            for (var i=0; i< ROW_N; i++) {
              var obj = results.features[i].attributes.OBJECTID;
              objID.push(obj);
            }
            
            var queryExt = new Query({
              objectIds: objID
            });
    
            if (highlightSelect) {
              highlightSelect.remove();
            }
            highlightSelect = layerView.highlight(objID);
    
            view.on("click", function() {
              layerView.filter = null;
              highlightSelect.remove();
            });
          });
        }); // End of whenLayerView
        
        chartLayerView.filter = {
          where: "Rating = " + selectedStatus
          //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
        };
      }; // End of filterByChart
    
      // Modify chart's colors
    chart.colors.list = [
    am4core.color("#FF0000"), // Major
    am4core.color("#FFAA00"), // Moderate
    am4core.color("#FFFF00"), // Minor
    am4core.color("#00B050"), // Basic
    ];
    
      series.columns.template.adapter.add("fill", function(fill, target){
        return chart.colors.getIndex(target.dataItem.index);
      });
      
    
    }); // End of queryFeatures
    } // End of updateMOAChartLot
    
    
    // Repairment Cost Chart:-------------------------------------------------------
    
    const repairedArray = [];
    const unrepairedArray = [];
    const pendingArray = [];
    
    function summaryCostStats(){
    var total_cost = {
              onStatisticField: "Cost",
              outStatisticFieldName: "total_cost",
              statisticType: "sum"
          }
    
          var query = damagePoints.createQuery();
          query.outStatistics = [total_cost];
          query.returnGeometry = true;
          query.groupByFieldsForStatistics = ["Repair_Status"];
    
          return damagePoints.queryFeatures(query).then(function(response){
              var stats = response.features;
    
              stats.forEach((result, index) => {
                const attributes = result.attributes;
                const REPAIR_STATUS = attributes.Repair_Status;
                const COST = attributes.total_cost;
    
                if (REPAIR_STATUS === 1) {
                  repairedArray.push(COST);
    
                } else if (REPAIR_STATUS === 2) {
                  unrepairedArray.push(COST);
    
                } else if (REPAIR_STATUS === 3) {
                  pendingArray.push(COST);
                }
              });
              return [repairedArray, unrepairedArray, pendingArray];
            });
    }
    
    async function updateBudgetRepairChart([repairedArray, unrepairedArray, pendingArray]) {
    function repairStatus(){
      return {
        1: "Repaired",
        2: "Not Repaired",
        3: "Pending"
      }
    }
    
    
    // Remaining Balance
    if (pendingArray[0] === undefined) {
    var pendingArray2 = 0;
    } else {
    var pendingArray2 = pendingArray[0];
    }
    
    const TOTAL_BUDGET = repairedArray[0] + unrepairedArray[0] + pendingArray2;
    const REMAINING = TOTAL_BUDGET - repairedArray[0];
    const p_REMAINING = ((REMAINING / TOTAL_BUDGET) * 100).toFixed(0);
    const p_TOTALSPENT = ((repairedArray[0] / TOTAL_BUDGET) * 100).toFixed(0); 
    
    var balanceBudgetValue = document.getElementById("balanceBudgetValue");
    var totalSpentValue = document.getElementById("totalSpentValue");
    
    balanceBudgetValue.innerHTML = "<h4>" + "P" + thousands_separators(REMAINING.toFixed(0)) + " (" + p_REMAINING + "%" + ")" +
                                 "\n</h4>" + "<br>" + "<h5>" + "REMAINING BALANCE" + "</h5>";
    totalSpentValue.innerHTML = "<h4>" + "P" + thousands_separators(repairedArray[0].toFixed(0)) +  " (" + p_TOTALSPENT + "%" + ")" +
                              "\n</h4>" + "<br>" + "<h5>" + "TOTAL SPENT FOR REPAIREMENT" + "</h5>";
    
    
    // Chart
    
    var chart = am4core.create("chartdiv1", am4charts.PieChart);
    
    // Add data
      chart.data = [
        {
          "Repair": repairStatus()[1],
          "status": repairedArray[0],
          "color": am4core.color("#964b00")
        },
        {
          "Repair": repairStatus()[2],
          "status": unrepairedArray[0],
          "color": am4core.color("#d0b49f")   
        },
        {
          "Repair": repairStatus()[3],
          "status": pendingArray[0],
          "color": am4core.color("#c1c2ad") 
        }
      ];
      // Set inner radius
      chart.innerRadius = am4core.percent(50);
      
      // Add and configure Series
      function createSlices(field, status){
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = field;
        pieSeries.dataFields.category = status;
        
        pieSeries.slices.template.propertyFields.fill = "color";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 1;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.slices.template
        // change the cursor on hover to make it apparent the object can be interacted with
        .cursorOverStyle = [
          {
            "property": "cursor",
            "value": "pointer"
          }
        ];
        
        // Hover setting
        pieSeries.tooltip.label.fontSize = 14;
        pieSeries.slices.template.tooltipText = "{value.percent.formatNumber('#.')}% (P{value.formatNumber('#,###.')}) {category}";
    
        
        // Pie
        //pieSeries.alignLabels = false;
        //pieSeries.labels.template.bent = false;
        pieSeries.labels.template.disabled = true;
        pieSeries.labels.template.radius = 3;
        pieSeries.labels.template.padding(0,0,0,0);
        pieSeries.labels.template.fontSize = 9;
        pieSeries.labels.template.fill = "#ffffff";
    
        // Ticks (a straight line)
        //pieSeries.ticks.template.disabled = true;
        pieSeries.ticks.template.fill = "#ffff00";
        
        // Create a base filter effect (as if it's not there) for the hover to return to
        var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
        shadow.opacity = 0;
        
        // Chart Title
    
        // Create hover state
        var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists
    
        // Slightly shift the shadow and make it more prominent on hover
        var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
        hoverShadow.opacity = 0.7;
        hoverShadow.blur = 5;
        
        // Add a legend
        const LEGEND_FONT_SIZE = 15;
        chart.legend = new am4charts.Legend();
        chart.legend.valueLabels.template.align = "right"
        chart.legend.valueLabels.template.textAlign = "end";
        //chart.legend.markers.template.disabled = true;
        chart.legend.disabled = true;
        
        //chart.legend.position = "bottom";
        chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
        chart.legend.labels.template.fill = "#ffffff";
        //chart.legend.labels.template.fontWeight = "bold";
    
        chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
        chart.legend.valueLabels.template.fontSize = LEGEND_FONT_SIZE; 
        pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
        //pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";
    
        // Chart Title
        // Chart Title
        var title = chart.titles.create();
        title.text = "BUDGET BALANCE"; // [#00ff00]world[/], Hello [font-size: 30px]world[/]
        title.fontSize = 30;
        //title.fontWeight = "bold";
        title.fill = "#ffaa00";
    
    
        /// Define marker symbols properties
        var marker = chart.legend.markers.template.children.getIndex(0);
        var markerTemplate = chart.legend.markers.template;
        marker.cornerRadius(12, 12, 12, 12);
        marker.strokeWidth = 1;
        marker.strokeOpacity = 1;
        marker.stroke = am4core.color("#ccc");
        markerTemplate.width = 18;
        markerTemplate.height = 18;
    
        // add total inside pie radius
        // https://www.amcharts.com/docs/v4/tutorials/automatically-resize-label-to-fit-donut-inner-radius/
        var container = new am4core.Container();
        container.parent = pieSeries;
        container.horizontalCenter = "middle";
        container.verticalCenter = "middle";
        container.width = am4core.percent(40) / Math.sqrt(2);
        container.fill = "white";
    
        var label = new am4core.Label();
        label.parent = container;
        label.text = "P{values.value.sum.formatNumber('#,###.')}";
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.fontSize = 20;
        label.fill = "white";
    
        chart.events.on("sizechanged", function(ev) {
          var scale = (pieSeries.pixelInnerRadius * 2) / label.bbox.width;
          if (scale > 1) {
            scale = 1;
          }
          label.scale = scale;
        });
        
        // This creates initial animation
        //pieSeries.hiddenState.properties.opacity = 1;
        //pieSeries.hiddenState.properties.endAngle = -90;
        //pieSeries.hiddenState.properties.startAngle = -90;
    
        // Click chart and filter, update maps
              
        // Click chart and filter, update maps
        pieSeries.slices.template.events.on("hit", filterByChart, this);
        function filterByChart(ev) {
          const SELECTED = ev.target.dataItem.category;
          if (SELECTED == repairStatus()[1]) {
            selectedStatus = 1;
          } else if (SELECTED == repairStatus()[2]) {
            selectedStatus = 2;
          } else if (SELECTED == repairStatus()[3]) {
            selectedStatus = 3;
          } else {
            selectedStatus = null;
          }
          
          view.when(function() {
            view.whenLayerView(damagePoints).then(function (layerView) {
              chartLayerView = layerView;
              chartPanelDiv.style.visibility = "visible";
              
              damagePoints.queryFeatures().then(function(results) {
                const RESULT_LENGTH = results.features;
                const ROW_N = RESULT_LENGTH.length;
    
                let objID = [];
                for (var i=0; i < ROW_N; i++) {
                    var obj = results.features[i].attributes.OBJECTID;
                    objID.push(obj);
                }
    
                var queryExt = new Query({
                   objectIds: objID
                });
    
                damagePoints.queryExtent(queryExt).then(function(result) {
                    if (result.extent) {
                        view.goTo(result.extent)
                    }
                });
    
                if (highlightSelect) {
                    highlightSelect.remove();
                }
                highlightSelect = layerView.highlight(objID);
    
                view.on("click", function() {
                  layerView.filter = null;
                  highlightSelect.remove();
                });
              }); // End of queryFeatures
              layerView.filter = {
                where: "Repair_Status = " + selectedStatus
              }
            }); // End of view.whenLayerView
          }); // End of view.when
        } // End of filterByChart
    
      } // End of createSlices function
    
      createSlices("status", "Repair");
    
    
    } // End of updateBudgetRepairChart()
    
    }); // End of am4core.ready
    
    /////////////////////////////////////////////////////////
    // Empty top-left widget
    view.ui.empty("top-left");
    
    // Search Widget
    //Search Widget 
    var searchWidget = new Search({
    view: view,
    locationEnabled: false,
    includeDefaultSources: false,
    sources: [
      {
        layer: damagePoints,
        searchFields: ["SECTION_ID"],
        displayField: "SECTION_ID",
        exactMatch: false,
        outFields: ["SECTION_ID"],
        name: "Section ID",
        placeholder: "Section ID"
    }
    ]
    });
    
    view.ui.add(searchWidget, "top-left");
    
    let homeWidget = new Home({
    view: view
    });
    
    // adds the home widget to the top left corner of the MapView
    view.ui.add(homeWidget, "top-left");
    
    // Full screen logo
    var fullScreen = new Fullscreen({
      view: view,
      element: applicationDiv
    });
    
    view.ui.add(fullScreen, "top-left")
    
    
    var legend = new Legend({
    view: view,
    container: legendDiv,
    layerInfos: [
      {
          layer: damagePoints,
          title: "Damage Ratings of Road"
      },
    {
      layer: majorRoadLayer,
      title: "Major Raod"
    },
    {
      layer: expressRoad,
      title: "Expressway"
    },
    {
      layer: municipalBoundary,
      title: "Municipal Boundary"
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
      position: "bottom-left"
    });
    
    
    // LayerList and Add legend to the LayerList
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
      group: "top-right"
    });
    view.ui.add(layerListExpand, {
      position: "bottom-left"
    });
    

    });