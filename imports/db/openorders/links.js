import { OpenOrdersHead, OpenOrdersBody } from './index';
import { Items } from '../items';

OpenOrdersBody.addLinks({
  'item': {
    type: 'one',
    collection: Items,
    field: 'itemId'
  }
})
