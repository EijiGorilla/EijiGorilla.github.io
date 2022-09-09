require([
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

    ], function(
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
      reactiveUtils

    ) {

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
        ground: "world-elevation"

}); 
map.ground.surfaceColor = '#004C73';
//map.ground.opacity = 0.5;


// Add scene view
var view = new SceneView({
map: map,
container: "viewDiv",
viewingMode: "local",
camera: {
  position: {
    x: 120.9777186,
    y: 14.5600295,
    z: 3000
  },
  tilt: 70,
  heading: 10
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
title: "OpenStreetMap 3D Buildings"
});
map.add(osm3D);
osm3D.renderer = {
type: "simple",
symbol: osmSymbol
}

// Animation Code:
// Move multiple animation points at the same time
// Sample
var point1 = {latitude: 14.65485964, longitude: 120.9988027};
var point2 = {latitude: 14.65415704, longitude: 120.99827729};
var point3 = {latitude: 14.65338464, longitude: 120.99786549};
var point4 = {latitude: 14.65258607, longitude: 120.99751129};
var point5 = {latitude: 14.65178518, longitude: 120.99716246};
var point6 = {latitude: 14.65098639, longitude: 120.99680852};
var point7 = {latitude: 14.65018651, longitude: 120.99645716};
var point8 = {latitude: 14.64938722, longitude: 120.9961044};
var point9 = {latitude: 14.64858785, longitude: 120.99575181};
var point10 = {latitude: 14.6477879, longitude: 120.99540063};
var point11 = {latitude: 14.64698523, longitude: 120.99505617};
var point12 = {latitude: 14.64618036, longitude: 120.9947172};
var point13 = {latitude: 14.64536681, longitude: 120.99440424};
var point14 = {latitude: 14.64452621, longitude: 120.99455161};
var point15 = {latitude: 14.64402225, longitude: 120.99526784};
var point16 = {latitude: 14.64392507, longitude: 120.99613567};
var point17 = {latitude: 14.64392619, longitude: 120.99703398};
var point18 = {latitude: 14.64393226, longitude: 120.99793225};
var point19 = {latitude: 14.64396144, longitude: 120.99882967};
var point20 = {latitude: 14.6440887, longitude: 120.99971803};
var point21 = {latitude: 14.64423012, longitude: 121.00060437};
var point22 = {latitude: 14.64437298, longitude: 121.00149047};
var point23 = {latitude: 14.64451831, longitude: 121.00237613};
var point24 = {latitude: 14.64469796, longitude: 121.00325481};
var point25 = {latitude: 14.64478453, longitude: 121.00414505};
var point26 = {latitude: 14.6446608, longitude: 121.00503337};
var point27 = {latitude: 14.64413962, longitude: 121.00570524};
var point28 = {latitude: 14.64328764, longitude: 121.00583428};
var point29 = {latitude: 14.64242924, longitude: 121.00594838};
var point30 = {latitude: 14.64158202, longitude: 121.00614887};
var point31 = {latitude: 14.6407342, longitude: 121.00634662};
var point32 = {latitude: 14.63988701, longitude: 121.00654726};
var point33 = {latitude: 14.63907599, longitude: 121.0068514};
var point34 = {latitude: 14.63844699, longitude: 121.0074641};
var point35 = {latitude: 14.63788265, longitude: 121.00814716};
var point36 = {latitude: 14.63712519, longitude: 121.00856126};
var point37 = {latitude: 14.63626551, longitude: 121.00868051};
var point38 = {latitude: 14.63540052, longitude: 121.00876847};
var point39 = {latitude: 14.63453549, longitude: 121.00885603};
var point40 = {latitude: 14.63367021, longitude: 121.00894099};
var point41 = {latitude: 14.6328163, longitude: 121.00908665};
var point42 = {latitude: 14.63204799, longitude: 121.00949007};
var point43 = {latitude: 14.6313697, longitude: 121.01005179};
var point44 = {latitude: 14.63079698, longitude: 121.01072559};
var point45 = {latitude: 14.63022775, longitude: 121.01140438};
var point46 = {latitude: 14.62962103, longitude: 121.01204723};
var point47 = {latitude: 14.62898608, longitude: 121.01266068};
var point48 = {latitude: 14.62835251, longitude: 121.01327567};
var point49 = {latitude: 14.62771976, longitude: 121.01389156};
var point50 = {latitude: 14.62708586, longitude: 121.01450618};
var point51 = {latitude: 14.62640364, longitude: 121.01505934};
var point52 = {latitude: 14.62561731, longitude: 121.01542533};
var point53 = {latitude: 14.62475369, longitude: 121.01546603};
var point54 = {latitude: 14.62389098, longitude: 121.01535641};
var point55 = {latitude: 14.62302793, longitude: 121.0152496};
var point56 = {latitude: 14.6221649, longitude: 121.01514258};
var point57 = {latitude: 14.62130196, longitude: 121.01503476};
var point58 = {latitude: 14.62043906, longitude: 121.01492658};
var point59 = {latitude: 14.61957453, longitude: 121.01483572};
var point60 = {latitude: 14.61870689, longitude: 121.0148506};
var point61 = {latitude: 14.61788931, longitude: 121.01513315};
var point62 = {latitude: 14.61715613, longitude: 121.0156144};
var point63 = {latitude: 14.61643248, longitude: 121.01611193};
var point64 = {latitude: 14.61566236, longitude: 121.01652626};
var point65 = {latitude: 14.61482315, longitude: 121.01675487};
var point66 = {latitude: 14.61395503, longitude: 121.01680045};
var point67 = {latitude: 14.61308679, longitude: 121.01684386};
var point68 = {latitude: 14.61221869, longitude: 121.01689019};
var point69 = {latitude: 14.61135013, longitude: 121.01692612};
var point70 = {latitude: 14.61048138, longitude: 121.0169564};
var point71 = {latitude: 14.60961244, longitude: 121.0169811};
var point72 = {latitude: 14.60874351, longitude: 121.01700627};
var point73 = {latitude: 14.60787991, longitude: 121.01709079};
var point74 = {latitude: 14.60706628, longitude: 121.01739092};
var point75 = {latitude: 14.60638114, longitude: 121.01793526};
var point76 = {latitude: 14.60576655, longitude: 121.01857027};
var point77 = {latitude: 14.60514795, longitude: 121.01920139};
var point78 = {latitude: 14.60449395, longitude: 121.01978034};
var point79 = {latitude: 14.6036633, longitude: 121.01974528};
var point80 = {latitude: 14.6028233, longitude: 121.01951459};
var point81 = {latitude: 14.60202316, longitude: 121.01968084};
var point82 = {latitude: 14.60144925, longitude: 121.02034347};
var point83 = {latitude: 14.6009826, longitude: 121.02110139};
var point84 = {latitude: 14.60051583, longitude: 121.02185922};
var point85 = {latitude: 14.60005444, longitude: 121.02262056};
var point86 = {latitude: 14.59952732, longitude: 121.0233307};
var point87 = {latitude: 14.59885785, longitude: 121.02388157};
var point88 = {latitude: 14.59808868, longitude: 121.02430015};
var point89 = {latitude: 14.5973186, longitude: 121.02471696};
var point90 = {latitude: 14.59654845, longitude: 121.02513362};
var point91 = {latitude: 14.59577829, longitude: 121.02555028};
var point92 = {latitude: 14.59497679, longitude: 121.02589621};
var point93 = {latitude: 14.59412692, longitude: 121.02603615};
var point94 = {latitude: 14.59328995, longitude: 121.02579332};
var point95 = {latitude: 14.59259489, longitude: 121.02526798};
var point96 = {latitude: 14.59210317, longitude: 121.02452717};
var point97 = {latitude: 14.59155369, longitude: 121.02383514};
var point98 = {latitude: 14.5909489, longitude: 121.02318984};
var point99 = {latitude: 14.590379, longitude: 121.02251413};
var point100 = {latitude: 14.58989913, longitude: 121.02176821};
var point101 = {latitude: 14.58951875, longitude: 121.02096045};
var point102 = {latitude: 14.58916506, longitude: 121.02014056};
var point103 = {latitude: 14.58884583, longitude: 121.019305};
var point104 = {latitude: 14.58862097, longitude: 121.01843859};
var point105 = {latitude: 14.58850892, longitude: 121.01755167};
var point106 = {latitude: 14.58850413, longitude: 121.01665403};
var point107 = {latitude: 14.58860798, longitude: 121.01576396};
var point108 = {latitude: 14.58905577, longitude: 121.01501213};
var point109 = {latitude: 14.58972529, longitude: 121.01444133};
var point110 = {latitude: 14.58992722, longitude: 121.01360856};
var point111 = {latitude: 14.58973018, longitude: 121.01273363};
var point112 = {latitude: 14.58953259, longitude: 121.01185882};
var point113 = {latitude: 14.58949292, longitude: 121.01096668};
var point114 = {latitude: 14.58963292, longitude: 121.01008046};
var point115 = {latitude: 14.58979042, longitude: 121.00919701};
var point116 = {latitude: 14.58961465, longitude: 121.00835513};
var point117 = {latitude: 14.58896614, longitude: 121.00775944};
var point118 = {latitude: 14.58831485, longitude: 121.0071655};
var point119 = {latitude: 14.58769875, longitude: 121.00653223};
var point120 = {latitude: 14.5870502, longitude: 121.00593403};
var point121 = {latitude: 14.5864118, longitude: 121.00532432};
var point122 = {latitude: 14.58576555, longitude: 121.00472345};
var point123 = {latitude: 14.58512138, longitude: 121.00412022};
var point124 = {latitude: 14.58455669, longitude: 121.0034427};
var point125 = {latitude: 14.58398869, longitude: 121.00276457};
var point126 = {latitude: 14.58332848, longitude: 121.00218011};
var point127 = {latitude: 14.58266276, longitude: 121.00160239};
var point128 = {latitude: 14.58200253, longitude: 121.00101801};
var point129 = {latitude: 14.58134109, longitude: 121.00043509};
var point130 = {latitude: 14.58067133, longitude: 120.99986237};
var point131 = {latitude: 14.57999242, longitude: 120.9993014};
var point132 = {latitude: 14.57930321, longitude: 120.99875384};
var point133 = {latitude: 14.57861429, longitude: 120.99820588};
var point134 = {latitude: 14.57789385, longitude: 120.99770551};
var point135 = {latitude: 14.57706829, longitude: 120.99745143};
var point136 = {latitude: 14.5762067, longitude: 120.99751167};
var point137 = {latitude: 14.57543932, longitude: 120.99793014};
var point138 = {latitude: 14.57467092, longitude: 120.99835039};
var point139 = {latitude: 14.57390045, longitude: 120.99876658};
var point140 = {latitude: 14.57312891, longitude: 120.99918065};
var point141 = {latitude: 14.57235719, longitude: 120.99959436};
var point142 = {latitude: 14.57158308, longitude: 121.00000329};
var point143 = {latitude: 14.57081098, longitude: 121.00041627};
var point144 = {latitude: 14.57003559, longitude: 121.00082261};
var point145 = {latitude: 14.5692621, longitude: 121.00123282};
var point146 = {latitude: 14.56849077, longitude: 121.00164732};
var point147 = {latitude: 14.56772031, longitude: 121.00206359};
var point148 = {latitude: 14.56694962, longitude: 121.00247938};
var point149 = {latitude: 14.56618057, longitude: 121.00289842};
var point150 = {latitude: 14.56540963, longitude: 121.00331375};
var point151 = {latitude: 14.56463964, longitude: 121.00373095};
var point152 = {latitude: 14.56386637, longitude: 121.00414159};
var point153 = {latitude: 14.56309631, longitude: 121.00455866};
var point154 = {latitude: 14.56232349, longitude: 121.00497026};
var point155 = {latitude: 14.56155138, longitude: 121.00538325};
var point156 = {latitude: 14.56077942, longitude: 121.00579658};
var point157 = {latitude: 14.56000858, longitude: 121.00621212};
var point158 = {latitude: 14.55923617, longitude: 121.00662456};
var point159 = {latitude: 14.55846179, longitude: 121.00703302};
var point160 = {latitude: 14.55768733, longitude: 121.00744133};
var point161 = {latitude: 14.55691709, longitude: 121.00785806};
var point162 = {latitude: 14.55614536, longitude: 121.00827186};
var point163 = {latitude: 14.55537616, longitude: 121.00869068};
var point164 = {latitude: 14.55460672, longitude: 121.00910905};
var point165 = {latitude: 14.55383798, longitude: 121.00952872};
var point166 = {latitude: 14.55345007, longitude: 121.00974464};


// Point Symbol 2
var pointB1 = {latitude: 14.64563842, longitude: 120.97629533};
var pointB2 = {latitude: 14.64477245, longitude: 120.97636576};
var pointB3 = {latitude: 14.64390757, longitude: 120.97643695};
var pointB4 = {latitude: 14.64305035, longitude: 120.97658453};
var pointB5 = {latitude: 14.64219715, longitude: 120.97675573};
var pointB6 = {latitude: 14.64134255, longitude: 120.97691932};
var pointB7 = {latitude: 14.64048609, longitude: 120.9770713};
var pointB8 = {latitude: 14.63961962, longitude: 120.97713503};
var pointB9 = {latitude: 14.63875072, longitude: 120.97712557};
var pointB10 = {latitude: 14.63788786, longitude: 120.97701854};
var pointB11 = {latitude: 14.63702659, longitude: 120.97689781};
var pointB12 = {latitude: 14.63616473, longitude: 120.97678161};
var pointB13 = {latitude: 14.63530329, longitude: 120.9766621};
var pointB14 = {latitude: 14.63444227, longitude: 120.97653941};
var pointB15 = {latitude: 14.6335807, longitude: 120.97642081};
var pointB16 = {latitude: 14.63271903, longitude: 120.97630301};
var pointB17 = {latitude: 14.63185712, longitude: 120.97618706};
var pointB18 = {latitude: 14.63099519, longitude: 120.97607123};
var pointB19 = {latitude: 14.63013367, longitude: 120.97595219};
var pointB20 = {latitude: 14.62927214, longitude: 120.97583322};
var pointB21 = {latitude: 14.62841048, longitude: 120.97571519};
var pointB22 = {latitude: 14.62754878, longitude: 120.97559744};
var pointB23 = {latitude: 14.62668706, longitude: 120.97547984};
var pointB24 = {latitude: 14.62582459, longitude: 120.97537167};
var pointB25 = {latitude: 14.6249745, longitude: 120.97554278};
var pointB26 = {latitude: 14.6241888, longitude: 120.97591737};
var pointB27 = {latitude: 14.62358628, longitude: 120.97656066};
var pointB28 = {latitude: 14.62322973, longitude: 120.97737493};
var pointB29 = {latitude: 14.62308204, longitude: 120.97825757};
var pointB30 = {latitude: 14.62299248, longitude: 120.97915107};
var pointB31 = {latitude: 14.62290402, longitude: 120.98004472};
var pointB32 = {latitude: 14.62281444, longitude: 120.98093825};
var pointB33 = {latitude: 14.62272948, longitude: 120.98183227};
var pointB34 = {latitude: 14.62264435, longitude: 120.98272626};
var pointB35 = {latitude: 14.62255572, longitude: 120.98361989};
var pointB36 = {latitude: 14.62246685, longitude: 120.9845135};
var pointB37 = {latitude: 14.62237831, longitude: 120.98540714};
var pointB38 = {latitude: 14.62229205, longitude: 120.98630099};
var pointB39 = {latitude: 14.6220428, longitude: 120.98715378};
var pointB40 = {latitude: 14.621529, longitude: 120.98787061};
var pointB41 = {latitude: 14.62089278, longitude: 120.98848265};
var pointB42 = {latitude: 14.62024837, longitude: 120.98908551};
var pointB43 = {latitude: 14.61960905, longitude: 120.98969414};
var pointB44 = {latitude: 14.6189698, longitude: 120.99030284};
var pointB45 = {latitude: 14.61833023, longitude: 120.9909112};
var pointB46 = {latitude: 14.61769141, longitude: 120.9915204};
var pointB47 = {latitude: 14.61705434, longitude: 120.99213155};
var pointB48 = {latitude: 14.61642009, longitude: 120.99274582};
var pointB49 = {latitude: 14.61578528, longitude: 120.99335949};
var pointB50 = {latitude: 14.61514971, longitude: 120.9939723};
var pointB51 = {latitude: 14.61451183, longitude: 120.99458256};
var pointB52 = {latitude: 14.61387536, longitude: 120.99519438};
var pointB53 = {latitude: 14.61323968, longitude: 120.99580706};
var pointB54 = {latitude: 14.61259916, longitude: 120.99641436};
var pointB55 = {latitude: 14.61196258, longitude: 120.99702606};
var pointB56 = {latitude: 14.61132738, longitude: 120.99763931};
var pointB57 = {latitude: 14.61069235, longitude: 120.99825275};
var pointB58 = {latitude: 14.61005411, longitude: 120.99886261};
var pointB59 = {latitude: 14.60941545, longitude: 120.999472};
var pointB60 = {latitude: 14.60877867, longitude: 121.00008351};
var pointB61 = {latitude: 14.60814102, longitude: 121.00069404};
var pointB62 = {latitude: 14.60750265, longitude: 121.00130377};
var pointB63 = {latitude: 14.60686776, longitude: 121.00191738};
var pointB64 = {latitude: 14.60623225, longitude: 121.00253029};
var pointB65 = {latitude: 14.60559432, longitude: 121.00314051};
var pointB66 = {latitude: 14.60495799, longitude: 121.00375253};
var pointB67 = {latitude: 14.60432308, longitude: 121.00436611};
var pointB68 = {latitude: 14.60377388, longitude: 121.00505868};
var pointB69 = {latitude: 14.60336163, longitude: 121.00584591};
var pointB70 = {latitude: 14.6030766, longitude: 121.00669344};
var pointB71 = {latitude: 14.60279558, longitude: 121.00754331};
var pointB72 = {latitude: 14.60234125, longitude: 121.00830251};
var pointB73 = {latitude: 14.60177836, longitude: 121.00898658};
var pointB74 = {latitude: 14.60120921, longitude: 121.0096656};
var pointB75 = {latitude: 14.60062777, longitude: 121.01033325};
var pointB76 = {latitude: 14.60004416, longitude: 121.01099888};
var pointB77 = {latitude: 14.59947767, longitude: 121.01168026};
var pointB78 = {latitude: 14.59891749, longitude: 121.01236717};
var pointB79 = {latitude: 14.59828569, longitude: 121.01297919};
var pointB80 = {latitude: 14.59751943, longitude: 121.01337516};
var pointB81 = {latitude: 14.59666034, longitude: 121.01349478};
var pointB82 = {latitude: 14.59581993, longitude: 121.0132842};
var pointB83 = {latitude: 14.59510973, longitude: 121.01277299};
var pointB84 = {latitude: 14.59443683, longitude: 121.01220428};
var pointB85 = {latitude: 14.59376531, longitude: 121.01163379};
var pointB86 = {latitude: 14.59309628, longitude: 121.01106018};
var pointB87 = {latitude: 14.59242646, longitude: 121.01048756};
var pointB88 = {latitude: 14.5917551, longitude: 121.00991685};
var pointB89 = {latitude: 14.59108485, longitude: 121.00934476};
var pointB90 = {latitude: 14.59041595, longitude: 121.00877098};
var pointB91 = {latitude: 14.58974119, longitude: 121.00820457};
var pointB92 = {latitude: 14.58904901, longitude: 121.00766133};
var pointB93 = {latitude: 14.58832559, longitude: 121.00716325};
var pointB94 = {latitude: 14.58830783, longitude: 121.00715121};
var pointB95 = {latitude: 14.58820798, longitude: 121.00725249};
var pointB96 = {latitude: 14.58879448, longitude: 121.0079143};
var pointB97 = {latitude: 14.58945116, longitude: 121.00850256};
var pointB98 = {latitude: 14.59018501, longitude: 121.0089827};
var pointB99 = {latitude: 14.59093791, longitude: 121.00942862};
var pointB100 = {latitude: 14.59161735, longitude: 121.00998831};
var pointB101 = {latitude: 14.59228677, longitude: 121.01056143};
var pointB102 = {latitude: 14.59295465, longitude: 121.01113648};
var pointB103 = {latitude: 14.59362378, longitude: 121.01170995};
var pointB104 = {latitude: 14.594296, longitude: 121.01227957};
var pointB105 = {latitude: 14.59496755, longitude: 121.01285001};
var pointB106 = {latitude: 14.59569355, longitude: 121.01334148};
var pointB107 = {latitude: 14.59652755, longitude: 121.01357829};
var pointB108 = {latitude: 14.59739246, longitude: 121.01354769};
var pointB109 = {latitude: 14.59819031, longitude: 121.01321431};
var pointB110 = {latitude: 14.59886763, longitude: 121.01265805};
var pointB111 = {latitude: 14.59944749, longitude: 121.01198944};
var pointB112 = {latitude: 14.6000159, longitude: 121.01130976};
var pointB113 = {latitude: 14.60058497, longitude: 121.01063068};
var pointB114 = {latitude: 14.60115347, longitude: 121.00995109};
var pointB115 = {latitude: 14.6017175, longitude: 121.00926756};
var pointB116 = {latitude: 14.6022769, longitude: 121.00857995};
var pointB117 = {latitude: 14.60277818, longitude: 121.00784807};
var pointB118 = {latitude: 14.60310338, longitude: 121.00701539};
var pointB119 = {latitude: 14.60337206, longitude: 121.00616125};
var pointB120 = {latitude: 14.60373989, longitude: 121.00534963};
var pointB121 = {latitude: 14.60423542, longitude: 121.00461336};
var pointB122 = {latitude: 14.60487035, longitude: 121.00400028};
var pointB123 = {latitude: 14.60550941, longitude: 121.00339136};
var pointB124 = {latitude: 14.6061481, longitude: 121.00278199};
var pointB125 = {latitude: 14.60678647, longitude: 121.00217225};
var pointB126 = {latitude: 14.60742538, longitude: 121.00156313};
var pointB127 = {latitude: 14.6080657, longitude: 121.00095559};
var pointB128 = {latitude: 14.6087027, longitude: 121.00034435};
var pointB129 = {latitude: 14.60934352, longitude: 120.99973738};
var pointB130 = {latitude: 14.60997996, longitude: 120.99912551};
var pointB131 = {latitude: 14.61062007, longitude: 120.99851773};
var pointB132 = {latitude: 14.61125905, longitude: 120.9979087};
var pointB133 = {latitude: 14.61189563, longitude: 120.99729698};
var pointB134 = {latitude: 14.61253145, longitude: 120.99668443};
var pointB135 = {latitude: 14.61317026, longitude: 120.99607523};
var pointB136 = {latitude: 14.61381161, longitude: 120.99546887};
var pointB137 = {latitude: 14.61445061, longitude: 120.99485987};
var pointB138 = {latitude: 14.61508945, longitude: 120.99425069};
var pointB139 = {latitude: 14.61572828, longitude: 120.99364149};
var pointB140 = {latitude: 14.61636948, longitude: 120.99303499};
var pointB141 = {latitude: 14.61700997, longitude: 120.99242771};
var pointB142 = {latitude: 14.61764832, longitude: 120.99181799};
var pointB143 = {latitude: 14.61828418, longitude: 120.99120552};
var pointB144 = {latitude: 14.61892269, longitude: 120.99059598};
var pointB145 = {latitude: 14.61955793, longitude: 120.98998287};
var pointB146 = {latitude: 14.62018932, longitude: 120.98936554};
var pointB147 = {latitude: 14.62082529, longitude: 120.98875322};
var pointB148 = {latitude: 14.62145745, longitude: 120.98813666};
var pointB149 = {latitude: 14.62203137, longitude: 120.98746778};
var pointB150 = {latitude: 14.62237568, longitude: 120.98664728};
var pointB151 = {latitude: 14.6224893, longitude: 120.98575907};
var pointB152 = {latitude: 14.62258369, longitude: 120.98486609};
var pointB153 = {latitude: 14.62267274, longitude: 120.98397251};
var pointB154 = {latitude: 14.62275872, longitude: 120.9830786};
var pointB155 = {latitude: 14.62284988, longitude: 120.98218524};
var pointB156 = {latitude: 14.62294029, longitude: 120.9812918};
var pointB157 = {latitude: 14.62302803, longitude: 120.98039807};
var pointB158 = {latitude: 14.62311577, longitude: 120.97950435};
var pointB159 = {latitude: 14.62320998, longitude: 120.97861133};
var pointB160 = {latitude: 14.62330583, longitude: 120.97771872};
var pointB161 = {latitude: 14.62361202, longitude: 120.97688288};
var pointB162 = {latitude: 14.62416917, longitude: 120.9761998};
var pointB163 = {latitude: 14.62491226, longitude: 120.97574244};
var pointB164 = {latitude: 14.6257591, longitude: 120.97554828};
var pointB165 = {latitude: 14.62662187, longitude: 120.97564343};
var pointB166 = {latitude: 14.62748422, longitude: 120.97575605};
var pointB167 = {latitude: 14.62834659, longitude: 120.97586844};
var pointB168 = {latitude: 14.62920905, longitude: 120.97598003};
var pointB169 = {latitude: 14.63007148, longitude: 120.97609183};
var pointB170 = {latitude: 14.63093362, longitude: 120.97620598};
var pointB171 = {latitude: 14.63179638, longitude: 120.976315};
var pointB172 = {latitude: 14.63265847, longitude: 120.9764293};
var pointB173 = {latitude: 14.6335198, longitude: 120.97654963};
var pointB174 = {latitude: 14.63438245, longitude: 120.97665946};
var pointB175 = {latitude: 14.63524508, longitude: 120.97676951};
var pointB176 = {latitude: 14.63610741, longitude: 120.97688189};
var pointB177 = {latitude: 14.6369695, longitude: 120.97699626};
var pointB178 = {latitude: 14.63783158, longitude: 120.97711069};
var pointB179 = {latitude: 14.63869407, longitude: 120.97722158};
var pointB180 = {latitude: 14.6395619, longitude: 120.97726177};
var pointB181 = {latitude: 14.6404282, longitude: 120.97718968};
var pointB182 = {latitude: 14.64128813, longitude: 120.9770595};
var pointB183 = {latitude: 14.64214068, longitude: 120.97688491};
var pointB184 = {latitude: 14.64299535, longitude: 120.97672168};
var pointB185 = {latitude: 14.64385129, longitude: 120.97656575};
var pointB186 = {latitude: 14.64471617, longitude: 120.97648655};
var pointB187 = {latitude: 14.64558274, longitude: 120.97643087};
var pointB188 = {latitude: 14.64643693, longitude: 120.97626591};
var pointB189 = {latitude: 14.64643942, longitude: 120.97626543};


// Point Symbol 4
var pointD1 = {latitude: 14.60082279, longitude: 120.99016691};
var pointD2 = {latitude: 14.60119668, longitude: 120.9893564};
var pointD3 = {latitude: 14.6015552, longitude: 120.98853806};
var pointD4 = {latitude: 14.60193641, longitude: 120.98773178};
var pointD5 = {latitude: 14.60229827, longitude: 120.98691504};
var pointD6 = {latitude: 14.60265066, longitude: 120.98609393};
var pointD7 = {latitude: 14.60305548, longitude: 120.98530025};
var pointD8 = {latitude: 14.60335046, longitude: 120.98445993};
var pointD9 = {latitude: 14.60346442, longitude: 120.98357011};
var pointD10 = {latitude: 14.60359185, longitude: 120.9826836};
var pointD11 = {latitude: 14.6037229, longitude: 120.98179755};
var pointD12 = {latitude: 14.60386333, longitude: 120.9809111};
var pointD13 = {latitude: 14.60407729, longitude: 120.98004332};
var pointD14 = {latitude: 14.60440845, longitude: 120.97921281};
var pointD15 = {latitude: 14.60473127, longitude: 120.97837875};
var pointD16 = {latitude: 14.60506639, longitude: 120.97755026};
var pointD17 = {latitude: 14.60540172, longitude: 120.97672205};
var pointD18 = {latitude: 14.60573216, longitude: 120.9758912};
var pointD19 = {latitude: 14.60602867, longitude: 120.97504796};
var pointD20 = {latitude: 14.60634078, longitude: 120.97421101};
var pointD21 = {latitude: 14.60662937, longitude: 120.97336431};
var pointD22 = {latitude: 14.60645809, longitude: 120.97249563};
var pointD23 = {latitude: 14.60624325, longitude: 120.97162526};
var pointD24 = {latitude: 14.60597842, longitude: 120.97077272};
var pointD25 = {latitude: 14.6055536, longitude: 120.97};
var pointD26 = {latitude: 14.60490126, longitude: 120.96940706};
var pointD27 = {latitude: 14.60425864, longitude: 120.96880242};
var pointD28 = {latitude: 14.60358916, longitude: 120.96823059};
var pointD29 = {latitude: 14.60294774, longitude: 120.96762892};
var pointD30 = {latitude: 14.60221654, longitude: 120.96717361};
var pointD31 = {latitude: 14.6015936, longitude: 120.96654809};
var pointD32 = {latitude: 14.6009754, longitude: 120.96591668};
var pointD33 = {latitude: 14.6003458, longitude: 120.9652976};
var pointD34 = {latitude: 14.59984739, longitude: 120.96459001};

// Point Symbol 5
var pointE1 = {latitude: 14.60043638, longitude: 120.96547445};
var pointE2 = {latitude: 14.60106289, longitude: 120.9660962};
var pointE3 = {latitude: 14.60168663, longitude: 120.96671892};
var pointE4 = {latitude: 14.60228737, longitude: 120.96736444};
var pointE5 = {latitude: 14.60295371, longitude: 120.96793642};
var pointE6 = {latitude: 14.60365058, longitude: 120.96846371};
var pointE7 = {latitude: 14.60428801, longitude: 120.96906782};
var pointE8 = {latitude: 14.60491948, longitude: 120.9696703};
var pointE9 = {latitude: 14.60555661, longitude: 120.9702644};
var pointE10 = {latitude: 14.60591417, longitude: 120.9710766};
var pointE11 = {latitude: 14.60612218, longitude: 120.97194665};
var pointE12 = {latitude: 14.60631505, longitude: 120.97282151};
var pointE13 = {latitude: 14.6063427, longitude: 120.9737026};
var pointE14 = {latitude: 14.60603746, longitude: 120.9745433};
var pointE15 = {latitude: 14.60570154, longitude: 120.97536898};
var pointE16 = {latitude: 14.60540116, longitude: 120.97620868};
var pointE17 = {latitude: 14.6050648, longitude: 120.97703698};
var pointE18 = {latitude: 14.60473885, longitude: 120.97786945};
var pointE19 = {latitude: 14.60441909, longitude: 120.97870426};
var pointE20 = {latitude: 14.60412118, longitude: 120.9795476};
var pointE21 = {latitude: 14.60383468, longitude: 120.9803933};
var pointE22 = {latitude: 14.60365418, longitude: 120.98127183};
var pointE23 = {latitude: 14.60353502, longitude: 120.98215908};
var pointE24 = {latitude: 14.60343656, longitude: 120.98304869};
var pointE25 = {latitude: 14.60326004, longitude: 120.98392514};
var pointE26 = {latitude: 14.60309536, longitude: 120.98480512};
var pointE27 = {latitude: 14.60272152, longitude: 120.98561487};
var pointE28 = {latitude: 14.60233177, longitude: 120.98641639};
var pointE29 = {latitude: 14.60198635, longitude: 120.9872396};
var pointE30 = {latitude: 14.60161635, longitude: 120.98804958};
var pointE31 = {latitude: 14.60122786, longitude: 120.98885138};
var pointE32 = {latitude: 14.60083659, longitude: 120.98964458};
var pointE33 = {latitude: 14.60048912, longitude: 120.99046746};
var pointE34 = {latitude: 14.60027246, longitude: 120.99086499};

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
    color: [0, 197, 255, 0.05],
    style: "solid",
    outline: {
      color: "#f0f4f7",
      width: 1.5,
      style: "short-dot"
    }
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
  popupEnabled: false,
  minScale: 1200000,
  maxScale: 0,
  returnGeometry: true
})
map.add(damagePoints,1);


      // listen to the view's click event
      
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

            damageLabel.innerHTML = "DAMAGE" + "<br>" + "<h6>" + "STATUS" + "</h6>" + "<h3>" + damageRating()[rating].toUpperCase() + "</h3>";
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

            damageLabel.innerHTML = "DAMAGE" + "<br>" + "<h6>" + "STATUS" + "</h6>" + "<h3>" + damageRating()[rating].toUpperCase() + "</h3>";
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
view.ui.add(
new Fullscreen({
  view: view,
  element: applicationDiv
}),
"top-left"
);


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
  if (item.title === "Municipal Boundary"){
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
  position: "bottom-left"
});


    });