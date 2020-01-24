import React from 'react';
import PropTypes from 'prop-types';

import { expectJson } from '../util.jsx';

const FramesContext = React.createContext();

class FramesProvider extends React.Component {
  constructor() {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      frames: [],
    };
  }

  componentDidMount() {
    this.fetchFrames();
  }

  fetchFrames() {
    this.setState({ isLoading: true });
    fetch(`/api/session/${this.props.sessionId}/frame`)
      .then(expectJson)
      .then(data => this.setState({ isLoading: false, error: null, frames: data.frames }))
      .catch(error => this.setState({ isLoading: false, error }));
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
