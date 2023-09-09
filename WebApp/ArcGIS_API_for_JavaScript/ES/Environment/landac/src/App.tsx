import { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { map, view, basemaps, layerList } from './Scene';
import './index.css';
import './App.css';
import UserContext, { DropDownProvider } from './components/DropDownProvider';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-list';
import '@esri/calcite-components/dist/components/calcite-list-item';
import '@esri/calcite-components/dist/components/calcite-shell-panel';
import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-bar';
import '@esri/calcite-components/dist/calcite/calcite.css';
import {
  CalciteShell,
  CalciteShellPanel,
  CalciteActionBar,
  CalciteAction,
  CalciteTab,
  CalciteTabs,
  CalciteTabNav,
  CalciteTabTitle,
  CalciteLoader,
  CalcitePanel,
  CalciteList,
  CalciteListItem,
} from '@esri/calcite-components-react';
import Statistics from './components/Statistics';
import { generateLotData, generateLotNumber } from './components/Query';
import LotChartStatistics from './statistics/LotChartStatistics';
import LotMoaChart from './chart/LotMoaChart';

function App() {
  const mapDiv = useRef(null);
  const layerListDiv = useRef<HTMLDivElement | undefined | any>(null);
  const calcitePanelBasemaps = useRef<HTMLDivElement | undefined | any>(null);
  const [activeWidget, setActiveWidget] = useState<undefined | any | unknown>(null);
  const [nextWidget, setNextWidget] = useState<undefined | any | unknown>(null);
  const [lotNumber, setLotNumber] = useState(0);

  //https://stackoverflow.com/questions/70832641/react-onclick-event-working-on-twice-clicks-when-clicking-again
  useEffect(() => {
    if (activeWidget) {
      const actionActiveWidget = document.querySelector(
        `[data-panel-id=${activeWidget}]`,
      ) as HTMLCalcitePanelElement;
      actionActiveWidget.hidden = true;
    }

    if (nextWidget !== activeWidget) {
      const actionNextWidget = document.querySelector(
        `[data-panel-id=${nextWidget}]`,
      ) as HTMLCalcitePanelElement;
      actionNextWidget.hidden = false;
    }
  });

  useEffect(() => {
    if (mapDiv.current) {
      /**
       * Initialize
       */

      map.ground.navigationConstraint = {
        type: 'none',
      };

      view.container = mapDiv.current;
      view.ui.components = [];
      view.ui.empty('top-left');
      basemaps.container = calcitePanelBasemaps.current;
      layerList.container = layerListDiv.current;
    }
  }, []);

  // https://developers.arcgis.com/calcite-design-system/resources/frameworks/
  // --calcite-ui-background: #353535 f
  // https://developers.arcgis.com/calcite-design-system/foundations/colors/
  // https://codesandbox.io/examples/package/@esri/calcite-components-react
  return (
    <div className="entire">
      <CalciteLoader text="loading" label="labelling"></CalciteLoader>
      <CalciteShell id="mainCalciteShell">
        <CalciteTabs slot="panel-end">
          <div id="chartPanel">
            <CalciteTabNav slot="tab-nav" id="thetabs">
              <CalciteTabTitle class="Land" selected>
                Land
              </CalciteTabTitle>
              <CalciteTabTitle class="Structure">Structure</CalciteTabTitle>
              <CalciteTabTitle class="ISF">NLO</CalciteTabTitle>
              <CalciteTabTitle class="ExproList">ExproList</CalciteTabTitle>
            </CalciteTabNav>
            <CalciteTab>
              <div className="lotNumberImage" style={{ display: 'flex' }}>
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ color: 'white', fontSize: '1vw' }}>TOTAL LOTS</div>
                  <br />
                  <br />
                  <b
                    style={{
                      color: '#6ede00',
                      fontSize: '2.5vw',
                      fontWeight: 'bold',
                      fontFamily: 'calibri',
                    }}
                  >
                    1,250{' '}
                    <div style={{ color: 'white', fontSize: '1vw', fontWeight: 'normal' }}>
                      (1,100)
                    </div>
                  </b>
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/Land_logo.png"
                  alt="Land Logo"
                  height={'17%'}
                  width={'17%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <Statistics value={lotNumber} setLotNumber={() => setLotNumber(lotNumber)} />
            </CalciteTab>
          </div>
        </CalciteTabs>
        <header
          slot="header"
          id="header-title"
          style={{ display: 'flex', width: '100%', padding: '0 1rem' }}
        >
          <b
            style={{
              color: 'white',
              marginLeft: '1rem',
              fontSize: '2.6vh',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          >
            N2 LAND ACQUISITION
          </b>
          <DropDownProvider />
        </header>

        <CalciteShellPanel
          width-scale="1"
          slot="panel-start"
          position="start"
          id="left-shell-panel"
          displayMode="dock"
        >
          <CalciteActionBar slot="action-bar">
            <CalciteAction
              data-action-id="layers"
              icon="layers"
              text="layers"
              id="layers"
              //textEnabled={true}
              onClick={(event: any) => {
                setNextWidget(event.target.id);
                setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
              }}
            ></CalciteAction>

            <CalciteAction
              data-action-id="basemaps"
              icon="basemap"
              text="basemaps"
              id="basemaps"
              onClick={(event: any) => {
                setNextWidget(event.target.id);
                setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
              }}
            ></CalciteAction>

            <CalciteAction
              data-action-id="charts"
              icon="graph-time-series"
              text="Progress Chart"
              id="charts"
              onClick={(event: any) => {
                setNextWidget(event.target.id);
                setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
              }}
            ></CalciteAction>

            <CalciteAction
              data-action-id="information"
              icon="information"
              text="Information"
              id="information"
              onClick={(event: any) => {
                setNextWidget(event.target.id);
                setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
              }}
            ></CalciteAction>
          </CalciteActionBar>

          <CalcitePanel heading="Layers" height-scale="l" data-panel-id="layers" hidden>
            <CalciteList>
              <CalciteListItem
                label=""
                description=""
                value="land-acquisition"
                ref={layerListDiv}
              ></CalciteListItem>
            </CalciteList>
          </CalcitePanel>

          <CalcitePanel heading="Basemaps" height-scale="l" data-panel-id="basemaps" hidden>
            <CalciteList>
              <CalciteListItem
                label=""
                description=""
                value="basemaps"
                ref={calcitePanelBasemaps}
              ></CalciteListItem>
            </CalciteList>
          </CalcitePanel>

          <CalcitePanel
            class="timeSeries-panel"
            height-scale="l"
            data-panel-id="charts"
            hidden
          ></CalcitePanel>

          <CalcitePanel heading="Description" data-panel-id="information" hidden>
            <div id="info-content">
              <div id="item-description"></div>
            </div>
          </CalcitePanel>
        </CalciteShellPanel>
        <div className="mapDiv" ref={mapDiv}></div>
      </CalciteShell>
    </div>
  );
}

export default App;
