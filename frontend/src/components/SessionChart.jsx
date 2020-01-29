import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, CartesianGrid, Legend, XAxis, YAxis, ReferenceLine, Line } from 'recharts'

import { BaselineContext } from '../contexts/BaselineContext.jsx';
import { FramesContext } from '../contexts/FramesContext.jsx';

const schema = {
  time: {
    frame: {
      property: 'frame_time',
      scale: 1,
      name: 'Frame',
      color: '#fff4b6',
      baseColor: '#6e6d60',
    },
    game: {
      property: 'game_thread_time',
      scale: 1,
      name: 'Game',
      color: '#5488ff',
      baseColor: '#3e4f74',
    },
    render: {
      property: 'render_thread_time',
      scale: 1,
      name: 'Render',
      color: '#8cf49a',
      baseColor: '#4b7056',
    },
    gpu: {
      property: 'gpu_frame_time',
      scale: 1,
      name: 'GPU',
      color: '#f0625b',
      baseColor: '#6e4143',
    },
  },
  memory: {
    gpu: {
      property: 'gpu_memory',
      scale: 1,
      name: 'GPU memory (MB)',
      color: '#fff4b6',
      baseColor: '#6e6d60',
    },
  },
  triangles: {
    tris: {
      property: 'num_triangles_drawn',
      scale: 1000,
      name: 'Triangles (thousands)',
      color: '#fff4b6',
      baseColor: '#6e6d60',
    },
  },
  drawcalls: {
    prim: {
      property: 'num_draw_calls',
      scale: 1,
      name: 'Primitive draw calls',
      color: '#fff4b6',
      baseColor: '#6e6d60',
    },
    mesh: {
      property: 'num_mesh_draw_calls',
      scale: 1,
      name: 'Mesh draw calls',
      color: '#5488ff',
      baseColor: '#3e4f74',
    },
  },
};

function getDomain(mode) {
  if (mode === 'time') {
    return [0, (x) => Math.max(16, Math.round(x + 2.0))];
  }
  return [(x) => Math.floor(x) - 1, (x) => Math.ceil(x) + 1];
}

function formatFrameData(frame, mode) {
  let data = { name: frame.description };
  for (const key in schema[mode]) {
    data[key] = frame[schema[mode][key].property] / schema[mode][key].scale;
  }
  if (mode !== 'time') {
    data.overlay = frame.gpu_frame_time;
  }
  return data;
};

function formatData(frames, baselineFrames, mode) {
  const getNumbers = (xs) => xs.map(x => x.number);
  const numbers = [...new Set([ ...getNumbers(frames), ...getNumbers(baselineFrames) ])].sort((a, b) => a - b);
  let data = [];
  let showBaseline = false;
  for (const number of numbers) {
    const frame = frames.find(x => x.number === number);
    const baselineFrame = baselineFrames.find(x => x.number === number);
    if (baselineFrame) {
      if (frame) {
        data.push({ ...formatFrameData(frame, mode), base: formatFrameData(baselineFrame, mode) });
      } else {
        data.push({ name: baselineFrame.description, base: formatFrameData(baselineFrame, mode) });
      }
      showBaseline = true;
    } else if (frame) {
      data.push(formatFrameData(frame, mode));
    }
  }
  return { data, showBaseline };
}

const SquareDot = (props) => {
  const { cx, cy, stroke, payload, value } = props;
  if (cx === null || cy === null || value === undefined) {
    return null;
  }
  return (
    <svg key={[cx, value]} className="recharts-dot recharts-line-dot"  x={cx - 6} y={cy - 6} width={10} height={10} viewBox="0 0 32 32">
      <path fill="rgba(54, 57, 63, 0.4)" d="M0 0 L0 32 L32 32 L32 0 Z" />
      <path fill={stroke} d="M2 2 L2 30 L30 30 L30 2 Z" />
    </svg>
  );
};

function getLines(mode, showBaseline) {
  let lines = [];
  if (showBaseline) {
    for (const key in schema[mode]) {
      lines.push(
        <Line
          key={`${mode}.${key}.baseline`}
          name={`${schema[mode][key].name} (base)`}
          yAxisId="left"
          isAnimationActive={false}
          legendType="none"
          type="monotoneX"
          dot={false}
          dataKey={`base.${key}`}
          stroke={schema[mode][key].baseColor}
          fill={schema[mode][key].baseColor}
          strokeWidth={3}
        />
      );
    }
  }
  for (const key in schema[mode]) {
    lines.push(
      <Line
        key={`${mode}.${key}`}
        name={schema[mode][key].name}
        yAxisId="left"
        isAnimationActive={false}
        legendType="square"
        type="monotoneX"
        dot={SquareDot}
        dataKey={key}
        stroke={schema[mode][key].color}
        fill={schema[mode][key].color}
        strokeWidth={3}
      />
    );
  }
  return lines;
}

function SessionChart(props) {
  const baseline = useContext(BaselineContext);
  const frames = useContext(FramesContext).frames;
  const { mode } = props;
  const { data, overlayData, showBaseline } = formatData(frames, baseline.hasBaseline ? baseline.frames : [], mode);
  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={data} margin={{ top: 0, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid stroke="#45474d" />
        <Legend verticalAlign="top" height={20} />
        <XAxis dataKey="name" tickLine={false} />
        <YAxis yAxisId="left" width={32} allowDecimals={false} type="number" domain={getDomain(mode)} />
        {mode !== 'time' && (
          <YAxis yAxisId="right" width={32} allowDecimals={false} orientation="right" type="number" domain={getDomain('time')} />
        )}
        {mode !== 'time' && (
          <ReferenceLine y={13.3333} stroke="#695558" strokeWidth={1} yAxisId="right" />
        )}
        {mode !== 'time' && (
          <Line
            name="GPU time (ms)"
            legendType="square"
            yAxisId="right"
            isAnimationActive={false}
            type="monotoneX"
            dot={false}
            dataKey="overlay"
            stroke="#6e4143"
            fill="#6e4143"
            strokeWidth={2}
          />
        )}
        {getLines(mode, showBaseline)}
      </LineChart>
    </ResponsiveContainer>
  );
}
SessionChart.propTypes = {
  mode: PropTypes.oneOf(['time', 'memory', 'triangles', 'drawcalls']).isRequired,
};

export default SessionChart;
