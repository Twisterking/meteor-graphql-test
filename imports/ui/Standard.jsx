import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';

const GET_USER_DATA = gql`
  query getCurrentUser {
    user {
      emails {
        address
        verified
      }
      _id
      username
    }
  }
`;

const SUBSCRIBE_USER_CHANGES = gql`
  subscription {
    userChange {
      event
      doc
    }
  }
`;

// { data: { error, loading, user, refetch } }

export default props => (
  <ReactiveQuery
    query={GET_USER_DATA}
    subscription={SUBSCRIBE_USER_CHANGES}
  >
    {({ data, error, loading }) => {
      if(loading) return null;
      if(error) { console.error(error); return null; }
      return <Show currentUser={data.user} />;
    }}
  </ReactiveQuery>
)

class Show extends React.Component {
  render() {
    const { currentUser } = this.props;
    console.log('STANDARD:', currentUser);
    return (
      <div>
        <h3>STANDARD: _id: {currentUser._id}</h3>
        <h3>STANDARD: username: {currentUser.username}</h3>
      </div>
    )
  }
}