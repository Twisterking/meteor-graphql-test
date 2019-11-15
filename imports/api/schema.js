import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { PubSub } from 'graphql-subscriptions';
import { asyncIterator } from 'apollo-live-server';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
// PROD: Later use https://github.com/davidyaha/graphql-redis-subscriptions

export const pubsub = new PubSub();
export const USER_CHANGE_CHANNEL = 'user_changed';

export const typeDefs = [
  `
  type Email {
    address: String
    verified: Boolean
  }
  type User {
    emails: [Email]
    _id: String,
    username: String
  }
  type Query {
    user: User
  }  
  `,
  // `
  // type Subscription {
  //   userChange: User
  // }
  // `
  `
  scalar JSON
  type SubscriptionEvent {
    event: String,
    doc: JSON
  }
  `,
  `
  type Subscription {
    user: SubscriptionEvent
  }
  `
];

console.log('Server STARTUP!');

export const resolvers = {
  Query: {
    user(root, args, context) {
      return Meteor.users.findOne({ _id: 'seDueMBtGiuMCWez6' });
      // return {
      //   _id: Random.id(),
      //   emails: [
      //     { address: 'hui@foobar.com', verified: true }
      //   ]
      // }
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
      subscribe() {
        const observable = Meteor.users.find({ _id: 'seDueMBtGiuMCWez6' });
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