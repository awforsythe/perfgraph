import React from 'react';
import PropTypes from 'prop-types';

function ErrorIndicator(props) {
  const { message } = props;
  return (
    <strong>Error: <em>{message}</em></strong>
  );
}
ErrorIndicator.propTypes = {
  message: PropTypes.string
};

export default ErrorIndicator;
