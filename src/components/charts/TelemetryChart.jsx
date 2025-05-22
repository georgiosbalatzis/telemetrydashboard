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
                          margin = { top: 20, right: 30, left: 20, bottom: 60 },
                          isDarkMode // Add this prop
                        }) => {
  return (
      <div style={{ width: '100%', height }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
              data={data}
              margin={margin}
          >
            <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#444' : '#ccc'}
                opacity={0.4}
            />
            <XAxis
                dataKey={xDataKey}
                label={{
                  value: xAxisLabel,
                  position: 'bottom',
                  fill: isDarkMode ? '#f0f0f0' : '#333'
                }}
                tick={{ fill: isDarkMode ? '#f0f0f0' : '#333' }}
            />
            <YAxis
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: 'left',
                  fill: isDarkMode ? '#f0f0f0' : '#333'
                }}
                tick={{ fill: isDarkMode ? '#f0f0f0' : '#333' }}
            />
            <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: isDarkMode ? '#f0f0f0' : '#333'
                }}
            />
            <Legend wrapperStyle={{ color: isDarkMode ? '#f0f0f0' : '#333' }} />
            {lines.map((line, index) => (
                <Line
                    key={index}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.color}
                    name={line.name}
                    dot={false}
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
};

export default TelemetryChart;