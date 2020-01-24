import React from 'react';
import PropTypes from 'prop-types';

import { SocketEventContext } from './SocketEventContext.jsx';
import { expectJson } from '../util.jsx';

const SessionsContext = React.createContext();

class _SessionsProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      sessions: [],
    };
  }

  handleSocketEvent = (type, params) => {
    if (type === 'session_created' || type === 'session_updated') {
      this.refreshSession(params.id);
    } else if (type === 'session_deleted') {
      this.removeSession(params.id);
    }
  };

  componentDidMount() {
    this.fetchSessions();
    this.props.socketEvents.register(this.handleSocketEvent);
  }

  componentWillUnmount() {
    this.props.socketEvents.unregister(this.handleSocketEvent);
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
_SessionsProvider.propTypes = {
  socketEvents: PropTypes.object.isRequired,
};
const SessionsProvider = (props) => (
  <SocketEventContext.Consumer>
    {socketEvents => (
      <_SessionsProvider
        socketEvents={socketEvents}
        {...props}
      />
    )}
  </SocketEventContext.Consumer>
);

export { SessionsContext, SessionsProvider };
