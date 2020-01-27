import React from 'react';
import PropTypes from 'prop-types';

function ChartModeSelector(props) {
  const { mode, onChange } = props;
  function handleClick(event, modeClicked) {
    event.preventDefault();
    onChange(modeClicked);
  }
  return (
    <div className="chart-mode-selector">
      <div className={`button button-leftcap chart-mode-button${mode === 'time' ? ' active' : ''}`}>
        <a href="#" onClick={(event) => handleClick(event, 'time')}>Frame Times</a>
      </div>
      <div className={`button button-nocap chart-mode-button${mode === 'memory' ? ' active' : ''}`}>
        <a href="#" onClick={(event) => handleClick(event, 'memory')}>Memory</a>
      </div>
      <div className={`button button-nocap chart-mode-button${mode === 'triangles' ? ' active' : ''}`}>
        <a href="#" onClick={(event) => handleClick(event, 'triangles')}>Triangles</a>
      </div>
      <div className={`button button-rightcap chart-mode-button${mode === 'drawcalls' ? ' active' : ''}`}>
        <a href="#" onClick={(event) => handleClick(event, 'drawcalls')}>Draw Calls</a>
      </div>
    </div>
  );
}
ChartModeSelector.propTypes = {
  mode: PropTypes.oneOf(['time', 'memory', 'triangles', 'drawcalls']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ChartModeSelector;
