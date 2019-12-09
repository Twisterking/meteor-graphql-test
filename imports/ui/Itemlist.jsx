import React, { useState } from 'react';
import { Random } from 'meteor/random';
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';
import { useMutation } from '@apollo/react-hooks';
import { Mutation } from '@apollo/react-components';
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

// GET CART DATA
const GET_CART_DATA = gql`
  query getOpenOrder($groupId: ID) {
    openorderbody(groupId: $groupId) {
      _id
      list_id
      row_id
      itemId
      item_amount
      unit
    }
  }
`;

// MUTATIONS - https://www.apollographql.com/docs/react/data/mutations/
const ADD_TO_CART = gql`
  mutation AddToCart($_id: ID, $list_id: ID, $itemId: ID, $item_amount: Float, $unit: String) {
    addToCart(_id: $_id, list_id: $list_id, itemId: $itemId, item_amount: $item_amount, unit: $unit) {
      _id
      list_id
      row_id
      itemId
      item_amount
      unit
    }
  }
`;

// https://dev.to/aerogear/automatically-update-apollo-cache-after-mutations-20n7

// <Mutation> : https://www.apollographql.com/docs/react/data/mutations/

export default (props) => {
  const [page, setPage] = useState(1);
  const prevPage = () => {
    if(page == 1) return;
    setPage(page - 1);
  }
  const nextPage = () => {
    setPage(page + 1);
  }
  const variables = { listId: props.listId, limit: 20, skip: (page-1)*20 };
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
        return (
          <div className="list-container">
            <div className="flex">
              <button onClick={prevPage}>&lt;</button>
              Seite {page}
              <button onClick={nextPage}>&gt;</button>
            </div>
            { error ? <h2>ERROR!</h2> : (
              <ul>
                {_.orderBy(items, ['row_id'], ['asc']).map(item => {
                  const openOrderId = 'qPDGf3p53P9G4dqs2';
                  const units = ['kg', 'Stk', 'KRT', 'Pkg'];
                  const mutationVars = {
                    _id: Random.id(),
                    itemId: item.itemId,
                    list_id: openOrderId,
                    item_amount: _.random(1, 20),
                    unit: units[Math.floor(Math.random() * units.length)]
                  }
                  return (
                    <li key={item._id}>
                      {/* https://www.apollographql.com/docs/react/api/react-components/#mutation */}
                      <Mutation
                        mutation={ADD_TO_CART}
                        variables={mutationVars}
                        update={(cache, { data: { addToCart } }) => {
                          const { openorderbody } = cache.readQuery({ query: GET_CART_DATA, variables: { groupId: 'vXGNoPBx5cxDbMsui' } });
                          const newOpenOrderBody = openorderbody.concat([addToCart]);
                          // console.log('Mutation update()', { addToCart, newOpenOrderBody });
                          cache.writeQuery({
                            query: GET_CART_DATA,
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
                          <button onClick={addToCart}>+</button> 
                        ) }
                      </Mutation>
                      <span>@{item.row_id}: {item._id} - {item.itemId}</span>
                    </li>
                  )
                })}
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

// OLD:
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