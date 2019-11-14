import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { PubSub } from 'graphql-subscriptions';
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
  type Subscription {
    userChange: User
  }
`
];

console.log('Schema STARTUP!');

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
    userChange: {
      subscribe: () => pubsub.asyncIterator(USER_CHANGE_CHANNEL),
    }
  },
  // User: {
  //   emails: ({ emails }) => emails
  // }
};

Meteor.setInterval(
  () => {
    pubsub.publish(USER_CHANGE_CHANNEL, {
      userChange: Meteor.users.findOne({ _id: 'seDueMBtGiuMCWez6' })
    });
  },
  10000
);