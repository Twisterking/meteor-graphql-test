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
  if(loading) return null;
  const currentUser = data.user;
  // console.log('HOOK:', currentUser);
  return (
    <div>
      <h5>HOOK: _id: {currentUser._id}</h5>
      <h5>HOOK: username: {currentUser.username}</h5>
    </div>
  )
}