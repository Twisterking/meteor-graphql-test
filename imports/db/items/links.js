import { Items } from './index';
import { ListsHead, ListsBody } from '../lists';
import { OpenOrdersHead, OpenOrdersBody } from '../openorders';
import { Categories } from '../categories';
import { Prices } from '../prices';

Items.addLinks({
  'openOrderItems': {
    collection: OpenOrdersBody,
    inversedBy: 'item'
  },
  'listItems': {
    collection: ListsBody,
    inversedBy: 'item'
  },
  'category': {
    type: 'one',
    collection: Categories,
    field: 'categoryId'
  },
  'prices': {
    collection: Prices,
    inversedBy: 'item'
  }
});