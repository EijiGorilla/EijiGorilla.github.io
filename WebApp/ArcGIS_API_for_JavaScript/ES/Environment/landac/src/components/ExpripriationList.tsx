/* eslint-disable array-callback-return */
import { useEffect, useState } from 'react';
import { lotLayer } from '../layers';
import Query from '@arcgis/core/rest/support/Query';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-list';
import '@esri/calcite-components/dist/components/calcite-list-item';
import '@esri/calcite-components/dist/components/calcite-shell-panel';
import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-bar';
import '@esri/calcite-components/dist/calcite/calcite.css';
import {
  CalciteList,
  CalciteListItem,
  CalciteChip,
  CalciteAvatar,
} from '@esri/calcite-components-react';
import { view } from '../Scene';

// Zoom in to selected lot from expropriation list
function resultClickHandler(event: any) {
  var queryExtent = new Query({
    objectIds: [event.target.value],
  });
  lotLayer.queryExtent(queryExtent).then((result: any) => {
    result.extent &&
      view.goTo({
        target: result.extent,
        speedFactor: 2,
        zoom: 17,
      });
  });
  let highlightSelect: any;
  view.whenLayerView(lotLayer).then((layerView: any) => {
    highlightSelect && highlightSelect.remove();
    highlightSelect = layerView.highlight([event.target.value]);

    view.on('click', () => {
      layerView.filter = null;
      highlightSelect.remove();
    });
  });
}

const ExpropriationList = (municipal: any, barangay: any) => {
  const [exproItem, setExproItem] = useState<undefined | any>([]);

  useEffect(() => {
    var query = lotLayer.createQuery();
    query.outFields = ['*'];
    query.where = 'StatusLA = 5';
    query.returnGeometry = true;
    lotLayer.queryFeatures(query).then((result: any) => {
      // eslint-disable-next-line array-callback-return
      result.features.map((feature: any, index: any) => {
        const attributes = feature.attributes;
        const lotid = attributes.LotID;
        const cp = attributes.CP;
        const municipal = attributes.Municipality;
        const landowner = attributes.LandOwner;
        const objectid = attributes.OBJECTID;
        const id = index;

        setExproItem((prev: any) => [
          ...prev,
          {
            id: id,
            lotid: lotid,
            landowner: landowner,
            municipality: municipal,
            cp: cp,
            objectid: objectid,
          },
        ]);
      });
    });
  }, []);

  return (
    <>
      <CalciteList id="result-list" label="exproListLabel">
        {exproItem &&
          exproItem.map((result: any, index: any) => {
            return (
              <>
                <CalciteListItem
                  key={result.id}
                  label={result.lotid}
                  description={result.landowner}
                  value={result.objectid}
                  onCalciteListItemSelect={(event: any) => resultClickHandler(event)}
                >
                  <CalciteChip value={result.cp} slot="content-end" scale="s" id="exproListChip">
                    <CalciteAvatar full-name={result.municipality} scale="s"></CalciteAvatar>
                    {result.cp}
                  </CalciteChip>
                </CalciteListItem>
              </>
            );
          })}
      </CalciteList>
    </>
  );
};

export default ExpropriationList;
// {console.log(exproItem.length)}
