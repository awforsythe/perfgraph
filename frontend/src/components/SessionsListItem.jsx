import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { BaselineContext } from '../contexts/BaselineContext.jsx';
import { FramesProvider } from '../contexts/FramesContext.jsx';
import TimeReadout from './TimeReadout.jsx';
import FramesList from './FramesList.jsx';
import { BaselineIcon, NotBaselineIcon, ChartedIcon, NotChartedIcon, DeleteIcon } from './Icons.jsx';

function SessionsListItem(props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const baseline = useContext(BaselineContext);
  const { id, createdAt, description, notes, frameTime, gameThreadTime, renderThreadTime, gpuFrameTime, isBaseline, isCharted, onBaselineSessionIdChange, onChartSessionIdChange } = props;
  const showBaseline = !isBaseline && baseline.hasBaseline;
  function handleToggleBaselineClick(event) {
    event.preventDefault();
    onBaselineSessionIdChange(isBaseline ? null : id);
  }
  function handleToggleChartedClick(event) {
    event.preventDefault();
    onChartSessionIdChange(isCharted ? null : id);
  }
  function handleDeleteClick(event) {
    event.preventDefault();
    setIsDeleting(true);
    fetch(`/api/session/${id}`, { method: 'DELETE' });
  }
  return (
    <div className="session">
      <div className={`session-header card${isBaseline ? ' is-baseline' : ''}`}>
        <div className={`button${!isBaseline ? ' off' : ''}`}>
          <a href="#" onClick={handleToggleBaselineClick}>
            { isBaseline ? <BaselineIcon size={20} /> : <NotBaselineIcon size={20} /> }
          </a>
        </div>
        <div className={`button${!isBaseline && !isCharted ? ' off' : ''}`}>
          <a href="#" onClick={handleToggleChartedClick}>
            { isCharted ? <ChartedIcon size={20} /> : <NotChartedIcon size={20} /> }
          </a>
        </div>
        <div className="session-label">
          {description || `Session ${id}`}
          {description && (
            <span className="session-label-id">
              &nbsp;({id})
            </span>
          )}
        </div>
        <div title="Frame time (ms)" className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
          <TimeReadout
            type="frame"
            value={frameTime}
            baselineValue={showBaseline ? baseline.frameTime : null}
          />
        </div>
        <div title="Game thread time (ms)" className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
          <TimeReadout
            type="game"
            value={gameThreadTime}
            baselineValue={showBaseline ? baseline.gameThreadTime : null}
          />
        </div>
        <div title="Render thread time (ms)" className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
          <TimeReadout
            type="render"
            value={renderThreadTime}
            baselineValue={showBaseline ? baseline.renderThreadTime : null}
          />
        </div>
        <div title="GPU frame time (ms)" className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
          <TimeReadout
            type="gpu"
            value={gpuFrameTime}
            baselineValue={showBaseline ? baseline.gpuFrameTime : null}
          />
        </div>
        <div style={{ flexGrow: 1 }}></div>
        <div className="button session-delete-button">
          { !isBaseline && (
            <a href="#" onClick={handleDeleteClick}>
              <DeleteIcon />
            </a>
          )}
        </div>
      </div>
      <div className="session-frames">
        <FramesProvider sessionId={id}>
          <FramesList isBaseline={isBaseline} />
        </FramesProvider>
      </div>
    </div>
  );
}
SessionsListItem.propTypes = {
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  description: PropTypes.string,
  notes: PropTypes.string,
  frameTime: PropTypes.number.isRequired,
  gameThreadTime: PropTypes.number.isRequired,
  renderThreadTime: PropTypes.number.isRequired,
  gpuFrameTime: PropTypes.number.isRequired,
  isBaseline: PropTypes.bool.isRequired,
  isCharted: PropTypes.bool.isRequired,
  onBaselineSessionIdChange: PropTypes.func.isRequired,
  onChartSessionIdChange: PropTypes.func.isRequired,
};

export default SessionsListItem;
