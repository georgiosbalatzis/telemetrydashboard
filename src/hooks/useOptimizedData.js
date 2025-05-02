import { useMemo } from 'react';

export function useChartDataMemo(rawData, selectedDrivers, selectedLap) {
  // Memoize chart data to prevent unnecessary recalculations
  return useMemo(() => {
    // Skip processing if no data
    if (!rawData || rawData.length === 0) {
      return [];
    }
    
    // Filter for selected lap
    const lapData = rawData.filter(item => item.lap_number === selectedLap);
    
    // Process into chart format (implementation depends on data structure)
    // ...processing logic
    
    return processedData;
  }, [rawData, selectedDrivers, selectedLap]);
}

// components/OptimizedChart.jsx
import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Use React.memo to prevent unnecessary re-renders
const OptimizedChart = memo(function OptimizedChart({ 
  data, 
  dataKeys, 
  drivers, 
  title, 
  yAxisLabel, 
  domain = [0, 'auto'],
  isDarkMode 
}) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }
  
  return (
    <div className="h-64">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="time" />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            domain={domain}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#222' : '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key.id}
              type="monotone"
              dataKey={key.dataKey}
              name={key.name}
              stroke={key.color}
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default OptimizedChart; 