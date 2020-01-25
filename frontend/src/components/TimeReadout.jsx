import React from 'react';
import PropTypes from 'prop-types';

import { FrameTimeIcon, GameThreadTimeIcon, RenderThreadTimeIcon, GpuFrameTimeIcon } from './Icons.jsx';
import DiffReadout from './DiffReadout.jsx';

function getIconClass(type) {
  if (type === 'gpu') return GpuFrameTimeIcon;
  if (type === 'render') return RenderThreadTimeIcon;
  if (type === 'game') return GameThreadTimeIcon;
  return FrameTimeIcon;
};

function getColor(delta) {
  if (!isNaN(delta)) {
    if (delta < -0.5) return 'green';
    if (delta < 0.5) return 'blue';
    if (delta < 1.25) return 'yellow';
    return 'red';
  }
  return null;
}

function TimeReadout(props) {
  const { type, value, baselineValue, small } = props;
  const IconClass = getIconClass(type);
  const baselineDelta = typeof baselineValue === 'number' ? (value - baselineValue) : null;
  return (
    <div style={{ display: 'flex' }}>
      <div>
        <IconClass size={small ? 16 : 20} />
      </div>
      <div className={`readout-value${small ? ' small' : ''}`}>
        {value.toFixed(2)}
      </div>
      <div className={`readout-delta${small ? ' small' : ''}`}>
      { typeof baselineDelta === 'number' && (
          <DiffReadout
            delta={baselineDelta}
            color={getColor(baselineDelta)}
            precision={2}
            small={small}
          />
      )}
      </div>
    </div>
  );
}
TimeReadout.propTypes = {
  type: PropTypes.oneOf(['frame', 'game', 'render', 'gpu']).isRequired,
  value: PropTypes.number.isRequired,
  baselineValue: PropTypes.number,
  small: PropTypes.bool,
};

export default TimeReadout;
