require([
    "esri/core/Accessor",
    "esri/Map",
    "esri/views/SceneView",
    "esri/geometry/Point",
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
    "esri/layers/SceneLayer",
    "esri/symbols/WebStyleSymbol",
    "esri/widgets/Fullscreen",
    "dojo/on",
    "dojo/query",
    "dojo/domReady!"
  ],
  function (
  Accessor,
    Map,
    SceneView,
    Point,
    Polyline,
    externalRenderers,
    SpatialReference,
    route,
    RouteParameters,
    FeatureSet,
    GraphicsLayer,
    Graphic,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    Color,
    geometryEngine,
    urlUtils,
    SceneLayer,
    WebStyleSymbol,
    Fullscreen,
    on,
    query
  ) {
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
      // Create a map
      //////////////////////////////////////////////////////////////////////////////////////
      var map = new Map({
          basemap: "hybrid",
          ground: "world-elevation",
        layers: [routeLyr]
      });
  
      // Create a SceneView
      //////////////////////////////////////////////////////////////////////////////////////
      var view = new SceneView({
          container: "viewDiv",
          map: map,
          viewingMode: "local",
          camera: {
              position: {
                  x: 120.5707665,
                  y: 15.18042317,
                  z: 600,
                  spatialReference: SpatialReference.WGS84
              },
              heading: 60,
              tilt: 70
          },
          environment: {
              background: {
                  type: "color", // autocasts as new ColorBackground()
                  color: [0, 0, 0, 1]
              },
              lighting: {
                // enable shadows for all the objects in a scene
                directShadowsEnabled: true,
                // set the date and a time of the day for the current camera location
                date: new Date("Sat Oct 15 2022 02:00:00 GMT+0100 (CET)")
              }
          }
      });   
  
    // Add viaduct
    let viaductSymbol = {
      type: "mesh-3d",  // autocasts as new MeshSymbol3D()
      symbolLayers: [{
        type: "fill",  // autocasts as new FillSymbol3DLayer()
        material: {color: [204, 204, 204],
                  colorMixMode: "replace"
              }
      }]
    };
    
    var viaductLayer = new SceneLayer({
      portalItem: {
        id: "01ce59e532d148bfa74f50301ea8124a"
      },
      definitionExpression: "CP = 'N-04'"
    });
  
    viaductLayer.renderer = {
      type: "simple",
      symbol: viaductSymbol
    }
  
    map.add(viaductLayer);
  
  
    // OSM 3D
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
    
    /*
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
  
  */
    ///
  
  
      // Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
      //on(view, "click", addStop);
      view.on("click", function() {
          addStop();
          animation.play();
          animation2.play();
  
      });
  
      function addStop(event) {
  
          // Add a point at the location of the map click
          //var stop = new Graphic({
          //    geometry: event.mapPoint,
          //    symbol: stopSymbol
          //});
  
          var stop1 = new Graphic({
              geometry: new Point({x: 13422812.716400001, y: 1710317.0639999993, z: 115.65110000000277, spatialReference: SpatialReference.WebMercator}),
              symbol: stopSymbol
          });
          routeLyr.add(stop1);
  
          var stop2 = new Graphic({
              geometry: new Point({x: 13422004.020599999, y: 1713789.0846000016, z: 105.54970000000321, spatialReference: SpatialReference.WebMercator }),
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
        var pl = geometryEngine.densify(routeResult.geometry, 0.1, "meters");
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
          issScale: 3,                                     // scale for the iss model
          issScale2: 20,
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
  
              var issMeshUrl = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/externalRendererSkeleton/models/train_locomotive.glb"; 
                  
                 //"https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/externalRendererSkeleton/models/train_locomotive.glb"
             //     "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Truck.gltf";
             // "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Running3.glb"; 
             //"https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Wraith_Animated.glb";
              // "https://EijiGorilla.github.io/glTF/canoe.glb"
  
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
  
                 //this.iss.update(stepSize);
                  //this.clips = this.iss.animations;
                  // update animated object
                  // requestAnimationFrame();
              
              }.bind(this), undefined, function(error) {
                  console.error("Error loading ISS mesh. ", error);
              });

              // 2nd Object
              let example2 = new THREE.Object3D();
              var issMeshUrl2 = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Running.glb"; 
              //"https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Waterwheel.glb"
              //"https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/Car4ReScaled.glb"
              loaderGLTF.load(issMeshUrl2, function(gltf) {
                console.log("ISS2 mesh loaded");

                example2 = gltf.scene;
                this.iss2 = example2;

                // apply ISS material to all nodes in the geometry
                //this.iss2.traverse( function ( child ) {
                //    if ( child instanceof THREE.Mesh ) {
                //        child.material = this.issMaterial;
                //   }
                //}.bind(this));

                this.iss2.scale.set(this.issScale2, this.issScale2, this.issScale2)
                this.scene.add(this.iss2);
                console.log("ISS2 mesh added");

                this.mixer2 = new THREE.AnimationMixer(this.iss2);
                this.mixer2.clipAction(gltf.animations[0]).play();



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
                const offset = 9;
                const offsetZ = -5;
  
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
              // 2nd object
              if (this.iss2) {
                       
                // Add this.mixer.update first; otherwise, the object will not be animated.s
                if (this.mixer) {
                    var scale2 = 80; //this.gui.getTimeScale();
                    var delta = this.clock.getDelta() * scale2;

                  this.mixer2.update(delta);         
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
              const offset = 40;
              const offsetZ = -5;

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

               this.iss2.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
              
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
              this.iss2.up = this.up;
              
              this.iss2.lookAt(rotation.elements[12], rotation.elements[13], rotation.elements[14]);
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
  
  
  // Anime.js for Airplane and others
  
  
  var scale = 20;
  var scale2 = 1.5;
  
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
  
  var democar1 = new Graphic({
      geometry: { ...point1, type: "point" }
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
  
      var symbol2 = await webStyleSymbol2.fetchSymbol();
      symbol2.symbolLayers.items[0].heading = 80;
      symbol2.symbolLayers.items[0].height *= scale;
      symbol2.symbolLayers.items[0].depth *= scale;
      symbol2.symbolLayers.items[0].width *= scale;
      symbol2.symbolLayers.items[0].material.color *= "white";
      symbol2.symbolLayers.items[0].size *= 0.5;
  
  
      plane.symbol = symbol;
      democar1.symbol = symbol2;
  
      graphicsLayer.addMany([plane, democar1]);
      })();
  
      (async () => {
          await view.when();
          view.map.basemap.referenceLayers = [];
          view.map.add(graphicsLayer);
          view.environment.atmosphere.quality = "high";
        })();
  
        var point = plane.geometry.clone();
        var pointCar = democar1.geometry.clone();
  
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
  
      // Democar 1: Sphere
          // 2. Second 
          var animation2 = anime.timeline({
              autoplay: true,
              direction: 'alternate',
              targets: pointCar,
              loop: true,
              duration: 1000,
              update: function() {
                democar1.geometry = pointCar.clone();
              }
              });
  
          animation2.add({...point1, easing: 'linear'})
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
          .add({z: 0, easing: 'easeOutSine'},0)
  
  
  // Anime.js
  view.ui.add(
      new Fullscreen({
        view: view,
        element: viewDiv
        //element: viewDiv // if you change element to viewDiv, only viewDiv panel is fully expanded
        // this is good for demonstration, as this removes header and chart panels.
      }),
      "top-right"
    );
  
  
      view.when(function() {
          // allow navigation above and below the ground
          map.ground.navigationConstraint = {
              type: "none"
          };
          // the webscene has no basemap, so set a surfaceColor on the ground
          map.ground.surfaceColor = "#fff";
  
          // to see through the ground, set the ground opacity to 0.4
          map.ground.opacity = 0.9;
      });
  });