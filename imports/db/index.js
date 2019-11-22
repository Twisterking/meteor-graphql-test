import { Tracker } from 'meteor/tracker';
import { Items } from './items';
import { Groups } from './groups';
import { ListsHead, ListsBody } from './lists';
import { OpenOrdersHead, OpenOrdersBody } from './openorders';

export {
  Items,
  Groups,
  ListsHead,
  ListsBody,
  OpenOrdersHead,
  OpenOrdersBody
}

if(Meteor.isClient) {
  [Groups].forEach(collection => {
    // https://github.com/Twisterking/grounddb/tree/master
    const groundColl = new Ground.Collection(`_${collection._name}`);
    groundColl.observeSource(collection.find({}));
    ['find', 'findOne'].forEach(method => {
      if(Tracker.nonreactive(() => Meteor.status().status == "offline")) {
        collection[method] = groundColl[method];
      }
    });
  });
}