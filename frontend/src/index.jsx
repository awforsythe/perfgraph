import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { SocketEventProvider } from './contexts/SocketEventContext.jsx';
import { SessionsProvider } from './contexts/SessionsContext.jsx';
import { BaselineProvider } from './contexts/BaselineContext.jsx';
import SessionsList from './components/SessionsList.jsx';

const App = () => {
  const [baselineSessionId, setBaselineSessionId] = useState(null);
  return (
    <SocketEventProvider>
      <SessionsProvider>
        <BaselineProvider baselineSessionId={baselineSessionId}>
          <SessionsList
            baselineSessionId={baselineSessionId}
            onSetBaselineSessionId={setBaselineSessionId}
          />
        </BaselineProvider>
      </SessionsProvider>
    </SocketEventProvider>
  );
}

ReactDOM.render(<App />, document.querySelector('#main'));
