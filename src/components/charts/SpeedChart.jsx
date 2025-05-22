import React from 'react';
import { useTelemetryContext } from '../../context/TelemetryContext';
import { useChartDataMemo } from '../../hooks/useOptimizedData';
import TelemetryChart from './TelemetryChart';

function SpeedChart() {
  const {
    carData,
    selectedDrivers,
    selectedLap,
    drivers,
    isDarkMode // Make sure you get this from context
  } = useTelemetryContext();

  // Process data for the chart
  const chartData = useChartDataMemo(carData, selectedDrivers, selectedLap);

  // Prepare lines configuration
  const lines = selectedDrivers.map(driverId => ({
    dataKey: `speed_${driverId}`,
    name: drivers[driverId]?.name || `Driver ${driverId}`,
    color: drivers[driverId]?.color || '#999999'
  }));

  if (!chartData.length) {
    return (
        <div className="text-center p-4">
          No speed data available for the selected drivers and lap
        </div>
    );
  }

  return (
      <TelemetryChart
          data={chartData}
          lines={lines}
          xDataKey="distance"
          title="Speed Comparison"
          xAxisLabel="Distance (m)"
          yAxisLabel="Speed (km/h)"
          height={400}
          isDarkMode={isDarkMode} // Pass this prop
      />
  );
}

export default SpeedChart;