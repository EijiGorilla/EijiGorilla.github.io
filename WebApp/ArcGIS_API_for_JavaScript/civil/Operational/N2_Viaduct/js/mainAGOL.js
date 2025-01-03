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
    "esri/PopupTemplate",
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
    "esri/TimeExtent",
    "esri/widgets/Search",
    "esri/widgets/BasemapToggle",
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
    "esri/layers/GraphicsLayer",
    "esri/core/Accessor",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/geometryEngine"
  ], function(Basemap, Map, MapView, SceneView, FeatureLayer, FeatureFilter,
              SceneLayer, Layer, TileLayer, VectorTileLayer,
              LabelClass, LabelSymbol3D, WebMap,
              WebScene, PortalItem, Portal, PopupTemplate,
              TimeSlider, Legend, LayerList, Fullscreen,
              geometryService, Query,
              StatisticDefinition, WebStyleSymbol,
              TimeExtent, Expand, Editor, UniqueValueRenderer,
              DatePicker, FeatureTable, Compass, TimeExtent, Search, BasemapToggle,
              Weather, Daylight, Polyline, GraphicsLayer, Graphic, Point,
              externalRenderers, SpatialReference, route, RouteParameters, FeatureSet,
              GraphicsLayer, Accessor, SimpleMarkerSymbol, SimpleLineSymbol, geometryEngine) {
  
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
  
  // Basemap
  var basemap = new Basemap({
    baseLayers: [
      new VectorTileLayer({
        portalItem: {
          id: "8a9ef2a144e8423786f6139408ac3424"
        }
      })
    ]
  });
  
  // Add Map
  var map = new Map({
    basemap: basemap, // "streets-night-vector"
    ground: "world-elevation" // ground: "no"
  }); 
  //map.ground.surfaceColor = "#FFFF";
  //map.ground.opacity = 0.5;
           
  // Add scene view
  var view = new SceneView({
    map: map,
    container: "viewDiv",
    viewingMode: "local",
    camera: {
      position: {
        x: 120.75200,
        y: 14.90,
        z: 2500
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
        
  // Error Abort function 
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
      var pl = geometryEngine.densify(routeResult.geometry, 0.5, "meters");
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





/// Camera animation
const camera = view.camera.clone();

const pt1 = {x: 120.58066534, y: 15.18190446, z: 193.6964};
const pt2 = {x: 120.57976213, y: 15.1870787, z: 128.02725};
const pt3 = {x: 120.57975569, y: 15.19070198, z: 138.165};
const pt4 = {x: 120.57831507, y: 15.19802226, z: 183.82172};
const pt5 = {x: 120.57478353, y: 15.20799639, z: 145.15981};
const pt6 = {x: 120.57369966, y: 15.21207364, z: 138.33217};

const comp_pts = [pt1, pt2, pt3, pt4, pt5, pt6];
const heading_pts = [331.62, 334.31, 336.19, 323.47, 311.74, 289.63];
const tilt_pts = [72.29, 81.91, 78.58, 72.66, 72.48, 73.59];

let abort = false;
async function startAnimation(slideNo) {
  play.style.display = "none";
  pause.style.display = "block";
    if (!view.interactingj && !abort) {

        if (slideNo < comp_pts.length) {
            if (slideNo === 0) {
                camera.heading = heading_pts[slideNo];
                camera.tilt = tilt_pts[slideNo];
            } else {
                camera.heading = heading_pts[slideNo];
            }
            camera.tilt = tilt_pts[slideNo];
            camera.position = comp_pts[slideNo];
    
            await view.goTo(camera, {animate: true, speedFactor: 0.3, easing: "linear"});
            //requestAnimationFrame(startAnimation);
            window.setTimeout(function() {
                startAnimation(slideNo + 1);
            }, 0);
        }
    } else {
        abort = true;
        play.style.display = "block";
        pause.style.display = "none";
    }
}

// Initialization
play.onclick = initialization;
pause.onclick = function() {
    play.style.display = "block";
    pause.style.display = "none";
    abort = true;
};

async function initialization() {
  abort = false;

  document.getElementById("N-04").checked = true;
  viaductLayer.definitionExpression = "CP = 'N-04'";
  PierNoLayer.definitionExpression = "CP = 'N-04'";

  addStop();
  await startAnimation(0);
  /*
    window.setTimeout(function() {
        startAnimation(0);
    }, 1)
    */
}


////////// 



  
  //*******************************//
  // Label Class Property Settings //
  //*******************************//
  // Chainage Label
  var labelChainage = new LabelClass({
    labelExpressionInfo: {expression: "$feature.KmSpot"},
    symbol: {
      type: "text",
      color: [85, 255, 0],
      size: 25
    }
  });
  
  // Pier No Label
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
        screenLength: 40,
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
  
  //*****************************//
  //      Renderer Settings      //
  //*****************************//
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
  
  // Legend Color for Viaduct Layer
  // 0.1: more transparent, 0.9: not transparent 
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
  
          
  //*******************************//
  // Import Layers                 //
  //*******************************//
  // Station Layer
  var stationLayer = new SceneLayer({
    portalItem: {
            id: "212904618a1f44c1a78e2446d905e679"
          },
  labelingInfo: [labelClass],
  renderer: stationsRenderer,
  elevationInfo: {
    mode: "relative-to-ground"
  },
  definitionExpression: "Extension = 'N2'"
              //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
});
stationLayer.listMode = "hide";
map.add(stationLayer, 0);
  
  // Centerline and chainage
  var chainageLayer = new FeatureLayer ({
    portalItem: {
            id: "3fddba70fc1746fbb917cf647d9b4118"
          },
  layerId: 0,
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
  
  // Pier No. (point feature)
  var PierNoLayer = new FeatureLayer ({
    portalItem: {
            id: "3fddba70fc1746fbb917cf647d9b4118"
          },
  layerId: 1,
  labelingInfo: [pierNoLabelClass],
  elevationInfo: {
    mode: "on-the-ground" //absolute-height, relative-to-ground
  },
  title: "Pier No",
  outFields: ["*"],
  popupEnabled: false
});
map.add(PierNoLayer, 1);

  // PROW //
  var rowLayer = new FeatureLayer ({
    portalItem: {
            id: "30ce40d4da364a628dbb2c0234c5b2e1"
          },
  layerId: 49,
  title: "ROW",
  popupEnabled: false
});
map.add(rowLayer,2);
  
var viaductLayer = new SceneLayer({
 portalItem: {
       id: "01ce59e532d148bfa74f50301ea8124a"
     },
     //3d6b2d59343c46ea907395d4af1db454
     
// popupTemplate: viadTemplate,
elevationInfo: {
mode: "absolute-height" //absolute-height, relative-to-ground
},
title: "Viaduct sample",
outFields: ["*"],   
});
viaductLayer.listMode = "hide";
map.add(viaductLayer);

// Symbology for Viaduct Layer
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


  
  //*******************************//
  //      Progress Chart           //
  //*******************************//
  // Total progress //
  function perCpProgress() {
  var total_complete = {
    onStatisticField: "CASE WHEN Status1 = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_complete",
    statisticType: "sum"
  };
  
  var total_obs = {
    onStatisticField: "Status1",
    outStatisticFieldName: "total_obs",
    statisticType: "count"
  };
  
  var query = viaductLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  
  viaductLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
  
    const total_complete = stats.total_complete;
    const total_obs = stats.total_obs;
    document.getElementById("totalProgressDiv").innerHTML = ((total_complete/total_obs)*100).toFixed(1) + " %";
  });
  }
  perCpProgress();
  
  // Function for zooming to selected layers */
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
  
  // Setup DOM
  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");
  var applicationDiv = document.getElementById("applicationDiv");
  const cpButtonElement = document.getElementById("cpButton");
  const monthlyProgressChartDiv = document.getElementById("monthlyProgressChartDiv");
  const chartElement = document.getElementById("chartPanel");
  
  
  //*******************************************************************//
  // CHART FUNCTION:
  //
  // All commands related to chart must fall inside am4core
  //*******************************************************************//
  
   // Create a Bar chart to calculate % completion for each viaduct sample
  am4core.ready(function() {
  am4core.useTheme(am4themes_animated);
  
  // Default label
  if (document.getElementById("N-01").checked = true) {
      viaductLayer.definitionExpression = "CP = 'N-01'";
      PierNoLayer.definitionExpression = "CP = 'N-01'";
      zoomToLayer(viaductLayer);
      chartAllViaduct();
      perCpProgress();
  }
  
  // click event handler for contract packages
  cpButtonElement.addEventListener("click", filterByTest);
  function filterByTest(event) {
    const selectedID = event.target.id;
  
    if(selectedID === "N-01") {
      viaductLayer.definitionExpression = "CP = '" + selectedID + "'";
      PierNoLayer.definitionExpression = "CP = '" + selectedID + "'";
   
      zoomToLayer(viaductLayer);
      chartAllViaduct();
      perCpProgress();
  
    } else if (selectedID === "N-02") {
      viaductLayer.definitionExpression = "CP = '" + selectedID + "'";
      PierNoLayer.definitionExpression = "CP = '" + selectedID + "'";
  
      zoomToLayer(viaductLayer);
      chartAllViaduct();
      perCpProgress();
  
    } else if (selectedID === "N-03") {
      viaductLayer.definitionExpression = "CP = '" + selectedID + "'";
      PierNoLayer.definitionExpression = "CP = '" + selectedID + "'";
  
      zoomToLayer(viaductLayer);
      chartAllViaduct();
      perCpProgress();
  
    } else if (selectedID === "N-04") {
      viaductLayer.definitionExpression = "CP = '" + selectedID + "'";
      PierNoLayer.definitionExpression = "CP = '" + selectedID + "'";
   
      zoomToLayer(viaductLayer);
      chartAllViaduct();
      perCpProgress();
  }
  }
  
  
  // CHART
  // 1. Bored pile
  function chartBoredPile() {
      var total_boredpile_incomp = {
          onStatisticField: "CASE WHEN (Type = 1 and Status1 = 1) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_boredpile_incomp",
          statisticType: "sum"
      }
  
      var total_boredpile_comp = {
          onStatisticField: "CASE WHEN (Type = 1 and Status1 = 4) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_boredpile_comp",
          statisticType: "sum"
      }
  
      var total_boredpile_delay = {
          onStatisticField: "CASE WHEN (Type = 1 and Status1 = 3) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_boredpile_delay",
          statisticType: "sum"
      }
  
      var query = viaductLayer.createQuery();
      query.outStatistics = [total_boredpile_incomp, total_boredpile_comp, total_boredpile_delay];
      query.returnGeometry = true;
  
      viaductLayer.queryFeatures(query).then(function(response) {
          var stats = response.features[0].attributes;
          const boredPile_incomp = stats.total_boredpile_incomp;
          const boredPile_comp = stats.total_boredpile_comp;
          const boredPile_delay = stats.total_boredpile_delay;
  
          var chart = am4core.create("chartBoredPileDiv", am4charts.XYChart);
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
              category: "Bored Pile",
              value1: boredPile_comp,
              value2: boredPile_delay,
              value3: boredPile_incomp,
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
      
          if (name === "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
  
          } else if (name === "Delay"){
              series.fill = am4core.color("#FF0000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
      
          } else {
              // When completed value is zero, show no labels.
              if (boredPile_comp === 0) {
                  labelBullet.label.text = "";
              } else {
                  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 15;
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
                  selectedStatus = 1;
              } else if (selectedC === "Delay"){
                  selectedStatus = 3;
              } else if (selectedC === "Complete") {
                  selectedStatus = 4;
              } else {
                  selectedLayer = null;
              }
              
              var highlight = null;
              // Update layerView based on viaduct components being selected
              view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                  viaductLayerView.filter = {
                      where: "Type = 1" + " AND " +  "Status1 = " + selectedStatus
                      //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                  };
                  
                  viaductLayerView.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      // Extract and obtain OBJECTID
                      let objID = [];
                      for (var i=0; i< rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      // Reset selection by clicking anywhere on the map
                      view.on("click", function() {
                          viaductLayerView.filter = null;
                          // highlight.remove();
                      });
                  });
              }); // whenLayerView
          } // End of filterByChart
      } // end of createSeries function
      createSeries("value1", "Complete");
      createSeries("value2", "Delay");
      createSeries("value3", "Incomplete");
  }); // end of queryFeatures
  } // end of chartBoredPileDiv
  
  // 2. Pile Cap
  function chartPileCap() {
      var total_pilecap_incomp = {
          onStatisticField: "CASE WHEN (Type = 2 and Status1 = 1) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pilecap_incomp",
          statisticType: "sum"
      }
  
      var total_pilecap_comp = {
          onStatisticField: "CASE WHEN (Type = 2 and Status1 = 4) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pilecap_comp",
          statisticType: "sum"
      }
  
      var total_pilecap_delay = {
          onStatisticField: "CASE WHEN (Type = 2 and Status1 = 3) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pilecap_delay",
          statisticType: "sum"
      }
  
      var query = viaductLayer.createQuery();
      query.outStatistics = [total_pilecap_incomp, total_pilecap_comp, total_pilecap_delay];
      query.returnGeometry = true;
  
      viaductLayer.queryFeatures(query).then(function(response) {
          var stats = response.features[0].attributes;
          const pileCap_incomp = stats.total_pilecap_incomp;
          const pileCap_comp = stats.total_pilecap_comp;
          const pileCap_delay = stats.total_pilecap_delay;
  
          var chart = am4core.create("chartPileCapDiv", am4charts.XYChart);
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
              category: "Pile Cap",
              value1: pileCap_comp,
              value2: pileCap_delay,
              value3: pileCap_incomp,
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
      
          if (name === "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
  
          } else if (name === "Delay"){
              series.fill = am4core.color("#FF0000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
      
          } else {
              // When completed value is zero, show no labels.
              if (pileCap_comp === 0) {
                  labelBullet.label.text = "";
              } else {
                  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 15;
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
                  selectedStatus = 1;
              } else if (selecteC === "Delay"){
                  selectedStatus = 3;
              } else if (selectedC === "Complete") {
                  selectedStatus = 4;
              } else {
                  selectedLayer = null;
              }
              
              var highlight = null;
              // Update layerView based on viaduct components being selected
              view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                  viaductLayerView.filter = {
                      where: "Type = 2" + " AND " +  "Status1 = " + selectedStatus
                      //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                  };
                  
                  viaductLayerView.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      // Extract and obtain OBJECTID
                      let objID = [];
                      for (var i=0; i< rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      // Reset selection by clicking anywhere on the map
                      view.on("click", function() {
                          viaductLayerView.filter = null;
                          // highlight.remove();
                      });
                  });
              }); // whenLayerView
          } // End of filterByChart
      } // end of createSeries function
      createSeries("value1", "Complete");
      createSeries("value2", "Delay");
      createSeries("value3", "Incomplete");
  }); // end of queryFeatures
  } // end of chartPileCap
  
  
  // 3. Pier
  function chartPier() {
      var total_pier_incomp = {
          onStatisticField: "CASE WHEN (Type = 3 and Status1 = 1) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pier_incomp",
          statisticType: "sum"
      }
  
      var total_pier_comp = {
          onStatisticField: "CASE WHEN (Type = 3 and Status1 = 4) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pier_comp",
          statisticType: "sum"
      }
  
      var total_pier_delay = {
          onStatisticField: "CASE WHEN (Type = 3 and Status1 = 3) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pier_delay",
          statisticType: "sum"
      }
  
      var query = viaductLayer.createQuery();
      query.outStatistics = [total_pier_incomp, total_pier_comp, total_pier_delay];
      query.returnGeometry = true;
  
      viaductLayer.queryFeatures(query).then(function(response) {
          var stats = response.features[0].attributes;
          const pier_incomp = stats.total_pier_incomp;
          const pier_comp = stats.total_pier_comp;
          const pier_delay = stats.total_pier_delay;
  
          var chart = am4core.create("chartPierDiv", am4charts.XYChart);
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
              category: "Pier",
              value1: pier_comp,
              value2: pier_delay,
              value3: pier_incomp,
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
      
          if (name === "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
  
          } else if (name === "Delay"){
              series.fill = am4core.color("#FF0000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
      
          } else {
              // When completed value is zero, show no labels.
              if (pier_comp === 0) {
                  labelBullet.label.text = "";
              } else {
                  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 15;
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
                  selectedStatus = 1;
              } else if (selecteC === "Delay"){
                  selectedStatus = 3;
              } else if (selectedC === "Complete") {
                  selectedStatus = 4;
              } else {
                  selectedLayer = null;
              }
              
              var highlight = null;
              // Update layerView based on viaduct components being selected
              view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                  viaductLayerView.filter = {
                      where: "Type = 3" + " AND " +  "Status1 = " + selectedStatus
                      //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                  };
                  
                  viaductLayerView.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      // Extract and obtain OBJECTID
                      let objID = [];
                      for (var i=0; i< rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      // Reset selection by clicking anywhere on the map
                      view.on("click", function() {
                          viaductLayerView.filter = null;
                          // highlight.remove();
                      });
                  });
              }); // whenLayerView
          } // End of filterByChart
      } // end of createSeries function
      createSeries("value1", "Complete");
      createSeries("value2", "Delay");
      createSeries("value3", "Incomplete");
  }); // end of queryFeatures
  } // end of chartPier
  
  
  // 4. Pier Head
  function chartPierHead() {
      var total_pierhead_incomp = {
          onStatisticField: "CASE WHEN (Type = 4 and Status1 = 1) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pierhead_incomp",
          statisticType: "sum"
      }
  
      var total_pierhead_comp = {
          onStatisticField: "CASE WHEN (Type = 4 and Status1 = 4) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pierhead_comp",
          statisticType: "sum"
      }
  
      var total_pierhead_delay = {
          onStatisticField: "CASE WHEN (Type = 4 and Status1 = 3) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_pierhead_delay",
          statisticType: "sum"
      }
  
      var query = viaductLayer.createQuery();
      query.outStatistics = [total_pierhead_incomp, total_pierhead_comp, total_pierhead_delay];
      query.returnGeometry = true;
  
      viaductLayer.queryFeatures(query).then(function(response) {
          var stats = response.features[0].attributes;
          const pierHead_incomp = stats.total_pierhead_incomp;
          const pierHead_comp = stats.total_pierhead_comp;
          const pierHead_delay = stats.total_pierhead_delay;
  
          var chart = am4core.create("chartPierHeadDiv", am4charts.XYChart);
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
              category: "Pier Head",
              value1: pierHead_comp,
              value2: pierHead_delay,
              value3: pierHead_incomp,
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
      
          if (name === "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
  
          } else if (name === "Delay"){
              series.fill = am4core.color("#FF0000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
      
          } else {
              // When completed value is zero, show no labels.
              if (pierHead_comp === 0) {
                  labelBullet.label.text = "";
              } else {
                  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 15;
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
                  selectedStatus = 1;
              } else if (selecteC === "Delay"){
                  selectedStatus = 3;
              } else if (selectedC === "Complete") {
                  selectedStatus = 4;
              } else {
                  selectedLayer = null;
              }
              
              var highlight = null;
              // Update layerView based on viaduct components being selected
              view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                  viaductLayerView.filter = {
                      where: "Type = 4" + " AND " +  "Status1 = " + selectedStatus
                      //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                  };
                  
                  viaductLayerView.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      // Extract and obtain OBJECTID
                      let objID = [];
                      for (var i=0; i< rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      // Reset selection by clicking anywhere on the map
                      view.on("click", function() {
                          viaductLayerView.filter = null;
                          // highlight.remove();
                      });
                  });
              }); // whenLayerView
          } // End of filterByChart
      } // end of createSeries function
      createSeries("value1", "Complete");
      createSeries("value2", "Delay");
      createSeries("value3", "Incomplete");
  }); // end of queryFeatures
  } // end of chartPierHeadDiv
  
  
  // 5. Precast
  function chartPrecast() {
      var total_precast_incomp = {
          onStatisticField: "CASE WHEN (Type = 5 and Status1 = 1) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_precast_incomp",
          statisticType: "sum"
      }
  
      var total_precast_comp = {
          onStatisticField: "CASE WHEN (Type = 5 and Status1 = 4) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_precast_comp",
          statisticType: "sum"
      }
  
      var total_precast_delay = {
          onStatisticField: "CASE WHEN (Type = 5 and Status1 = 3) THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_precast_delay",
          statisticType: "sum"
      }
  
      var query = viaductLayer.createQuery();
      query.outStatistics = [total_precast_incomp, total_precast_comp, total_precast_delay];
      query.returnGeometry = true;
  
      viaductLayer.queryFeatures(query).then(function(response) {
          var stats = response.features[0].attributes;
          const preCast_incomp = stats.total_precast_incomp;
          const preCast_comp = stats.total_precast_comp;
          const preCast_delay = stats.total_precast_delay;
  
          var chart = am4core.create("chartPrecastDiv", am4charts.XYChart);
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
              category: "Precast",
              value1: preCast_comp,
              value2: preCast_delay,
              value3: preCast_incomp,
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
      
          if (name === "Incomplete"){
              series.fill = am4core.color("#FF000000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
  
          } else if (name === "Delay"){
              series.fill = am4core.color("#FF0000");
              labelBullet.label.text = "";
              labelBullet.label.fill = am4core.color("#FFFFFFFF");
              labelBullet.label.fontSize = 0;
      
          } else {
              // When completed value is zero, show no labels.
              if (preCast_comp === 0) {
                  labelBullet.label.text = "";
              } else {
                  labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              };
              series.fill = am4core.color("#00B0F0"); // Completed
              //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
              labelBullet.label.fill = am4core.color("#ffffff");
              labelBullet.label.fontSize = 15;
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
                  selectedStatus = 1;
              } else if (selecteC === "Delay"){
                  selectedStatus = 3;
              } else if (selectedC === "Complete") {
                  selectedStatus = 4;
              } else {
                  selectedLayer = null;
              }
              
              var highlight = null;
              // Update layerView based on viaduct components being selected
              view.whenLayerView(viaductLayer).then(function (viaductLayerView) {
                  viaductLayerView.filter = {
                      where: "Type = 5" + " AND " +  "Status1 = " + selectedStatus
                      //where: "Status1 = '" + selectedC + "'" + " AND " + "Layer = '" + selectedStatus + "'" 
                  };
                  
                  viaductLayerView.queryFeatures().then(function(results) {
                      const ggg = results.features;
                      const rowN = ggg.length;
                      
                      // Extract and obtain OBJECTID
                      let objID = [];
                      for (var i=0; i< rowN; i++) {
                          var obj = results.features[i].attributes.OBJECTID;
                          objID.push(obj);
                      }
                      
                      // Reset selection by clicking anywhere on the map
                      view.on("click", function() {
                          viaductLayerView.filter = null;
                          // highlight.remove();
                      });
                  });
              }); // whenLayerView
          } // End of filterByChart
      } // end of createSeries function
      createSeries("value1", "Complete");
      createSeries("value2", "Delay");
      createSeries("value3", "Incomplete");
  }); // end of queryFeatures
  } // end of chartPrecastDiv
  
  // Compile function
  function chartAllViaduct(){
      chartBoredPile();
      chartPileCap();
      chartPier();
      chartPierHead();
      chartPrecast();
  }
  
  
  
  // Time line bar charts //
  // This stacked bar charnts show monthly construction progress by year and components
  //************************************
  // Define Year, Month, and Types
  
  const pile_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  const pile_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
  const pileC_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  const pileC_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
  const pier_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  const pier_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
  const pierH_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
  const pierH_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
  
  const precast_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  const precast_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
   
  // OPTION 1:
    function summaryStats(){
      const pile_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      const pile_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      
      const pileC_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      const pileC_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      
      const pier_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      const pier_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
      const pierH_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
      const pierH_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],};
  
      const precast_2021 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
      const precast_2022 = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []};
  
   
      var total_count = {
      onStatisticField: "CASE WHEN Status1 = 4 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_count",
      statisticType: "sum"
    }
  
    var query = viaductLayer.createQuery();
    query.where = "Year IS NOT NULL";
  query.outStatistics = [total_count];
  //query.orderByFields = ["Type Year Month"];
  query.groupByFieldsForStatistics = ["Type", "Year", "Month"];
  
    return viaductLayer.queryFeatures(query).then(function(response) {
      stats = response.features;
      
      stats.forEach((result, index) => {
        const attributes = result.attributes;
        const TYPE = attributes.Type;
        const YEAR = attributes.Year;
        const MONTH = attributes.Month;
        const DATE = attributes.end_date;
        const VALUE = attributes.total_count;
  
        // Type = 1 (Bored Piles)
        if(TYPE === 1 && YEAR === 2021){
          pile_2021[MONTH].push(VALUE);
  
        } else if (TYPE === 1 && YEAR === 2022){
          pile_2022[MONTH].push(VALUE);
  
        } else if (TYPE === 2 && YEAR === 2021){
          pileC_2021[MONTH].push(VALUE);
  
        } else if (TYPE === 2 && YEAR === 2022){
          pileC_2022[MONTH].push(VALUE);
          
        } else if (TYPE === 3 && YEAR === 2021){
          pier_2021[MONTH].push(VALUE);
          
        } else if (TYPE === 3 && YEAR === 2022){
          pier_2022[MONTH].push(VALUE);
          
        } else if (TYPE === 4 && YEAR === 2021){
          pierH_2021[MONTH].push(VALUE);
          
        } else if (TYPE === 4 && YEAR === 2022){
          pierH_2022[MONTH].push(VALUE);
          
        } else if (TYPE === 5 && YEAR === 2021){
          precast_2021[MONTH].push(VALUE);
          
        } else if (TYPE === 5 && YEAR === 2022){
          precast_2022[MONTH].push(VALUE);
          
        }
  
      });
      return [pile_2021, pile_2022,
              pileC_2021, pileC_2022,
              pier_2021, pier_2022,
              pierH_2021, pierH_2022,
              precast_2021, precast_2022];
  });
    }
  //*************************************
  
  function MonthlyProgressChart([pile_2021, pile_2022,
              pileC_2021, pileC_2022,
              pier_2021, pier_2022,
              pierH_2021, pierH_2022,
              precast_2021, precast_2022]){
  
  
  var chart = am4core.create("monthlyProgressChartDiv", am4charts.XYChart);
  
  // Add data
  chart.data = [
    {
    date: new Date(2020, 12), // Jan. 2021
    value1: pile_2021[1],
    value2: pileC_2021[1],
    value3: pier_2021[1],
    value4: pierH_2021[1],
    value5: precast_2022[1]
  },
  {
    date: new Date(2021, 1),
    value1: pile_2021[2],
    value2: pileC_2021[2],
    value3: pier_2021[2],
    value4: pierH_2021[2],
    value5: precast_2021[2]
  },
  {
    date: new Date(2021, 2),
    value1: pile_2021[3],
    value2: pileC_2021[3],
    value3: pier_2021[3],
    value4: pierH_2021[3],
    value5: precast_2021[3]
  },
  {
    date: new Date(2021, 3),
    value1: pile_2021[4],
    value2: pileC_2021[4],
    value3: pier_2021[4],
    value4: pierH_2021[4],
    value5: precast_2021[4]
  },
  {
    date: new Date(2021, 4),
    value1: pile_2021[5],
    value2: pileC_2021[5],
    value3: pier_2021[5],
    value4: pierH_2021[5],
    value5: precast_2021[5]
  },
  {
    date: new Date(2021, 5),
    value1: pile_2021[6],
    value2: pileC_2021[6],
    value3: pier_2021[6],
    value4: pierH_2021[6],
    value5: precast_2021[6]
  },
  {
    date: new Date(2021, 6),
    value1: pile_2021[7],
    value2: pileC_2021[7],
    value3: pier_2021[7],
    value4: pierH_2021[7],
    value5: precast_2021[7]
  },
  {
    date: new Date(2021, 7),
    value1: pile_2021[8],
    value2: pileC_2021[8],
    value3: pier_2021[8],
    value4: pierH_2021[8],
    value5: precast_2021[8]
  },
  {
    date: new Date(2021, 8),
    value1: pile_2021[9],
    value2: pileC_2021[9],
    value3: pier_2021[9],
    value4: pierH_2021[9],
    value5: precast_2021[9]
  },
  {
    date: new Date(2021, 9),
    value1: pile_2021[10],
    value2: pileC_2021[10],
    value3: pier_2021[10],
    value4: pierH_2021[10],
    value5: precast_2021[10]
  },
  {
    date: new Date(2021, 10),
    value1: pile_2021[11],
    value2: pileC_2021[11],
    value3: pier_2021[11],
    value4: pierH_2021[11],
    value5: precast_2021[11]
  },
  {
    date: new Date(2021, 11),
    value1: pile_2021[12],
    value2: pileC_2021[12],
    value3: pier_2021[12],
    value4: pierH_2021[12],
    value5: precast_2021[12]
  },
  {
    date: new Date(2021, 12),
    value1: pile_2022[1],
    value2: pileC_2022[1],
    value3: pier_2022[1],
    value4: pierH_2022[1],
    value5: precast_2022[1]
  },
  {
    date: new Date(2022, 1),
    value1: pile_2022[2],
    value2: pileC_2022[2],
    value3: pier_2022[2],
    value4: pierH_2022[2],
    value5: precast_2022[2]
  },
  {
    date: new Date(2022, 2),
    value1: pile_2022[3],
    value2: pileC_2022[3],
    value3: pier_2022[3],
    value4: pierH_2022[3],
    value5: precast_2022[3]
  },
  {
    date: new Date(2022, 3),
    value1: pile_2022[4],
    value2: pileC_2022[4],
    value3: pier_2022[4],
    value4: pierH_2022[4],
    value5: precast_2022[4]
  },
  {
    date: new Date(2022, 4),
    value1: pile_2022[5],
    value2: pileC_2022[5],
    value3: pier_2022[5],
    value4: pierH_2022[5],
    value5: precast_2022[5]
  },
  {
    date: new Date(2022, 5),
    value1: pile_2022[6],
    value2: pileC_2022[6],
    value3: pier_2022[6],
    value4: pierH_2022[6],
    value5: precast_2022[6]
  },
  {
    date: new Date(2022, 6),
    value1: pile_2022[7],
    value2: pileC_2022[7],
    value3: pier_2022[7],
    value4: pierH_2022[7],
    value5: precast_2022[7]
  },
  {
    date: new Date(2022, 7),
    value1: pile_2022[8],
    value2: pileC_2022[8],
    value3: pier_2022[8],
    value4: pierH_2022[8],
    value5: precast_2022[8]
  },
  {
    date: new Date(2022, 8),
    value1: pile_2022[9],
    value2: pileC_2022[9],
    value3: pier_2022[9],
    value4: pierH_2022[9],
    value5: precast_2022[9]
  }
  ];
  
  //** Legend Properties
  const LegendFontSizze = 14;
  chart.legend = new am4charts.Legend();
  
  /// Alignment of Legend
  chart.legend.valueLabels.template.align = "right"
  chart.legend.valueLabels.template.textAlign = "end";  
  
  /// Position, Font Size, Fill
  chart.legend.position = "bottom";
  chart.legend.labels.template.fontSize = LegendFontSizze;
  chart.legend.labels.template.fill = "#ffffff";
  chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
  chart.legend.valueLabels.template.fontSize = LegendFontSizze;
  
  /// Legend marker size and shape and color
  var marker = chart.legend.markers.template.children.getIndex(0);
  var markerTemplate = chart.legend.markers.template;
  marker.cornerRadius(12, 12, 12, 12);
  marker.strokeWidth = 1;
  marker.strokeOpacity = 1;
  marker.stroke = am4core.color("#ccc");
  markerTemplate.width = 16;
  markerTemplate.height = 16;
  
  //** Category Axis Properties
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
  
  //** Create series function for bar chart
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
  createSeries("value1", "Pile");
  createSeries("value2", "Pile Cap");
  createSeries("value3", "Pier");
  createSeries("value4", "Pier Head");
  createSeries("value5", "Precast");
  // Create scrollbars
  //chart.scrollbarX = new am4core.Scrollbar();
  //chart.scrollbarY = new am4core.Scrollbar();
  }
  
  // Monthly Progress Chart
  var monthlyProgressInput = document.getElementById("monthlyProgressInput");
  view.when(function() {
    monthlyProgressInput.addEventListener("change", function(event) {
      
      if (event.target.checked === true){
        summaryStats().then(MonthlyProgressChart);
        monthlyProgressChartDiv.style.display = 'block';
      } else if (event.target.checked === false) {
        monthlyProgressChartDiv.style.display = 'none';
      }
      
      //monthlyProgressChartDiv.removeAttr("style");
      //event.target.checked ? summaryStats().then(MonthlyProgressChart) : monthlyProgressChartDiv.style.display = 'none';
     
      });
      view.ui.add("menu", "bottom-right");
  
  });
  // Progress Bar Charts //
  // Pile
  
  
  }); // end am4core.ready()
  
  // Editor: enable when necessary
  /*
  view.when(function () {
    view.popup.autoOpenEnabled = true; //disable popups
    // Create the Editor
    const editor = new Editor({
      view: view
    });
    // Add widget to top-right of the view
    view.ui.add(editor, "top-right");
  });
  */
  
  // Monthly Progress Chart 
  const progressExpand = new Expand({
    view: view,
    content: document.getElementById("monthlyProgressChartDiv"),
    expandIconClass: "esri-icon-filter"
  });
  
  // LayerList and Add legend to the LayerList
  var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event) {
      const item = event.item;
      if (item.title === "Chainage" || item.title === "OpenStreetMap 3D Buildings"){
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
  
  
  // Legend
  var legend = new Legend({
    view: view,
    container: document.getElementById("legendDiv"),
    layerInfos: [
      {
        layer: rowLayer,
        title: "PROW"
      },
      {
        layer: chainageLayer,
        title: "chainage"
      },
      {
        layer: PierNoLayer,
        title: "Pier No."
      },
      {
        layer: osm3D,
        title: "OpenStreetMap 3D Buildings"
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
  
  // Empty top-left widget
  view.ui.empty("top-left");
  
  // See-through-Ground
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
            
  document.getElementById("opacityInput")
          .addEventListener("change", function(event) {
            map.ground.opacity = event.target.checked ? 0.1 : 0.6;
          });
  view.ui.add("menu", "bottom-right");
  
  
  
  //Search Widget 
  var searchWidget = new Search({
    view: view,
    locationEnabled: false,
    allPlaceholder: "Chainage or Utility ID",
    includeDefaultSources: false,
    sources: [
      {
        layer: chainageLayer,
        searchFields: ["KmSpot"],
        displayField: "KmSpot",
        exactMatch: false,
        outFields: ["KmSpot"],
        name: "Main KM",
        placeholder: "example: 80+400"
    },
    {
        layer: viaductLayer,
        searchFields: ["PierNumber"],
        displayField: "PierNumber",
        exactMatch: false,
        outFields: ["PierNumber"],
        name: "Pier No.",
        placeholder: "example: PLK-01"
    },
    {
        layer: viaductLayer,
        searchFields: ["OBJECTID"],
        displayField: "OBJECTID",
        exactMatch: false,
        outFields: ["OBJECTID"],
        name: "OBJECTID",
        placeholder: "example: 12617"
    }
  ]
  });
  
  const searchExpand = new Expand({
    view: view,
    content: searchWidget,
    expandIconClass: "esri-icon-search"
  });
  view.ui.add(searchExpand, {
    position: "top-right"
  });
  
  searchExpand.watch("expanded", function() {
    if(!searchExpand.expanded) {
      searchWidget.searchTerm = null;
    }
  });
  
  // Full screen widget
  view.ui.add(
    new Fullscreen({
      view: view,
      element: viewDiv
      //element: viewDiv // if you change element to viewDiv, only viewDiv panel is fully expanded
      // this is good for demonstration, as this removes header and chart panels.
    }),
    "top-right"
  );
  
  // Compass
  var compassWidget = new Compass({
    view: view
  });
  view.ui.add(compassWidget, "top-right");
  });
  