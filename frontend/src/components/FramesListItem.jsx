import React from 'react';
import PropTypes from 'prop-types';

function FramesListItem(props) {
  const { id, number, description, frameTime, gameThreadTime, renderThreadTime, gpuFrameTime, gpuMemory, numTrianglesDrawn, numDrawCalls, numMeshDrawCalls } = props;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid black', minWidth: 100, marginLeft: 5 }}>
      <div>{number}</div>
      <div><span style={{ fontSize: 10 }}>GPU:</span> {gpuFrameTime.toFixed(2)}</div>
      <div><span style={{ fontSize: 10 }}>Mem:</span> {gpuMemory.toFixed(0)}</div>
      <div><span style={{ fontSize: 10 }}>Tris:</span> {numTrianglesDrawn.toFixed(0)}</div>
      <div><span style={{ fontSize: 10 }}>pDrw:</span> {numDrawCalls.toFixed(0)}</div>
      <div><span style={{ fontSize: 10 }}>mDrw:</span> {numMeshDrawCalls.toFixed(0)}</div>
    </div>
  );
}
FramesListItem.propTypes = {
  id: PropTypes.number.isRequired,
  number: PropTypes.number.isRequired,
  description: PropTypes.string,
  frameTime: PropTypes.number.isRequired,
  gameThreadTime: PropTypes.number.isRequired,
  renderThreadTime: PropTypes.number.isRequired,
  gpuFrameTime: PropTypes.number.isRequired,
  gpuMemory: PropTypes.number.isRequired,
  numTrianglesDrawn: PropTypes.number.isRequired,
  numDrawCalls: PropTypes.number.isRequired,
  numMeshDrawCalls: PropTypes.number.isRequired,
};

export default FramesListItem;
