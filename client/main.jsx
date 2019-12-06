import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { render } from 'react-dom';
import React from 'react';
import gql from 'graphql-tag';
window.gql = gql;

// import ApolloClient from 'apollo-client';
// import { InMemoryCache } from 'apollo-cache-inmemory';

// WORA:
import { ApolloClient } from "@wora/apollo-offline";
import ApolloCache from '@wora/apollo-cache';

import QueueLink from 'apollo-link-queue';
import { RetryLink } from 'apollo-link-retry';
import SerializingLink from 'apollo-link-serialize';
import { ApolloLink } from 'apollo-link';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
import { persistCache } from 'apollo-cache-persist';
import { ApolloProvider } from 'react-apollo';
const ddpLink = new DDPLink();

// import { OfflineClient } from 'offix-client';

// https://www.apollographql.com/docs/link/links/retry/
// https://medium.com/twostoryrobot/a-recipe-for-offline-support-in-react-apollo-571ad7e6f7f4
// https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-retry
// import { onError } from 'apollo-link-error';
// const errorLink = onError(() => {
//   console.log('Caught Apollo Client Error');
// });
// const queueLink = new QueueLink();
// const retryLink = new RetryLink({ 
//   attempts: {
//     max: Infinity,
//     retryIf: (error, _operation) => {
//       console.log({ error, _operation });
//       return !!error || !Meteor.status().connected
//     }
//   }
// });
// const serializingLink = new SerializingLink();

import App from '/imports/ui/App';

_ = require('lodash');

// OFFIX:
// https://offix.dev/docs/client-configuration
// const offlineClient = new OfflineClient({
//   terminatingLink: new DDPLink(),
//   cache: new InMemoryCache()
// });



// Persistant offline cache https://github.com/apollographql/apollo-cache-persist
// export let client;
// const cache = new InMemoryCache();
// const storage = window.localStorage;
// const waitOnCache = persistCache({ cache, storage });



// WORA: https://morrys.github.io/wora/docs/apollo-offline
const cache = new ApolloCache({
  dataIdFromObject: o => o.id
});
export const client = new ApolloClient({
  link: ddpLink,
  cache
});

// client.setOfflineOptions({
//   link: ddpLink
// });

Meteor.startup(async () => {
  // wora
  await client.hydrate();

  // await waitOnCache;
  // client = new ApolloClient({
  //   cache,
  //   link: ApolloLink.from([
  //     errorLink,
  //     retryLink,
  //     queueLink,
  //     serializingLink,
  //     ddpLink
  //   ])
  // });
  window.client = client;

  // fake offline:
  // Meteor.disconnect();

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