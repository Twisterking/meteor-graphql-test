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
    console.log(collection);
  });
}