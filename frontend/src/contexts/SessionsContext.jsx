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
    this.socket = null;
  }

  handleEvent = (event, params) => {
    if (event === 'session_created' || event === 'session_updated') {
      this.refreshSession(params.id);
    } else if (event === 'session_deleted') {
      this.removeSession(params.id);
    }
  };

  componentDidMount() {
    this.fetchSessions();
    this.socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.socket.onmessage = (sockevent) => {
      const { event, params } = JSON.parse(sockevent.data);
      this.handleEvent(event, params);
    }
  }

  componentWillUnmount() {
    this.socket.close(1001);
  }

  fetchSessions() {
    this.setState({ isLoading: true });
    fetch('/api/session')
      .then(expectJson)
      .then(data => this.setState({ isLoading: false, error: null, sessions: data.sessions }))
      .catch(error => this.setState({ isLoading: false, error }));
  }

  refreshSession(id) {
    if (!this.state.isLoading) {
      fetch(`/api/session/${id}`)
        .then(expectJson)
        .then(data => {
          const { isLoading, sessions } = this.state;
          if (!isLoading) {
            const index = sessions.findIndex(x => x.id === id);
            if (index >= 0) {
              this.setState({ sessions: sessions.slice(0, index).concat([data]).concat(sessions.slice(index + 1)) });
            } else {
              this.setState({ sessions: [data].concat(sessions) })
            }
          }
        });
    }
  }

  removeSession(id) {
    const { isLoading, sessions } = this.state;
    if (!isLoading) {
      const index = sessions.findIndex(x => x.id === id);
      if (index >= 0) {
        this.setState({ sessions: sessions.slice(0, index).concat(sessions.slice(index + 1)) });
      }
    }
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
