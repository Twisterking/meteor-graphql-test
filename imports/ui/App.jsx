import React from 'react';
import TestHoc from './TestHoc';
import Standard from './Standard';

export default (props) => {
  return (
    <div>
      <h1>GraphQL/Apollo TEST</h1>
      <TestHoc />
      <hr/>
      <Standard />
    </div>
  )
}