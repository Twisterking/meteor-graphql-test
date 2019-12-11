import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Prices = new Mongo.Collection('prices');

if(Meteor.isServer) {
  Meteor.startup(() => {
    Prices._ensureIndex({
      itemId: 1,
      groupId: 1,
      priceGroupId: 1
    });
    // https://stackoverflow.com/questions/12219858/mongodb-not-using-indexes
    Prices._ensureIndex({
      supplierId: 1,
      groupId: 1,
      priceGroupId: 1
    });
    Prices._ensureIndex({
      updated_at: 1
    });
    Prices._ensureIndex({
      itemId: 1
    });
    Prices._ensureIndex({
      groupId: 1
    });
    Prices._ensureIndex({
      priceGroupId: 1
    });
  });

  Prices.allow({
    'update': allowPricesEdit,
    'insert': allowPricesEdit,
    'remove': allowPricesEdit
  });

  function allowPricesEdit(userId, price, fields, modifier) {
    return price.supplierId == userId || Roles.userIsInRole(userId, 'admin') || false;
  }
}