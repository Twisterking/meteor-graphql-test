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
          console.log('Query props', props);
          return (
            <Subscription
              subscription={subscription}
              variables={variables}
              {...props}
            >
              {() => {
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
    // console.log('componentDidMount', this.props);
    const { subscribeToMore, subscription, variables } = this.props;
    subscribeToMore({
      document: subscription,
      variables: variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        // console.log('subscriptionData', subscriptionData.data);
        
        const storeName = Object.keys(subscriptionData.data)[0];
        // SUBSCRIPTION HAS TO HAVE SAME NAME AS QUERY!!!
        const newStore = Object.assign({}, prev, {
          [storeName]: reduceStore(
            subscriptionData.data[storeName],
            prev[storeName]
          )
        });
        // console.log('newStore', newStore);
        return newStore;
      }
    });
  }
  render() {
    const { children, ...rest } = this.props;
    return children(rest);
  }
}
