import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Groups = new Mongo.Collection('groups');

if(Meteor.isServer) {
  Meteor.startup(() => {
    Groups._ensureIndex({ _id: 1 });
    Groups._ensureIndex({
      'supplierId': 1,
      'users.userId': 1,
      'priceGroupId': 1,
      'gln': 1
    });
  });
}

// Groups.schema = new SimpleSchema({
//   name: {
//     type: String
//   },
//   _parent: {
//     type: String,
//     min: 17,
//     max: 17,
//     optional: true
//   },
//   supplier_id: {
//     type: String,
//     min: 17,
//     max: 17
//   }
// });

// Groups.attachSchema(Groups.schema);