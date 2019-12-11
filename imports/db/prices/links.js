import { Prices } from './index';
import { Items } from '../items';
import { PriceGroups } from '../pricegroups';
import { addLinks } from "@kaviar/nova"; // https://github.com/kaviarjs/nova/blob/master/docs/index.md#linking-collections

addLinks(Prices.rawCollection(), {
  item: {
    collection: () => Items.rawCollection(),
    field: 'itemId'
  },
  priceGroup: {
    collection: () => PriceGroups.rawCollection(),
    field: 'groupId'
  }
});