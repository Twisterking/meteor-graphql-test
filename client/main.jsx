import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { render } from 'react-dom';
import React from 'react';
import gql from 'graphql-tag';
import { ApolloClient } from "@wora/apollo-offline";
import ApolloCache from '@wora/apollo-cache';
import { NetInfo } from "@wora/netinfo";
// https://github.com/react-native-community/react-native-netinfo/blob/master/README.md#usage
const stopCheckingConnection = NetInfo.addEventListener(state => {
  console.log('NetInfo', state);
});
import { DDPLink } from 'meteor/swydo:ddp-apollo';
import { ApolloProvider } from 'react-apollo';
const ddpLink = new DDPLink();
import App from '/imports/ui/App';
_ = require('lodash');

// WORA: https://morrys.github.io/wora/docs/apollo-offline
const cache = new ApolloCache({
  dataIdFromObject: o => {
    console.log('dataIdFromObject o:', o);
    return o._id
  }
});
export const client = new ApolloClient({
  link: ddpLink,
  cache
});
client.activeSubscriptions = new Set();

Meteor.startup(async () => {
  // wora
  await client.hydrate();

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