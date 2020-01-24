import React from 'react';
import PropTypes from 'prop-types';

function SessionsListItem(props) {
  const { id, createdAt, description, frameTime, gameThreadTime, renderThreadTime, gpuFrameTime } = props;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid black' }}>
      <div>Session {id}</div>
      <div>{frameTime.toFixed(2)}ms</div>
      <div>{gameThreadTime.toFixed(2)}ms</div>
      <div>{renderThreadTime.toFixed(2)}ms</div>
      <div>{gpuFrameTime.toFixed(2)}ms</div>
    </div>
  );
}
SessionsListItem.propTypes = {
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  description: PropTypes.string,
  frameTime: PropTypes.number.isRequired,
  gameThreadTime: PropTypes.number.isRequired,
  renderThreadTime: PropTypes.number.isRequired,
  gpuFrameTime: PropTypes.number.isRequired,
};

export default SessionsListItem;
