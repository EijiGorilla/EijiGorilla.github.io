require({
    packages: [{
        name: "app",
        location: window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/js'
    }]
}, [
    "dojo/_base/lang",
    "esri/Map",
    "esri/Color",
    "esri/geometry/SpatialReference",
    "esri/geometry/Extent",
    "esri/views/SceneView",
    "esri/views/3d/externalRenderers",
    "esri/core/Accessor",
    "esri/layers/SceneLayer",
    "esri/widgets/TimeSlider",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/widgets/Fullscreen",
    "dijit/ColorPalette",
    "dijit/form/HorizontalSlider",
    "app/kernel",
    "app/heat",
    "dojo/domReady!"
], function (
             lang,
             Map,
             Color,
             SpatialReference,
             Extent,
             SceneView,
             externalRenderers,
             Accessor,
             SceneLayer,
             TimeSlider,
             GraphicsLayer,
             Graphic,
             Fullscreen,
             ColorPalette,
             HorizontalSlider,
             KernelCalculator,
             appHeat) {

    "use strict";
    // adding the following in .html does not work <script src="http://ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojo/dojo.js" data-dojo-config="async: true"></script>
    const appData = appHeat.data.data;
    const appMesh = appHeat.mesh;

    // esri/core/declare is deparecated.
    //https://js.arcgis.com/4.15/esri/core/declare.js
    const MeshRend = Accessor.createSubclass({
        view: null,
        vertices: appMesh.vertices,
        program: null,
        pMatrixUniform: null,
        vMatrixUniform: null,
        aPosition: null,
        uColorOrig: null,
        uColorDest: null,
        aMult: null,
        bufPosition: null,
        bufMult: null,
        bufIndex: null,
        arrPosition: new Float32Array(3 * appMesh.length),
        arrColorOrig: [0, 0, 0],
        arrColorDest: [0, 0, 0],
        arrMult: new Float32Array(appMesh.length),
        /**
         * Dojo constructor
         */
        constructor: function (view) {
            this.view = view;
        },
        /**
         * Called once after this external renderer is added to the scene.
         * This is part of the external renderer interface.
         */
        setup: function (context) {
            try {
                this.initShaders(context);
            } finally {
                context.resetWebGLState();
            }
        },
        /**
         * Called each time the scene is rendered.
         * This is part of the external renderer interface.
         */
        render: function (context) {
            const gl = context.gl;

            gl.useProgram(this.program);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA
            );

            var camera = context.camera;
            gl.uniformMatrix4fv(this.pMatrixUniform, false, camera.projectionMatrix);
            gl.uniformMatrix4fv(this.vMatrixUniform, false, camera.viewMatrix);

            externalRenderers.toRenderCoordinates(
                this.view,
                this.vertices,
                0,
                SpatialReference.WGS84,
                this.arrPosition,
                0,
                appMesh.length);

            this.draw(gl);

            externalRenderers.requestRender(this.view);
            // cleanup
            context.resetWebGLState();
            // fix for bug in the JS API 4.2, related to RibbonLineMaterial
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA
            );
        },
        draw: function (gl) {
            gl.uniform3fv(this.uColorOrig, new Float32Array(this.arrColorOrig));
            gl.uniform3fv(this.uColorDest, new Float32Array(this.arrColorDest));

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPosition);
            gl.bufferData(gl.ARRAY_BUFFER, this.arrPosition, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufMult);
            gl.bufferData(gl.ARRAY_BUFFER, this.arrMult, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aMult, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aMult);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIndex);

            const glMode = _mode !== "mesh" ? gl.TRIANGLES : gl.LINES;
            gl.drawElements(glMode, appMesh.indices.length, gl.UNSIGNED_SHORT, 0);
        },
        initShaders: function (context) {
            const gl = context.gl;
            const v = 'uniform mat4 uPMatrix;' +
                'uniform mat4 uVMatrix;' +
                'attribute vec3 aPosition;' +
                'attribute float aMult;' +
                'varying float vMult;' +
                'void main(void) {' +
                'vMult = clamp(aMult*2.0,0.0,0.95);' +
                'gl_Position = uPMatrix * uVMatrix * vec4(aPosition, 1.0);' +
                'gl_Position.z -= 1.0;' +
                '}';
            const f = 'precision mediump float;' +
                'uniform vec3 uColorOrig;' +
                'uniform vec3 uColorDest;' +
                'varying float vMult;' +
                'void main(void) {' +
                'gl_FragColor = (1.0 - vMult) * vec4(uColorOrig, vMult) + vMult * vec4(uColorDest, vMult);' +
                '}';

            const vShader = gl.createShader(gl.VERTEX_SHADER);
            const fShader = gl.createShader(gl.FRAGMENT_SHADER);

            gl.shaderSource(vShader, v);
            gl.shaderSource(fShader, f);

            gl.compileShader(vShader);
            if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(vShader));
                return;
            }
            gl.compileShader(fShader);
            if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(fShader));
                return;
            }

            this.program = gl.createProgram();

            gl.attachShader(this.program, vShader);
            gl.attachShader(this.program, fShader);

            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                alert(gl.getShaderInfoLog(this.program));
                return;
            }

            this.pMatrixUniform = gl.getUniformLocation(this.program, 'uPMatrix');
            this.vMatrixUniform = gl.getUniformLocation(this.program, 'uVMatrix');

            this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
            this.uColorOrig = gl.getUniformLocation(this.program, 'uColorOrig');
            this.uColorDest = gl.getUniformLocation(this.program, 'uColorDest');
            this.aMult = gl.getAttribLocation(this.program, 'aMult');

            this.bufPosition = gl.createBuffer();
            this.bufMult = gl.createBuffer();
            this.bufIndex = gl.createBuffer();

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIndex);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(appMesh.indices), gl.STATIC_DRAW);
        }
    }); // end of Accessor.createSubclass

    var map = new Map({
        basemap: 'dark-gray-vector'
    });

    var view = new SceneView({
        container: 'panelView',
        viewingMode: "local",
        map: map,
        extent: new Extent({xmin: appMesh.xmin, ymin: appMesh.ymin, xmax: appMesh.xmax, ymax: appMesh.ymax})
    });
    view.when(function () {
        updateUI();
    }, function (err) {
        alert('Error:' + err);
    });

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
  
    // Full screen widget
    view.ui.add(
        new Fullscreen({
          view: view,
          element: panelView
          //element: viewDiv // if you change element to viewDiv, only viewDiv panel is fully expanded
          // this is good for demonstration, as this removes header and chart panels.
        }),
        "top-left"
      );

    var _dtIndex = 0;
    var _mode = "mesh";
    var _origColor = "#0000ff";
    var _destColor = "#ff0000";
    var _radius = 2;
    var _meshRend;
    var _heatmapCalc;

    const _size = [appMesh.rows, appMesh.cols];

    function updateUI() {
        _meshRend = new MeshRend(view);
        externalRenderers.add(view, _meshRend);

        _heatmapCalc = new KernelCalculator();

        // Time Slider
        const start = new Date(1992, 11, 30);
        const end = new Date(2015, 11, 30);

        const panelSlider = document.getElementById("panelSlider");

        var timeContainer = document.getElementById("timeContainer");
        const timeSlider = new TimeSlider({
            container: "timeContainer",
            mode: "cumulative-from-start",
            layout: "compact",
            fullTimeExtent: {
              start: start,
              end: end
            },
            values: [start],
            stops: {
              interval: {
                  value: 1,
                  unit: "years"
              },
              timeExtent: { start, end }
            },
            //disabled: true,
            });
            timeContainer.style.display = 'block';
            timeSlider.watch("timeExtent", function(timeExtent) {
                const INDEX = timeExtent.end.getFullYear() - start.getFullYear(); // subtract from initial year to get index values
                horizontalSlider_changeHandler(INDEX);
            });
            //view.ui.add(timeContainer, "bottom-right");
        

        /*
        new HorizontalSlider({
            value: 0,
            minimum: 0,
            maximum: Math.max(0, appData.length - 1),
            discreteValues: appData.length,
            intermediateChanges: true,
            showButtons: false,
            clickSelect: true,
            style: "width:90%;",
            onChange: horizontalSlider_changeHandler
        }, "panelSlider").startup();
        */

        var icon = document.getElementById('icon');
        var switchMesh = document.getElementById('switchMesh');
        var switchSurface = document.getElementById('switchSurface');

        icon.addEventListener("click", toggleSettings);
        switchMesh.addEventListener("click", lang.hitch(this, setMode, "mesh"));
        switchSurface.addEventListener("click", lang.hitch(this, setMode, "surface"))

        new ColorPalette({
            palette: "7x10",
            onChange: function (val) {
                changeOrigColor(val);
            }
        }, "startColor").startup();

        new ColorPalette({
            palette: "7x10",
            onChange: function (val) {
                changeDestColor(val);
            }
        }, "endColor").startup();

        
        new HorizontalSlider({
            value: 2,
            minimum: 1,
            maximum: 5,
            discreteValues: 10,
            intermediateChanges: true,
            showButtons: false,
            style: "width:90%;",
            onChange: radiusSlider_changeHandler
        }, "radiusSlider").startup();

        updateViz();
    }
    

    var panelDate = document.getElementById('panelDate');

    function updateViz() {
        const sRGB = normalizeRGB(Color.fromHex(_origColor).toRgb());
        const eRGB = normalizeRGB(Color.fromHex(_destColor).toRgb());
        const data = appData[_dtIndex];
        //panelDate.innerHTML = data.datetime;
        const zArr = _heatmapCalc.calculateKernel(data.points, _size, _radius);
        const vertices = appMesh.vertices.slice(0);
        var z = 2;
        for (var i = 0; i < appMesh.length; i++) {
            vertices[z] = 25 + 5000 * zArr[i];
            z += 3;
        }
        _meshRend.arrColorOrig = sRGB;
        _meshRend.arrColorDest = eRGB;
        _meshRend.arrMult = zArr;
        _meshRend.vertices = vertices;
    }

    function normalizeRGB(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        return [r, g, b];
    }

    const headerTitleDiv = document.getElementById("headerTitleDiv");


    function horizontalSlider_changeHandler(index) {
        headerTitleDiv.innerHTML = index;
        _dtIndex = index;
        updateViz();
    }

    var panelSettings = document.getElementById('panelSettings');
    function toggleSettings() {
        panelSettings.classList.toggle("open");
       // domClass.toggle("panelSettings", "open");
    }

    function setMode(value) {
        _mode = value;
        if (_mode === "mesh") {
            switchMesh.classList.add('on');
            switchSurface.classList.remove('on');
            //domClass.add("switchMesh", "on");
            //domClass.remove("switchSurface", "on");
        } else {
            switchMesh.classList.remove('on');
            switchSurface.classList.add('on');    
            //domClass.remove("switchMesh", "on");
            //domClass.add("switchSurface", "on");
        }
    }

    var startSwatch = document.getElementById('startSwatch');
    var endSwatch = document.getElementById('endSwatch');

    function changeOrigColor(value) {
        _origColor = value;
        startSwatch.style.background = value;
        //domStyle.set("startSwatch", "background-color", value);
        updateViz();
    }

    function changeDestColor(value) {
        _destColor = value;
        endSwatch.style.background = value;
        //domStyle.set("endSwatch", "background-color", value);
        updateViz();
    }

    function radiusSlider_changeHandler(value) {
        _radius = value;
        updateViz();
    }

});