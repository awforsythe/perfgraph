import React from 'react';

import { expectJson } from '../util.jsx';

const SocketEventContext = React.createContext();

class SocketEventProvider extends React.Component {
  constructor(props) {
    super(props);
    this.callbacks = [];
    this.socket = null;
  }

  register = (callback) => {
    this.callbacks.push(callback);
  };

  unregister = (callback) => {
    this.callbacks.splice(this.callbacks.indexOf(callback), 1);
  };

  componentDidMount() {
    this.socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.socket.onmessage = (event) => {
      const { type, params } = JSON.parse(event.data);
      for (const callback of this.callbacks) {
        callback(type, params);
      }
    }
  }

  componentWillUnmount() {
    this.socket.close(1000);
  }

  render() {
    const { children } = this.props;
    const socketEvents = {
      register: this.register,
      unregister: this.unregister
    };
    return (
      <SocketEventContext.Provider value={socketEvents}>
        {children}
      </SocketEventContext.Provider>
    );
  }
};

export { SocketEventContext, SocketEventProvider };
