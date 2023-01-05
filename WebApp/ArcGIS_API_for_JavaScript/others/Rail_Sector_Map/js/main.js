require([
  "esri/Basemap",
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/SceneLayer",
  "esri/layers/VectorTileLayer",
  "esri/layers/support/LabelClass",
  "esri/widgets/Fullscreen",
  "esri/rest/support/Query",
  "esri/renderers/UniqueValueRenderer",
], function(Basemap, Map, SceneView, 
            FeatureLayer, 
            SceneLayer, VectorTileLayer,
            LabelClass, Fullscreen, Query, UniqueValueRenderer) {

  var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "3a62040541b84f528da3ac7b80cf4a63" 
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
              x: 121.07,
              y: 14.50,
              z: 2500
              },
              tilt: 80
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
  // Setup UI

  var applicationDiv = document.getElementById("applicationDiv");
  var titleDiv = document.getElementById("titleDiv");
  //titleDiv.innerHTML = "Rail Sector Maps";

  //********** Import Layers**********

  // When a scene layer is published using 'Copy All' view.goTo did not work
  // It worked when the scene layer is published in 'Reference Registered Data'

  //********* Define LabelingInfo *************//
  var stationLabelMMSP = new LabelClass({
      type: "label-3d", // autocasts as new LabelSymbol3D()
      labelPlacement: "above-center",
      labelExpressionInfo: {
      expression: "When($feature.Project == 'MMSP', $feature.Station, '')"
    },
      symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: [255, 235, 190]
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
      }
    }
  });

  var stationLabelNSCR = new LabelClass({
      type: "label-3d", // autocasts as new LabelSymbol3D()
      labelPlacement: "above-center",
      labelExpressionInfo: {
      expression: "When($feature.Project == 'NSCR', $feature.Station, '')"
    },
      symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: [255, 235, 190]
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
      }
    }
  });

  var stationLabelNSCREX = new LabelClass({
      type: "label-3d", // autocasts as new LabelSymbol3D()
      labelPlacement: "above-center",
      labelExpressionInfo: {
      expression: "When($feature.Project == 'NSCR-Ex', $feature.Station, '')"
      },
      symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: [255, 235, 190]
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
      }
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
            color: "orange"
          },
          size: 15,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
           // weight: "bold"
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

  // convenience function to retrieve the WebStyleSymbols based on their name
  var verticalOffsetStation = {
screenLength: 200,
maxWorldLength: 300,
minWorldLength: 50
};


  function getUniqueValueSymbol(name, color, sizeS) {
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

      verticalOffset: verticalOffsetStation,

      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: "grey",
        size: 0.4,
        border: {
          color: "grey"
        }
      }
    }
    };



  //********* Set Renderer
  /* Company and Utilty Relocation Status Symbols with Callout */
var stationsRenderer = {
type: "unique-value",
field: "Sector",
valueExpression: "When($feature.Sector == 'MMSP', 'MMSP', \
                     $feature.Sector == 'MCRP', 'MCRP', \
                     $feature.Sector == 'NSRP', 'NSRP', \
                     $feature.Sector == 'NSCR', 'NSCR', $feature.Sector)",
uniqueValueInfos: [
  {
      value: "MMSP",
      symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/station_symbol_mmsp.png",
          "#D13470",
          20
      )
  },
  {
      value: "MCRP",
      symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/station_symbol_nscrex.png",
          "#D13470",
          20
      )
  },
  {
    value: "NSRP",
    symbol: getUniqueValueSymbol(
        "https://EijiGorilla.github.io/Symbols/station_symbol_nscrex.png",
        "#D13470",
        20
    )
  },
  {
      value: "NSCR",
      symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/station_symbol_nstren.png",
          "#D13470",
          20
      )
  }
]
};


// Station Line Color
const stationColor = {
  'MMSP': [205, 97, 85],
  'MCRP': [102, 153, 205],
  'NSRP': [102, 153, 205],
  'NSCR': [112, 168, 0]
};

//********** Read Feature and Scene Layers
   // Station point feature
  var stationLayer = new SceneLayer({
      portalItem: {
          id: "90dc71a2f98546f98b61af29a205ba0c",
          portal: {
              url: "https://gis.railway-sector.com/portal"
          }
      },
      //labelingInfo: [stationLabelMMSP, stationLabelNSCREX, stationLabelNSCR],
      renderer: stationsRenderer,
      labelingInfo: [labelClass],
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
      popupTemplate: {
        title: "<h5>{StnName}</h5>",
        lastEditInfoEnabled: false,
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Sector"
              },
              {
                fieldName: "Extension"
              },
              {
                fieldName: "CP"
              }
            ]
          }
        ]
      }
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer);


var stationLine = new FeatureLayer({
portalItem: {
          id: "283e48cb0b364a4088d3199e7a65f802",
          portal: {
              url: "https://gis.railway-sector.com/portal"
          }
      },
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
      popupTemplate: {
        defaultPopupTemplateEnabled: false
      }
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  //stationLine.listMode = "hide";
  map.add(stationLine);


function lineSizeShapeSymbolLayers(profile, cap, join, width, height, profileRotation, property){
return {
      type: "line-3d",
      symbolLayers: [
          {
              type: "path",
                profile: profile,
                material: {
                  color: stationColor[property]
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

function renderStationLine() {
const renderer = new UniqueValueRenderer({
  field: "Sector"
});

for (let property in stationColor) {
  if (property == 'MMSP') {
      renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad", "none", "miter", 8, 30, "heading", property)
      });
  } else if (property == 'MCRP' || property == 'NSRP') {
      renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad", "none", "miter", 8, 30, "heading", property)
      });
  } else if (property == 'NSCR') {
      renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad", "none", "miter", 8, 30, "heading", property)
      });
  }
}
stationLine.renderer = renderer;
}

renderStationLine();


//////////////////////////////
const cpButtonElement = document.getElementById("cpButton");

/* Function for zooming to selected layers */
function zoomToLayer(layer) {
    return layer.queryExtent().then((response) => {
      view.goTo(response.extent).catch((error) => {
        console.log(error);
      });
    });
  }
///////////////////////////
/*
var header = document.getElementById("myDIV");
var btns = header.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
btns[i].addEventListener("click", function() {
var current = document.getElementsByClassName("active");
current[0].className = current[0].className.replace(" active", "");
this.className += " active";
});
}
*/
/////////////////////////////

var projectList = document.getElementById("projectList");
var ttt = projectList.getElementsByClassName("test");

// Default station is MMSP
stationLayer.definitionExpression = "Sector = 'MMSP'";
stationLine.definitionExpression = "Sector = 'MMSP'";
zoomToLayer(stationLayer);

for(var i = 0; i < ttt.length; i ++) {
ttt[i].addEventListener("click", filterByP);
}

function filterByP(event) {
var current = document.getElementsByClassName("active");
current[0].className = current[0].className.replace(" active","");
this.className += " active";

const selectedID = event.target.id;
stationLayer.definitionExpression = "Sector = '" + selectedID + "'";
stationLine.definitionExpression = "Sector = '" + selectedID +  "'";
zoomToLayer(stationLayer);


/*
if(selectedID == "MMSP") {
  stationLayer.definitionExpression = "Sector = '" + selectedID + "'";
  stationLine.definitionExpression = "Sector = '" + selectedID +  "'";
  zoomToLayer(stationLayer);

} else if (selectedID == "MCRP" || selectedID == "NSRP") {
  stationLayer.definitionExpression = "Sector = '" + selectedID + "'";
  stationLine.definitionExpression = "Sector = '" + selectedID +  "'";
  zoomToLayer(stationLayer);        
} else if (selectedID == "NSCR") {
  stationLayer.definitionExpression = "Sector = '" + selectedID + "'";
  stationLine.definitionExpression = "Sector = '" + selectedID +  "'";
  zoomToLayer(stationLayer);  
}
*/
}




////////////////////////////////////////////////////////////////////////////////////////

  //*** Highlight and Zoom to Stations*** //
  // This variable will store highlight handle that is used to remove the highlight
  var highlight = null;

  view.when(function() {
  
    // define the attributes which are used in the query
    stationLayer.outFields = "Station";

    // Get DOM (Document Object Model) eement where list items will be placed
    var container = document.getElementById("stationList");

    // Highlight is set on the layerView, so we need to detect when the layerView is ready
    view.whenLayerView(stationLayer).then(function(stationLayerView) {
      //wait for the layer view to finish updating
      stationLayerView.watch("updating", function(val) {
        if (!val) {
          // Query the features available for drawing and get all the attributes
          var query = new Query();
          stationLayerView.queryFeatures(query).then(function(result) {
            // Empty the list DOM element
            container.innerHTML = "";
            // For each returned feature that is of station create a list item and append it to the container
            result.features.forEach(function(feature) {
              var attributes = feature.attributes;
              // we only want to add features of station to the list
              var li = document.createElement("li");
              li.setAttribute("class", "panel-result");
              li.innerHTML = attributes.Station;
              li.addEventListener("click", function(event) {
                var target = event.target;
                 
                var objectId = feature.attributes.OBJECTID;
                // Create an extent query on the layer view that will return to 3D extent of the feature
                var queryExtent = new Query({
                  objectIds: [objectId]
                });
                stationLayerView
                  .queryExtent(queryExtent)
                  .then(function(result) {
                    // Zoom to the extent of the feature
                    // Use the expand method to prevent zooming in too close to the feature
                    if (result.extent) {
                      view
                        .goTo(result.extent.expand(900), {
                          speedFactor: 2
                        })
                        .catch(function(error) {
                          if (error.name != "AbortError") {
                            console.error(error);
                          }
                        });
                    }
                  });
                  // Remove the previous highlights
                  if (highlight) {
                    highlight.remove();
                  }
                  // Highlight the feature passing the objectId to the method
                  highlight = stationLayerView.highlight([objectId]);
              });
              container.appendChild(li);
            });
          });
        }
      });
    });
  });
//*** End of Highlight & Zoom to Stations*** //

//*** Highlight and Zoom to Project*** //
//const myLi = document.querySelectorAll('myLi')

view.ui.empty("top-left"); 
  // Full screen logo
  view.ui.add(
      new Fullscreen({
          view: view,
          element: applicationDiv
      }),
      "bottom-left"
  );


});