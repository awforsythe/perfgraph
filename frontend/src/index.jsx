import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import '@csstools/normalize.css';
import 'typeface-roboto';
import './style.css';

import { SocketEventProvider } from './contexts/SocketEventContext.jsx';
import { SessionsProvider } from './contexts/SessionsContext.jsx';
import { BaselineProvider } from './contexts/BaselineContext.jsx';
import SessionsList from './components/SessionsList.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baselineSessionId: null,
    };
  }

  componentDidMount() {
    const baselineSessionId = parseInt(window.localStorage.getItem('perfgraphBaselineSessionId'));
    if (!isNaN(baselineSessionId) && baselineSessionId > 0) {
      this.setState({ baselineSessionId });
    }
  }

  handleSetBaselineSessionId = (baselineSessionId) => {
    window.localStorage.setItem('perfgraphBaselineSessionId', baselineSessionId);
    this.setState({ baselineSessionId });
  };

  render() {
    const { baselineSessionId } = this.state;
    return (
      <SocketEventProvider>
        <SessionsProvider>
          <BaselineProvider baselineSessionId={baselineSessionId}>
            <h1>perfgraph</h1>
            <SessionsList
              baselineSessionId={baselineSessionId}
              onSetBaselineSessionId={this.handleSetBaselineSessionId}
            />
          </BaselineProvider>
        </SessionsProvider>
      </SocketEventProvider>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#main'));
