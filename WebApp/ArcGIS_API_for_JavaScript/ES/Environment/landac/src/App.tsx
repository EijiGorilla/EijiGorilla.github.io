import { useRef, useEffect, useState } from 'react';
import Select from 'react-select';
import { map, view, basemaps, layerList } from './Scene';
import './index.css';
import './App.css';
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
import LotChart from './chart/LotChart';
import LotMoaChart from './chart/LotMoaChart';
import {
  generateLotNumber,
  generateNloNumber,
  generatePermitEnter,
  generateStrucNumber,
  getMuniciaplityBarangayPair,
  thousands_separators,
} from './components/Query';
import StructureChart from './chart/StructureChart';
import StructureMoaChart from './chart/StructureMoaChart';
import NloChart from './chart/NloChart';
import LotProgressChart from './chart/LotProgressChart';
import ExpropriationList from './components/ExpripriationList';

function App() {
  //**** Set states */
  const mapDiv = useRef(null);
  const layerListDiv = useRef<HTMLDivElement | undefined | any>(null);
  const searchDiv = useRef<HTMLDivElement | undefined | any>(null);

  // For Calcite Design
  const calcitePanelBasemaps = useRef<HTMLDivElement | undefined | any>(null);
  const [activeWidget, setActiveWidget] = useState<undefined | any | unknown>(null);
  const [nextWidget, setNextWidget] = useState<undefined | any | unknown>(null);

  // For dropdown filter
  const [initMunicipalBarangay, setInitMunicipalBarangay] = useState([
    {
      municipality: '',
      barangay: [
        {
          name: '',
        },
      ],
    },
  ]);

  const [municipality, setMunicipality] = useState(null);
  const [barangay, setBarangay] = useState(null);
  const [barangayList, setBarangayList] = useState([]);
  const [municipalSelected, setMunicipalSelected] = useState({
    municipality: '',
    barangay: [
      {
        name: '',
      },
    ],
  });
  const [barangaySelected, setBarangaySelected] = useState({ name: '' });

  // For lot numbers and permit-to-enter
  const [lotNumber, setLotNumber] = useState([]);
  const [pteNumber, setPteNumber] = useState([]);

  const [structureNumber, setStructureNumber] = useState([]);
  const [nloNumber, setNloNumber] = useState(0);

  //**** Create dropdonw list */
  // Get a pair of municipality and barangay
  useEffect(() => {
    getMuniciaplityBarangayPair().then((response: any) => {
      setInitMunicipalBarangay(response);
    });
  }, []);

  // handle change event of the Municipality dropdown
  const handleMunicipalityChange = (obj: any) => {
    setMunicipalSelected(obj);
    setMunicipality(obj);
    setBarangayList(obj.barangay);
    setBarangay(null);
    setBarangaySelected({ name: '' });
  };

  // handle change event of the barangay dropdownff
  const handleBarangayChange = (obj: any) => {
    setBarangaySelected(obj);
    setBarangay(obj);
  };

  // End of dropdown list

  // Calculate the number of lot and structure
  useEffect(() => {
    // Lot
    generateLotNumber().then((response: any) => {
      setLotNumber(response);
    });

    generatePermitEnter().then((response: any) => {
      setPteNumber(response);
    });

    // Structure
    generateStrucNumber().then((response: any) => {
      setStructureNumber(response);
    });

    // Non-Land Owner
    generateNloNumber().then((response: any) => {
      setNloNumber(response);
    });
  }, [municipalSelected, barangaySelected]);

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

  // Style CSS
  const customstyles = {
    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
      // const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isFocused ? '#999999' : isSelected ? '#2b2b2b' : '#2b2b2b',
        color: '#ffffff',
      };
    },

    control: (defaultStyles: any) => ({
      ...defaultStyles,
      backgroundColor: '#2b2b2b',
      borderColor: '#949494',
      height: 35,
      width: '170px',
      color: '#ffffff',
    }),
    singleValue: (defaultStyles: any) => ({ ...defaultStyles, color: '#fff' }),
  };

  // https://developers.arcgis.com/calcite-design-system/resources/frameworks/
  // --calcite-ui-background: #353535 f
  // https://developers.arcgis.com/calcite-design-system/foundations/colors/
  // https://codesandbox.io/examples/package/@esri/calcite-components-react
  return (
    <div className="entire">
      <CalciteLoader text="loading" label="labelling"></CalciteLoader>
      <CalciteShell id="mainCalciteShell">
        <CalciteTabs slot="panel-end" style={{ width: '27vw' }}>
          <div id="chartPanel" style={{ height: '100%' }}>
            <CalciteTabNav slot="tab-nav" id="thetabs">
              <CalciteTabTitle class="Land">Land</CalciteTabTitle>
              <CalciteTabTitle class="Structure">Structure</CalciteTabTitle>
              <CalciteTabTitle class="ISF">NLO</CalciteTabTitle>
              <CalciteTabTitle class="ExproList">ExproList</CalciteTabTitle>
            </CalciteTabNav>
            {/* CalciteTab: Lot */}
            <CalciteTab>
              <div
                className="lotNumberImage"
                style={{
                  display: 'flex',
                  paddingLeft: 20,
                }}
              >
                <div style={{}}>
                  <div
                    style={{
                      color: 'white',
                      fontSize: '1vw',
                      paddingBottom: '0.5vh',
                      paddingTop: '0.6vh',
                    }}
                  >
                    TOTAL LOTS
                  </div>
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
                    {thousands_separators(lotNumber[1])}{' '}
                    <div
                      style={{
                        color: 'white',
                        fontSize: '1vw',
                        fontWeight: 'normal',
                        paddingTop: '0.5vh',
                      }}
                    >
                      ({thousands_separators(lotNumber[0])})
                    </div>
                  </b>
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/Land_logo.png"
                  alt="Land Logo"
                  height={'18%'}
                  width={'18%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <LotChart
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
              <div
                className="PteNumberImage"
                style={{ display: 'flex', paddingLeft: 20, marginBottom: '1.5vh' }}
              >
                <div>
                  <div style={{ color: 'white', fontSize: '1vw', paddingBottom: '0.6vh' }}>
                    PERMIT-TO-ENTER
                  </div>
                  <br />
                  <br />
                  {/* if pte is 'Infinity, display 'N/A' else  */}
                  {pteNumber[0] === 'Infinity' ? (
                    <b
                      style={{
                        color: '#6ede00',
                        fontSize: '2.5vw',
                        fontWeight: 'bold',
                        fontFamily: 'calibri',
                      }}
                    >
                      N/A
                    </b>
                  ) : (
                    <b
                      style={{
                        color: '#6ede00',
                        fontSize: '2.5vw',
                        fontWeight: 'bold',
                        fontFamily: 'calibri',
                      }}
                    >
                      {pteNumber[0]}% ({thousands_separators(pteNumber[1])})
                    </b>
                  )}
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/Permit-To-Enter.png"
                  alt="Land Logo"
                  height={'18%'}
                  width={'18%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <LotMoaChart
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
            </CalciteTab>

            {/* CalciteTab: Structure */}
            <CalciteTab>
              <div
                className="structureNumberImage"
                style={{
                  display: 'flex',
                  paddingLeft: 20,
                }}
              >
                <div style={{}}>
                  <div
                    style={{
                      color: 'white',
                      fontSize: '1vw',
                      paddingBottom: '0.5vh',
                      paddingTop: '0.6vh',
                    }}
                  >
                    TOTAL STRUCTURES{' '}
                  </div>
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
                    {thousands_separators(structureNumber[2])}{' '}
                  </b>
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/House_Logo.svg"
                  alt="Structure Logo"
                  height={'19%'}
                  width={'19%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <StructureChart
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
              <div
                className="PteNumberImage"
                style={{ display: 'flex', paddingLeft: 20, marginBottom: '1.5vh' }}
              >
                <div>
                  <div style={{ color: 'white', fontSize: '1vw', paddingBottom: '0.6vh' }}>
                    PERMIT-TO-ENTER
                  </div>
                  <br />
                  <br />
                  {/* If zero, display as zero else */}
                  {structureNumber[1] === 0 ? (
                    <b
                      style={{
                        color: '#6ede00',
                        fontSize: '2.5vw',
                        fontWeight: 'bold',
                        fontFamily: 'calibri',
                      }}
                    >
                      {structureNumber[0]}% (0)
                    </b>
                  ) : (
                    <b
                      style={{
                        color: '#6ede00',
                        fontSize: '2.5vw',
                        fontWeight: 'bold',
                        fontFamily: 'calibri',
                      }}
                    >
                      {structureNumber[0]}% ({thousands_separators(structureNumber[1])})
                    </b>
                  )}
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/Permit-To-Enter.png"
                  alt="Structure Logo"
                  height={'18%'}
                  width={'18%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <StructureMoaChart
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
            </CalciteTab>

            {/* CalciteTab: Non-Land Owner */}
            <CalciteTab>
              <div
                className="NloNumberImage"
                style={{
                  display: 'flex',
                  paddingLeft: 20,
                }}
              >
                <div style={{}}>
                  <div
                    style={{
                      color: 'white',
                      fontSize: '1vw',
                      paddingBottom: '0.5vh',
                      paddingTop: '0.6vh',
                    }}
                  >
                    TOTAL NON-LAND OWNERS{' '}
                  </div>
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
                    {thousands_separators(nloNumber)}{' '}
                  </b>
                </div>
                <img
                  src="https://EijiGorilla.github.io/Symbols/NLO_Logo.svg"
                  alt="NLO Logo"
                  height={'19%'}
                  width={'19%'}
                  style={{ padding: '10px', margin: 'auto' }}
                />
              </div>
              <NloChart
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
            </CalciteTab>

            {/* CalciteTab: List of Lots under Expropriation */}
            <CalciteTab>
              <ExpropriationList
                municipal={municipalSelected.municipality}
                barangay={barangaySelected.name}
              />
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

          <div
            className="DropDownFilter"
            style={{
              height: 50,
              width: '70%',
              borderColor: 'rgb(0,0,0,0)',
              paddingTop: 10,
              marginLeft: '-7rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                fontSize: 12,
                color: 'black',
                justifyContent: 'right',
              }}
            >
              <b style={{ color: 'white', margin: 10 }}>Municipality</b>
              <Select
                placeholder="Select Municipality"
                value={municipality}
                options={initMunicipalBarangay}
                onChange={handleMunicipalityChange}
                getOptionLabel={(x: any) => x.municipality}
                styles={customstyles}
              />
              <br />
              <b style={{ color: 'white', margin: 10 }}>Barangay</b>
              <Select
                placeholder="Select Barangay"
                value={barangay}
                options={barangayList}
                onChange={handleBarangayChange}
                getOptionLabel={(x: any) => x.name}
                styles={customstyles}
              />
            </div>
          </div>
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

          <CalcitePanel
            heading="Layers"
            height-scale="l"
            width-scale="l"
            data-panel-id="layers"
            style={{ width: '18vw' }}
            hidden
          >
            <CalciteList>
              <CalciteListItem
                label=""
                description=""
                value="land-acquisition"
                ref={layerListDiv}
              ></CalciteListItem>
            </CalciteList>
          </CalcitePanel>

          <CalcitePanel
            heading="Basemaps"
            height-scale="l"
            data-panel-id="basemaps"
            style={{ width: '18vw' }}
            hidden
          >
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
            {nextWidget === 'information' ? (
              <div
                id="informationDiv"
                style={{
                  color: '#eaeaea',
                  fontSize: '13px',
                  marginLeft: '-10px',
                  paddingRight: '5px',
                }}
              >
                <ul>
                  <li>
                    You can <b>filter the data</b> by City and Barangy using dropdown lists.
                  </li>
                  <li>
                    <b>Click a tab</b> below the dropdown lists to view progress on land, structure,
                    or NLO in charts.
                  </li>
                  <li>
                    <b>Click series in pie charts</b> to view progress on the corresponding
                    lots/structures/NLO on the map.
                  </li>
                  <li>
                    <b>Lots under expropriation</b> are available in the 'Expro List' tab.
                  </li>
                  <li>
                    Click/unclick widgets icon for viewing Layer list, legend, basemaps, and locate
                    widgets under the main title.
                  </li>
                  <li>
                    <b>Toggle a checkbox</b> above the Land pie chart to view{' '}
                    <b>handed-over areas</b> (m2) of Contract Packages.
                  </li>
                </ul>
              </div>
            ) : (
              <div id="informationDiv" hidden></div>
            )}
          </CalcitePanel>
        </CalciteShellPanel>
        <div className="mapDiv" ref={mapDiv}></div>
        <LotProgressChart
          municipal={municipalSelected.municipality}
          barangay={barangaySelected.name}
          nextwidget={nextWidget === activeWidget ? null : nextWidget}
        />
      </CalciteShell>
    </div>
  );
}

export default App;
