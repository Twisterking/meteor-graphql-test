import { PriceGroups } from './index';
import { Prices } from '../prices';

PriceGroups.addLinks({
  'prices': {
    collection: Prices,
    inversedBy: 'priceGroup'
  }
})