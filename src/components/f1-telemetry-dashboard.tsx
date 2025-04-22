import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Sun, Moon, Thermometer, Wind, Droplet, Clock,
  Zap, Sliders, Activity, Headphones, Flag,
  Radio, GitBranch
} from 'lucide-react';

// --- Sample driver data generator & definitions ---
function generateDriverData(driverNumber: number) {
  const laps: any[] = [];
  for (let lap = 1; lap <= 3; lap++) {
    for (let i = 0; i < 20; i++) {
      const baseTime = new Date("2023-11-12T14:10:00.000Z").getTime();
      const date = new Date(baseTime + i * 1000);
      const speed = 300 - (i % 5) * 20 + Math.random() * 10 - (driverNumber % 3) * 2;
      const throttle = i % 5 === 0 ? 30 + Math.random() * 20 : 80 + Math.random() * 20;
      const brake = i % 5 === 0 ? 70 + Math.random() * 30 : Math.random() * 10;
      laps.push({
        date: date.toISOString(),
        lap_number: lap,
        speed,
        throttle,
        brake,
        n_gear: Math.floor(speed / 50),
        drs: i % 7 === 0 ? 1 : 0,
        sector: Math.floor(i / 7) + 1,
        lapTime: lap === 3 ? 90.5 + (driverNumber % 3) * 0.2 : 91 + (driverNumber % 3) * 0.3,
        s1Time: 28.5 + (driverNumber % 3) * 0.1,
        s2Time: 31.2 + (driverNumber % 3) * 0.15,
        s3Time: 30.8 + (driverNumber % 3) * 0.05,
        tireTemp: 85 + (i % 5) * 3 - (driverNumber % 3),
        tireWear: 100 - (lap * 3) - (i * 0.1) - (driverNumber % 3),
        currentCompound: lap === 1 ? 'soft' : lap === 2 ? 'medium' : 'hard',
        trackPosition: (i / 20) + lap - 1,
        gap_ahead: driverNumber === 1 ? 0 : 0.5 + Math.random() * 2,
        gap_behind: driverNumber === 10 ? 0 : 0.5 + Math.random() * 2
      });
    }
  }
  return laps;
}

const drivers: Record<number, any> = {
  1: { name: "Charles Leclerc", color: "#DC0000", team: "Ferrari", data: generateDriverData(1) },
  44: { name: "Lewis Hamilton", color: "#00D2BE", team: "Mercedes", data: generateDriverData(44) },
  33: { name: "Max Verstappen", color: "#1E41FF", team: "Red Bull", data: generateDriverData(33) },
  4: { name: "Lando Norris", color: "#FF8700", team: "McLaren", data: generateDriverData(4) },
  77: { name: "Valtteri Bottas", color: "#469BFF", team: "Sauber", data: generateDriverData(77) },
  11: { name: "Sergio Perez", color: "#0600EF", team: "Red Bull", data: generateDriverData(11) },
  63: { name: "George Russell", color: "#00D2BE", team: "Mercedes", data: generateDriverData(63) },
  55: { name: "Carlos Sainz", color: "#DC0000", team: "Ferrari", data: generateDriverData(55) },
  10: { name: "Pierre Gasly", color: "#2293D1", team: "Alpine", data: generateDriverData(10) },
  14: { name: "Fernando Alonso", color: "#006F62", team: "Aston Martin", data: generateDriverData(14) }
};

const tireCompounds = {
  soft: { color: "#FF3333", durability: 0.7, grip: 0.95, optimal_temp: 90 },
  medium: { color: "#FFCC33", durability: 0.85, grip: 0.8, optimal_temp: 85 },
  hard: { color: "#FFFFFF", durability: 1, grip: 0.7, optimal_temp: 80 },
  intermediate: { color: "#33CC33", durability: 0.8, grip: 0.75, optimal_temp: 75 },
  wet: { color: "#3333FF", durability: 0.9, grip: 0.6, optimal_temp: 65 }
};

const weatherData = {
  clear: { temperature: 28, humidity: 45, windSpeed: 8, windDirection: 225, precipitation: 0, trackTemp: 42 },
  cloudy: { temperature: 22, humidity: 62, windSpeed: 12, windDirection: 180, precipitation: 0, trackTemp: 32 },
  lightRain: { temperature: 18, humidity: 85, windSpeed: 15, windDirection: 200, precipitation: 25, trackTemp: 25 },
  heavyRain: { temperature: 15, humidity: 95, windSpeed: 22, windDirection: 210, precipitation: 80, trackTemp: 20 }
};

const years = [2023, 2024, 2025];
const sessions = ["FP1", "FP2", "FP3", "Qualifying", "Sprint", "Race"];
const circuits = ["Monza", "Monaco", "Silverstone", "Spa", "Singapore", "Suzuka", "COTA", "Bahrain", "Imola", "Barcelona"];
const miniSectors = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));

const drsZones: Record<string, any[]> = {
  Monza: [{ startDistance: 0.05, endDistance: 0.15, detectionPoint: 0.03 }, { startDistance: 0.45, endDistance: 0.55, detectionPoint: 0.42 }, { startDistance: 0.78, endDistance: 0.9, detectionPoint: 0.75 }],
  Monaco: [{ startDistance: 0.4, endDistance: 0.6, detectionPoint: 0.38 }],
  Silverstone: [{ startDistance: 0.15, endDistance: 0.3, detectionPoint: 0.12 }, { startDistance: 0.6, endDistance: 0.75, detectionPoint: 0.55 }],
  Spa: [{ startDistance: 0.25, endDistance: 0.4, detectionPoint: 0.2 }, { startDistance: 0.7, endDistance: 0.85, detectionPoint: 0.65 }],
  Singapore: [{ startDistance: 0.3, endDistance: 0.45, detectionPoint: 0.27 }, { startDistance: 0.75, endDistance: 0.9, detectionPoint: 0.7 }],
  Suzuka: [{ startDistance: 0.1, endDistance: 0.25, detectionPoint: 0.05 }, { startDistance: 0.5, endDistance: 0.65, detectionPoint: 0.45 }],
  COTA: [{ startDistance: 0.12, endDistance: 0.25, detectionPoint: 0.08 }, { startDistance: 0.55, endDistance: 0.7, detectionPoint: 0.5 }],
  Bahrain: [{ startDistance: 0.08, endDistance: 0.2, detectionPoint: 0.05 }, { startDistance: 0.4, endDistance: 0.55, detectionPoint: 0.35 }, { startDistance: 0.75, endDistance: 0.9, detectionPoint: 0.7 }],
  Imola: [{ startDistance: 0.15, endDistance: 0.3, detectionPoint: 0.1 }, { startDistance: 0.65, endDistance: 0.8, detectionPoint: 0.6 }],
  Barcelona: [{ startDistance: 0.2, endDistance: 0.35, detectionPoint: 0.15 }]
};

// --- Utility functions for ERS, fuel, G-force, etc. ---
function generateERSData(driverId: number, lapData: any[]) {
  return lapData.map(point => ({
    ...point,
    ersDeployment: (point.throttle > 70) ? Math.min(100, 70 + Math.random() * 30) : 0,
    ersHarvesting: (point.brake > 20) ? Math.min(100, point.brake * (0.8 + Math.random() * 0.4)) : 0,
    batteryLevel: 70 + Math.sin(point.lap_number * 0.5) * 30 + Math.random() * 10
  }));
}

function generateFuelData(driverId: number, lapData: any[]) {
  const fuelStart = 105;
  const consumption = 1.8 + (Math.random() * 0.4) + (driverId % 3) * 0.1;
  return lapData.map(point => {
    const progress = point.lap_number - 1 + (0.05 * Math.floor(Math.random() * 20));
    const remaining = Math.max(0, fuelStart - progress * consumption);
    return { ...point, fuelRemaining: remaining, fuelPerLap: consumption * (0.95 + Math.random() * 0.1), fuelTarget: consumption * 0.98 };
  });
}

function generateGForceData(driverId: number, lapData: any[]) {
  return lapData.map(point => {
    const isCorner = point.throttle < 80 || Math.abs(point.speed - (point.lap_number > 1 ? 300 : 200)) > 40;
    const lateralG = isCorner ? (2 + Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1) : Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    const longitudinalG = point.brake > 30 ? -(3 + Math.random() * 2) : (point.throttle > 90 ? 1 + Math.random() : 0);
    return { ...point, lateralG, longitudinalG };
  });
}

function generateMiniSectorData(driverId: number) {
  return miniSectors.map(({ id }) => {
    const baseTime = 4 + (id % 3);
    const perf = (driverId % 20) / 100;
    const time = baseTime * (1 - perf) + (Math.random() * 0.4 - 0.2);
    const color = perf < 0.2 ? 'purple' : perf < 0.5 ? 'green' : perf < 0.8 ? 'yellow' : 'red';
    return { sectorId: id, time: time.toFixed(3), color, speedTrap: Math.floor(200 + Math.random() * 100) };
  });
}

function generateDRSData(driverId: number, lapData: any[], circuit: string) {
  const zones = drsZones[circuit] || [];
  return lapData.map(point => {
    const lapProg = (point.lap_number - 1) + (point.date.length % 20) / 20;
    const pos = lapProg % 1;
    const inZone = zones.some(z => pos >= z.startDistance && pos <= z.endDistance);
    const chance = 1 - (driverId % 10) / 20;
    return { ...point, drsActive: inZone && Math.random() < chance ? 1 : 0, inDRSZone: inZone ? 1 : 0 };
  });
}

function generatePitStopData(driverId: number) {
  const stops: any[] = [];
  const count = driverId % 3 === 0 ? 3 : driverId % 2 === 0 ? 2 : 1;
  let compound = 'medium';
  for (let i = 0; i < count; i++) {
    const lapNum = 15 + i * 20 + (driverId % 5);
    if (i === 0) compound = 'hard';
    else if (i === 1 && count === 3) compound = 'medium';
    else compound = 'soft';
    stops.push({ lap: lapNum, duration: 2.1 + Math.random() * 0.8, tireCompound: compound, tireAge: lapNum - (i > 0 ? stops[i - 1].lap : 0) });
  }
  return stops;
}

function generateCarSetupData(driverId: number) {
  const base = {
    frontWing: 5 + (driverId % 3),
    rearWing: 4 + (driverId % 4),
    onThrottleDiff: 70 + (driverId % 10),
    offThrottleDiff: 60 + (driverId % 15),
    frontCamber: -3.2 + (driverId % 5) * 0.1,
    rearCamber: -1.8 + (driverId % 5) * 0.1,
    frontToe: 0.08 + (driverId % 5) * 0.01,
    rearToe: 0.2 + (driverId % 5) * 0.01,
    frontSuspension: 5 + (driverId % 6),
    rearSuspension: 4 + (driverId % 6),
    frontAntiRollBar: 5 + (driverId % 5),
    rearAntiRollBar: 6 + (driverId % 5),
    frontRideHeight: 2 + (driverId % 5) * 0.1,
    rearRideHeight: 6 + (driverId % 5) * 0.1,
    brakePressure: 95 + (driverId % 6),
    brakeBias: 52 + (driverId % 7)
  };
  const teammates = Object.entries(drivers).filter(([id, d]) => d.team === drivers[driverId].team && +id !== driverId);
  if (teammates.length) {
    return { ...base, frontWing: base.frontWing + (Math.random() < 0.5 ? 1 : 0), rearWing: base.rearWing + (Math.random() < 0.5 ? -1 : 0), brakeBias: base.brakeBias + (Math.random() < 0.5 ? 1 : -1) };
  }
  return base;
}

function generateTeamRadioMessages(driverId: number) {
  const msgs: any[] = [];
  const templates = [
    { type: 'strategy', text: 'Box this lap, box this lap.' },
    { type: 'info', text: 'Gap to car ahead is 1.2 seconds and closing.' },
    { type: 'warning', text: 'Track limits at turn 9, that\'s a warning.' },
    { type: 'encouragement', text: 'Great job, keep pushing, 10 laps to go.' },
    { type: 'technical', text: 'We\'re seeing high temps on the front left.' },
    { type: 'celebration', text: 'Excellent overtake! Well done!' }
  ];
  const count = 5 + (driverId % 5);
  for (let i = 0; i < count; i++) {
    const lap = 5 + Math.floor(i * (70 / count));
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    msgs.push({ lap, time: `1:${10 + lap}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`, from: Math.random() > 0.7 ? 'Driver' : 'Engineer', ...tpl });
  }
  return msgs.sort((a,b) => a.lap - b.lap);
}

function generateRaceIncidents() {
  const types = ['Collision','Track Limits','Unsafe Release','False Start','Ignoring Blue Flags','Crossing Pit Lane Entry','Speeding in Pit Lane','Causing a Collision','Impeding'];
  const outcomes = ['5 Second Time Penalty','Drive Through Penalty','Warning','Investigation After Race','No Further Action','Grid Penalty Next Race'];
  const count = 3 + Math.floor(Math.random() * 6);
  const incidents: any[] = [];
  for (let i = 0; i < count; i++) {
    const ids = Object.keys(drivers).map(x => +x);
    const d1 = ids[Math.floor(Math.random() * ids.length)];
    let d2: number|null = null;
    if (Math.random() > 0.5) { do { d2 = ids[Math.floor(Math.random() * ids.length)]; } while (d2 === d1); }
    const lap = 5 + Math.floor(Math.random() * 65);
    const t = types[Math.floor(Math.random() * types.length)];
    const o = outcomes[Math.floor(Math.random() * outcomes.length)];
    const desc = (() => {
      const n1 = drivers[d1].name, n2 = d2 ? drivers[d2].name : '';
      switch(t) {
        case 'Collision': return `${n1} and ${n2} collided at Turn 2 on lap ${lap}`;
        case 'Track Limits': return `${n1} exceeded track limits at Turn 4`;
        case 'Unsafe Release': return `Unsafe release of ${n1} on lap ${lap}`;
        default: return `Incident: ${t} involving ${n1}`;
      }
    })();
    incidents.push({ lap, type: t, driver1Id: d1, driver2Id: d2, outcome: o, description: desc });
  }
  return incidents.sort((a,b) => a.lap - b.lap);
}

function generateLiveTimingData() {
  const arr: any[] = [];
  Object.entries(drivers).forEach(([id, d], idx) => {
    const pos = Math.min(Object.keys(drivers).length, Math.max(1, idx + 1 + (Math.random() > 0.7 ? Math.floor(Math.random()*3)-1 : 0)));
    const sectors = [1,2,3].map(s => {
      const t = 25 + s*2 + Math.random()*2;
      const perf = Math.random();
      const color = perf<0.2?'purple':perf<0.5?'green':perf<0.8?'yellow':'red';
      return { time: t.toFixed(3), color };
    });
    const lastLap = sectors.reduce((sum,e)=>sum+parseFloat(e.time),0).toFixed(3);
    arr.push({ position: pos, driverId: +id, name: d.name, team: d.team, color: d.color, gapToLeader: pos===1?'-':`+${(pos*Math.random()*4).toFixed(3)}`, lastLap, sectors });
  });
  return arr.sort((a,b)=>a.position-b.position);
}

// --- Main component ---
const F1TelemetryDashboard = () => {
  const [selectedDrivers, setSelectedDrivers] = useState([33, 44, 4, 55]);
  const [selectedLap, setSelectedLap] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedSession, setSelectedSession] = useState('Race');
  const [selectedCircuit, setSelectedCircuit] = useState('Monza');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('telemetry');
  const [liveTimingData, setLiveTimingData] = useState([]);
  const [raceIncidents, setRaceIncidents] = useState([]);
  const [showLiveTimingDetails, setShowLiveTimingDetails] = useState(false);
  const [comparisonSession, setComparisonSession] = useState(null);
  
  useEffect(() => {
    setLiveTimingData(generateLiveTimingData());
    if (selectedSession === 'Race') {
      setRaceIncidents(generateRaceIncidents());
    }
  }, [selectedSession, selectedCircuit]);

  // Derived data
  const lapOptions = Array.from(new Set(selectedDrivers.flatMap(id => drivers[id].data.map(d => d.lap_number)))).sort((a, b) => Number(a) - Number(b));
  const teams = Array.from(new Set(Object.values(drivers).map(d => d.team)));

  const simulateLoading = (fn: ()=>void) => {
    setIsLoading(true);
    setTimeout(()=>{
      fn();
      setIsLoading(false);
    },800);
  };

  const selectTeamDrivers = (team: string) => {
    const teamIds = Object.entries(drivers).filter(([_,d])=>d.team===team).map(([id])=>+id);
    let sel = [...teamIds];
    if (sel.length<4) {
      const others = Object.keys(drivers).map(x=>+x).filter(x=>!teamIds.includes(x));
      sel = sel.concat(others.slice(0,4-sel.length));
    }
    setSelectedDrivers(sel.slice(0,4));
    setSelectedTeam(team);
  };

  return (
    <div className={`min-h-screen pb-10 ${isDarkMode?'bg-gray-900 text-gray-100':'bg-white text-gray-800'}`}>
      {/* Theme toggle */}
      <button onClick={()=>setIsDarkMode(d=>!d)} className="fixed top-4 right-4 p-2 rounded-full shadow-lg">
        {isDarkMode?<Sun size={20}/>:<Moon size={20}/>}
      </button>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Year */}
        <div>
          <label className="block mb-2 text-sm font-semibold uppercase">Year</label>
          <select
            className="w-full p-2 rounded-lg border"
            value={selectedYear}
            onChange={e=>simulateLoading(()=>setSelectedYear(+e.target.value))}
          >
            {years.map(y=><option key={y}>{y}</option>)}
          </select>
        </div>
        {/* Circuit */}
        <div>
          <label className="block mb-2 text-sm font-semibold uppercase">Circuit</label>
          <select
            className="w-full p-2 rounded-lg border"
            value={selectedCircuit}
            onChange={e=>simulateLoading(()=>setSelectedCircuit(e.target.value))}
          >
            {circuits.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {/* Session */}
        <div>
          <label className="block mb-2 text-sm font-semibold uppercase">Session</label>
          <select
            className="w-full p-2 rounded-lg border"
            value={selectedSession}
            onChange={e=>simulateLoading(()=>setSelectedSession(e.target.value))}
          >
            {sessions.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="flex space-x-4 border-b">
          {['telemetry','tires','energy','setup','radio','incidents','weather'].map(tab=>(
            <button
              key={tab}
              className={`px-4 py-2 ${activeTab===tab?'border-b-2 text-cyan-400':'text-gray-400 hover:text-gray-200'}`}
              onClick={()=>setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content placeholder: render charts/panels based on activeTab */}
      {/* ...you can fill in your charts here as before... */}

      {/* Live Timing Panel */}
      {showLiveTimingDetails && (
        <div className="fixed right-4 top-16 z-20 w-96 bg-opacity-90 p-4 shadow-lg rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Live Timing</h3>
            <button onClick={()=>setShowLiveTimingDetails(false)}>×</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0">
                <tr>
                  <th>Pos</th><th>Driver</th><th>Last Lap</th><th>S1</th><th>S2</th><th>S3</th>
                </tr>
              </thead>
              <tbody>
                {liveTimingData.map((d,i)=>(
                  <tr key={d.driverId} className={`${i<3?'font-bold':''}`}>
                    <td>{d.position}</td>
                    <td>{d.name}</td>
                    <td>{d.lastLap}</td>
                    {d.sectors.map((s:any,j)=><td key={j} style={{color: s.color}}>{s.time}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weather Panel */}
      {showWeatherPanel && (
        <div className="fixed top-16 right-4 z-20 w-72 p-4 bg-white shadow-lg rounded-xl">
          <h3 className="font-bold mb-2">Weather Conditions</h3>
          <select
            className="w-full mb-4 p-2 rounded-lg border"
            value={weatherCondition}
            onChange={e=>setWeatherCondition(e.target.value)}
          >
            {Object.keys(weatherData).map(w=><option key={w}>{w}</option>)}
          </select>
          {/* Show current weatherData[weatherCondition] */}
        </div>
      )}

    </div>
  );
};

export default F1TelemetryDashboard;
