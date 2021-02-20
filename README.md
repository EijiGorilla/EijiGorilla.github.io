## Tips and Tricks - ArcGIS API for JavaScript

### 1. "TimeSlider" widget
TimeSlider widget is very useful to display the temporal change of a feature layer. But coding the timeSlider is not as straightforwar as you think,
as the coding pattern varies between feature layers and scene layers. Plase refer to the following sample code:
### 1.1 Feature Layer
var transitLayer = new FeatureLayer({**
        portalItem: {
          id: "fa7aad7fd11d401a9911c8b261784980",
          portal: {
            url: "https://mmspgc-gis.mmspgc.local/portal"
          }
        },
        elevationInfo: {
          mode: "relative-to-ground",//"on-the-ground"
          offset: -60
        },
         //renderer: roundTubeSymbol,
         title: "TBM Alignment",
         //definitionExpression: "sens='Aller'",
         outFields: ["*"]
        });
        map.add(transitLayer);
                const timeSlider = new TimeSlider({
          container: "timeSlider",
          mode: "time-window",
          //destroyed: false,
          view: view
       });
       view.ui.add(timeSlider, "manual");

  // Wait till the layer view is loaded**
  //let timeLayerView;
        view.whenLayerView(transitLayer).then(function(lv) {
          timeLayerView = lv;
          const fullTimeExtent = transitLayer.timeInfo.fullTimeExtent;
          timeSlider.fullTimeExtent = fullTimeExtent;
          timeSlider.stops = {
            interval: transitLayer.timeInfo.interval
          };
}); 

