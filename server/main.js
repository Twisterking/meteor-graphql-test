import { Meteor } from 'meteor/meteor';
import { makeExecutableSchema } from 'graphql-tools';
import { setup as createApolloServer } from 'meteor/swydo:ddp-apollo';
import { typeDefs, resolvers } from '/imports/api/schema';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

createApolloServer({
  schema,
});