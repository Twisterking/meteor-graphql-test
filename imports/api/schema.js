import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export const typeDefs = [
  `
  type Email {
    address: String
    verified: Boolean
  }
  type User {
    emails: [Email]
    _id: String
  }
  type Query {
    user: User
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
  // User: {
  //   emails: ({ emails }) => emails
  // }
};