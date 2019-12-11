import { Meteor } from 'meteor/meteor';
import { makeExecutableSchema } from 'graphql-tools';
import { setup as createApolloServer } from 'meteor/swydo:ddp-apollo';
import '/imports/api/publications';
import { typeDefs, resolvers } from '/imports/api/schema';

import '/imports/db/index';
import '/imports/db/links';

import '/imports/db'; // load all collections and grapher links
import '/imports/db/exposures'; // only load grapher exposures on server

_ = require('lodash');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

createApolloServer({
  schema
});