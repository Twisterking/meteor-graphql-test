import { PriceGroups } from './index';
import { Prices } from '../prices';
import { addLinks } from "@kaviar/nova"; // https://github.com/kaviarjs/nova/blob/master/docs/index.md#linking-collections

addLinks(PriceGroups.rawCollection(), {
  prices: {
    collection: () => Prices.rawCollection(),
    inversedBy: 'priceGroup'
  }
});