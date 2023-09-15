import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { structureLayer } from '../layers';
import { view } from '../Scene';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Query from '@arcgis/core/rest/support/Query';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import { generateStructureData } from '../components/Query';

const statusStructure = [
  'Dismantling/Clearing',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/Offer to Compensate',
  'LBP Account Opening',
];

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

const StructureChart = ({ municipal, barangay }: any) => {
  const seriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [structureData, setStructureData] = useState([
    {
      category: String,
      value: Number,
    },
  ]);

  const chartID = 'pie-structure';
  const queryMunicipality = "Municipality = '" + municipal + "'";
  const queryBarangay = "Barangay = '" + barangay + "'";
  const queryMunicipalBarangay = queryMunicipality + ' AND ' + queryBarangay;

  if (municipal && !barangay) {
    structureLayer.definitionExpression = queryMunicipality;
  } else if (barangay) {
    structureLayer.definitionExpression = queryMunicipalBarangay;
  }

  useEffect(() => {
    generateStructureData().then((result: any) => {
      setStructureData(result);
    });
  }, [municipal, barangay]);

  useLayoutEffect(() => {
    //zoomToLayer(structureLayer);
    maybeDisposeRoot(chartID);

    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themes
    class MyTheme extends am5.Theme {
      patterns: any;
      currentPattern: number | any;
      setupDefaultRules() {
        var theme = this;

        const gap = 4;
        const rotation = 135;
        const strokeWidth = 1.1;
        const fillOpacity = 0;
        const width = 10;
        const height = 10;

        this.patterns = [
          am5.LinePattern.new(this._root, {
            color: am5.color('#00C5FF'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),

          am5.LinePattern.new(this._root, {
            color: am5.color('#70AD47'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),

          am5.LinePattern.new(this._root, {
            color: am5.color('#0070FF'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),

          am5.LinePattern.new(this._root, {
            color: am5.color('#FFFF00'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),
          am5.LinePattern.new(this._root, {
            color: am5.color('#FFAA00'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),

          am5.LinePattern.new(this._root, {
            color: am5.color('#FF0000'),
            gap: gap,
            rotation: rotation,
            strokeWidth: strokeWidth,
            fillOpacity: fillOpacity,
            width: width,
            height: height,
          }),
        ];

        this.currentPattern = 0;
        this.rule('Slice').setAll({
          fillOpacity: 1,
        });

        this.rule('Slice').setup = function (target) {
          target.set('fillPattern', theme.patterns[theme.currentPattern]);
          theme.currentPattern++;
          if (theme.currentPattern === theme.patterns.length) {
            theme.currentPattern = 0;
          }
        };
      }
    }

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
      MyTheme.new(root),
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        //centerY: am5.percent(-2), //-10
        //y: am5.percent(-30), // -30
        y: am5.percent(-7),
        layout: root.verticalLayout,
      }),
    );
    chartRef.current = chart;

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    var pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: 'Series',
        categoryField: 'category',
        valueField: 'value',
        //legendLabelText: "[{fill}]{category}[/]",
        legendValueText: "{valuePercentTotal.formatNumber('#.')}% ({value})",
        radius: am5.percent(70), // outer radius
        innerRadius: am5.percent(30),
        marginBottom: -10,
      }),
    );
    seriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Set slice opacity and stroke color
    pieSeries.slices.template.setAll({
      //fillOpacity: 0.9,
      stroke: am5.color('#ffffff'),
      strokeWidth: 1,
      strokeOpacity: 1,
      tooltipText: '{category}: {value}',
      tooltipY: am5.percent(10),
      //fill: am5.color("#1e8553")//root3.interfaceColors.get("alternativeText"),
    });

    // Disabling labels and ticksll
    pieSeries.labels.template.set('visible', false);
    pieSeries.ticks.template.set('visible', false);

    pieSeries.slices.template.events.on('click', (ev) => {
      var Selected: any = ev.target.dataItem?.dataContext;
      var Category: string = Selected.category;

      var highlightSelect: any;
      var SelectedStatus: number | null;

      if (Category === statusStructure[0]) {
        SelectedStatus = 0;
      } else if (Category === statusStructure[1]) {
        SelectedStatus = 1;
      } else if (Category === statusStructure[2]) {
        SelectedStatus = 2;
      } else if (Category === statusStructure[3]) {
        SelectedStatus = 3;
      } else if (Category === statusStructure[4]) {
        SelectedStatus = 4;
      } else if (Category === statusStructure[5]) {
        SelectedStatus = 5;
      }

      var query = structureLayer.createQuery();
      query.outFields = ['StatusStruc', 'OBJECTID'];

      view.when(function () {
        view.whenLayerView(structureLayer).then((strucLayerView): any => {
          //chartLayerView = layerView;

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
            highlightSelect = strucLayerView.highlight(objID);

            view.on('click', function () {
              strucLayerView.filter = new FeatureFilter({
                where: undefined,
              });
              highlightSelect.remove();
            });
          }); // End of queryFeatures
          strucLayerView.filter = new FeatureFilter({
            where: 'StatusStruc = ' + SelectedStatus,
          });
        }); // End of view.whenLayerView
      }); // End of view.whenv
    });

    pieSeries.data.setAll(structureData);

    // Legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.verticalLayout,
        marginBottom: 10,
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Change the size of legend markers
    legend.markers.template.setAll({
      width: 18,
      height: 18,
      //strokeWidth: 1,
      //strokeOpacity: 1,
      //stroke: am5.color('#ffffff'),
    });

    // Change the marker shape
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10,
    });

    const valueLabelsWidth = 50;

    // Responsive legend
    // https://www.amcharts.com/docs/v5/tutorials/pie-chart-with-a-legend-with-dynamically-sized-labels/
    chart.onPrivate('width', function (width) {
      const boxWidth = 190; //props.style.width;
      var availableSpace = Math.max(boxWidth - chart.width() - boxWidth, 190);
      //var availableSpace = (boxWidth - valueLabelsWidth) * 0.7
      legend.labels.template.setAll({
        width: availableSpace,
        maxWidth: availableSpace,
      });
    });

    // Change legend labelling properties
    // To have responsive font size, do not set font size
    legend.labels.template.setAll({
      oversizedBehavior: 'truncate',
      fill: am5.color('#ffffff'),
      //textDecoration: "underline"
      //width: am5.percent(200)
      //fontWeight: "300"
    });

    legend.valueLabels.template.setAll({
      textAlign: 'right',
      width: valueLabelsWidth,
      fill: am5.color('#ffffff'),
      //fontSize: LEGEND_FONT_SIZE,
    });

    legend.itemContainers.template.setAll({
      // set space between legend items
      paddingTop: 1.1,
      paddingBottom: 1.1,
    });

    pieSeries.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, [chartID, structureData]);

  useLayoutEffect(() => {
    seriesRef.current?.data.setAll(structureData);
    legendRef.current?.data.setAll(seriesRef.current.dataItems);
  });

  return (
    <>
      <div
        id={chartID}
        style={{
          height: '45vh',
          backgroundColor: 'rgb(0,0,0,0)',
          color: 'white',
          marginBottom: '-1.5vh',
        }}
      ></div>
    </>
  );
};
export default StructureChart;
