import React from 'react';
import gql from 'graphql-tag';
// import { ReactiveQuery } from 'apollo-live-client';
import _ from 'lodash';
import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

// not updating while offline:
const GET_CART_DATA = gql`
  query getOpenOrder($openOrderId: ID) {
    openorderbody(openOrderId: $openOrderId) {
      _id
      list_id
      row_id
      itemId
      item_amount
      unit
      item
    }
  }
`;

// not updating while offline:
const SUB_CART_DATA = gql`
  subscription subOpenOrder($openOrderId: ID) {
    openorderbody(openOrderId: $openOrderId)  {
      event
      doc
    }
  }
`;

export default (props) => {
  const variables = { openOrderId: props.openOrderId };
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
        return (
          <div className="list-container">
            { error ? <h2>ERROR!</h2> : (
              <ul className="itemlist">
                {_.orderBy(items, ['row_id'], ['asc']).map(listItem => {
                  // console.log('listItem', listItem);
                  return (
                    <li key={listItem._id}>
                      <span className="rowid">{listItem.row_id}</span>
                      <div className="name-ref">
                        <h5>{listItem.item.item_name}</h5>
                        <small>{listItem.item.item_ref}</small>
                      </div>
                      <div className="units">
                        { listItem.item.units && listItem.item.units.length > 0 ?
                          <select>
                            { listItem.item.units.map(unit => (
                              <option key={unit.alias} value={unit.alias}>{unit.name}</option>
                            )) }
                          </select>
                        : null }
                      </div>
                    </li>
                  )
                })}
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