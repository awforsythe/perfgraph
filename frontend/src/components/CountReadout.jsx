import React from 'react';
import PropTypes from 'prop-types';

import DiffReadout from './DiffReadout.jsx';

function formatValue(value, thousands) {
  if (thousands) {
    const rounded = Math.round(value / 1000.0);
    return rounded <= 0 ? '<1k' : `${rounded}k`;
  }
  return value.toFixed(0);
}

function getColor(baselineDelta, greenThreshold, blueThreshold, yellowThreshold) {
  if (typeof baselineDelta === 'number') {
    if (baselineDelta < greenThreshold) return 'green';
    if (baselineDelta < blueThreshold) return 'blue';
    if (baselineDelta < yellowThreshold) return 'yellow';
    return 'red';
  }
}

function CountReadout(props) {
  const { label, value, baselineValue, greenThreshold, blueThreshold, yellowThreshold, thousands } = props;
  const baselineDelta = typeof baselineValue === 'number' ? (value - baselineValue) : null;
  return (
    <div className="count">
      <div className="count-value">
        {formatValue(value, thousands)}
      </div>
      <div className="count-label">
        {label}
      </div>
      <div className="count-delta">
        {baselineDelta && (
          <DiffReadout
            delta={baselineDelta}
            color={getColor(baselineDelta, greenThreshold, blueThreshold, yellowThreshold)}
            precision={0}
            small
            thousands={thousands}
          />
        )}
      </div>
    </div>
  );
}
CountReadout.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  baselineValue: PropTypes.number,
  greenThreshold: PropTypes.number.isRequired,
  blueThreshold: PropTypes.number.isRequired,
  yellowThreshold: PropTypes.number.isRequired,
  thousands: PropTypes.bool,
};

export default CountReadout;
