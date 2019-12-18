import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
// import { PubSub } from 'graphql-subscriptions'; // PROD: Later use https://github.com/davidyaha/graphql-redis-subscriptions
import { asyncIterator } from 'apollo-live-server';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Items, Groups, ListsHead, ListsBody, OpenOrdersHead, OpenOrdersBody } from '/imports/db';

import listsQuery from '/imports/db/lists/queries/listsQuery';
// import { query } from "@kaviar/nova"; // https://github.com/kaviarjs/nova/blob/master/docs/index.md#graphql-integration

// export const pubsub = new PubSub();
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
    itemId: ID,
    item: JSON
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
    addToCart(_id: ID, list_id: ID, itemId: ID, item_amount: Float, unit: String): OpenOrderElement
  }
  `
];

export const resolvers = {
  Query: {
    user(_, args, context) {
      const { userId } = args;
      return Meteor.users.findOne({ _id: userId });
    },
    // standard Mongo
    // listbody(_, args, context, ast) {
    //   const { listId, limit, skip } = args;
    //   return ListsBody.find({ list_id: listId }, { sort: { row_id: 1 }, limit, skip }).fetch();
    // },
    listbody(_, args, context, ast) {
      const { userId } = context;
      const { listId, limit, skip } = args;      
      const user = Meteor.users.findOne({ _id: userId });
      const listhead = ListsHead.findOne({ _id: listId });
      const supplierId = listhead.supplier_id;

      // cloned query
      const listbody = listsQuery.clone({
        listId: listId,
        user,
        group: null,
        supplierId,
        skip,
        limit
      }).fetch();
      listbody.forEach((listItem, index) => {
        if(index == 0 && Meteor.isDevelopment) console.log(JSON.stringify(listItem, false, 2));
      });
      return listbody;

      // https://cult-of-coders.github.io/grapher/#GraphQL-Bridge
      // const listbody = ListsBody.astToQuery(ast, {
      //   $filters: {
      //     list_id: listId
      //   },
      //   $options: {
      //     sort: { row_id: 1 },
      //     limit,
      //     skip
      //   }
      // }).fetch();
      // return listbody;
    },
    openorderbody(_, args, context) {
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
      // https://github.com/cult-of-coders/apollo-live-server#creating-subscriptions
      resolve: ({ event, doc }, args, context, ast) => {
        console.log('listbody sub resolve:', { event, doc, args });
        doc.__typename = 'ListElement';
        Object.assign(doc, {
          item: Items.findOne(doc.itemId)
        });
        return { event, doc };
      },
      subscribe(_, args, context, ast) {
        const { listId, limit, skip } = args;
        console.log('SUB listbody args:', args);
        const observable = ListsBody.find({ list_id: listId }, { sort: { row_id: 1 } });
        return asyncIterator(observable);
      }
    },
    openorderbody: {
      resolve: payload => {
        payload.doc.__typename = 'OpenOrderElement'; // no idea why I need this for the sub
        return payload
      },
      subscribe(_, args, context) {
        const { groupId } = args;
        let openOrderHead = OpenOrdersHead.findOne({ group_id: groupId });
        if(!openOrderHead) {
          console.error(`openOrderHead not found for groupId ${groupId}`);
          return;
        }
        const observable = OpenOrdersBody.find({ list_id: openOrderHead._id }, { sort: { row_id: 1 } });
        return asyncIterator(observable);
      }
    }
  },
  Mutation: {
    addToCart(_, args, context) {
      const { _id, list_id, itemId, item_amount, unit } = args;
      const lastOOItem = OpenOrdersBody.findOne({ list_id }, { sort: { row_id: -1 } });
      const newBodyItem = {
        _id,
        list_id,
        itemId,
        item_amount,
        unit: unit || undefined,
        row_id: lastOOItem && (lastOOItem.row_id + 1) || 0
      };
      newBodyItem._id = OpenOrdersBody.insert(newBodyItem);
      return newBodyItem
    }
  },
  JSON: GraphQLJSON
}