import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { render } from 'react-dom';
import React from 'react';
import gql from 'graphql-tag';
window.gql = gql;

import { ApolloLink } from 'apollo-link';
import ApolloClient from 'apollo-client';
import { OfflineClient } from 'offix-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloProvider } from 'react-apollo';

// https://codeburst.io/highly-functional-offline-applications-using-apollo-client-12885bd5f335
// https://github.com/larkintuckerllc/ApolloReactOffline/blob/master/src/components/App/index.tsx

import { onError } from 'apollo-link-error';
const errorLink = onError(() => {
  console.log('Caught Apollo Client Error');
});


import { DDPLink } from 'meteor/swydo:ddp-apollo';
import QueueLink from 'apollo-link-queue';
import { RetryLink } from 'apollo-link-retry';
import SerializingLink from 'apollo-link-serialize';
const ddpLink = new DDPLink();
const queueLink = new QueueLink();
const retryLink = new RetryLink();
const serializingLink = new SerializingLink();

import App from '/imports/ui/App';

_ = require('lodash');

// OFFIX:
// https://offix.dev/docs/client-configuration
// const offlineClient = new OfflineClient({
//   terminatingLink: new DDPLink(),
//   cache: new InMemoryCache()
// });

export let client;

// Persistent Cache: https://github.com/apollographql/apollo-cache-persist
const cache = new InMemoryCache();
const storage = window.localStorage;
const waitOnCache = persistCache({ cache, storage });

Meteor.startup(async () => {
  // Offix:
  // client = await offlineClient.init();

  await waitOnCache;
  client = new ApolloClient({
    cache,
    link: ApolloLink.from([
      errorLink,
      queueLink,
      serializingLink,
      retryLink,
      ddpLink,
    ]),
  });
  window.client = client;

  // fake offline:
  Meteor.disconnect();

  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('react-target')
  );
});

// MONKEY PATCHES

const MeteorSubscribe = Meteor.subscribe;
Meteor.subscribe = function(...args) {
  const sub = MeteorSubscribe.call(this, ...args);
  if(Tracker.nonreactive(() => Meteor.status().status == "offline")) {
    Meteor.connection._subscriptions[sub.subscriptionId].ready = true;
    Meteor.connection._subscriptions[sub.subscriptionId].readyDeps.changed();
  }
  return sub;
}

const AccountsUser = Accounts.user;
Accounts.user = function() {
  if(Tracker.nonreactive(() => Meteor.status().status == "offline")) {
    return JSON.parse(localStorage.getItem('Meteor.user'));
  }
  return AccountsUser.call(this);
}