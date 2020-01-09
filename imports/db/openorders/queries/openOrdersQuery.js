import { OpenOrdersBody } from '../index';
import { getPricesFilter } from '../../index';

export default OpenOrdersBody.createQuery('openOrdersQuery', {
  $filter({filters, options, params}) {
    if(params.listId) filters.list_id = params.listId;
    if(params.currentOpenOrderId) filters.list_id = params.currentOpenOrderId;
  },
  _id: 1,
  list_id: 1,
  row_id: 1,
  item_amount: 1,
  unit: 1,
  total_price: 1,
  itemId: 1,
  item: {
    supplier_id: 1,
    item_ref: 1,
    item_name: 1,
    ean: 1,
    unit: 1,
    units: 1,
    price: 1,
    image_id: 1,
    image_url: 1,
    meta: 1
  },
  $options: {
    sort: { row_id: 1 }
  }
});