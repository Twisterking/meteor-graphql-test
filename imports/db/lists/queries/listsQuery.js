import { ListsBody } from '../index';
import { getPricesFilter } from '../../index';
import { getRestrictedItemsQuery } from '../../../modules/helpers';

export default ListsBody.createQuery('listsQuery', {
  $filter({filters, options, params}) {
    if(params.listId) filters.list_id = params.listId;
    // not working yet 100% - dont forget the pagination count thingy!
    // if(!params.isMngtView) {
    //   filters = getRestrictedItemsQuery(filters, params.specialLists, { idField: 'itemId' });
    // }
    options.sort = { row_id: 1 };
    if(typeof params.limit == 'number') options.limit = params.limit;
    if(typeof params.skip == 'number') options.skip = params.skip;
  },
  _id: 1,
  list_id: 1,
  row_id: 1,
  item_amount: 1,
  unit: 1,
  itemId: 1,
  item: {
    supplier_id: 1,
    groupIds: 1,
    item_ref: 1,
    item_name: 1,
    categoryIds: 1,
    unit: 1,
    units: 1,
    price: 1,
    image_id: 1,
    image_url: 1,
    meta: 1,
    // prices: {
    //   $filter(props) {
    //     filters = getPricesFilter(props);
    //   },
    //   itemId: 1,
    //   groupId: 1,
    //   priceGroupId: 1,
    //   priceInfo: 1,
    //   tag: 1
    // },
    // openOrderItems: {
    //   $filter({filters, options, params}) {
    //     if(params.currentOpenOrderId) filters.list_id = params.currentOpenOrderId;
    //   },
    //   _id: 1,
    //   item_amount: 1,
    //   unit: 1
    // }
  }
});