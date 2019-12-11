import { OpenOrdersHead, OpenOrdersBody } from './index';
import { Items } from '../items';
import { addLinks } from "@kaviar/nova"; // https://github.com/kaviarjs/nova/blob/master/docs/index.md#linking-collections

addLinks(OpenOrdersBody.rawCollection(), {
  item: {
    collection: () => Items.rawCollection(),
    field: 'itemId'
  }
});