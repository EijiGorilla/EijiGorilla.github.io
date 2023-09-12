import { useLayoutEffect, useContext, useRef, useState, useEffect } from 'react';
import { lotLayer } from '../layers';
import DataContext from '../components/DataContext';
import { view } from '../Scene';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Query from '@arcgis/core/rest/support/Query';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import { generateLotData } from '../components/Query';
import { handleInputChange } from '../components/DropDownFilter';

const statusLot: string[] = [
  'Handed-Over',
  'Paid',
  'For Payment Processing',
  'For Legal Pass',
  'For Appraisal/Offer to Buy',
  'For Expro',
];

//https://codesandbox.io/s/amcharts5-react-demo-forked-gid7b0?from-embed=&file=/src/App.js:271-276
// https://github.com/reactchartjs/react-chartjs-2/blob/master/src/chart.tsx
//https://www.reddit.com/r/reactjs/comments/gr5vhh/react_hooks_and_amcharts4/?rdt=56344
//https://medium.com/swlh/how-to-use-amcharts-4-with-react-hooks-999a62c185a5
//https://codesandbox.io/s/amcharts5-react-demo-forked-hrth2d
// Zoom

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

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

/// Draw chart
interface Props {
  chartID: any;
  data?: any;
  lotNumber?: any;
}
const LotChart = () => {
  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const municipalBarangayContext = useContext(DataContext);
  const [lotData, setLotData] = useState([
    {
      category: String,
      value: Number,
      sliceSettings: {
        fill: am5.color('#00c5ff'),
      },
    },
  ]);

  const chartID = 'pie-two';

  const municipalSelected = municipalBarangayContext.municipality;
  const barangaySelected = municipalBarangayContext.barangay;

  const queryMunicipality = "Municipality = '" + municipalSelected + "'";
  const queryBarangay = "Barangay = '" + barangaySelected + "'";
  const queryMunicipalBarangay = queryMunicipality + ' AND ' + queryBarangay;

  if (municipalSelected && !barangaySelected) {
    lotLayer.definitionExpression = queryMunicipality;
  } else if (barangaySelected) {
    lotLayer.definitionExpression = queryMunicipalBarangay;
  }

  useEffect(() => {
    handleInputChange().then((response: any) => {
      console.log(response);
    });
  });

  useEffect(() => {
    generateLotData().then((result: any) => {
      setLotData(result);
    });
  }, [municipalSelected, barangaySelected]);

  useLayoutEffect(() => {
    // Dispose previously created root element
    zoomToLayer(lotLayer);
    maybeDisposeRoot(chartID);

    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root), am5themes_Responsive.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        //centerY: am5.percent(-2), //-10
        y: am5.percent(-25), // space between pie chart and total lots
        layout: root.horizontalLayout,
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
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(20),
        marginBottom: -10,
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // Set slice opacity and stroke color
    pieSeries.slices.template.setAll({
      fillOpacity: 0.9,
      stroke: am5.color('#ffffff'),
      strokeWidth: 1,
      strokeOpacity: 1,
      templateField: 'sliceSettings',
    });

    // Disabling labels and ticksll
    pieSeries.labels.template.set('visible', false);
    pieSeries.ticks.template.set('visible', false);

    // EventDispatcher is disposed at SpriteEventDispatcher...
    // It looks like this error results from clicking events
    pieSeries.slices.template.events.on('click', (ev) => {
      var Selected: any = ev.target.dataItem?.dataContext;
      var Category: string = Selected.category;

      var highlightSelect: any;
      var SelectedStatus: number | null;

      if (Category === statusLot[0]) {
        SelectedStatus = 0;
      } else if (Category === statusLot[1]) {
        SelectedStatus = 1;
      } else if (Category === statusLot[2]) {
        SelectedStatus = 2;
      } else if (Category === statusLot[3]) {
        SelectedStatus = 3;
      } else if (Category === statusLot[4]) {
        SelectedStatus = 4;
      } else if (Category === statusLot[5]) {
        SelectedStatus = 5;
      }

      var query = lotLayer.createQuery();

      view.when(function () {
        view.whenLayerView(lotLayer).then((layerView): any => {
          //chartLayerView = layerView;

          lotLayer.queryFeatures(query).then(function (results) {
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

            lotLayer.queryExtent(queryExt).then(function (result) {
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
          }); // End of queryFeatures

          layerView.filter = new FeatureFilter({
            where: 'StatusLA = ' + SelectedStatus,
          });
        }); // End of view.whenLayerView
      }); // End of view.whenv
    });

    pieSeries.data.setAll(lotData);

    // Legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    var legend = root.container.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        y: am5.percent(48),
        layout: root.verticalLayout,
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Change the size of legend markers
    legend.markers.template.setAll({
      width: 18,
      height: 18,
    });

    // Change the marker shape
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10,
    });

    // Responsive legend
    // https://www.amcharts.com/docs/v5/tutorials/pie-chart-with-a-legend-with-dynamically-sized-labels/
    // This aligns Legend to Left
    chart.onPrivate('width', function (width) {
      const boxWidth = 190; //props.style.width;
      var availableSpace = Math.max(boxWidth - chart.width() - boxWidth, 190);
      //var availableSpace = (boxWidth - valueLabelsWidth) * 0.7
      legend.labels.template.setAll({
        width: availableSpace,
        maxWidth: availableSpace,
      });
    });

    // To align legend items: valueLabels right, labels to left
    // 1. fix width of valueLabels
    // 2. dynamically change width of labels by screen size

    const valueLabelsWidth = 50;

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
      paddingBottom: 2,
    });

    pieSeries.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, lotData]);

  useLayoutEffect(() => {
    pieSeriesRef.current?.data.setAll(lotData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div style={{ color: 'white', fontSize: '20px' }}>{municipalSelected}</div>
      <div
        id={chartID}
        style={{
          height: '330px',
          backgroundColor: 'rgb(0,0,0,0)',
          color: 'white',
        }}
      ></div>
    </>
  );
}; // End of lotChartgs

export default LotChart;
