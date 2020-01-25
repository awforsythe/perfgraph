import React from 'react';
import PropTypes from 'prop-types';

import { SessionsContext } from './SessionsContext.jsx';
import { FramesContext, FramesProvider } from './FramesContext.jsx';

const BaselineContext = React.createContext();

class BaselineProvider extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { baselineSessionId, children } = this.props;
    return (
      <SessionsContext.Consumer>
        {(sessionsContext) => {
          const session = baselineSessionId ? sessionsContext.sessions.find(x => x.id === baselineSessionId) : null;
          const sessionStats = {
            hasBaseline: !!session,
            frameTime: session ? session.mean_frame_time : 0.0,
            gameThreadTime: session ? session.mean_game_thread_time : 0.0,
            renderThreadTime: session ? session.mean_render_thread_time : 0.0,
            gpuFrameTime: session ? session.mean_gpu_frame_time : 0.0,
          };
          return (
            <FramesProvider sessionId={baselineSessionId}>
              <FramesContext.Consumer>
                {(framesContext) => (
                  <BaselineContext.Provider value={{ frames: framesContext.frames, ...sessionStats }}>
                    {children}
                  </BaselineContext.Provider>
                )}
              </FramesContext.Consumer>
            </FramesProvider>
          );
        }}
      </SessionsContext.Consumer>
    );
  }
}
BaselineProvider.propTypes = {
  baselineSessionId: PropTypes.number,
};

export { BaselineContext, BaselineProvider };
