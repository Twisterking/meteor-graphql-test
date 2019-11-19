import React from 'react';
import gql from 'graphql-tag';
import { ReactiveQuery } from 'apollo-live-client';
import _ from 'lodash';
// import { ReactiveQuery } from './reactiveQuery/index'; // just my own copy to fiddle around

// SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!!
const GET_LIST_DATA = gql`
  query getList($listId: ID, $limit: Int, $skip: Int) {
    listbody(listId: $listId, limit: $limit, skip: $skip) {
      _id
      row_id
      itemId
    }
  }
`;

// SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!!
const SUB_LIST_DATA = gql`
  subscription subList($listId: ID, $limit: Int, $skip: Int) {
    listbody(listId: $listId, limit: $limit, skip: $skip) {
      event
      doc
    }
  }
`;

export default class Itemlist extends React.Component {
  constructor() {
    super();
    this.state = {
      page: 1
    }
  }
  prevPage = () => {
    this.setState({ page: this.state.page - 1 });
  }
  nextPage = () => {
    this.setState({ page: this.state.page + 1 });
  }
  render() {
    const {page} = this.state;
    const variables = { listId: this.props.listId, limit: 20, skip: (page-1)*20 };
    // fetchPolicy='no-cache'
    return (
      <ReactiveQuery
        query={GET_LIST_DATA}
        subscription={SUB_LIST_DATA}
        variables={variables}
      >
        {(props) => {
          const { data, error, loading, refetch } = props;
          if(loading) return null;
          if(error) { console.error(error); return null; }
          const items = data.listbody;
          console.log('items', items);
          return (
            <div className="list-container container">
              <ul>
                {_.orderBy(items, ['row_id'], ['asc']).map(item => (
                  <li key={item._id}>
                    @{item.row_id}: {item._id} - {item.itemId}
                  </li>
                ))}
              </ul>
              <div className="flex">
                <button onClick={this.prevPage}>&lt;</button>
                Seite {this.state.page}
                <button onClick={this.nextPage}>&gt;</button>
              </div>
            </div>
          )
        }}
      </ReactiveQuery>
    )
  }
}