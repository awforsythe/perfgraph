import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { SessionsContext } from '../contexts/SessionsContext.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';
import ErrorIndicator from './ErrorIndicator.jsx';
import SessionsListItem from './SessionsListItem.jsx';

function SessionsList(props) {
  const context = useContext(SessionsContext);
  const { baselineSessionId, chartSessionId, onBaselineSessionIdChange, onChartSessionIdChange } = props;
  if (context.isLoading) {
    return <LoadingIndicator text="Loading sessions..." />;
  }
  if (context.error) {
    return <ErrorIndicator message={context.error} />;
  }
  return (
    <div className="sessions-list">
      {context.sessions.map(session => (
        <SessionsListItem
          key={session.id}
          id={session.id}
          createdAt={session.created_at}
          description={session.description}
          notes={session.notes}
          frameTime={session.mean_frame_time}
          gameThreadTime={session.mean_game_thread_time}
          renderThreadTime={session.mean_render_thread_time}
          gpuFrameTime={session.mean_gpu_frame_time}
          isBaseline={baselineSessionId === session.id}
          isCharted={chartSessionId === session.id}
          onBaselineSessionIdChange={onBaselineSessionIdChange}
          onChartSessionIdChange={onChartSessionIdChange}
        />
      ))}
    </div>
  )
}
SessionsList.propTypes = {
  baselineSessionId: PropTypes.number,
  chartSessionId: PropTypes.number,
  onBaselineSessionIdChange: PropTypes.func.isRequired,
  onChartSessionIdChange: PropTypes.func.isRequired,
};

export default SessionsList;
