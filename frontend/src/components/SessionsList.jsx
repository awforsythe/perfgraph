import React, { useContext } from 'react';

import { SessionsContext } from '../contexts/SessionsContext.jsx';
import LoadingIndicator from './LoadingIndicator.jsx';
import ErrorIndicator from './ErrorIndicator.jsx';
import SessionsListItem from './SessionsListItem.jsx';

function SessionsList(props) {
  const context = useContext(SessionsContext);
  if (context.isLoading) {
    return <LoadingIndicator text="Loading sessions..." />;
  }
  if (context.error) {
    return <ErrorIndicator message={context.error} />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid black' }}>
        <div>&nbsp;</div>
        <div>FRAME</div>
        <div>GAME</div>
        <div>RENDER</div>
        <div>GPU</div>
      </div>
      {context.sessions.map(session => (
        <SessionsListItem
          key={session.id}
          id={session.id}
          createdAt={session.created_at}
          description={session.description}
          frameTime={session.mean_frame_time}
          gameThreadTime={session.mean_game_thread_time}
          renderThreadTime={session.mean_render_thread_time}
          gpuFrameTime={session.mean_gpu_frame_time}
        />
      ))}
    </div>
  )
}

export default SessionsList;
