import React from 'react';
import Hook from './Hook';
import TestHoc from './TestHoc';
import Reactive from './Reactive';
import Itemlist from './Itemlist';
import Cart from './Cart';

// https://stackoverflow.com/questions/5529718/how-to-detect-internet-speed-in-javascript
const arrTimes = [];
let i = 0; // start
const tThreshold = 150; //ms
const testImage = "http://www.google.com/images/phd/px.gif"; // small image in your server
const dummyImage = new Image();

function testLatency(cb) {
  let tStart = new Date().getTime();
  dummyImage.src = testImage + '?t=' + tStart;
  dummyImage.onload = function() {
    let tEnd = new Date().getTime();
    let tTimeTook = tEnd-tStart;
    arrTimes[i] = tTimeTook;
    i++;
    let sum = arrTimes.reduce(function(a, b) { return a + b; });
    let avg = sum / arrTimes.length;
    // TODO: Check if current val is way lower than the last --> online again
    // TODO: Check if current val is way higher than the last --> OFFLINE
    cb(avg);
  }
}

// setInterval(() => {
//   testLatency((avg) => {
//     let isConnectedFast = (avg <= tThreshold);
//     console.log('SPEEDTEST', { avg, tThreshold, isConnectedFast });
//     // Call refetch for the most important queries
//   });
// }, 3000);

function login(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  Meteor.loginWithPassword(formData.get('login'), formData.get('password'), (error) => {
    if(error) return console.error(error);
    console.log('%c LOGGED IN! ', 'background: #40CA49; color: #ffffff');
  });
}

export default (props) => {
  return (
    <div>
      <div className="flex center">
        <h1>Apollo Playground</h1>
        <div>
          <form className="flex" onSubmit={login}>
            <input type="text" placeholder="Login" id="login" name="login" />
            <input type="password" placeholder="Password" id="password" name="password" />
            <button type="submit">LOGIN</button>
            <button type="button" onClick={e => Meteor.logout()}>LOGOUT</button>
          </form>
        </div>
        <div>
          <button className="bigger mr" onClick={e => Meteor.disconnect()}>Disconnect</button>
          <button className="bigger" onClick={e => Meteor.reconnect()}>Connect</button>
        </div>
      </div>
      <div>
        <h3>User Subs</h3>
        <div className="flex">
          <div>
            <h4>HOOK:</h4>
            <Hook />
          </div>
          <div>
            <h4>ReactiveQuery</h4>
            <Reactive />
          </div>
          <div>
            <h4>withTracker()</h4>
            <h5>TODO!</h5>
          </div>
        </div>
      </div>
      <hr/>
      <div className="flex mt">
        <div className="container">
          <h3>LIST Qy4tHNKJnY9fgyJiQ</h3>        
          <Itemlist listId="Qy4tHNKJnY9fgyJiQ" />
          {/* Blacklist JUFA Kaffee AGM Klagenfurt */}
        </div>
        <div className="container">
          <h3>CART groupId 363SQib5kzShKmYo2</h3>
          <Cart groupId="363SQib5kzShKmYo2" />
          {/* Group: JUFA Stift Gurk @ AGM Klagenfurt */}
        </div>
      </div>
    </div>
  )
}