import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { PubSub } from 'graphql-subscriptions';
import { asyncIterator } from 'apollo-live-server';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { ListsHead, ListsBody } from '/imports/db';
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
  type Query {
    user(userId: ID): User
    listbody(listId: ID, limit: Int, skip: Int): [ListElement]
  }  
  type Subscription {
    user(userId: ID): SubscriptionEvent
    listbody(listId: ID, limit: Int, skip: Int): SubscriptionEvent
  }
  type SubscriptionEvent {
    event: String,
    doc: JSON
  }
  `
];

export const resolvers = {
  Query: {
    user(_, args, context) {
      // console.log('QUERY', { _, args, context });
      const { userId } = args;
      return Meteor.users.findOne({ _id: userId });
    },
    listbody(_, args, context) {
      // console.log('QUERY', args);
      const { listId, limit, skip } = args;
      return ListsBody.find({ list_id: listId }, { sort: { row_id: 1 }, limit, skip }).fetch();
    }
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
        // console.log('SUBSCRIPTION', { _, args, context });
        const { userId } = args;
        const observable = Meteor.users.find({ _id: userId });
        return asyncIterator(observable);
      }
    },
    listbody: {
      resolve: payload => payload,
      subscribe(_, args, context) {
        // console.log('SUBSCRIPTION', args);
        const { listId, limit, skip } = args;
        // NOT WORKING! Subscriptions have to subscribe "the whole body"
        // const observable = ListsBody.find({ list_id: listId }, { sort: { row_id: 1 }, limit, skip });
        const observable = ListsBody.find({ list_id: listId }, { sort: { row_id: 1 } });
        return asyncIterator(observable);
      }
    }
  },
  JSON: GraphQLJSON
  // User: {
  //   emails: ({ emails }) => emails
  // }
};

// Meteor.setInterval(
//   () => {
//     pubsub.publish(USER_CHANGE_CHANNEL, {
//       userChange: Meteor.users.findOne({ _id: 'seDueMBtGiuMCWez6' })
//     });
//   },
//   10000
// );