import { ListsHead, ListsBody } from './index';
import { Items } from '../items';

ListsBody.addLinks({
  'item': {
    type: 'one',
    collection: Items,
    field: 'itemId'
  }
})
