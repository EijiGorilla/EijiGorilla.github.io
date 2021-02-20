## Tips and Tricks - ArcGIS API for JavaScript

### 1. "TimeSlider" widget
TimeSlider widget is very useful to display the temporal change of a feature layer. But coding the timeSlider is not as straightforwar as you think,
as the coding pattern varies between feature layers and scene layers. Plase refer to the following sample code:
### 1.1 Feature Layer
>var transitLayer = new FeatureLayer({  
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
  
  >// Wait till the layer view is loaded  
  //let timeLayerView;  
        view.whenLayerView(transitLayer).then(function(lv) {  
          timeLayerView = lv;  
          const fullTimeExtent = transitLayer.timeInfo.fullTimeExtent;  
          timeSlider.fullTimeExtent = fullTimeExtent;  
          timeSlider.stops = {  
            interval: transitLayer.timeInfo.interval  
          };  
});  

### 1.2 Scene Layer
>var viaductLayer = new SceneLayer({
            portalItem: {
            id: "024e53d5a4294c20ac9a5c822e3d1da9", //68da30606df344d09e8e7b7811debc07
          },
          elevationInfo: {
          mode: "absolute-height" //absolute-height, relative-to-ground
        },
            title: "Viaduct sample",
            outFields: ["*"]
            // when filter using date, example below. use this format
            //definitionExpression: "EndDate = date'2020-6-3'"
          });
          map.add(viaductLayer);  
>// Time SLider
const start = new Date(2019, 0, 1);  
const end = new Date(2022,0,1);  
const timeSlider = new TimeSlider({  
    container: "timeContainer",  
    mode: "cumulative-from-start",  
    fullTimeExtent: {  
        start: start,  
        end: end  
    },  
    values: [start],  
    stops: {  
        interval: {  
            value: 1,  
            unit: "days"  
        },  
        timeExtent: { start, end }  
    }  
});  
view.ui.add(timeSlider, "bottom-left");  
  timeSlider.watch("timeExtent", function(timeExtent) {  
   viaductLayer.definitionExpression = "TargetDate <= date'" + timeExtent.end.getFullYear() + "-" + (timeExtent.end.getMonth()+1) + "-" + (timeExtent.end.getDate()) +"'";  
  });  
  
