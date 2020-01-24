import React from 'react';
import ReactDOM from 'react-dom';

import { SocketEventProvider } from './contexts/SocketEventContext.jsx';
import { SessionsProvider } from './contexts/SessionsContext.jsx';
import SessionsList from './components/SessionsList.jsx';

const App = () => (
  <SocketEventProvider>
    <SessionsProvider>
      <SessionsList />
    </SessionsProvider>
  </SocketEventProvider>
);

ReactDOM.render(<App />, document.querySelector('#main'));
