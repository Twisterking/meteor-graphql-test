import React, { useState } from 'react';
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';
import { useMutation } from '@apollo/react-hooks';
import _ from 'lodash';
// import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

const GET_LIST_DATA = gql`
  query getList($listId: ID, $limit: Int, $skip: Int) {
    listbody(listId: $listId, limit: $limit, skip: $skip) {
      _id
      row_id
      itemId
    }
  }
`;

const SUB_LIST_DATA = gql`
  subscription subList($listId: ID, $limit: Int, $skip: Int) {
    listbody(listId: $listId, limit: $limit, skip: $skip) {
      event
      doc
    }
  }
`;

// MUTATIONS - https://www.apollographql.com/docs/react/data/mutations/
const ADD_TO_CART = gql`
  mutation AddToCart($openOrderId: ID, $itemId: ID, $amount: Float, $unit: String) {
    addToCart(openOrderId: $openOrderId, itemId: $itemId, amount: $amount, unit: $unit) {
      id
      type
    }
  }
`;

// https://reactjs.org/docs/hooks-state.html
export default (props) => {
  const [page, setPage] = useState(1);
  const prevPage = () => {
    if(page == 1) return;
    setPage(page - 1);
  }
  const nextPage = () => {
    setPage(page + 1);
  }
  const [addToCart, { data }] = useMutation(ADD_TO_CART);
  const doAddToCart = itemId => e => {
    const groupId = '363SQib5kzShKmYo2';
    const openOrderId = 'aqMMFbWYu6zary74i';
    console.log({ groupId, itemId });
    addToCart({ variables: { openOrderId, itemId, amount: 5, unit: "KGM" } });
  }

  const variables = { listId: props.listId, limit: 20, skip: (page-1)*20 };
  // fetchPolicy='no-cache'
  return (
    <ReactiveQuery
      query={GET_LIST_DATA}
      subscription={SUB_LIST_DATA}
      variables={variables}
    >
      {(props) => {
        const { data, error, loading, refetch } = props;
        // https://docs.meteor.com/api/connections.html#Meteor-status
        const connected = Meteor.status().connected || Meteor.status().status == 'connecting';
        if(loading && connected) return <h5>LOADING ...</h5>;
        const items = data.listbody;
        return (
          <div className="list-container">
            <div className="flex">
              <button onClick={prevPage}>&lt;</button>
              Seite {page}
              <button onClick={nextPage}>&gt;</button>
            </div>
            { error ? <h2>ERROR!</h2> : (
              <ul>
                {_.orderBy(items, ['row_id'], ['asc']).map(item => (
                  <li key={item._id}>
                    <button onClick={doAddToCart(item.itemId)}>+</button> @{item.row_id}: {item._id} - {item.itemId}
                  </li>
                ))}
              </ul>
            ) }
            <div className="flex">
              <button onClick={prevPage}>&lt;</button>
              Seite {page}
              <button onClick={nextPage}>&gt;</button>
            </div>
            <div className="flex _center mt">
              <button onClick={e => refetch()}>REFETCH</button>
            </div>
          </div>
        )
      }}
    </ReactiveQuery>
  )
}