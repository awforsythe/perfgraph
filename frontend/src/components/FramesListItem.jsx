import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { BaselineContext } from '../contexts/BaselineContext.jsx';

import TimeReadout from './TimeReadout.jsx';
import CountReadout from './CountReadout.jsx';

function FramesListItem(props) {
  const { id, isBaseline, number, description, frameTime, gameThreadTime, renderThreadTime, gpuFrameTime, gpuMemory, numTrianglesDrawn, numDrawCalls, numMeshDrawCalls } = props;
  const baseline = useContext(BaselineContext);
  const baselineFrame = (!isBaseline && baseline.hasBaseline) ? baseline.frames.find(x => x.number === number) : null;
  return (
    <div className="tooltip">
      <div className={`frame card secondary${isBaseline ? ' is-baseline' : ''}`}>
        <div className="frame-title">{description || number}</div>
        <TimeReadout small
          type="frame"
          value={frameTime}
          baselineValue={baselineFrame && baselineFrame.frame_time}
        />
        <TimeReadout small
          type="game"
          value={gameThreadTime}
          baselineValue={baselineFrame && baselineFrame.game_thread_time}
        />
        <TimeReadout small
          type="render"
          value={renderThreadTime}
          baselineValue={baselineFrame && baselineFrame.render_thread_time}
        />
        <TimeReadout small
          type="gpu"
          value={gpuFrameTime}
          baselineValue={baselineFrame && baselineFrame.gpu_frame_time}
        />
      </div>
      <div className="tooltip-content">
        <CountReadout
          label="mb gpu"
          value={gpuMemory}
          baselineValue={baselineFrame && baselineFrame.gpu_memory}
          greenThreshold={-20}
          blueThreshold={10}
          yellowThreshold={30}
        />
        <CountReadout thousands
          label="triangles"
          value={numTrianglesDrawn}
          baselineValue={baselineFrame && baselineFrame.num_triangles_drawn}
          greenThreshold={-3000}
          blueThreshold={1000}
          yellowThreshold={5000}
        />
        <CountReadout
          label="draw calls"
          value={numDrawCalls}
          baselineValue={baselineFrame && baselineFrame.num_draw_calls}
          greenThreshold={-15}
          blueThreshold={5}
          yellowThreshold={10}
        />
        <CountReadout
          label="mesh calls"
          value={numMeshDrawCalls}
          baselineValue={baselineFrame && baselineFrame.num_mesh_draw_calls}
          greenThreshold={-8}
          blueThreshold={2}
          yellowThreshold={6}
        />
      </div>
    </div>
  );
}
FramesListItem.propTypes = {
  id: PropTypes.number.isRequired,
  isBaseline: PropTypes.bool.isRequired,
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
