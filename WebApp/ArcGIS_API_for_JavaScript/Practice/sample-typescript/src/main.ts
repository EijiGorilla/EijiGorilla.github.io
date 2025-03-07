import ArcGISMap from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";


const map = new ArcGISMap({
    basemap: "streets-vector"
});

const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
});

view.when(() => {
    console.log("Map is loaded")
})

// Throw an error
// https://developers.arcgis.com/javascript/latest/install-and-set-up/#web-server-hosting-configuration
// Web server hosting configuration