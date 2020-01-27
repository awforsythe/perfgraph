import React from 'react';
import PropTypes from 'prop-types';

import { SocketEventContext } from '../contexts/SocketEventContext.jsx';
import { SessionsContext } from '../contexts/SessionsContext.jsx';
import { FramesProvider } from '../contexts/FramesContext.jsx';
import { BaselineProvider } from '../contexts/BaselineContext.jsx';
import ChartModeSelector from './ChartModeSelector.jsx';
import SessionChart from './SessionChart.jsx';
import SessionsList from './SessionsList.jsx';

class Client extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baselineSessionId: null,
      chartMode: 'time',
      chartSessionId: null,
      autoGraphNewSessions: true,
    };
  }

  handleSocketEvent = (type, params) => {
    const { baselineSessionId, chartSessionId, autoGraphNewSessions } = this.state;
    if (type === 'session_created') {
      if (autoGraphNewSessions) {
        window.localStorage.setItem('perfgraphChartSessionId', params.id);
        this.setState({ chartSessionId: params.id });
      }
    } else if (type === 'session_deleted') {
      if (baselineSessionId === params.id) {
        this.setState({ baselineSessionId: null });
      }
      if (chartSessionId === params.id) {
        this.setState({ chartSessionId: null });
      }
    }
  };

  handleChartModeChange = (chartMode) => {
    window.localStorage.setItem('perfgraphChartMode', chartMode);
    this.setState({ chartMode });
  };

  handleBaselineSessionIdChange = (baselineSessionId) => {
    window.localStorage.setItem('perfgraphBaselineSessionId', baselineSessionId);
    this.setState({ baselineSessionId });
  };

  handleChartSessionIdChange = (chartSessionId) => {
    window.localStorage.setItem('perfgraphChartSessionId', chartSessionId);
    this.setState({ chartSessionId });
  };

  componentDidMount() {
    const chartMode = window.localStorage.getItem('perfgraphChartMode');
    if (['time', 'memory', 'triangles', 'drawcalls'].includes(chartMode)) {
      this.setState({ chartMode });
    }
    const baselineSessionId = parseInt(window.localStorage.getItem('perfgraphBaselineSessionId'));
    if (!isNaN(baselineSessionId) && baselineSessionId > 0) {
      this.setState({ baselineSessionId });
    }
    const chartSessionId = parseInt(window.localStorage.getItem('perfgraphChartSessionId'));
    if (!isNaN(chartSessionId) && chartSessionId > 0) {
      this.setState({ chartSessionId });
    }
    this.props.socketEvents.register(this.handleSocketEvent);
  }

  componentWillUnmount() {
    this.props.socketEvents.unregister(this.handleSocketEvent);
  }

  render() {
    const { sessions } = this.props;
    const { baselineSessionId, chartMode, chartSessionId, autoGraphNewSessions } = this.state;
    const showChart = baselineSessionId || chartSessionId;
    return (
      <BaselineProvider baselineSessionId={baselineSessionId}>
        <div className="header">
          <h1>perfgraph</h1>
          <div style={{ flexGrow: 1 }}></div>
          <ChartModeSelector
            mode={chartMode}
            onChange={this.handleChartModeChange}
          />
        </div>
        {showChart && (
          <FramesProvider sessionId={chartSessionId}>
            <SessionChart mode={chartMode} />
          </FramesProvider>
        )}
        <SessionsList
          baselineSessionId={baselineSessionId}
          chartSessionId={chartSessionId}
          onBaselineSessionIdChange={this.handleBaselineSessionIdChange}
          onChartSessionIdChange={this.handleChartSessionIdChange}
        />
      </BaselineProvider>
    );
  }
}
Client.propTypes = {
  socketEvents: PropTypes.object.isRequired,
  sessions: PropTypes.array,
};

export default (props) => (
  <SocketEventContext.Consumer>
    {socketEvents => (
      <SessionsContext.Consumer>
        {context => (
          <Client
            socketEvents={socketEvents}
            sessions={context.sessions}
            {...props}
          />
        )}
      </SessionsContext.Consumer>
    )}
  </SocketEventContext.Consumer>
);
