import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import React from 'react';
import gql from 'graphql-tag';

import ApolloClient from 'apollo-client';
// import { OfflineClient } from 'offix-client';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloProvider } from 'react-apollo';

import App from '/imports/ui/App';

// OFFIX:
// https://offix.dev/docs/client-configuration
// const offlineClient = new OfflineClient({
//   terminatingLink: new DDPLink(),
//   cache: new InMemoryCache()
// });
// export let client;

// Persistent Cache:
const cache = new InMemoryCache()
const storage = window.localStorage
const waitOnCache = persistCache({ cache, storage });

// NORMAL:
export const client = new ApolloClient({
  link: new DDPLink(),
  cache: new InMemoryCache()
});
window.client = client;

Meteor.startup(async () => {
  // client = await offlineClient.init();
  // console.log('APOLLO CLIENT:', client);
  // persistent:
  await waitOnCache;
  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById('react-target')
  );
});

/*
 * We might be interested in updates on the user too, so let's subscribe to it
 * I'm not sure what the best place for this would be, so I'm dumping it here for now
 * A more advanced React developer might be able to help put this where it should
 */

// const SUBSCRIBE_USER_CHANGES = gql`
//   subscription {
//     user {
//       event
//       doc
//     }
//   }
// `;
// const observer = client.subscribe({
//   query: SUBSCRIBE_USER_CHANGES,
// });
// const subscription = observer.subscribe({
//   next({ data }) {
//     console.log('main.jsx Subscription data:', data);
//   },
// });