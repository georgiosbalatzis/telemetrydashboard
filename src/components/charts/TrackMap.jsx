import React, { useState, useEffect } from 'react';
import { useTelemetryContext } from '../../context/TelemetryContext';
import { useFileData } from '../../hooks/useFileResource';

function TrackMap() {
  const { 
    selectedCircuit, 
    selectedSession,
    selectedDrivers,
    selectedLap,
    isDarkMode,
    drivers
  } = useTelemetryContext();
  
  const [trackCoordinates, setTrackCoordinates] = useState([]);
  const [driverPositions, setDriverPositions] = useState([]);
  
  // Load track coordinates
  const { data: locationData, isLoading, error } = 
    useFileData('location_latest.json');
  
  useEffect(() => {
    if (!locationData || !selectedLap) return;
    
    // Filter for selected drivers and lap
    const filteredData = locationData.filter(
      pos => selectedDrivers.includes(pos.driver_number) && 
             pos.lap_number === selectedLap
    );
    
    // Set driver positions
    setDriverPositions(filteredData);
    
    // Extract track outline from points
    if (filteredData.length > 0) {
      // Get one driver's path to use as track outline
      const driverId = filteredData[0].driver_number;
      const driverPath = filteredData
        .filter(pos => pos.driver_number === driverId)
        .sort((a, b) => a.s - b.s);
      
      setTrackCoordinates(driverPath);
    }
  }, [locationData, selectedLap, selectedDrivers]);
  
  if (isLoading) {
    return <div>Loading track map...</div>;
  }
  
  if (error || !trackCoordinates.length) {
    return <div>Unable to load track map data</div>;
  }
  
  // Calculate map dimensions
  const xValues = trackCoordinates.map(point => point.x);
  const yValues = trackCoordinates.map(point => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Add padding
  const padding = 20;
  const viewBox = `${minX - padding} ${minY - padding} ${width + 2*padding} ${height + 2*padding}`;
  
  // Generate SVG path
  const trackPath = trackCoordinates
    .map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  
  return (
    <div className="h-80 w-full">
      <svg
        viewBox={viewBox}
        className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
      >
        {/* Track outline */}
        <path
          d={trackPath}
          fill="none"
          stroke={isDarkMode ? "#444" : "#777"}
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Start/Finish line */}
        {trackCoordinates.length > 0 && (
          <line
            x1={trackCoordinates[0].x - 10}
            y1={trackCoordinates[0].y - 10}
            x2={trackCoordinates[0].x + 10}
            y2={trackCoordinates[0].y + 10}
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}
        
        {/* Driver positions */}
        {driverPositions.map((pos, i) => {
          const driver = drivers[pos.driver_number];
          if (!driver) return null;
          
          return (
            <g key={`driver-${pos.driver_number}-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill={driver.color}
                stroke="#fff"
                strokeWidth="1"
              />
              <text
                x={pos.x + 6}
                y={pos.y - 6}
                fill={driver.color}
                fontSize="10"
                fontWeight="bold"
              >
                {pos.driver_number}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default TrackMap; 