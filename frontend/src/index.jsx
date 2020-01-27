import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import '@csstools/normalize.css';
import 'typeface-roboto';
import 'tippy.js/dist/tippy.css';
import './style.css';

import { SocketEventProvider } from './contexts/SocketEventContext.jsx';
import { SessionsProvider } from './contexts/SessionsContext.jsx';
import Client from './components/Client.jsx';

const App = () => (
  <SocketEventProvider>
    <SessionsProvider>
      <Client />
    </SessionsProvider>
  </SocketEventProvider>
);

ReactDOM.render(<App />, document.querySelector('#main'));
