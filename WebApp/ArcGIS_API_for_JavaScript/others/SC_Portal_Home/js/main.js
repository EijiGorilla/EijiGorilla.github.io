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
    var land2Image = document.getElementById("land2Image");
    var treeImage = document.getElementById("treeImage");
    var utilityImage = document.getElementById("utilityImage");
    var viaductImage = document.getElementById("viaductImage");
    var stationStructureImage =document.getElementById("stationStructureImage");
    var depotBuildingImage = document.getElementById("depotBuildingImage"); 
    var enviMonitoringImage = document.getElementById("enviMonitoringImage");
    
    var myLink = document.getElementById("myLink");
    var mapLinkButton = document.getElementById("mapLinkButton");
    const underConstruction = "Under Construction";

   
    const smartMapSource = ["https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/SC_Land_Structure2/index.html", // Land Acquisition
                            "https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/SC1_Land_Structure/index.html", // Land Acquisition for SC2
                            "https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/envi/Operational/SC_Tree_Cutting/index.html", // Tree Cutting
                            "https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/SC_Utility_Relocation/index.html", // Utility Relocation
                            "https://eijigorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/SC_Viaduct/index.html", // Viaduct
                            "Under Construction", // Station Structure
                            "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/civil/Operational/SC_Depot_Building/index.html", // Depot Building
                            "Under Construction"] // Environment Monitoring]

    // Default: Land Acquisition
    if (document.getElementById("landAcquisition").checked === true) {
        mapTitleDiv.innerHTML = "Land Aquisition";
        catchyTitleDiv.innerHTML = " MAPPING LAND ACQUISITION";
        descriptionDiv.innerHTML = "VISUALIZING ACQUISITION OF LAND AND EXISTING STRUCTURES IN 2D MAP";

        landImage.style.display = "block";
        land2Image.style.display = "none";
        treeImage.style.display = "none";
        utilityImage.style.display = "none";
        viaductImage.style.display = "none";
        stationStructureImage.style.display = "none";
        depotBuildingImage.style.display = "none";
        enviMonitoringImage.style.display = "none";

        if (smartMapSource[0] === underConstruction) {
            mapLinkButton.innerHTML = underConstruction
        } else {
            myLink.setAttribute('href', smartMapSource[0]);
        }
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
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[0] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[0]);
            }

        } else if (selected === "landAcquisition2") {
            mapTitleDiv.innerHTML = "Land Aquisition for Subcontractor";
            catchyTitleDiv.innerHTML = "MAPPING LAND ACQUISITION FOR SUBCONTRACTOR";
            descriptionDiv.innerHTML = "VISUALIZING ACQUISITION OF LAND AND EXISTING STRUCTURES IN 2D MAP";

            landImage.style.display = "none";
            land2Image.style.display = "block";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[1] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[1]);
            }

        } else if (selected === "treeCutting") {
            mapTitleDiv.innerHTML = "Tree Cutting & Compensation";
            catchyTitleDiv.innerHTML = "LOCATIONS OF TREES CUT AND EARTH-BALLED";
            descriptionDiv.innerHTML = "VISUALIZING STATUS OF TREE CUTTING/EARTH-BALLING, AND TREE COMPENSATION";

            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "block";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[2] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[2]);
            }
            
        } else if (selected === "utilityRelocation") {
            mapTitleDiv.innerHTML = "Utility Relocation";
            catchyTitleDiv.innerHTML = "MAPPING UTILITIES IN 3D";
            descriptionDiv.innerHTML = "VISUALIZING UTILITY RELOCATION STATUS";

            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "block";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[3] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[3]);
            }

        }  else if (selected === "viaductConstruction") {
            mapTitleDiv.innerHTML = "Viaduct Construction";
            catchyTitleDiv.innerHTML = "3D VIADUCT CONSTRUCTION";
            descriptionDiv.innerHTML = "VISUALIZING VIADUCT CONSTRUCTION STATUS FOR PILE, PILE CAP, PIER, PIER HEAD, AND PRECAST";

            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "block";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[4] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[4]);
            }

        }  else if (selected === "stationStructure") {
            mapTitleDiv.innerHTML = "Station Structure";
            catchyTitleDiv.innerHTML = "3D STATION STRUCTURES";
            descriptionDiv.innerHTML = "VISUALIZING CONSTRUCTINO STATUS OF STATION STRUCTURES";
            
            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "block";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[5] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[5]);
            }
            
        } else if (selected === "depotBuilding") {
            mapTitleDiv.innerHTML = "Depot Building";
            catchyTitleDiv.innerHTML = "3D DEPOT BUILDINGS";
            descriptionDiv.innerHTML = "VISUALIZING CONSTRUCTION STATUS OF DEPOT BUILDINGS";
            
            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "block";
            enviMonitoringImage.style.display = "none";

            if (smartMapSource[6] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[6]);
            }

        } else if (selected === "enviMonitoring") {
            mapTitleDiv.innerHTML = "Environment Monitoring";
            catchyTitleDiv.innerHTML = "ENVIRONMENTAL HOT SPOTS DURING CONSTRUCTION";
            descriptionDiv.innerHTML = "VISUALIZING MONITORING STATUS OF ENVIRONMENT INDICATORS DURING CONSTRUCTION";
            
            landImage.style.display = "none";
            land2Image.style.display = "none";
            treeImage.style.display = "none";
            utilityImage.style.display = "none";
            viaductImage.style.display = "none";
            stationStructureImage.style.display = "none";
            depotBuildingImage.style.display = "none";
            enviMonitoringImage.style.display = "block";

            if (smartMapSource[7] === underConstruction) {
                mapLinkButton.innerHTML = underConstruction
            } else {
                myLink.setAttribute('href', smartMapSource[7]);
            }

        }
    }
});