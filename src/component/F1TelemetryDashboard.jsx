import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Sun, Moon } from 'lucide-react';

// Sample driver data
const drivers = {
  1: {
    name: "Charles Leclerc",
    color: "#DC0000",
    team: "Ferrari",
    data: generateDriverData(1)
  },
  44: {
    name: "Lewis Hamilton",
    color: "#00D2BE",
    team: "Mercedes",
    data: generateDriverData(44)
  },
  33: {
    name: "Max Verstappen",
    color: "#1E41FF",
    team: "Red Bull",
    data: generateDriverData(33)
  },
  4: {
    name: "Lando Norris",
    color: "#FF8700",
    team: "McLaren",
    data: generateDriverData(4)
  },
  77: {
    name: "Valtteri Bottas",
    color: "#469BFF",
    team: "Sauber",
    data: generateDriverData(77)
  }
};

// Sample circuit data
const circuits = {
  monza: {
    name: "Monza",
    country: "Italy",
    pathData: "M50,50 L50,100 C60,110 70,110 80,100 L100,80 C110,70 110,60 100,50 L80,30 C70,20 60,20 50,50 Z",
    viewBox: "0 0 150 150"
  },
  monaco: {
    name: "Monaco",
    country: "Monaco",
    pathData: "M20,50 L40,30 L60,20 L80,30 C90,40 100,50 90,60 L70,70 C60,80 50,90 40,80 L20,50 Z",
    viewBox: "0 0 120 100"
  },
  silverstone: {
    name: "Silverstone",
    country: "UK",
    pathData: "M10,50 L30,20 L50,10 L70,20 L90,40 L100,60 L90,80 L70,90 L50,80 L40,70 L30,60 Z",
    viewBox: "0 0 110 100"
  }
};

// Sample years and sessions
const years = [2023, 2024, 2025];
const sessions = ["FP1", "FP2", "FP3", "Qualifying", "Race"];

// Function to generate sample driver data
function generateDriverData(driverNumber) {
  const laps = [];
  
  // Generate 3 laps of data
  for (let lap = 1; lap <= 3; lap++) {
    const lapData = [];
    const baseTime = new Date("2023-11-12T14:10:00.000Z").getTime();
    
    // Generate data points for each lap
    for (let i = 0; i < 20; i++) {
      const timeOffset = i * 1000; // 1 second intervals
      const date = new Date(baseTime + timeOffset);
      
      // Create data point with randomization for variety
      const speed = 300 - (i % 5) * 20 + Math.random() * 10 - (driverNumber % 3) * 2;
      const throttle = i % 5 === 0 ? 30 + Math.random() * 20 : 80 + Math.random() * 20;
      const brake = i % 5 === 0 ? 70 + Math.random() * 30 : Math.random() * 10;
      
      // Map coordinates for track position
      const progress = i / 20;
      const x = 50 + Math.sin(progress * Math.PI * 2) * 40;
      const y = 50 + Math.cos(progress * Math.PI * 2) * 40;
      
      lapData.push({
        date: date.toISOString(),
        lap_number: lap,
        speed: speed,
        throttle: throttle,
        brake: brake,
        n_gear: Math.floor(speed / 50), // Approximate gear based on speed
        drs: i % 7 === 0 ? 1 : 0, // DRS randomly activated
        x: x,
        y: y,
        sector: Math.floor(i / 7) + 1, // Sectors 1, 2, or 3
        lapTime: lap === 3 ? 90.5 + (driverNumber % 3) * 0.2 : 91 + (driverNumber % 3) * 0.3, // Sample lap times
        s1Time: 28.5 + (driverNumber % 3) * 0.1,
        s2Time: 31.2 + (driverNumber % 3) * 0.15,
        s3Time: 30.8 + (driverNumber % 3) * 0.05
      });
    }
    
    laps.push(...lapData);
  }
  
  return laps;
}

const F1TelemetryDashboard = () => {
  const [driverA, setDriverA] = useState(33); // Default to Verstappen
  const [driverB, setDriverB] = useState(44); // Default to Hamilton
  const [selectedLap, setSelectedLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedSession, setSelectedSession] = useState("Race");
  const [selectedCircuit, setSelectedCircuit] = useState("monza");
  const [positionA, setPositionA] = useState({ x: 50, y: 50 });
  const [positionB, setPositionB] = useState({ x: 50, y: 50 });
  const [isLoading, setIsLoading] = useState(false);

  // Get available laps for the selected drivers
  const getAvailableLaps = () => {
    const lapsA = [...new Set(drivers[driverA].data.map(d => d.lap_number))];
    const lapsB = [...new Set(drivers[driverB].data.map(d => d.lap_number))];
    return [...new Set([...lapsA, ...lapsB])].sort((a, b) => a - b);
  };

  // Filter data for the selected lap
  const getFilteredData = (driverId, lap) => {
    return drivers[driverId].data.filter(d => d.lap_number === lap);
  };

  // Play animation showing driver positions on track
  const playLapAnimation = () => {
    if (isPlaying) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      const dataA = getFilteredData(driverA, selectedLap);
      const dataB = getFilteredData(driverB, selectedLap);
      const maxPoints = Math.max(dataA.length, dataB.length);
      
      setIsPlaying(true);
      let i = 0;
      
      const animInterval = setInterval(() => {
        if (i >= maxPoints) {
          clearInterval(animInterval);
          setIsPlaying(false);
          return;
        }
        
        if (i < dataA.length) {
          setPositionA({ x: dataA[i].x, y: dataA[i].y });
        }
        
        if (i < dataB.length) {
          setPositionB({ x: dataB[i].x, y: dataB[i].y });
        }
        
        i++;
      }, 300);
    }, 800);
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('light-mode');
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const dataA = getFilteredData(driverA, selectedLap);
    const dataB = getFilteredData(driverB, selectedLap);
    
    return dataA.map((item, index) => {
      const timeStr = new Date(item.date).toLocaleTimeString([], { minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
      return {
        time: timeStr,
        [`speed${driverA}`]: item.speed,
        [`speed${driverB}`]: index < dataB.length ? dataB[index].speed : null,
        [`throttle${driverA}`]: item.throttle,
        [`throttle${driverB}`]: index < dataB.length ? dataB[index].throttle : null,
        [`brake${driverA}`]: item.brake,
        [`brake${driverB}`]: index < dataB.length ? dataB[index].brake : null,
      };
    });
  };

  // Get sector times
  const getSectorTimes = () => {
    const dataA = getFilteredData(driverA, selectedLap);
    const dataB = getFilteredData(driverB, selectedLap);
    
    // Get first item's sector times as sample
    return {
      driverA: dataA.length > 0 ? {
        s1: dataA[0].s1Time,
        s2: dataA[0].s2Time,
        s3: dataA[0].s3Time,
        total: dataA[0].lapTime
      } : { s1: 0, s2: 0, s3: 0, total: 0 },
      driverB: dataB.length > 0 ? {
        s1: dataB[0].s1Time,
        s2: dataB[0].s2Time,
        s3: dataB[0].s3Time,
        total: dataB[0].lapTime
      } : { s1: 0, s2: 0, s3: 0, total: 0 }
    };
  };

  // Format time with appropriate color based on comparison
  const formatTimeWithColor = (timeA, timeB) => {
    const diff = timeA - timeB;
    const color = diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-500' : 'text-gray-300';
    const sign = diff < 0 ? '-' : diff > 0 ? '+' : '';
    
    return (
      <span className={color}>
        {timeA.toFixed(3)}s {diff !== 0 && <span className="text-xs">({sign}{Math.abs(diff).toFixed(3)}s)</span>}
      </span>
    );
  };

  // Effect to reset positions when changing drivers or lap
  useEffect(() => {
    setPositionA({ x: 50, y: 50 });
    setPositionB({ x: 50, y: 50 });
    setIsPlaying(false);
  }, [driverA, driverB, selectedLap]);

  // Simulate API loading
  const simulateLoading = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 800);
  };

  const chartData = prepareChartData();
  const sectorTimes = getSectorTimes();
  const lapOptions = getAvailableLaps();
  const selectedCircuitData = circuits[selectedCircuit];

  return (
    <div className={`min-h-screen pb-10 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* Theme toggle button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-colors duration-300"
        style={{ 
          backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
          color: isDarkMode ? '#fff' : '#000'
        }}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        <header className="py-6 text-center">
          <h1 className="text-4xl font-bold" style={{ textShadow: isDarkMode ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none' }}>
            F1 Telemetry Comparison
          </h1>
          <p className="mt-2 text-cyan-400">Real-time Formula 1 data analysis</p>
        </header>
        
        <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gray-100'}`}>
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Year</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={selectedYear}
                onChange={(e) => simulateLoading(() => setSelectedYear(parseInt(e.target.value)))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Circuit</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={selectedCircuit}
                onChange={(e) => simulateLoading(() => setSelectedCircuit(e.target.value))}
              >
                {Object.entries(circuits).map(([id, circuit]) => (
                  <option key={id} value={id}>{circuit.name}, {circuit.country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Session</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={selectedSession}
                onChange={(e) => simulateLoading(() => setSelectedSession(e.target.value))}
              >
                {sessions.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Driver Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Driver A</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={driverA}
                onChange={(e) => setDriverA(parseInt(e.target.value))}
              >
                {Object.entries(drivers).map(([id, driver]) => (
                  <option key={id} value={id}>
                    {driver.name} ({driver.team})
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: drivers[driverA].color }}></div>
                <span className="font-medium" style={{ color: drivers[driverA].color }}>{drivers[driverA].name}</span>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Driver B</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={driverB}
                onChange={(e) => setDriverB(parseInt(e.target.value))}
              >
                {Object.entries(drivers).map(([id, driver]) => (
                  <option key={id} value={id}>
                    {driver.name} ({driver.team})
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: drivers[driverB].color }}></div>
                <span className="font-medium" style={{ color: drivers[driverB].color }}>{drivers[driverB].name}</span>
              </div>
            </div>
          </div>
          
          {/* Lap Selection and Play Button */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="w-full md:w-1/2">
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Lap</label>
              <select 
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={selectedLap}
                onChange={(e) => setSelectedLap(parseInt(e.target.value))}
              >
                {lapOptions.map(lap => (
                  <option key={lap} value={lap}>Lap {lap}</option>
                ))}
              </select>
            </div>
            
            <button 
              className={`w-full md:w-1/2 p-2 rounded-lg flex items-center justify-center ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-600'}`}
              style={{ 
                background: isPlaying ? '#555' : 'linear-gradient(to right, #0077ff, #00d0ff)',
                color: 'white'
              }}
              onClick={playLapAnimation}
              disabled={isPlaying}
            >
              <Play size={20} className="mr-2" />
              Play Lap Animation
            </button>
          </div>
          
          {/* Track Map Section */}
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} p-4 rounded-xl mb-6`}>
            <h3 className="text-xl font-bold mb-4 text-center">
              {selectedCircuitData.name} Circuit
            </h3>
            
            <div className="relative">
              <svg 
                viewBox={selectedCircuitData.viewBox} 
                className="mx-auto w-full max-w-md h-64"
              >
                <path 
                  d={selectedCircuitData.pathData} 
                  stroke={isDarkMode ? "#00ffff" : "#0077ff"} 
                  strokeWidth="2" 
                  fill="none" 
                />
                
                {/* Driver A position */}
                <circle 
                  cx={positionA.x} 
                  cy={positionA.y} 
                  r="4"
                  fill={drivers[driverA].color}
                />
                
                {/* Driver B position */}
                <circle 
                  cx={positionB.x} 
                  cy={positionB.y} 
                  r="4"
                  fill={drivers[driverB].color}
                />
              </svg>
              
              <div className="flex justify-center mt-2 text-sm">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: drivers[driverA].color }}></div>
                  <span>{drivers[driverA].name}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: drivers[driverB].color }}></div>
                  <span>{drivers[driverB].name}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lap Times Section */}
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} p-4 rounded-xl mb-6`}>
            <h3 className="text-xl font-bold mb-4 text-center">Sector Times</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">Driver</th>
                    <th className="p-2">Sector 1</th>
                    <th className="p-2">Sector 2</th>
                    <th className="p-2">Sector 3</th>
                    <th className="p-2">Lap Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                    <td className="p-2 font-medium" style={{ color: drivers[driverA].color }}>
                      {drivers[driverA].name}
                    </td>
                    <td className="p-2 text-center">{sectorTimes.driverA.s1.toFixed(3)}s</td>
                    <td className="p-2 text-center">{sectorTimes.driverA.s2.toFixed(3)}s</td>
                    <td className="p-2 text-center">{sectorTimes.driverA.s3.toFixed(3)}s</td>
                    <td className="p-2 text-center font-bold">{sectorTimes.driverA.total.toFixed(3)}s</td>
                  </tr>
                  <tr className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                    <td className="p-2 font-medium" style={{ color: drivers[driverB].color }}>
                      {drivers[driverB].name}
                    </td>
                    <td className="p-2 text-center">
                      {formatTimeWithColor(sectorTimes.driverB.s1, sectorTimes.driverA.s1)}
                    </td>
                    <td className="p-2 text-center">
                      {formatTimeWithColor(sectorTimes.driverB.s2, sectorTimes.driverA.s2)}
                    </td>
                    <td className="p-2 text-center">
                      {formatTimeWithColor(sectorTimes.driverB.s3, sectorTimes.driverA.s3)}
                    </td>
                    <td className="p-2 text-center font-bold">
                      {formatTimeWithColor(sectorTimes.driverB.total, sectorTimes.driverA.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="space-y-8">
          {/* Speed Chart */}
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-xl font-bold mb-4">Speed Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="time" />
                  <YAxis 
                    label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
                    domain={[0, 350]}
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
                  <Line 
                    type="monotone" 
                    dataKey={`speed${driverA}`} 
                    name={`${drivers[driverA].name} Speed`} 
                    stroke={drivers[driverA].color} 
                    dot={false}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={`speed${driverB}`} 
                    name={`${drivers[driverB].name} Speed`} 
                    stroke={drivers[driverB].color} 
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Throttle/Brake Chart */}
          <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-xl font-bold mb-4">Throttle & Brake Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="time" />
                  <YAxis 
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
                    domain={[0, 100]}
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
                  <Line 
                    type="monotone" 
                    dataKey={`throttle${driverA}`} 
                    name={`${drivers[driverA].name} Throttle`} 
                    stroke="#4ade80" 
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={`throttle${driverB}`} 
                    name={`${drivers[driverB].name} Throttle`} 
                    stroke="#a3e635" 
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey={`brake${driverA}`} 
                    name={`${drivers[driverA].name} Brake`} 
                    stroke="#f43f5e" 
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={`brake${driverB}`} 
                    name={`${drivers[driverB].name} Brake`} 
                    stroke="#fb923c" 
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Data provided by OpenF1 API • {new Date().getFullYear()}</p>
          <p className="mt-1">Lap data updated every 5 minutes during live sessions</p>
        </footer>
      </div>
    </div>
  );
};

export default F1TelemetryDashboard;