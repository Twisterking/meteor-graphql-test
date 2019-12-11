import { Items } from '../index';
import { getPricesFilter } from '../../index';
import { getItemsQuery } from '../../../modules/helpers';

// https://github.com/cult-of-coders/grapher/issues/206
// https://github.com/cult-of-coders/grapher/issues/251

export default Items.createQuery('itemsQuery', {
  $filter({ filters, options, params }) {
    // console.log('BEFORE', JSON.stringify({ filters, options, params }, false, 2));
    Object.assign(filters, getItemsQuery(filters, params));
    // console.log('AFTER', JSON.stringify(filters, false, 2));
    if(params.options) Object.assign(options, params.options);
  },
  _id: 1,
  item_ref: 1,
  item_name: 1,
  unit: 1,
  units: 1,
  price: 1,
  image_id: 1,
  image_url: 1,
  groupIds: 1,
  supplier_id: 1,
  categoryId: 1,
  categoryIds: 1,
  created_at: 1,
  prices: {
    $filter(props) {
      filters = getPricesFilter(props);
    },
    itemId: 1,
    groupId: 1,
    priceGroupId: 1,
    priceInfo: 1,
    tag: 1
  },
  meta: 1,
  openOrderItems: {
    $filter({ filters, options, params }) {
      if (filters && params.currentOpenOrderId) filters.list_id = params.currentOpenOrderId;
    },
    _id: 1,
    item_amount: 1,
    unit: 1
  },
  $options: {
    sort: { item_name: 1 }
  },
  $paginate: true
});