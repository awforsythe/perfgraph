import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { FramesContext } from '../contexts/FramesContext.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';
import ErrorIndicator from './ErrorIndicator.jsx';
import FramesListItem from './FramesListItem.jsx';

function FramesList(props) {
  const context = useContext(FramesContext);
  const inner = context.isLoading ? (
    <LoadingIndicator text="Loading frames..." />
  ) : (context.error ? (
    <ErrorIndicator message={context.error} />
  ) : (
    context.frames.map(frame => (
      <FramesListItem
        key={frame.id}
        id={frame.id}
        number={frame.number}
        description={frame.description}
        frameTime={frame.frame_time}
        gameThreadTime={frame.game_thread_time}
        renderThreadTime={frame.render_thread_time}
        gpuFrameTime={frame.gpu_frame_time}
        gpuMemory={frame.gpu_memory}
        numTrianglesDrawn={frame.num_triangles_drawn}
        numDrawCalls={frame.num_draw_calls}
        numMeshDrawCalls={frame.num_mesh_draw_calls}
      />
    ))
  ));
  return (
    <div style={{ display: 'flex', paddingLeft: 20, margin: 5 }}>
      {inner}
    </div>
  );
}
FramesList.propTypes = {
  sessionId: PropTypes.number.isRequired,
};

export default FramesList;
