require([
"esri/Basemap",
"esri/Map",
"esri/views/MapView",
"esri/views/SceneView"
], function(Basemap, Map, MapView, SceneView) {
    // Define parameters
    var mapTypeInput = document.getElementById("mapTypeInput");
    var mapTitleDiv = document.getElementById("mapTitleDiv");
    var catchyTitleDiv = document.getElementById("catchyTitleDiv");
    var descriptionDiv = document.getElementById("descriptionDiv");

    var landImage = document.getElementById("landImage");
    var demolitionImage = document.getElementById("demolitionImage");
    var treeImage = document.getElementById("treeImage");
    var utilityImage = document.getElementById("utilityImage");
    var tunnelImage = document.getElementById("tunnelImage");
    var stationStructureImage =document.getElementById("stationStructureImage");
    var depotBuildingImage = document.getElementById("depotBuildingImage"); 
    var enviMonitoringImage = document.getElementById("enviMonitoringImage");
    
    var myLink = document.getElementById("myLink");

    // Web App link
    const laURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/MMSP_Land_Structure/index.html";
    const demolitionURL = "https://gis.railway-sector.com/portal/apps/opsdashboard/index.html#/55002a9e0abb4eb7bf17f85a6c59210e";
    const treeURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/MMSP_Tree_Cutting/index.html";
    const utilityURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/MMSP_Utility_Relocation/index.html";
    const tbmURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/MMSP_TBM_Tunnel/index.html";
    const stationStructureURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/MMSP_Station_Structure/index.html";
    const depotBuildingURL = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/MMSP_Depot_Building/index.html";
    const enviMonitoringURL = "https://gis.railway-sector.com/portal/apps/opsdashboard/index.html#/1d5a99f80cb241ad8c9f5ef6e53595f5";

    // Default: Land Acquisition
    if (document.getElementById("landAcquisition").checked === true) {
        mapTitleDiv.innerHTML = "Land Aquisition";
        catchyTitleDiv.innerHTML = " MAPPING LAND ACQUISITION";
        descriptionDiv.innerHTML = "VISUALIZING ACQUISITION OF LAND AND EXISTING STRUCTURES IN 2D MAP";

        landImage.style.display = "block";
        demolitionImage.style.display = "none";
        treeImage.style.display = "none";
        utilityImage.style.display = "none";
        tunnelImage.style.display = "none";
        tunnelImage.style.display = "none";
        stationStructureImage.style.display = "none";
        depotBuildingImage.style.display = "none";

        myLink.setAttribute('href', laURL);
    }

    // AddEventListener
    mapTypeInput.addEventListener("click", filterForSmartMaps);
    function filterForSmartMaps(event) {
        const selected = event.target.id;
        if (selected === "landAcquisition") {
            mapTitleDiv.innerHTML = "Land Aquisition";
            catchyTitleDiv.innerHTML = "MAPPING LAND ACQUISITION";
            descriptionDiv.innerHTML = "VISUALIZING ACQUISITION OF LAND AND EXISTING STRUCTURES IN 2D MAP";

            landImage.style.display = "block";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            myLink.setAttribute('href', laURL);

        } else if (selected === "demolition") {
            mapTitleDiv.innerHTML = "Demolition";
            catchyTitleDiv.innerHTML = "MAPPING DEMOLITION";
            descriptionDiv.innerHTML = "VISUALIZING DEMOLITION OF EXISTING STRUCTURE";

            landImage.style.display = "none";
            demolitionImage.style.display = "block";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            myLink.setAttribute('href', demolitionURL);

        } else if (selected === "treeCutting") {
            mapTitleDiv.innerHTML = "Tree Cutting & Compensation";
            catchyTitleDiv.innerHTML = "LOCATIONS OF TREES CUT AND EARTH-BALLED";
            descriptionDiv.innerHTML = "VISUALIZING STATUS OF TREE CUTTING/EARTH-BALLING, AND TREE COMPENSATION";

            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "block";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            myLink.setAttribute('href', treeURL);
            
        } else if (selected === "utilityRelocation") {
            mapTitleDiv.innerHTML = "Utility Relocation";
            catchyTitleDiv.innerHTML = "MAPPING UTILITIES IN 3D";
            descriptionDiv.innerHTML = "VISUALIZING UTILITY RELOCATION STATUS";

            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "block";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            myLink.setAttribute('href', utilityURL);

        }  else if (selected === "tunnelConstruction") {
            mapTitleDiv.innerHTML = "3D Tunnel Construction";
            catchyTitleDiv.innerHTML = "LOCATION OF CONSTRUCTED TUNNEL SEGEMENTS IN 3D";
            descriptionDiv.innerHTML = "VISUALIZING TUNNEL CONSTRUCTION VIA TBM/NATM & DILAPIDATION SURVEY STATUS";

            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "block";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            myLink.setAttribute('href', tbmURL);

        }  else if (selected === "stationStructure") {
            mapTitleDiv.innerHTML = "Station Structure";
            catchyTitleDiv.innerHTML = "3D STATION STRUCTURES";
            descriptionDiv.innerHTML = "VISUALIZING CONSTRUCTINO STATUS OF STATION STRUCTURES";
            
            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "block";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";
            
            myLink.setAttribute('href', stationStructureURL);

        } else if (selected === "depotBuilding") {
            mapTitleDiv.innerHTML = "Depot Building";
            catchyTitleDiv.innerHTML = "3D DEPOT BUILDINGS";
            descriptionDiv.innerHTML = "VISUALIZING CONSTRUCTION STATUS OF DEPOT BUILDINGS";
            
            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "block";
            enviMonitoringImage.style.display = "none";
            
            myLink.setAttribute('href', depotBuildingURL);

        } else if (selected === "enviMonitoring") {
            mapTitleDiv.innerHTML = "Environment Monitoring";
            catchyTitleDiv.innerHTML = "ENVIRONMENTAL HOT SPOTS DURING CONSTRUCTION";
            descriptionDiv.innerHTML = "VISUALIZING MONITORING STATUS OF ENVIRONMENT INDICATORS DURING CONSTRUCTION";
            
            landImage.style.display = "none";
            demolitionImage.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            tunnelImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "block";
            
            myLink.setAttribute('href', enviMonitoringURL);
        }
    }
});