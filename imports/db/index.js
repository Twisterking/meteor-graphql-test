import './links';

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
  // https://github.com/Twisterking/grounddb/tree/master
  [Groups].forEach(collection => {
    const groundColl = new Ground.Collection(`_${collection._name}`);
    groundColl.observeSource(collection.find({}));
    ['find', 'findOne'].forEach(method => {
      const origMethod = collection[method];
      collection[method] = function(...args) {
        if(Tracker.nonreactive(() => Meteor.status().status == "offline")) {
          // console.log('OFFLINE! ' + method);
          // console.log('ARGS?', ...args);
          // console.log('OFFLINE!', groundColl[method].call(groundColl, ...args).fetch());
          return groundColl[method].call(groundColl, ...args);
        }
        // console.log('ONLINE! ' + method);
        return origMethod.call(this, ...args);
      }
    });
    ['insert', 'upsert', 'update', 'remove'].forEach(method => {
      // TODO
    });
  });
}