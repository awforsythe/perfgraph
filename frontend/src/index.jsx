import React from 'react';
import ReactDOM from 'react-dom';

import { SessionsProvider } from './contexts/SessionsContext.jsx';
import SessionsList from './components/SessionsList.jsx';

const App = () => (
  <SessionsProvider>
    <SessionsList />
  </SessionsProvider>
);

ReactDOM.render(<App />, document.querySelector('#main'));
