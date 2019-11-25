import React from 'react';
import gql from 'graphql-tag';
// import { ReactiveQuery } from 'apollo-live-client';
import _ from 'lodash';
import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

const GET_CART_DATA = gql`
  query getOpenOrder($groupId: ID) {
    openorderbody(groupId: $groupId) {
      _id
      row_id
      itemId
      item_amount
      unit
    }
  }
`;

const SUB_CART_DATA = gql`
  subscription subOpenOrder($groupId: ID) {
    openorderbody(groupId: $groupId)  {
      event
      doc
    }
  }
`;

export default (props) => {
  const variables = { groupId: props.groupId };
  return (
    <ReactiveQuery
      query={GET_CART_DATA}
      subscription={SUB_CART_DATA}
      variables={variables}
    >
      {(props) => {
        const { data, error, loading, refetch } = props;
        // console.log('CART DATA', data);
        // https://docs.meteor.com/api/connections.html#Meteor-status
        const connected = Meteor.status().connected || Meteor.status().status == 'connecting';
        if(loading && connected) return <h5>LOADING ...</h5>;
        if(!data) return <h5>No Data</h5>
        const items = data.openorderbody;
        // console.log('CART ITEMS', items);
        return (
          <div className="list-container">
            { error ? <h2>ERROR!</h2> : (
              <ul>
                {_.orderBy(items, ['row_id'], ['asc']).map(item => (
                  <li key={item._id}>
                    @{item.row_id}: {item.itemId} - {item.item_amount}x {item.unit}
                  </li>
                ))}
              </ul>
            ) }
            <div className="flex _center mt">
              <button onClick={e => refetch()}>REFETCH</button>
            </div>
          </div>
        )
      }}
    </ReactiveQuery>
  )
}