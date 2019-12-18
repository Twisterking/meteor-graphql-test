import * as React from 'react';
import * as PropTypes from 'prop-types';
import { reduceStore } from './reduceStore';
import { Query } from 'react-apollo';

import _ from 'lodash';

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
  componentDidMount() {
    const { variables } = this.props;
    console.log('componentDidMount variables:', variables);
    return this.updateSub();
  }
  componentDidUpdate(prevProps) {
    if(prevProps.variables && this.props.variables && !_.isEqual(prevProps.variables, this.props.variables)) {
      console.log('componentDidUpdate variables:', this.props.variables);
      return this.updateSub();
    }
  }
  updateSub = () => {
    const { subscribeToMore, subscription, variables } = this.props;
    const apolloClient = this.props.client;
    const subName = subscription.definitions[0].name.value;
    // create my subKey for the apolloClient.activeSubscriptions Set
    const avoidKeys = ['limit', 'skip'];
    const subKey = subName.concat('-').concat(Object.keys(variables).map(key => {
      if(avoidKeys.indexOf(key) !== -1) return null;
      return `${key}${variables[key]}`
    }).filter(v => !!v).join('-'));
    if(apolloClient.activeSubscriptions.has(subKey)) return;

    apolloClient.activeSubscriptions.add(subKey);
    // https://www.apollographql.com/docs/react/data/subscriptions/#subscribetomore
    subscribeToMore({
      document: subscription,
      variables: variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;        
        const storeName = Object.keys(subscriptionData.data)[0];
        let data = subscriptionData.data[storeName];
        console.log({ prev, storeName, data });
        const newStore = Object.assign({}, prev, {
          [storeName]: reduceStore(
            data,
            prev[storeName]
          )
        });
        console.log({ newStore });
        return newStore;
      }
    });
  }
  render() {
    const { children, ...rest } = this.props;
    return children(rest);
  }
}
