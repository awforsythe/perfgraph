import React from 'react';
import PropTypes from 'prop-types';

function LoadingIndicator(props) {
  const { text } = props;
  return (
    <em>{text || 'Loading...'}</em>
  );
}
LoadingIndicator.propTypes = {
  text: PropTypes.string,
};

export default LoadingIndicator;
