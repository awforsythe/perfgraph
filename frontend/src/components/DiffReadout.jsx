import React from 'react';
import PropTypes from 'prop-types';

function formatDelta(delta, precision, thousands) {
  const sign = delta < 0.0 ? '-' : '+';
  const absDelta = Math.abs(delta);
  if (thousands) {
    const rounded = Math.round(absDelta / 1000.0);
    return sign + (rounded <= 0 ? '<1k' : `${rounded}k`);
  }
  return sign + absDelta.toFixed(precision || 0);
}

function DiffReadout(props) {
  const { delta, color, precision, small, thousands } = props;
  return (
    <span className={`diff-readout ${color}${small ? ' small' : ''}`}>
      {formatDelta(delta, precision, thousands)}
    </span>
  );
}
DiffReadout.propTypes = {
  delta: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'yellow', 'red']).isRequired,
  precision: PropTypes.number,
  small: PropTypes.bool,
  thousands: PropTypes.bool,
};

export default DiffReadout;
