import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Groups, Items, OpenOrdersHead } from '../db';

Meteor.publish("buyer:getGroups", function(impersonatingSupplier) {
  const groupsCursor = Groups.find({ 'users.userId': this.userId });
  let supplierIds = [];
  let groupIds = [];
  groupsCursor.forEach(group => {
    groupIds.push(group._id);
    supplierIds.push(group.supplierId);
  });
  return [
    groupsCursor,
    OpenOrdersHead.find({ group_id: { $in: groupIds } }),
    Meteor.users.find({ _id: { $in: _.uniq(supplierIds) } }, { 
      fields: {
        'services': 0
      }
    })
  ]
});