import React from 'react';
import PropTypes from 'prop-types';

import { SocketEventContext } from './SocketEventContext.jsx';
import { expectJson } from '../util.jsx';

const FramesContext = React.createContext();

class _FramesProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      frames: [],
    };
  }

  handleSocketEvent = (type, params) => {
    if (type === 'frame_created') {
      if (params.sessionId === this.props.sessionId) {
        this.fetchSingleFrame(params.id);
      }
    }
  };

  componentDidMount() {
    this.fetchFrames();
    this.props.socketEvents.register(this.handleSocketEvent);
  }

  componentWillUnmount() {
    this.props.socketEvents.unregister(this.handleSocketEvent);
  }

  componentDidUpdate(prevProps) {
    if (this.props.sessionId !== prevProps.sessionId) {
      this.fetchFrames();
    }
  }

  fetchFrames() {
    if (this.props.sessionId) {
      this.setState({ isLoading: true });
      fetch(`/api/session/${this.props.sessionId}/frame`)
        .then(expectJson)
        .then(data => this.setState({ isLoading: false, error: null, frames: data.frames }))
        .catch(error => this.setState({ isLoading: false, error }));
    } else {
      this.setState({ isLoading: false, error: null, frames: [] });
    }
  }

  fetchSingleFrame(id) {
    if (!this.state.isLoading) {
      fetch(`/api/frame/${id}`)
        .then(expectJson)
        .then(data => {
          const { isLoading, frames } = this.state;
          if (!isLoading) {
            const index = frames.findIndex(x => x.number > data.number);
            if (index >= 0) {
              this.setState({ frame: frames.slice(0, index).concat([data]).concat(frames.slice(index)) });
            } else {
              this.setState({ frames: frames.concat([data]) })
            }
          }
        });
    }
  }

  render() {
    const { children } = this.props;
    return (
      <FramesContext.Provider value={{ ...this.state }}>
        {children}
      </FramesContext.Provider>
    );
  }
};
_FramesProvider.propTypes = {
  socketEvents: PropTypes.object.isRequired,
  sessionId: PropTypes.number,
};
const FramesProvider = (props) => (
  <SocketEventContext.Consumer>
    {socketEvents => (
      <_FramesProvider
        socketEvents={socketEvents}
        {...props}
      />
    )}
  </SocketEventContext.Consumer>
);


export { FramesContext, FramesProvider };
