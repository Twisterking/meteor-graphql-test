import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// not working! - but has to work to use a subscription here with the HOC
import { client } from '/client/main.jsx';

// https://github.com/jamiter/meteor-starter-kit/blob/master/imports/ui/App.js
      
class TestHoc extends React.Component {
  render() {
    const { loading, currentUser } = this.props;
    if(loading) return null;
    console.log('HOC:', currentUser);
    return (
      <div>
        <h5>HOC: _id: {currentUser._id}</h5>
        <h5>HOC: username: {currentUser.username}</h5>
      </div>
    )
  }
}           

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

export default graphql(GET_USER_DATA, {
  variables: { userId: 'seDueMBtGiuMCWez6' },
  props: ({ data: { error, loading, user, refetch } }) => {
    if (loading) return { loading: true };
    if (error) {
      console.error(error);
      return { hasErrors: true };
    }
    return {
      currentUser: user,
      refetch
    }
  },
})(TestHoc)

// broken because of missing "client"
// const SUBSCRIBE_USER_CHANGES = gql`
//   subscription {
//     userChange {
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
//     console.log('HOC subscription data:', data);
//   },
// });