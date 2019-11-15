import React from 'react';
import Hook from './Hook';
import TestHoc from './TestHoc';
import Reactive from './Reactive';

export default (props) => {
  return (
    <div>
      <h1>GraphQL/Apollo TEST</h1>
      <Hook />
      <hr/>
      {/* <TestHoc /> */}
      {/* <hr/> */}
      <Reactive />
    </div>
  )
}