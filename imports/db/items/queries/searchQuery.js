import { Items } from '../index';
import { getPricesFilter } from '../../index';
import { getItemsQuery, getRestrictedItemsQuery } from '../../../modules/helpers';

function buildRegExp(words, startsWith) {
  var exps = _.map(words, function (word, key) {
    if (startsWith && key == 0)
      return "(?=^" + word + ")";
    else
      return "(?=.*" + word + ")";
  });
  var fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}

export default Items.createQuery('searchQuery', {
  $filter({ filters, options, params }) {

    if (params.filter) {
      Object.keys(params.filter).forEach(key => {
        let param = params.filter[key];
        if (param) filters[key] = param;
      });
    }
    if (params.supplierId) {
      filters.supplier_id = params.supplierId;
    }
    if (params.searchTerm) {
      let words = params.searchTerm.trim().split(/[ \-\:]+/);
      let regex;
      try {
        regex = buildRegExp(words, false);
      } catch(err) {
        regex = words;
      }
      filters.$and = [
        {
          $or: [
            { item_name: regex },
            { item_ref: regex }
          ]
        },
        {
          $or: [
            { groupIds: { $exists: false } },
            { groupIds: params.groupId }
          ]
        }
      ];
      if(params.allListItemIds && filters && filters.$and && Array.isArray(filters.$and)) {
        filters.$and.push({
          _id: { $in: params.allListItemIds }
        });
      }
    }
    if(!params.isMngtView) {
      filters = getRestrictedItemsQuery(filters, params.specialLists, { limitedItemIds: params.limitedItemIds });
    }

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
  categoryIds: 1,
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
  listItems: {
    $filter({ filters, params }) {
      if (params.listId) filters.list_id = params.listId;
    },
    _id: 1
  },
  openOrderItems: {
    $filter({ filters, params }) {
      if (params.currentOpenOrderId) filters.list_id = params.currentOpenOrderId;
    },
    _id: 1,
    item_amount: 1,
    unit: 1
  },
  $options: {
    limit: 100
  }
});