import React from 'react';
import Hook from './Hook';
import TestHoc from './TestHoc';
import Reactive from './Reactive';
import Itemlist from './Itemlist';

export default (props) => {
  return (
    <div>
      <h1>GraphQL/Apollo TEST</h1>
      <div>
        <h3>User Subs</h3>
        <Hook />
        {/* <hr/>
        <TestHoc /> */}
        <hr/>
        <Reactive />
      </div>
      <div style={{ marginTop: '100px' }}>
        <hr/>
        <h2>LIST</h2>
        <Itemlist listId="Qy4tHNKJnY9fgyJiQ" /> {/* Blacklist JUFA Kaffee AGM Klagenfurt */}
      </div>
    </div>
  )
}