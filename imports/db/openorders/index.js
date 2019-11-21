import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { Groups } from '../groups';

export const OpenOrdersHead = new Mongo.Collection('openordershead');
export const OpenOrdersBody = new Mongo.Collection('openordersbody');

if(Meteor.isServer) {
  Meteor.startup(() => {
    OpenOrdersBody._ensureIndex({ '_id': 1 });
    OpenOrdersBody._ensureIndex({ 'itemId': 1 });
  });
}

OpenOrdersHead.schema = new SimpleSchema({
  // OLD:
  buyer_id: {
    type: String,
    label: "Buyer Id",
    min: 17,
    max: 17,
    optional: true
  },
  // NEW:
  group_id: {
    type: String,
    min: 17,
    max: 17
  },
  supplier_id: {
    type: String,
    min: 17,
    max: 17
  },
  delivery_method: {
    type: String,
    label: "Delivery method",
    optional: true
  },
  delivery_date: {
    type: Date,
    label: "Delivery date",
    optional: true
  },
  notes: {
    type: String,
    label: "Notes",
    optional: true,
    max: 1000
  },
	datetime: {
		type: Date,
		label: "datetime"
  },
  hasBody: {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
});

OpenOrdersHead.attachSchema(OpenOrdersHead.schema);

OpenOrdersBody.schema = new SimpleSchema({
  list_id: {
    type: String,
    label: "List Id",
    min: 17,
    max: 17
  },
  item_amount: {
    type: Number,
    label: "Item Amount",
    min: 0,
    max: 99999
  },
  row_id: {
    type: Number,
    label: "Row Id",
    optional: true
  },
  itemId: {
    type: String,
    min: 17,
    max: 17,
    optional: true
  },
  unit: {
    type: String,
    optional: true
  },
  total_price: {
    type: Number,
    optional: true
  }
});

OpenOrdersBody.attachSchema(OpenOrdersBody.schema);

if(Meteor.isServer) {

  OpenOrdersHead.allow({
    'update': allowOpenOrdersHeadEdit,
    'insert': allowOpenOrdersHeadEdit,
    'remove': allowOpenOrdersHeadEdit
  });

  function allowOpenOrdersHeadEdit(userId, openorder, fields, modifier) {
    const group = Groups.findOne({ _id: openorder.group_id });
    return group && _.findIndex(group.users, { userId }) !== -1 || group.supplierId == userId || false;
  }

  OpenOrdersBody.allow({
    'update': allowOpenOrdersBodyEdit,
    'insert': allowOpenOrdersBodyEdit,
    'remove': allowOpenOrdersBodyEdit
  });

  function allowOpenOrdersBodyEdit(userId, bodyItem, fields, modifier) {
    const ooHead = OpenOrdersHead.findOne({ _id: bodyItem.list_id });
    const group = Groups.findOne({ _id: ooHead.group_id });
    return group && _.findIndex(group.users, { userId }) !== -1 || group.supplierId == userId || false;
  }
  
}