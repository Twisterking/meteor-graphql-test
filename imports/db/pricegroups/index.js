import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const PriceGroups = new Mongo.Collection('pricegroups');

if(Meteor.isServer) {
  Meteor.startup(() => {
    PriceGroups._ensureIndex({
      _id: 1,
      supplierId: 1
    });
  });
}

PriceGroups.schema = new SimpleSchema({
  name: {
    type: String
  },
  supplierId: {
    type: String,
    min: 17,
    max: 17
  },
  gln: {
    type: String,
    min: 13,
    max: 13,
    optional: true
  },
  customerId: {
    type: String,
    optional: true
  }
});

PriceGroups.attachSchema(PriceGroups.schema);

PriceGroups.allow({
  'update': allowPriceGroupEdit,
  'insert': allowPriceGroupEdit
});

function allowPriceGroupEdit(userId, priceGroup, fieldNames, modifier) {
  if(Roles.userIsInRole(userId, 'admin') || priceGroup.supplierId == userId) {
    return true;
  } else {
    return false;
  }
}