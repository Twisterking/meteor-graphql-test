import React from 'react';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// https://github.com/jamiter/meteor-starter-kit/blob/master/imports/ui/App.js

const App = (props) => {
  console.log(props);
  const { loading, currentUser } = props;
  if(loading) return null;
  return (
    <div>
      <h1>Welcome to Meteor!</h1>
      <p>TEST</p>
      <h3>_id: {currentUser._id}</h3>
    </div>
  )
}

const GET_USER_DATA = gql`
  query getCurrentUser {
    user {
      emails {
        address
        verified
      }
      _id
    }
  }
`;

const withData = graphql(GET_USER_DATA, {
  props: ({ data: { error, loading, user, refetch } }) => {
    if (loading) return { loading: true };
    if (error) {
      console.error(error);
      return { hasErrors: true };
    }
    return {
      currentUser: user,
      refetch
    };
  },
});

export default withData(App);