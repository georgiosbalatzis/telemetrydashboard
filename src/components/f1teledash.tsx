import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, ReferenceLine, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Sun, Moon, Thermometer, Wind, Droplet, Clock, Radio,
  Flag, Zap, Settings, Shield, Activity, Headphones,
  AlertTriangle, Award, Mic, BarChart2, TrendingUp, Sliders, GitBranch
} from 'lucide-react';

// Sample driver data and helper data
function generateDriverData(driverNumber: number) {
  const laps: any[] = [];
  const baseTime = new Date("2023-11-12T14:10:00.000Z").getTime();
  for (let lap = 1; lap <= 3; lap++) {
    const lapData: any[] = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date(baseTime + i * 1000);
      const speed = 300 - (i % 5) * 20 + Math.random() * 10 - (driverNumber % 3) * 2;
      const throttle = i % 5 === 0 ? 30 + Math.random() * 20 : 80 + Math.random() * 20;
      const brake = i % 5 === 0 ? 70 + Math.random() * 30 : Math.random() * 10;
      lapData.push({
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
        tireWear: 100 - lap * 3 - i * 0.1 - (driverNumber % 3),
        currentCompound: lap === 1 ? "soft" : lap === 2 ? "medium" : "hard",
        trackPosition: i / 20 + lap - 1,
        gap_ahead: driverNumber === 1 ? 0 : 0.5 + Math.random() * 2,
        gap_behind: driverNumber === 10 ? 0 : 0.5 + Math.random() * 2
      });
    }
    laps.push(...lapData);
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

const weatherData: Record<string, any> = {
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
  Monza: [
    { startDistance: 0.05, endDistance: 0.15, detectionPoint: 0.03 },
    { startDistance: 0.45, endDistance: 0.55, detectionPoint: 0.42 },
    { startDistance: 0.78, endDistance: 0.9, detectionPoint: 0.75 }
  ],
  Monaco: [
    { startDistance: 0.4, endDistance: 0.6, detectionPoint: 0.38 }
  ],
  Silverstone: [
    { startDistance: 0.15, endDistance: 0.3, detectionPoint: 0.12 },
    { startDistance: 0.6, endDistance: 0.75, detectionPoint: 0.55 }
  ],
  Spa: [
    { startDistance: 0.25, endDistance: 0.4, detectionPoint: 0.2 },
    { startDistance: 0.7, endDistance: 0.85, detectionPoint: 0.65 }
  ],
  Singapore: [
    { startDistance: 0.3, endDistance: 0.45, detectionPoint: 0.27 },
    { startDistance: 0.75, endDistance: 0.9, detectionPoint: 0.7 }
  ],
  Suzuka: [
    { startDistance: 0.1, endDistance: 0.25, detectionPoint: 0.05 },
    { startDistance: 0.5, endDistance: 0.65, detectionPoint: 0.45 }
  ],
  COTA: [
    { startDistance: 0.12, endDistance: 0.25, detectionPoint: 0.08 },
    { startDistance: 0.55, endDistance: 0.7, detectionPoint: 0.5 }
  ],
  Bahrain: [
    { startDistance: 0.08, endDistance: 0.2, detectionPoint: 0.05 },
    { startDistance: 0.4, endDistance: 0.55, detectionPoint: 0.35 },
    { startDistance: 0.75, endDistance: 0.9, detectionPoint: 0.7 }
  ],
  Imola: [
    { startDistance: 0.15, endDistance: 0.3, detectionPoint: 0.1 },
    { startDistance: 0.65, endDistance: 0.8, detectionPoint: 0.6 }
  ],
  Barcelona: [
    { startDistance: 0.2, endDistance: 0.35, detectionPoint: 0.15 }
  ]
};

interface PitStop {
  lap: number;
  duration: number;
  tireCompound: string;
  tireAge: number;
}

interface RadioMessage {
  lap: number;
  time: string;
  from: string;
  type: string;
  message: string;
}

interface Incident {
  lap: number;
  type: string;
  driver1Id: number;
  driver2Id: number | null;
  outcome: string;
  description: string;
}

// Sample data generation functions
function generatePitStopData(driverId: number): PitStop[] {
  const pitStops: PitStop[] = [];
  const numberOfStops = driverId % 3 === 0 ? 3 : driverId % 2 === 0 ? 2 : 1;
  let currentCompound = "medium";
  for (let i = 0; i < numberOfStops; i++) {
    const lapNumber = 15 + i * 20 + (driverId % 5);
    if (i === 0) currentCompound = "hard";
    else if (i === 1 && numberOfStops === 3) currentCompound = "medium";
    else currentCompound = "soft";
    pitStops.push({
      lap: lapNumber,
      duration: 2.1 + Math.random() * 0.8,
      tireCompound: currentCompound,
      tireAge: lapNumber - (i > 0 ? pitStops[i - 1].lap : 0)
    });
  }
  return pitStops;
}

function generateCarSetupData(driverId: number) {
  const baseSetup = {
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
  const sameTeamDrivers = Object.values(drivers).filter(d => d.team === drivers[driverId].team);
  if (sameTeamDrivers.length > 1) {
    const teammateEntry = Object.entries(drivers).find(([id, d]) => d.team === drivers[driverId].team && parseInt(id) !== driverId);
    if (teammateEntry) {
      return {
        ...baseSetup,
        frontWing: baseSetup.frontWing + (Math.random() < 0.5 ? 1 : 0),
        rearWing: baseSetup.rearWing + (Math.random() < 0.5 ? -1 : 0),
        brakeBias: baseSetup.brakeBias + (Math.random() < 0.5 ? 1 : -1)
      };
    }
  }
  return baseSetup;
}

function generateTeamRadioMessages(driverId: number): RadioMessage[] {
  const messages: RadioMessage[] = [];
  const messageCount = 5 + (driverId % 5);
  const templates = [
    { type: "strategy", text: "Box this lap, box this lap." },
    { type: "strategy", text: "We're looking at Plan B, Plan B." },
    { type: "info", text: "Gap to car ahead is 1.2 seconds and closing." },
    { type: "info", text: "Yellow flags in sector 2, be careful." },
    { type: "feedback", text: "Copy that, understood." },
    { type: "complaint", text: "These tires are gone, I have no grip!" },
    { type: "encouragement", text: "Great job, keep pushing, 10 laps to go." },
    { type: "technical", text: "We're seeing high temps on the front left, manage it." },
    { type: "technical", text: "Switch to position 5 on the rotary for more deployment." },
    { type: "warning", text: "Track limits at turn 9, that's a warning." },
    { type: "warning", text: "Cars behind on fresher tires, defend position." },
    { type: "celebration", text: "Excellent overtake! Well done!" }
  ];
  for (let i = 0; i < messageCount; i++) {
    const lapNumber = 5 + Math.floor(i * (70 / messageCount));
    const template = templates[Math.floor(Math.random() * templates.length)];
    messages.push({
      lap: lapNumber,
      time: `1:${10 + lapNumber}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      from: Math.random() > 0.7 ? "Driver" : "Engineer",
      type: template.type,
      message: template.text
    });
  }
  return messages;
}

function generateRaceIncidents(): Incident[] {
  const incidents: Incident[] = [];
  const types = ["Collision", "Track Limits", "Unsafe Release", "False Start", "Ignoring Blue Flags", "Crossing Pit Lane Entry", "Speeding in Pit Lane", "Causing a Collision", "Impeding"];
  const outcomes = ["5 Second Time Penalty", "10 Second Time Penalty", "Drive Through Penalty", "Warning - Black & White Flag", "Investigation After Race", "No Further Action", "Reprimand", "Grid Penalty Next Race"];
  const count = 3 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const ids = Object.keys(drivers);
    const id1 = ids[Math.floor(Math.random() * ids.length)];
    let id2: string | null = null;
    if (Math.random() > 0.5) {
      do {
        id2 = ids[Math.floor(Math.random() * ids.length)];
      } while (id2 === id1);
    }
    const lap = 5 + Math.floor(Math.random() * 65);
    const type = types[Math.floor(Math.random() * types.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    incidents.push({
      lap,
      type,
      driver1Id: parseInt(id1),
      driver2Id: id2 ? parseInt(id2) : null,
      outcome,
      description: generateIncidentDescription(type, id1, id2, lap)
    });
  }
  return incidents.sort((a, b) => a.lap - b.lap);
}

function generateIncidentDescription(type: string, driver1Id: string, driver2Id: string | null, lap: number) {
  const driver1Name = drivers[parseInt(driver1Id)].name;
  const driver2Name = driver2Id ? drivers[parseInt(driver2Id)].name : null;
  switch (type) {
    case "Collision":
      return `${driver1Name} and ${driver2Name} collided at Turn 2 on lap ${lap}`;
    case "Track Limits":
      return `${driver1Name} exceeded track limits at Turn 4 multiple times`;
    case "Unsafe Release":
      return `Unsafe release of ${driver1Name} during pit stop on lap ${lap}`;
    case "False Start":
      return `${driver1Name} moved before the start lights went out`;
    case "Ignoring Blue Flags":
      return `${driver1Name} ignored blue flags when being lapped by ${driver2Name}`;
    case "Crossing Pit Lane Entry":
      return `${driver1Name} crossed the pit lane entry line on lap ${lap}`;
    case "Speeding in Pit Lane":
      return `${driver1Name} exceeded pit lane speed limit by 3.2km/h`;
    case "Causing a Collision":
      return `${driver1Name} caused a collision with ${driver2Name} at Turn 10`;
    case "Impeding":
      return `${driver1Name} impeded ${driver2Name} during their flying lap in Q3`;
    default:
      return `Incident involving ${driver1Name} on lap ${lap}`;
  }
}

function generateLiveTimingData() {
  const timingData: any[] = [];
  Object.entries(drivers).forEach(([id, driver], index) => {
    const basePos = index + 1;
    const position = Math.max(1, Math.min(Object.keys(drivers).length, basePos + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0)));
    const intervalAhead = position === 1 ? "LEADER" : `+${(Math.random() * 2 + 0.1).toFixed(3)}`;
    const gapToLeader = position === 1 ? "-" : `+${(position * Math.random() * 4 + position * 2).toFixed(3)}`;
    const sectors: { time: string; color: string; }[] = [];
    for (let i = 1; i <= 3; i++) {
      const baseTime = 25 + i * 2 + Math.random() * 2;
      const perf = Math.random();
      const color = perf < 0.2 ? "purple" : perf < 0.5 ? "green" : perf < 0.8 ? "yellow" : "red";
      sectors.push({ time: baseTime.toFixed(3), color });
    }
    const lastLap = sectors.reduce((sum, s) => sum + parseFloat(s.time), 0).toFixed(3);
    const bestLap = (parseFloat(lastLap) - 0.5 - Math.random() * 0.5).toFixed(3);
    timingData.push({
      position,
      driverId: parseInt(id),
      name: driver.name,
      team: driver.team,
      color: driver.color,
      intervalAhead,
      gapToLeader,
      lastLap,
      bestLap,
      sectors,
      tiresAge: 10 + Math.floor(Math.random() * 20),
      currentTire: Object.keys(tireCompounds)[Math.floor(Math.random() * Object.keys(tireCompounds).length)]
    });
  });
  return timingData.sort((a, b) => a.position - b.position);
}

function generateERSData(driverId: number, lapData: any[]) {
  return lapData.map(point => ({
    ...point,
    ersDeployment: point.throttle > 70 ? Math.min(100, 70 + Math.random() * 30) : 0,
    ersHarvesting: point.brake > 20 ? Math.min(100, point.brake * (0.8 + Math.random() * 0.4)) : 0,
    batteryLevel: 70 + Math.sin(point.lap_number * 0.5) * 30 + Math.random() * 10
  }));
}

function generateFuelData(driverId: number, lapData: any[]) {
  const fuelStart = 105;
  const consumption = 1.8 + Math.random() * 0.4 + (driverId % 3) * 0.1;
  return lapData.map(point => {
    const lapProgress = point.lap_number - 1 + 0.05 * Math.floor(Math.random() * 20);
    const fuelRemaining = Math.max(0, fuelStart - lapProgress * consumption);
    return {
      ...point,
      fuelRemaining,
      fuelPerLap: consumption * (0.95 + Math.random() * 0.1),
      fuelTarget: consumption * 0.98
    };
  });
}

function generateGForceData(driverId: number, lapData: any[]) {
  return lapData.map(point => {
    const isCorner = point.throttle < 80 || Math.abs(point.speed - (point.lap_number > 1 ? 300 : 200)) > 40;
    const lateralG = isCorner ? (2 + Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1) : Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    const longitudinalG = point.brake > 30
      ? -(3 + Math.random() * 2)
      : (point.throttle > 90 ? 1 + Math.random() : 0);
    return { ...point, lateralG, longitudinalG };
  });
}

function generateMiniSectorData(driverId: number) {
  const data: any[] = [];
  for (let i = 0; i < miniSectors.length; i++) {
    const baseTime = 4 + (i % 3);
    const performance = (driverId % 20) / 100;
    const randomVar = Math.random() * 0.4 - 0.2;
    const time = baseTime * (1 - performance) + randomVar;
    const perf = Math.random();
    const color = perf < 0.2 ? "purple" : perf < 0.5 ? "green" : perf < 0.8 ? "yellow" : "red";
    data.push({
      sectorId: miniSectors[i].id,
      time: time.toFixed(3),
      color,
      speedTrap: Math.floor(200 + Math.random() * 100)
    });
  }
  return data;
}

function generateDRSData(driverId: number, lapData: any[], circuit: string) {
  const zones = drsZones[circuit] || [];
  return lapData.map(point => {
    const lapProgress = (point.lap_number - 1) + (point.date.length % 20) / 20;
    const trackPos = lapProgress % 1;
    const inZone = zones.some(zone => trackPos >= zone.startDistance && trackPos <= zone.endDistance);
    const activationChance = 1 - (driverId % 10) / 20;
    return {
      ...point,
      drsActive: inZone && Math.random() < activationChance ? 1 : 0,
      inDRSZone: inZone ? 1 : 0
    };
  });
}

const F1TelemetryDashboard = () => {
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([33, 44, 4, 55]);
  const [selectedLap, setSelectedLap] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedSession, setSelectedSession] = useState("Race");
  const [selectedCircuit, setSelectedCircuit] = useState("Monza");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState("clear");
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("telemetry");
  const [liveTimingData, setLiveTimingData] = useState<any[]>([]);
  const [raceIncidents, setRaceIncidents] = useState<any[]>([]);
  const [showLiveTimingDetails, setShowLiveTimingDetails] = useState(false);
  const [selectedDriverSetup, setSelectedDriverSetup] = useState<number | null>(null);
  const [comparisonSession, setComparisonSession] = useState<string | null>(null);

  useEffect(() => {
    setLiveTimingData(generateLiveTimingData());
    if (selectedSession === "Race") {
      setRaceIncidents(generateRaceIncidents());
    } else {
      setRaceIncidents([]);
    }
  }, [selectedSession, selectedCircuit]);

  const getAvailableLaps = () => {
    let allLaps: number[] = [];
    selectedDrivers.forEach(driverId => {
      const laps = drivers[driverId].data.map((d: any) => d.lap_number);
      allLaps = allLaps.concat(laps);
    });
    return Array.from(new Set(allLaps)).sort((a, b) => a - b);
  };

  const getFilteredData = (driverId: number, lap: number) => {
    let data = drivers[driverId].data.filter((d: any) => d.lap_number === lap);
    data = generateERSData(driverId, data);
    data = generateFuelData(driverId, data);
    data = generateGForceData(driverId, data);
    data = generateDRSData(driverId, data, selectedCircuit);
    return data;
  };

  const findBestSectorTimes = (sectorTimes: Record<number, any>) => {
    const best = { s1: Infinity, s2: Infinity, s3: Infinity, total: Infinity };
    Object.values(sectorTimes).forEach(times => {
      if (times.s1 < best.s1) best.s1 = times.s1;
      if (times.s2 < best.s2) best.s2 = times.s2;
      if (times.s3 < best.s3) best.s3 = times.s3;
      if (times.total < best.total) best.total = times.total;
    });
    return best;
  };

  const selectTeamDrivers = (team: string) => {
    const teamDrivers = Object.entries(drivers)
      .filter(([id, d]) => d.team === team)
      .map(([id]) => parseInt(id));
    let newSelection = [...teamDrivers];
    if (newSelection.length < 4) {
      const otherDrivers = Object.keys(drivers)
        .map(id => parseInt(id))
        .filter(id => !teamDrivers.includes(id));
      newSelection = newSelection.concat(otherDrivers.slice(0, 4 - newSelection.length));
    }
    setSelectedDrivers(newSelection.slice(0, 4));
    setSelectedTeam(team);
  };

  const getTeams = () => {
    const teamSet = new Set<string>();
    Object.values(drivers).forEach(d => teamSet.add(d.team));
    return Array.from(teamSet);
  };

  const preparePitStopData = () => {
    return selectedDrivers.map(driverId => {
      const stops = generatePitStopData(driverId);
      return {
        driver: drivers[driverId].name,
        color: drivers[driverId].color,
        stops: stops.length,
        strategy: stops.map(s => s.tireCompound).join(" → "),
        totalPitTime: stops.reduce((sum, s) => sum + s.duration, 0),
        pitStops: stops
      };
    });
  };

  const simulateLoading = (callback: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 800);
  };

  const formatWeatherRadarData = () => {
    const w = weatherData[weatherCondition];
    return [
      { subject: 'Temperature', A: (w.temperature / 40) * 100 },
      { subject: 'Humidity', A: w.humidity },
      { subject: 'Wind Speed', A: (w.windSpeed / 30) * 100 },
      { subject: 'Track Temp', A: (w.trackTemp / 60) * 100 },
      { subject: 'Precipitation', A: w.precipitation }
    ];
  };

  const getSectorTimes = () => {
    const sectorTimes: Record<number, any> = {};
    selectedDrivers.forEach(driverId => {
      const data = getFilteredData(driverId, selectedLap);
      sectorTimes[driverId] = data.length
        ? {
            s1: data[0].s1Time,
            s2: data[0].s2Time,
            s3: data[0].s3Time,
            total: data[0].lapTime,
            miniSectors: generateMiniSectorData(driverId)
          }
        : { s1: 0, s2: 0, s3: 0, total: 0, miniSectors: [] };
    });
    return sectorTimes;
  };

  const getTeamRadioMessages = () => {
    const messages: (RadioMessage & { driverId: number; driverName: string; driverColor: string; team: string })[] = [];
    selectedDrivers.forEach(driverId => {
      const msgs = generateTeamRadioMessages(driverId);
      messages.push(...msgs.map(msg => ({
        ...msg,
        driverId,
        driverName: drivers[driverId].name,
        driverColor: drivers[driverId].color,
        team: drivers[driverId].team
      })));
    });
    return messages.sort((a, b) => a.lap - b.lap);
  };

  const getCarSetupData = (driverId: number) => generateCarSetupData(driverId);

  const getAllCarSetups = () => {
    const setups: Record<number, any> = {};
    selectedDrivers.forEach(id => {
      setups[id] = getCarSetupData(id);
    });
    return setups;
  };

  // Prepare derived data for rendering
  const sectorTimes = getSectorTimes();
  const bestSectorTimes = findBestSectorTimes(sectorTimes);
  const lapOptions = getAvailableLaps();
  const teams = getTeams();
  const pitStopData = preparePitStopData();
  const weather = weatherData[weatherCondition];
  const weatherRadarData = formatWeatherRadarData();
  const radioMessages = getTeamRadioMessages();
  const carSetups = getAllCarSetups();
  const drsZonesData = drsZones[selectedCircuit] || [];

  const formatTimeWithColor = (time: number, bestTime: number) => {
    const diff = time - bestTime;
    const colorClass = diff === 0 ? 'text-purple-500' : diff < 0.2 ? 'text-green-500' : diff < 0.5 ? 'text-yellow-500' : 'text-red-500';
    const sign = diff > 0 ? '+' : '';
    return (
      <span className={colorClass}>
        {time.toFixed(3)}s {diff !== 0 && <span className="text-xs">({sign}{diff.toFixed(3)}s)</span>}
      </span>
    );
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className={`min-h-screen pb-10 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
        {/* Theme toggle button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
            color: isDarkMode ? '#fff' : '#000'
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {/* Weather toggle button */}
        <button
          onClick={() => setShowWeatherPanel(!showWeatherPanel)}
          className="fixed top-4 right-16 z-10 p-2 rounded-full shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
            color: isDarkMode ? '#fff' : '#000'
          }}
        >
          {(weatherCondition === 'clear' || weatherCondition === 'cloudy') ? <Sun size={20} /> : <Droplet size={20} />}
        </button>
        {/* Live Timing toggle button */}
        <button
          onClick={() => setShowLiveTimingDetails(!showLiveTimingDetails)}
          className="fixed top-4 right-28 z-10 p-2 rounded-full shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
            color: isDarkMode ? '#fff' : '#000'
          }}
        >
          <Clock size={20} />
        </button>

        <div className="max-w-6xl mx-auto px-4">
          <header className="py-6 text-center">
            <h1 className="text-4xl font-bold" style={{ textShadow: isDarkMode ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none' }}>
              F1 Advanced Telemetry Dashboard
            </h1>
            <p className="mt-2 text-cyan-400">Comprehensive Formula 1 data analysis platform</p>
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
                  <option value="Monza">Monza</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Silverstone">Silverstone</option>
                  <option value="Spa">Spa</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Suzuka">Suzuka</option>
                  <option value="COTA">COTA</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Imola">Imola</option>
                  <option value="Barcelona">Barcelona</option>
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

            {/* Lap Selection and Session Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
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
              <div>
                <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Compare With Session</label>
                <select
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  value={comparisonSession || ""}
                  onChange={(e) => setComparisonSession(e.target.value || null)}
                >
                  <option value="">No Comparison</option>
                  {sessions.filter(s => s !== selectedSession).map(session => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap border-b border-gray-700">
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'telemetry' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('telemetry')}
                >
                  <Activity size={16} className="inline mr-1" />
                  Telemetry
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'tires' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('tires')}
                >
                  <Activity size={16} className="inline mr-1" />
                  Tires &amp; Strategy
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'energy' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('energy')}
                >
                  <Zap size={16} className="inline mr-1" />
                  ERS &amp; Fuel
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'setup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('setup')}
                >
                  <Sliders size={16} className="inline mr-1" />
                  Car Setup
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'radio' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('radio')}
                >
                  <Headphones size={16} className="inline mr-1" />
                  Team Radio
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'incidents' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('incidents')}
                >
                  <Flag size={16} className="inline mr-1" />
                  Incidents
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'weather' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setActiveTab('weather')}
                >
                  <Sun size={16} className="inline mr-1" />
                  Weather
                </button>
              </div>
            </div>

            {/* Team Selection */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Quick Team Selection</label>
              <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                  <button
                    key={team}
                    className={`py-1 px-3 rounded-full text-sm ${selectedTeam === team ? 'bg-cyan-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => selectTeamDrivers(team)}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Driver Selection Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[0, 1, 2, 3].map(index => (
                <div key={index}>
                  <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">
                    Driver {index + 1}
                  </label>
                  <select
                    className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    value={selectedDrivers[index]}
                    onChange={(e) => {
                      const newDrivers = [...selectedDrivers];
                      newDrivers[index] = parseInt(e.target.value);
                      setSelectedDrivers(newDrivers);
                      setSelectedTeam(null);
                    }}
                  >
                    {Object.entries(drivers).map(([id, driver]) => (
                      <option key={id} value={id}>
                        {driver.name} ({driver.team})
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: drivers[selectedDrivers[index]].color }}></div>
                    <span className="font-medium" style={{ color: drivers[selectedDrivers[index]].color }}>
                      {drivers[selectedDrivers[index]].name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Tab */}
          {activeTab === 'telemetry' && (
            <div>
              {/* (Telemetry charts/tables would be rendered here in a real app) */}
              {/* Example: Show best sector times using formatTimeWithColor */}
              <h3 className="text-lg font-bold mb-2">Best Sector Times</h3>
              <table className="text-sm mb-4">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Sector</th>
                    <th className="px-2 py-1 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1">S1</td>
                    <td className="px-2 py-1">{formatTimeWithColor(bestSectorTimes.s1, bestSectorTimes.s1)}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">S2</td>
                    <td className="px-2 py-1">{formatTimeWithColor(bestSectorTimes.s2, bestSectorTimes.s2)}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">S3</td>
                    <td className="px-2 py-1">{formatTimeWithColor(bestSectorTimes.s3, bestSectorTimes.s3)}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">Total</td>
                    <td className="px-2 py-1">{formatTimeWithColor(bestSectorTimes.total, bestSectorTimes.total)}</td>
                  </tr>
                </tbody>
              </table>
              {/* ... Telemetry line charts would go here ... */}
            </div>
          )}

          {/* Tires & Strategy Tab */}
          {activeTab === 'tires' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Pit Stop Strategies</h3>
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Driver</th>
                    <th className="px-2 py-1 text-left">Stops</th>
                    <th className="px-2 py-1 text-left">Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {pitStopData.map(data => (
                    <tr key={data.driver}>
                      <td className="px-2 py-1">{data.driver}</td>
                      <td className="px-2 py-1">{data.stops}</td>
                      <td className="px-2 py-1">{data.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* ... Possibly a bar chart for pit stops ... */}
            </div>
          )}

          {/* ERS & Fuel Tab */}
          {activeTab === 'energy' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Energy Usage (Driver {selectedDrivers[0]})</h3>
              {/* ... Combined ERS/Fuel charts would go here ... */}
            </div>
          )}

          {/* Car Setup Tab */}
          {activeTab === 'setup' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Car Setup Comparison</h3>
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left"></th>
                    {selectedDrivers.map(id => (
                      <th key={id} className="px-2 py-1 text-left">{drivers[id].name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(carSetups[selectedDrivers[0]] || {}).map(param => (
                    <tr key={param}>
                      <td className="px-2 py-1 font-semibold">{param}</td>
                      {selectedDrivers.map(id => (
                        <td key={id} className="px-2 py-1">
                          {typeof carSetups[id][param] === 'number'
                            ? Number.isInteger(carSetups[id][param])
                              ? carSetups[id][param]
                              : carSetups[id][param].toFixed(param.toLowerCase().includes('toe') ? 2 : 1)
                            : carSetups[id][param]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Team Radio Tab */}
          {activeTab === 'radio' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Team Radio Messages</h3>
              <ul className="text-sm list-disc list-inside">
                {radioMessages.map((msg, idx) => (
                  <li key={idx}>
                    Lap {msg.lap} – {msg.driverName} ({msg.from}): {msg.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Race Incidents</h3>
              {raceIncidents.length ? (
                <ul className="text-sm list-disc list-inside">
                  {raceIncidents.map((inc, idx) => (
                    <li key={idx}>
                      Lap {inc.lap} – {inc.description}{inc.outcome && ` (${inc.outcome})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No incidents for this session.</p>
              )}
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div>
              <h3 className="text-lg font-bold mb-2">Weather Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>Air Temp: {weather.temperature}°C</div>
                <div>Track Temp: {weather.trackTemp}°C</div>
                <div>Humidity: {weather.humidity}%</div>
                <div>Wind Speed: {weather.windSpeed} km/h</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={weatherRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#ccc' : '#666', fontSize: 10 }} />
                  <Radar name="Weather" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weather Conditions Panel (toggleable) */}
        {showWeatherPanel && (
          <div className={`fixed top-16 right-4 z-20 p-4 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ width: '280px' }}>
            <h3 className="text-lg font-bold mb-2">Weather Conditions</h3>
            <select
              className={`w-full mb-4 p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
            >
              <option value="clear">Clear</option>
              <option value="cloudy">Cloudy</option>
              <option value="lightRain">Light Rain</option>
              <option value="heavyRain">Heavy Rain</option>
            </select>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center">
                <Thermometer size={16} className="mr-2 text-red-500" />
                <span>Air: {weather.temperature}°C</span>
              </div>
              <div className="flex items-center">
                <Thermometer size={16} className="mr-2 text-orange-500" />
                <span>Track: {weather.trackTemp}°C</span>
              </div>
              <div className="flex items-center">
                <Droplet size={16} className="mr-2 text-blue-500" />
                <span>Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center">
                <Wind size={16} className="mr-2 text-cyan-500" />
                <span>Wind: {weather.windSpeed} km/h</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <RadarChart outerRadius={50} data={weatherRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#ccc' : '#666', fontSize: 10 }} />
                <Radar name="Weather" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Live Timing Panel (toggleable) */}
        {showLiveTimingDetails && (
          <div
            className={`fixed right-4 top-16 z-20 shadow-lg rounded-xl ${isDarkMode ? 'bg-black bg-opacity-90' : 'bg-white bg-opacity-90'}`}
            style={{ width: '400px', maxHeight: 'calc(100vh - 6rem)', overflow: 'auto' }}
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold flex items-center justify-between">
                <span>Live Timing</span>
                <button className="text-gray-400 hover:text-white" onClick={() => setShowLiveTimingDetails(false)}>
                  ×
                </button>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th className="p-2">Pos</th>
                    <th className="p-2 text-left">Driver</th>
                    <th className="p-2">Gap</th>
                    <th className="p-2">Last Lap</th>
                    <th className="p-2">S1</th>
                    <th className="p-2">S2</th>
                    <th className="p-2">S3</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTimingData.map((driver, index) => (
                    <tr
                      key={driver.driverId}
                      className={`border-b border-gray-800 ${index < 3 ? 'font-bold' : ''}`}
                      style={{ backgroundColor: index % 2 === 0 ? (isDarkMode ? 'rgba(30,30,30,0.5)' : 'rgba(240,240,240,0.5)') : 'transparent' }}
                    >
                      <td className="p-2 text-center">{driver.position}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: driver.color }}
                          ></div>
                          <span>{driver.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-right">{driver.gapToLeader}</td>
                      <td className="p-2 text-right">{driver.lastLap}</td>
                      {driver.sectors.map((sector: any, idx: number) => (
                        <td
                          key={idx}
                          className="p-2 text-right"
                          style={{
                            color:
                              sector.color === "purple" ? "#C900FF" :
                              sector.color === "green" ? "#00FF00" :
                              sector.color === "yellow" ? "#FFFF00" :
                              sector.color === "red" ? "#FF0000" : "inherit"
                          }}
                        >
                          {sector.time}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default F1TelemetryDashboard;