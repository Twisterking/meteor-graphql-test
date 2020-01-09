import React, { Fragment, useState } from 'react';
import { Random } from 'meteor/random';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Mutation } from '@apollo/react-components';
import _ from 'lodash';
// import { ReactiveQuery } from 'apollo-live-client';
import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

const GET_LIST_DATA = gql`
  query getList($listId: ID, $limit: Int, $skip: Int) {
    listbody(listId: $listId, limit: $limit, skip: $skip) {
      _id
      row_id
      itemId
      item
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

// GET CART DATA
const GET_CART_DATA = gql`
  query getOpenOrder($openOrderId: ID) {
    openorderbody(openOrderId: $openOrderId) {
      _id
      list_id
      row_id
      itemId
      item
      item_amount
      unit
    }
  }
`;

// MUTATIONS - https://www.apollographql.com/docs/react/data/mutations/
const ADD_TO_CART = gql`
  mutation AddToCart($_id: ID, $list_id: ID, $itemId: ID, $item: JSON, $item_amount: Float, $unit: String) {
    addToCart(_id: $_id, list_id: $list_id, itemId: $itemId, item: $item, item_amount: $item_amount, unit: $unit) {
      _id
      list_id
      row_id
      itemId
      item
      item_amount
      unit
    }
  }
`;

// https://dev.to/aerogear/automatically-update-apollo-cache-after-mutations-20n7

// <Mutation> : https://www.apollographql.com/docs/react/data/mutations/

export default class Itemlist extends React.Component {
  constructor() {
    super();
    this.state = {
      page: 1
    }
  }
  prevPage = () => {
    this.setState(state => {
      if(state.page == 1) return;
      state.page--;
      return state;
    });
  }
  nextPage = () => {
    this.setState(state => {
      state.page++;
      return state;
    });
  }
  render() {
    const variables = { listId: this.props.listId, limit: 20, skip: (this.state.page-1)*20 };
    // console.log('variables', variables);
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
          if(!data) return <h5>No Data</h5>
          const items = data.listbody;
          // if(items && items[0]) console.log(JSON.stringify(items[0], false, 2));
          return (
            <div className="list-container">
              <div className="flex">
                <button onClick={this.prevPage}>&lt;</button>
                Seite {this.state.page}
                <button onClick={this.nextPage}>&gt;</button>
              </div>
              { error ? <h2>ERROR!</h2> : (
                <ul className="itemlist">
                  {_.orderBy(items, ['row_id'], ['asc']).map(item => {
                    return (
                      <ListBodyItem
                        key={item._id}
                        openOrderId={this.props.openOrderId}
                        listItem={item}
                      />
                    )
                  })}
                </ul>
              ) }
              <div className="flex">
                <button onClick={this.prevPage}>&lt;</button>
                Seite {this.state.page}
                <button onClick={this.nextPage}>&gt;</button>
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
}

class ListBodyItem extends React.Component {
  constructor(props) {
    super(props);
    const { listItem } = props;
    const { units } = listItem.item || {};
    this.state = {
      unit: units && units.length > 0 ? units[0].alias : null,
      mutationVars: null
    }
  }
  getMutationVars = cb => {
    const { listItem, openOrderId } = this.props;
    const mutationVars = {
      _id: Random.id(),
      itemId: listItem.itemId,
      item: listItem.item,
      list_id: openOrderId,
      item_amount: _.random(1, 20),
      unit: this.state.unit
    }
    this.setState({ mutationVars }, () => {
      // console.log('mutationVars set:', mutationVars);
      if(typeof cb == 'function') {
        cb();
      }
    });
    return null;
  }
  render() {
    // https://www.apollographql.com/docs/react/api/react-components/#mutation
    const { listItem, openOrderId } = this.props;
    const { mutationVars } = this.state;
    if(!listItem || !listItem.item) {
      console.warn('listItem has no .item!!', listItem);
      return null;
    }
    return (
      <li>
        <Mutation
          mutation={ADD_TO_CART}
          variables={mutationVars}
          update={(cache, { data: { addToCart } }) => {
            const { openorderbody } = cache.readQuery({ query: GET_CART_DATA, variables: { openOrderId } });
            const newOpenOrderBody = openorderbody.concat([addToCart]);
            if(_.findIndex(openorderbody, { _id: mutationVars._id }) !== -1) return;
            // console.log('addToCartaddToCartaddToCart', addToCart);
            cache.writeQuery({
              query: GET_CART_DATA,
              variables: { openOrderId },
              data: { openorderbody: newOpenOrderBody }
            })
          }}
          optimisticResponse={{
            addToCart: {
              ...mutationVars,
              row_id: 77,
              __typename: "OpenOrderElement"
            }
          }}
        >
          { addToCart => (
            <Fragment>
              <span className="rowid">{listItem.row_id}</span>
              <div className="name-ref">
                <h5>{listItem.item.item_name}</h5>
                <small>{listItem.item.item_ref}</small>
              </div>
              <div className="units">
                { listItem.item.units && listItem.item.units.length > 0 ?
                  <select onChange={e => this.setState({ unit: e.target.value })} value={this.state.unit}>
                    { listItem.item.units.map(unit => (
                      <option key={unit.alias} value={unit.alias}>{unit.name}</option>
                    )) }
                  </select>
                : null }
              </div>
              <button onClick={e => this.getMutationVars(addToCart)}>Warenkorb +</button> 
            </Fragment>
          ) }
        </Mutation>
      </li>
    )
  }
}

// HOOK: https://reactjs.org/docs/hooks-state.html
// export default (props) => {
//   const [page, setPage] = useState(1);
//   const prevPage = () => {
//     if(page == 1) return;
//     setPage(page - 1);
//   }
//   const nextPage = () => {
//     setPage(page + 1);
//   }
//   // https://www.apollographql.com/docs/react/data/mutations/#updating-the-cache-after-a-mutation
//   // https://www.apollographql.com/docs/react/api/react-hooks/#usemutation
//   const [addToCart, result] = useMutation(ADD_TO_CART, {
//     update(cache, { data: { addToCart } }) {
//       const { openorderbody } = cache.readQuery({ query: GET_CART_DATA, variables: { groupId: 'vXGNoPBx5cxDbMsui' } });
//       const newOpenOrderBody = openorderbody.concat([addToCart]);
//       // console.log('Mutation update()', { addToCart, newOpenOrderBody });
//       cache.writeQuery({
//         query: GET_CART_DATA,
//         data: { openorderbody: newOpenOrderBody },
//       });
//     },
//     // https://github.com/larkintuckerllc/ApolloReactOffline/blob/master/src/components/App/AppTodos/AppTodosCreate.tsx
//     // optimisticResponse: {
//     //   addToCart: {
//     //     __typename: "OpenOrderElement",
//     //     list_id: "aqMMFbWYu6zary74i",
//     //     itemId: "Sd2irqR9PXm6pXKes",
//     //     item_amount: 19,
//     //     row_id: 77,
//     //     unit: "kg",
//     //     _id: Random.id()
//     //   }
//     // },
//     onError(err) {
//       console.error('Mutation Error:', err);
//     },
//     onCompleted(data) {
//       console.log('Mutation Completed. Data:', data);
//     }
//   });
//   console.log('Mutation result?', result);
//   const doAddToCart = itemId => e => {
//     const openOrderId = 'qPDGf3p53P9G4dqs2';
//     const units = ['kg', 'Stk', 'KRT', 'Pkg'];
//     addToCart({ variables: {
//       list_id: openOrderId,
//       itemId,
//       item_amount: _.random(1, 20),
//       unit: units[Math.floor(Math.random() * units.length)]
//     } });
//   }
//   const variables = { listId: props.listId, limit: 20, skip: (page-1)*20 };
//   return (
//     <ReactiveQuery
//       query={GET_LIST_DATA}
//       subscription={SUB_LIST_DATA}
//       variables={variables}
//     >
//       {(props) => {
//         const { data, error, loading, refetch } = props;
//         // https://docs.meteor.com/api/connections.html#Meteor-status
//         const connected = Meteor.status().connected || Meteor.status().status == 'connecting';
//         if(loading && connected) return <h5>LOADING ...</h5>;
//         if(!data) return <h5>No Data</h5>
//         const items = data.listbody;
//         return (
//           <div className="list-container">
//             <div className="flex">
//               <button onClick={prevPage}>&lt;</button>
//               Seite {page}
//               <button onClick={nextPage}>&gt;</button>
//             </div>
//             { error ? <h2>ERROR!</h2> : (
//               <ul>
//                 {_.orderBy(items, ['row_id'], ['asc']).map(item => (
//                   <li key={item._id}>
//                     <button onClick={doAddToCart(item.itemId)}>+</button> @{item.row_id}: {item._id} - {item.itemId}
//                   </li>
//                 ))}
//               </ul>
//             ) }
//             <div className="flex">
//               <button onClick={prevPage}>&lt;</button>
//               Seite {page}
//               <button onClick={nextPage}>&gt;</button>
//             </div>
//             <div className="flex _center mt">
//               <button onClick={e => refetch()}>REFETCH</button>
//             </div>
//           </div>
//         )
//       }}
//     </ReactiveQuery>
//   )
// }