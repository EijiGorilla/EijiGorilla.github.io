import { useLayoutEffect, useRef, useState } from 'react';
import { structureLayer } from '../layers';
import { view } from '../Scene';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Query from '@arcgis/core/rest/support/Query';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import { generateStrucMoaData } from '../components/Query';

const statusMoaStructure = ['For Negotiation', 'Expropriation', 'Donation', 'No Need to Acquire'];

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

///*** Others */
function zoomToLayer(layer: any) {
  return layer.queryExtent().then((response: any) => {
    view
      .goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch(function (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });
  });
}

function StructureMoaChart({ municipal, barangay }: any) {
  const barSeriesRef = useRef<unknown | any | undefined>({});
  const yAxisRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [structureMoaData, setStructureMoaData] = useState([
    {
      category: String,
      value: Number,
    },
  ]);

  const queryMunicipality = "Municipality = '" + municipal + "'";
  const queryBarangay = "Barangay = '" + barangay + "'";
  const queryMunicipalBarangay = queryMunicipality + ' AND ' + queryBarangay;

  if (municipal && !barangay) {
    structureLayer.definitionExpression = queryMunicipality;
  } else if (barangay) {
    structureLayer.definitionExpression = queryMunicipalBarangay;
  }
  const chartID = 'structure-moa';

  useLayoutEffect(() => {
    generateStrucMoaData().then((response: any) => {
      setStructureMoaData(response);
    });
  }, [municipal, barangay]);

  useLayoutEffect(() => {
    // Dispose previously created root element
    zoomToLayer(structureLayer);
    maybeDisposeRoot(chartID);

    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root), am5themes_Responsive.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
        marginTop: 20,
        //height: am5.percent(81),
      }),
    );
    chartRef.current = chart;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 5,
      strokeOpacity: 1,
      strokeWidth: 1,
      inversed: true,
      stroke: am5.color('#ffffff'),
    });
    yRenderer.grid.template.set('location', 1);

    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: 'category',
        renderer: yRenderer,
      }),
    );

    // Remove grid lines
    yAxis.get('renderer').grid.template.set('forceHidden', true);

    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        strictMinMax: true,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root, {
          visible: true,
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: am5.color('#ffffff'),
        }),
      }),
    );
    // Remove grid lines
    xAxis.get('renderer').grid.template.set('forceHidden', true);

    // Label properties for yAxis (category axis)
    yAxis.get('renderer').labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: 'center',
      fill: am5.color('#ffffff'),
      //maxWidth: 150,
      fontSize: 12,
    });

    xAxis.get('renderer').labels.template.setAll({
      fill: am5.color('#ffffff'),
      fontSize: 10,
    });

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Series 1',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'value',
        sequencedInterpolation: true,
        categoryYField: 'category',
      }),
    );
    barSeriesRef.current = series;
    chart.series.push(series);

    var columnTemplate = series.columns.template;

    columnTemplate.setAll({
      draggable: true,
      cursorOverStyle: 'pointer',
      tooltipText: '{value}',
      cornerRadiusBR: 10,
      cornerRadiusTR: 10,
      strokeOpacity: 0,
    });

    // Add Label bullet
    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: '{value}',
          fill: root.interfaceColors.get('alternativeText'),
          centerY: 8,
          centerX: am5.p50,
          fontSize: 13,
          populateText: true,
        }),
      });
    });

    // Use different color by column
    /*
    columnTemplate.adapters.add('fill', (fill, target) => {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });

    columnTemplate.adapters.add('stroke', (stroke, target) => {
      return chart.get('colors').getIndex(series.columns.indexOf(target));
    });
    */

    series.columns.template.events.on('click', function (ev) {
      var Selected: any = ev.target.dataItem?.dataContext;
      var Category: string = Selected.category;

      var highlightSelect: any;
      var SelectedStatus: number | null;

      if (Category === statusMoaStructure[0]) {
        SelectedStatus = 1;
      } else if (Category === statusMoaStructure[1]) {
        SelectedStatus = 2;
      } else if (Category === statusMoaStructure[2]) {
        SelectedStatus = 3;
      } else if (Category === statusMoaStructure[3]) {
        SelectedStatus = 4;
      }

      var query = structureLayer.createQuery();
      view.whenLayerView(structureLayer).then(function (layerView) {
        //CHART_ELEMENT.style.visibility = "visible";

        structureLayer.queryFeatures(query).then(function (results) {
          const RESULT_LENGTH = results.features;
          const ROW_N = RESULT_LENGTH.length;

          let objID = [];
          for (var i = 0; i < ROW_N; i++) {
            var obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }

          var queryExt = new Query({
            objectIds: objID,
          });

          structureLayer.queryExtent(queryExt).then(function (result) {
            if (result.extent) {
              view.goTo(result.extent);
            }
          });

          if (highlightSelect) {
            highlightSelect.remove();
          }
          highlightSelect = layerView.highlight(objID);

          view.on('click', function () {
            layerView.filter = new FeatureFilter({
              where: undefined,
            });
            highlightSelect.remove();
          });
        });
        layerView.filter = new FeatureFilter({
          where: 'MoA = ' + SelectedStatus,
        });
      }); // End of whenLayerView
    });

    // Chart title
    chart.children.unshift(
      am5.Label.new(root, {
        text: 'MODE OF ACQUISITION',
        fontSize: '1.1vw',
        fontWeight: 'normal',
        textAlign: 'left',
        fill: am5.color('#f7f5f7'),
        paddingTop: -21,
        paddingLeft: 20,
      }),
    );

    yAxisRef.current = yAxis;
    yAxis.data.setAll(structureMoaData);
    series.data.setAll(structureMoaData);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, structureMoaData]);

  useLayoutEffect(() => {
    barSeriesRef.current?.data.setAll(structureMoaData);
    yAxisRef.current?.data.setAll(structureMoaData);
  });

  return (
    <>
      <div
        id={chartID}
        style={{
          height: '21vh',
          backgroundColor: 'rgb(0,0,0,0)',
          color: 'white',
        }}
      ></div>
    </>
  );
}
export default StructureMoaChart;
