import { Prices } from './index';
import { Items } from '../items';
import { PriceGroups } from '../pricegroups';

Prices.addLinks({
  'item': {
    type: 'one',
    collection: Items,
    field: 'itemId'
  },
  'priceGroup': {
    type: 'one',
    collection: PriceGroups,
    field: 'groupId'
  }
})