import { Items } from './index';
import { ListsHead, ListsBody } from '../lists';
import { OpenOrdersHead, OpenOrdersBody } from '../openorders';
import { Categories } from '../categories';
import { Prices } from '../prices';
import { addLinks } from "@kaviar/nova"; // https://github.com/kaviarjs/nova/blob/master/docs/index.md#linking-collections

addLinks(Items.rawCollection(), {
  openOrderItems: {
    collection: () => OpenOrdersBody.rawCollection(),
    inversedBy: 'item'
  },
  listItems: {
    collection: () => ListsBody.rawCollection(),
    inversedBy: 'item'
  },
  category: {
    collection: () => Categories.rawCollection(),
    field: 'categoryId'
  },
  prices: {
    collection: () => Prices.rawCollection(),
    inversedBy: 'item'
  }
});