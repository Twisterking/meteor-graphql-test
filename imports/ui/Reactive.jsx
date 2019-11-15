import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
// import { ReactiveQuery } from 'apollo-live-client';
import { ReactiveQuery } from './reactiveQuery/index';

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

const SUBSCRIBE_USER_CHANGES = gql`
  subscription subUser($userId: ID) {
    user(userId: $userId) {
      event
      doc
    }
  }
`;

export default props => (
  <ReactiveQuery
    query={GET_USER_DATA}
    subscription={SUBSCRIBE_USER_CHANGES}
    variables={{ userId: 'CYzjtN3TaWB9KQJAP' }}
  >
    {(props) => {
      // console.log('PROPS:', props);
      const { data, error, loading, refetch } = props;
      if(loading) return null;
      if(error) { console.error(error); return null; }
      return <Show currentUser={data.user} refetch={refetch} />;
    }}
  </ReactiveQuery>
)

class Show extends React.Component {
  render() {
    const { currentUser, refetch } = this.props;
    console.log('STANDARD:', currentUser);
    return (
      <div>
        <h3>STANDARD: _id: {currentUser._id}</h3>
        <h3>STANDARD: username: {currentUser.username}</h3>
        {/* <button onClick={e => refetch()}>refetch</button> */}
      </div>
    )
  }
}