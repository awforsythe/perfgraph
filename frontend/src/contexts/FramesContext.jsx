import React from 'react';
import PropTypes from 'prop-types';

import { expectJson } from '../util.jsx';

const FramesContext = React.createContext();

class FramesProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      frames: [],
    };
    this.socket = null;
  }

  handleEvent = (event, params) => {
    if (event === 'frame_created') {
      if (params.sessionId === this.props.sessionId) {
        this.fetchSingleFrame(params.id);
      }
    }
  };

  componentDidMount() {
    this.fetchFrames();
    this.socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.socket.onmessage = (sockevent) => {
      const { event, params } = JSON.parse(sockevent.data);
      this.handleEvent(event, params);
    }
  }

  componentWillUnmount() {
    this.socket.close(1000);
  }

  fetchFrames() {
    this.setState({ isLoading: true });
    fetch(`/api/session/${this.props.sessionId}/frame`)
      .then(expectJson)
      .then(data => this.setState({ isLoading: false, error: null, frames: data.frames }))
      .catch(error => this.setState({ isLoading: false, error }));
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
FramesProvider.propTypes = {
  sessionId: PropTypes.number.isRequired,
};

export { FramesContext, FramesProvider };
