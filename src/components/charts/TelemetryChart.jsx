import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TelemetryChart = ({
  data,
  lines,
  xDataKey,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 }
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xDataKey}
            label={{ value: xAxisLabel, position: 'bottom' }}
          />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: 'left' }}
          />
          <Tooltip />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              name={line.name}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart; 