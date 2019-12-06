import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

// https://github.com/jamiter/meteor-starter-kit/blob/master/imports/ui/App.js

const GET_USER_DATA = gql`
  query getUser($userId: ID) {
    user(userId: $userId) {
      emails {
        address
        verified
      }
      _id
      username
    }
  }
`;

export default props => {
  const { loading, error, data } = useQuery(GET_USER_DATA, {
    variables: { userId: 'seDueMBtGiuMCWez6' },
  });
  console.log({ loading, error, data });
  if(loading || !data) return null;
  const currentUser = data.user;
  return (
    <div>
      <h5>_id: {currentUser._id}</h5>
      <h5>username: {currentUser.username}</h5>
    </div>
  )
}