import { Meteor } from 'meteor/meteor';
import { makeExecutableSchema } from 'graphql-tools';
import { setup as createApolloServer } from 'meteor/swydo:ddp-apollo';
import '/imports/api/publications';
import { typeDefs, resolvers } from '/imports/api/schema';

_ = require('lodash');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

createApolloServer({
  schema
});