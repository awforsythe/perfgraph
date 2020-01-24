import React from 'react';

import { expectJson } from '../util.jsx';

const SessionsContext = React.createContext();

class SessionsProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      sessions: [],
    };
  }

  componentDidMount() {
    this.fetchSessions();
  }

  fetchSessions() {
    this.setState({ isLoading: true });
    fetch('/api/session')
      .then(expectJson)
      .then(data => this.setState({ isLoading: false, error: null, sessions: data.sessions }))
      .catch(error => this.setState({ isLoading: false, error }));
  }

  render() {
    const { children } = this.props;
    return (
      <SessionsContext.Provider value={{ ...this.state }}>
        {children}
      </SessionsContext.Provider>
    );
  }
};

export { SessionsContext, SessionsProvider };
