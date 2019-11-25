import React, { Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Groups } from '/imports/db';

function GroupsFromSub(props) {
  const { loading, groups } = props;
  if(loading) return <h5>(( LOADING ))</h5>;
  // console.log('GroupsFromSub() render: props', props);
  return (
    <ul>
      { groups.slice(0, 3).map(group => (
        <li key={group._id}>{group.company.name}</li>
      )) }
    </ul>
  )
}

export default withTracker(() => {
  const sub = Meteor.subscribe('buyer:getGroups');
  const loading = !sub.ready();
  if (!Meteor.user() || loading) return { loading: true }
  const currentUser = Meteor.user();
  let groups = Groups.find({ 'users.userId': currentUser._id }, { sort: { 'company.name': 1 } }).fetch().filter(group => {
    if (group.status == 'inactive') return false;
    return true;
  });
  return {
    loading,
    groups
  }
})(GroupsFromSub);