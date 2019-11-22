import * as React from 'react';
import * as PropTypes from 'prop-types';
import { reduceStore } from './reduceStore';
import { Query } from 'react-apollo';

export default class ReactiveQuery extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    subscription: PropTypes.object.isRequired,
  };

  render() {
    const { children, subscription, query, variables, ...rest } = this.props;

    return (
      <Query query={query} variables={variables} {...rest}>
        {props => {
          // console.log('props1', props);
          return (
            <Subscription
              subscription={subscription}
              variables={variables}
              {...props}
            >
              {() => {
                // console.log('props2', props);
                return children(props);
              }}
            </Subscription>
          );
        }}
      </Query>
    );
  }
}

class Subscription extends React.Component {
  componentDidMount = () => {
    const { subscribeToMore, subscription, variables } = this.props;
    subscribeToMore({
      document: subscription,
      variables: variables,
      updateQuery: (prev, { subscriptionData }) => {
        // console.log('subscriptionData', subscriptionData);
        if (!subscriptionData.data) return prev;

        const storeName = Object.keys(subscriptionData.data)[0];
        // SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!!
        const newStore = Object.assign({}, prev, {
          [storeName]: reduceStore(
            subscriptionData.data[storeName],
            prev[storeName]
          )
        });
        console.log('newStore', newStore);
        return newStore;
      }
    });
  };

  render() {
    const { children, ...rest } = this.props;
    return children(rest);
  }
}
