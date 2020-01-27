import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Tippy from '@tippy.js/react';

import { BaselineContext } from '../contexts/BaselineContext.jsx';
import { FramesProvider } from '../contexts/FramesContext.jsx';
import TimeReadout from './TimeReadout.jsx';
import FramesList from './FramesList.jsx';
import { BaselineIcon, NotBaselineIcon, ChartedIcon, NotChartedIcon, DeleteIcon } from './Icons.jsx';

function SessionNameTooltip(props) {
  const { id, createdAt, description, notes } = props;
  const timeStr = moment.utc(createdAt).local().calendar();
  return (
    <div className="session-name-tooltip-content">
      <div>Session {id}</div>
      <div>{timeStr}</div>
      <div>{description}</div>
      <div>{notes}</div>
    </div>
  );
}
SessionNameTooltip.propTypes = {
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string,
  description: PropTypes.string,
  notes: PropTypes.string,
};

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
        <Tippy content="Use as baseline" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`button${!isBaseline ? ' off' : ''}`}>
            <a href="#" onClick={handleToggleBaselineClick}>
              { isBaseline ? <BaselineIcon size={20} /> : <NotBaselineIcon size={20} /> }
            </a>
          </div>
        </Tippy>
        <Tippy content="Show on chart" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`button${!isBaseline && !isCharted ? ' off' : ''}`}>
            <a href="#" onClick={handleToggleChartedClick}>
              { isCharted ? <ChartedIcon size={20} /> : <NotChartedIcon size={20} /> }
            </a>
          </div>
        </Tippy>
        <div className="session-label">
          <Tippy
            content={<SessionNameTooltip id={id} createdAt={createdAt} description={description} notes={notes} />}
            arrow={false}
            duration={[100, 0]}
            distance={2}
            placement="bottom"
          >
            <span>{description || `Session ${id}`}</span>
          </Tippy>
          {description && (
            <span className="session-label-id">
              &nbsp;({id})
            </span>
          )}
        </div>
        <Tippy content="Frame time (ms)" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
            <TimeReadout
              type="frame"
              value={frameTime}
              baselineValue={showBaseline ? baseline.frameTime : null}
            />
          </div>
        </Tippy>
        <Tippy content="Game thread time (ms)" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
            <TimeReadout
              type="game"
              value={gameThreadTime}
              baselineValue={showBaseline ? baseline.gameThreadTime : null}
            />
          </div>
        </Tippy>
        <Tippy content="Render thread time (ms)" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
            <TimeReadout
              type="render"
              value={renderThreadTime}
              baselineValue={showBaseline ? baseline.renderThreadTime : null}
            />
          </div>
        </Tippy>
        <Tippy content="GPU frame time (ms)" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
          <div className={`session-time-readout${isBaseline ? ' is-baseline' : ''}`}>
            <TimeReadout
              type="gpu"
              value={gpuFrameTime}
              baselineValue={showBaseline ? baseline.gpuFrameTime : null}
            />
          </div>
        </Tippy>
        <div style={{ flexGrow: 1 }}></div>
        <div className="button session-delete-button">
          {!isBaseline && (
            <Tippy className="delete-tooltip" content="Delete session" arrow={false} duration={[100, 100]} distance={2} placement="bottom">
              <a href="#" onClick={handleDeleteClick}>
                <DeleteIcon />
              </a>
            </Tippy>
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
