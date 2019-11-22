import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { PubSub } from 'graphql-subscriptions';
import { asyncIterator } from 'apollo-live-server';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Groups, ListsHead, ListsBody, OpenOrdersHead, OpenOrdersBody } from '/imports/db';
// PROD: Later use https://github.com/davidyaha/graphql-redis-subscriptions

export const pubsub = new PubSub();
export const USER_CHANGE_CHANNEL = 'user_changed';

export const typeDefs = [
  `
  scalar JSON
  type Email {
    address: String
    verified: Boolean
  }
  type User {
    emails: [Email]
    _id: String,
    username: String
  }
  type ListElement {
    _id: ID,
    row_id: Int,
    itemId: ID
  }
  type OpenOrderElement {
    _id: ID,
    list_id: ID,
    row_id: Int,
    itemId: ID,
    unit: String,
    item_amount: Float,
    total_price: Float
  }
  type Query {
    user(userId: ID): User
    listbody(listId: ID, limit: Int, skip: Int): [ListElement]
    openorderbody(groupId: ID): [OpenOrderElement]
  }  
  type Subscription {
    user(userId: ID): SubscriptionEvent
    listbody(listId: ID, limit: Int, skip: Int): SubscriptionEvent
    openorderbody(groupId: ID): SubscriptionEvent
  }
  type SubscriptionEvent {
    event: String,
    doc: JSON
  }
  type MutationSuccess {
    success: Boolean
  }
  type Mutation {
    addToCart(openOrderId: ID, itemId: ID, amount: Float, unit: String): OpenOrderElement
  }
  `
];

export const resolvers = {
  Query: {
    user(_, args, context) {
      // console.log('QUERY USER!');
      const { userId } = args;
      return Meteor.users.findOne({ _id: userId });
    },
    listbody(_, args, context) {
      // console.log('QUERY 11', args);
      const { listId, limit, skip } = args;
      return ListsBody.find({ list_id: listId }, { sort: { row_id: 1 }, limit, skip }).fetch();
    },
    openorderbody(_, args, context) {
      // console.log('QUERY 22', args);
      const { groupId } = args;
      let headId = null;
      let openOrderHead = OpenOrdersHead.findOne({ group_id: groupId });
      if(!openOrderHead) {
        const group = Groups.findOne({ _id: groupId });
        headId = OpenOrdersHead.insert({   
          group_id: groupId,
          supplier_id: group.supplierId,
          delivery_method: 'shipping',
          datetime: new Date
        });
      }
      if(!headId && openOrderHead) headId = openOrderHead._id;
      // console.log('openOrderId:', headId);
      return OpenOrdersBody.find({ list_id: headId }, { sort: { row_id: 1 } }).fetch();
    },
  },
  Subscription: {
    // userChange: {
    //   subscribe: () => pubsub.asyncIterator(USER_CHANGE_CHANNEL),
    // }
    // https://www.apollographql.com/docs/apollo-server/data/data/#context-argument
    // userChange: {
    //   resolve: payload => payload,
    //   subscribe() {
    //     const observable = Meteor.users.find({ _id: 'seDueMBtGiuMCWez6' });
    //     return asyncIterator(observable);
    //   }
    // }
    user: {
      resolve: payload => payload,
      subscribe(_, args, context) {
        const { userId } = args;
        const observable = Meteor.users.find({ _id: userId });
        return asyncIterator(observable);
      }
    },
    // https://github.com/Swydo/ddp-apollo#setting-up-pubsub
    listbody: {
      resolve: payload => payload,
      subscribe(_, args, context) {
        const { listId, limit, skip } = args;
        // NOT WORKING! Subscriptions have to subscribe "the whole body":
        const observable = ListsBody.find({ list_id: listId }, { sort: { row_id: 1 } });
        return asyncIterator(observable);
      }
    },
    openorderbody: {
      resolve: payload => {
        payload.doc.__typename = 'OpenOrderElement';
        // console.log('payload!', JSON.stringify(payload.doc, false, 2));
        return payload
      },
      subscribe(_, args, context) {
        const { groupId } = args;
        let openOrderHead = OpenOrdersHead.findOne({ group_id: groupId });
        if(!openOrderHead) return;
        const observable = OpenOrdersBody.find({ list_id: openOrderHead._id }, { sort: { row_id: 1 } });
        return asyncIterator(observable);
      }
    }
  },
  Mutation: {
    addToCart(_, args, context) {
      const { openOrderId, itemId, amount, unit } = args;
      const lastOOItem = OpenOrdersBody.findOne({ list_id: openOrderId }, { sort: { row_id: -1 } });
      const newBodyItem = {
        list_id: openOrderId,
        itemId,
        item_amount: amount,
        unit: unit || undefined,
        row_id: lastOOItem.row_id + 1
      };
      newBodyItem._id = OpenOrdersBody.insert(newBodyItem);
      newBodyItem.__typename == 'OpenOrderElement';
      return newBodyItem
    }
  },
  JSON: GraphQLJSON
}