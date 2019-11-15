import React from 'react';
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';
import _ from 'lodash';
// import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

// SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!! ("user")
const GET_LIST_DATA = gql`
  query getList($listId: ID) {
    listbody(listId: $listId) {
      _id
      row_id
      itemId
    }
  }
`;

// SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!! ("user")
const SUB_LIST_DATA = gql`
  subscription subList($listId: ID) {
    listbody(listId: $listId) {
      event
      doc
    }
  }
`;

export default ({ listId }) => (
  <ReactiveQuery
    query={GET_LIST_DATA}
    subscription={SUB_LIST_DATA}
    variables={{ listId }}
  >
    {(props) => {
      // console.log('PROPS:', props);
      const { data, error, loading, refetch } = props;
      if(loading) return null;
      if(error) { console.error(error); return null; }
      return <Itemlist items={data.listbody} />;
    }}
  </ReactiveQuery>
)

class Itemlist extends React.Component {
  render() {
    const { items } = this.props;
    console.log('LIST:', items);
    return (
      <ul>
        {_.orderBy(items, ['row_id'], ['asc']).map(item => (
          <li key={item._id}>
            @{item.row_id}: {item._id} - {item.itemId}
          </li>
        ))}
      </ul>
    )
  }
}