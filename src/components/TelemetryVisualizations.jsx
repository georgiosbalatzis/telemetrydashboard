// Import React and other dependencies first
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Sun, Moon, Thermometer, Wind, Droplet } from 'lucide-react';
import { F1StoriesLogo, F1StoriesPoweredBy } from './F1StoriesBranding';
import { Card, Row, Col, Select, Button, Spin, Alert, Space, Typography } from 'antd';
import { generateSampleTelemetryData } from '../data/sampleData';
import { useTelemetryContext } from '../context/TelemetryContext';
import { prepareLocalData } from '../utils/dataLoader';
import { Box, MenuItem, FormControl, InputLabel } from '@mui/material';

// Import the sample data
import {
    sampleMeetings,
    sampleSessions,
    sampleDrivers,
    generateSampleLapData,
    generateSamplePitStops,
    generateSampleStints
} from '../data/sampleData';

// Import local data files
import localMeetings2025 from '../data/2025/meetings_2025.json';
import localSessions2025 from '../data/2025/sessions_2025.json';
import localDriversLatest from '../data/data/drivers_latest.json';
import localLapsLatest from '../data/data/laps_latest.json';
import localPitsLatest from '../data/data/pit_latest.json';
import localStintsLatest from '../data/data/stints_latest.json';

const { Title } = Typography;
const { Option } = Select;

// Create a lookup object for car data files - start with empty
const carDataFiles = {
    "latest": {
        "1": [],
        "16": []
    }
};

// F1 team colors for 2024 season
const teamColors = {
    "Ferrari": "#DC0000",
    "Mercedes": "#00D2BE",
    "Red Bull": "#0600EF",
    "McLaren": "#FF8700",
    "Sauber": "#469BFF",
    "Alpine": "#0090FF",
    "Aston Martin": "#006F62",
    "Haas F1 Team": "#FFFFFF",
    "RB": "#CAD2D3",
    "Williams": "#005AFF"
};

// Tire compounds data
const tireCompounds = {
    soft: { color: "#FF3333", durability: 0.7, grip: 0.95, optimal_temp: 90 },
    medium: { color: "#FFCC33", durability: 0.85, grip: 0.8, optimal_temp: 85 },
    hard: { color: "#FFFFFF", durability: 1, grip: 0.7, optimal_temp: 80 },
    intermediate: { color: "#33CC33", durability: 0.8, grip: 0.75, optimal_temp: 75 },
    wet: { color: "#3333FF", durability: 0.9, grip: 0.6, optimal_temp: 65 }
};

// Sample weather data
const weatherData = {
    clear: {
        temperature: 28,
        humidity: 45,
        windSpeed: 8,
        windDirection: 225,
        precipitation: 0,
        trackTemp: 42
    },
    cloudy: {
        temperature: 22,
        humidity: 62,
        windSpeed: 12,
        windDirection: 180,
        precipitation: 0,
        trackTemp: 32
    },
    lightRain: {
        temperature: 18,
        humidity: 85,
        windSpeed: 15,
        windDirection: 200,
        precipitation: 25,
        trackTemp: 25
    },
    heavyRain: {
        temperature: 15,
        humidity: 95,
        windSpeed: 22,
        windDirection: 210,
        precipitation: 80,
        trackTemp: 20
    }
};

// Main component
const TelemetryVisualizations = () => {
    const {
        selectedCircuit,
        setSelectedCircuit,
        selectedSession,
        setSelectedSession,
        selectedDrivers,
        setSelectedDrivers,
        selectedLap,
        setSelectedLap,
        dataSource,
        setDataSource,
        isLoading,
        error,
        fetchMeetings,
        fetchSessions,
        fetchDrivers,
        fetchLaps,
        fetchCarData
    } = useTelemetryContext();

    const [localData, setLocalData] = useState(null);
    const [circuits, setCircuits] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [laps, setLaps] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [carData, setCarData] = useState([]);
    const [pitStops, setPitStops] = useState([]);
    const [stints, setStints] = useState([]);

    // Load data when component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await prepareLocalData();
                setLocalData(data);
                console.log('Local data loaded:', data);
            } catch (error) {
                console.error('Error loading local data:', error);
            }
        };
        loadData();
    }, []);

    // Set meetings and circuits when local data is loaded
    useEffect(() => {
        if (localData?.meetings) {
            setMeetings(localData.meetings);
            const uniqueCircuits = [...new Set(localData.meetings.map(m => m.circuit_short_name))];
            setCircuits(uniqueCircuits);
            console.log('Circuits loaded:', uniqueCircuits);
        }
    }, [localData]);

    // Filter sessions based on selected circuit
    useEffect(() => {
        if (localData?.sessions && selectedCircuit) {
            const circuitSessions = localData.sessions.filter(
                session => session.circuit_short_name === selectedCircuit
            );
            setSessions(circuitSessions);
            console.log('Sessions loaded for circuit:', selectedCircuit, circuitSessions);
        }
    }, [localData, selectedCircuit]);

    // Filter drivers based on selected circuit and session
    useEffect(() => {
        if (localData?.drivers && selectedCircuit && selectedSession) {
            console.log('Filtering drivers for:', {
                circuit: selectedCircuit,
                session: selectedSession,
                totalDrivers: localData.drivers.length
            });

            const sessionDrivers = localData.drivers.filter(driver => {
                const matchesCircuit = driver.circuit_short_name === selectedCircuit;
                const matchesSession = driver.session_name === selectedSession;
                
                console.log('Driver check:', {
                    driverNumber: driver.driver_number,
                    driverName: driver.full_name,
                    driverCircuit: driver.circuit_short_name,
                    driverSession: driver.session_name,
                    matchesCircuit,
                    matchesSession
                });

                return matchesCircuit && matchesSession;
            });

            console.log('Filtered drivers:', sessionDrivers);

            // Convert to a map with driver_number as key and add color
            const driversMap = sessionDrivers.reduce((acc, driver) => {
                acc[driver.driver_number] = {
                    ...driver,
                    name: driver.full_name,
                    team: driver.team_name,
                    color: `#${driver.team_colour}`
                };
                return acc;
            }, {});

            setDrivers(driversMap);
            console.log('Drivers map created:', driversMap);
        } else {
            setDrivers({});
        }
    }, [localData, selectedCircuit, selectedSession]);

    // Filter laps based on selected circuit, session, and drivers
    useEffect(() => {
        if (localData?.laps && selectedCircuit && selectedSession && selectedDrivers.length > 0) {
            const sessionLaps = localData.laps.filter(
                lap => lap.circuit_short_name === selectedCircuit && 
                      lap.session_name === selectedSession &&
                      selectedDrivers.includes(lap.driver_number)
            );
            
            // Extract unique lap numbers for the lap selector
            const uniqueLapNumbers = [...new Set(sessionLaps.map(lap => lap.lap_number))].sort((a, b) => a - b);
            setLaps(uniqueLapNumbers);
            console.log('Laps loaded for session:', selectedSession, sessionLaps);
        } else {
            setLaps([]);
        }
    }, [localData, selectedCircuit, selectedSession, selectedDrivers]);

    const handleDataSourceChange = (newDataSource) => {
        setDataSource(newDataSource);
        // Reset selections when changing data source
        setSelectedCircuit(null);
        setSelectedSession(null);
        setSelectedDrivers([]);
        setSelectedLap(null);
    };

    // Load sessions when circuit changes
    useEffect(() => {
        if (selectedCircuit) {
            fetchSessions();
        }
    }, [selectedCircuit, dataSource]);

    // Load drivers when session changes
    useEffect(() => {
        if (selectedSession && selectedCircuit) {
            fetchDrivers();
        }
    }, [selectedSession, selectedCircuit, dataSource]);

    // Load lap data when drivers or session change
    useEffect(() => {
        if (selectedDrivers.length > 0 && selectedSession && selectedCircuit) {
            fetchLaps();
        }
    }, [selectedDrivers, selectedSession, selectedCircuit, dataSource]);

    // Load car data when lap changes
    useEffect(() => {
        if (selectedLap && selectedDrivers.length > 0 && selectedSession && selectedCircuit) {
            console.log('Loading car data for:', {
                lap: selectedLap,
                drivers: selectedDrivers,
                session: selectedSession,
                circuit: selectedCircuit
            });

            // Prepare chart data
            const chartData = prepareChartData();
            setCarData(chartData);
        } else {
            setCarData([]);
        }
    }, [selectedLap, selectedDrivers, selectedSession, selectedCircuit]);

    // Toggle dark/light mode
    const [isDarkMode, setIsDarkMode] = useState(true);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
    };

    // Prepare chart data from car telemetry
    const prepareChartData = () => {
        const chartData = [];
        console.log('Preparing chart data for:', {
            selectedDrivers,
            selectedLap,
            drivers,
            laps
        });

        // Generate synthetic data points for the lap
        const numPoints = 50; // Number of data points per lap
        const lapDuration = 90; // Average lap duration in seconds

        // Create base data points
        for (let i = 0; i < numPoints; i++) {
            const time = (i * lapDuration / numPoints).toFixed(2);
            chartData.push({
                index: i,
                time: `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`
            });
        }

        // Add data for each selected driver
        selectedDrivers.forEach(driverId => {
            if (drivers[driverId]) {
                const driver = drivers[driverId];
                const baseSpeed = 250 + (Math.random() * 50); // Base speed between 250-300 km/h
                const baseThrottle = 0.8 + (Math.random() * 0.2); // Base throttle between 80-100%
                
                // Generate synthetic telemetry data
                chartData.forEach((point, index) => {
                    // Speed variation based on track position (simulating straights and corners)
                    const speedVariation = Math.sin(index / numPoints * Math.PI * 2) * 50;
                    const speed = Math.max(50, baseSpeed + speedVariation);
                    
                    // Throttle and brake simulation
                    const isBraking = speedVariation < -20;
                    const throttle = isBraking ? 0 : baseThrottle;
                    const brake = isBraking ? 0.8 + (Math.random() * 0.2) : 0;
                    
                    // Tire temperature and wear simulation
                    const baseTemp = 85 + (Math.random() * 10);
                    const tempVariation = Math.sin(index / numPoints * Math.PI) * 10;
                    const tireTemp = baseTemp + tempVariation;
                    
                    const baseWear = 100 - (selectedLap * 2);
                    const wearVariation = Math.random() * 5;
                    const tireWear = Math.max(0, baseWear - wearVariation);

                    // Add driver-specific data
                    point[`speed${driverId}`] = Math.round(speed);
                    point[`throttle${driverId}`] = Math.round(throttle * 100);
                    point[`brake${driverId}`] = Math.round(brake * 100);
                    point[`tireTemp${driverId}`] = Math.round(tireTemp);
                    point[`tireWear${driverId}`] = Math.round(tireWear);
                });
            }
        });

        console.log('Prepared chart data:', chartData);
        return chartData;
    };

    // Get sector times for all selected drivers with improved error handling
    const getSectorTimes = () => {
        const sectorTimes = {};

        selectedDrivers.forEach(driverId => {
            const driverIdStr = String(driverId); // Convert to string for lookups
            const driverLapData = laps.filter(lap => String(lap.driver_number) === driverIdStr && lap.lap_number === selectedLap);
            
            if (driverLapData.length > 0) {
                sectorTimes[driverId] = {
                    s1: driverLapData[0].sector_1_time || 0,
                    s2: driverLapData[0].sector_2_time || 0,
                    s3: driverLapData[0].sector_3_time || 0,
                    total: driverLapData[0].lap_time || 0
                };
                console.log(`Found lap data for driver ${driverId}: ${drivers[driverId]?.name || 'Unknown'}`);
            } else {
                // Fallback to synthetic data if no real data exists
                sectorTimes[driverId] = {
                    s1: 28.5 + (Math.random() * 0.5),
                    s2: 31.2 + (Math.random() * 0.5),
                    s3: 30.8 + (Math.random() * 0.5),
                    total: 90.5 + (Math.random() * 1.5)
                };
                console.log(`No lap data for driver ${driverId}, using synthetic data`);
            }
        });

        return sectorTimes;
    };

    // Find best sector times among all drivers
    const findBestSectorTimes = (sectorTimes) => {
        const best = { s1: Infinity, s2: Infinity, s3: Infinity, total: Infinity };

        Object.values(sectorTimes).forEach(times => {
            if (times.s1 > 0 && times.s1 < best.s1) best.s1 = times.s1;
            if (times.s2 > 0 && times.s2 < best.s2) best.s2 = times.s2;
            if (times.s3 > 0 && times.s3 < best.s3) best.s3 = times.s3;
            if (times.total > 0 && times.total < best.total) best.total = times.total;
        });

        return best;
    };

    // Format time with appropriate color based on comparison to best time
    const formatTimeWithColor = (time, bestTime) => {
        if (!time || time === 0) return <span className="text-gray-400">No data</span>;

        const diff = time - bestTime;
        const color = diff === 0 ? 'text-purple-500' : diff < 0.2 ? 'text-green-500' : diff < 0.5 ? 'text-yellow-500' : 'text-red-500';
        const sign = diff > 0 ? '+' : '';

        return (
            <span className={color}>
        {time.toFixed(3)}s {diff !== 0 && <span className="text-xs">({sign}{diff.toFixed(3)}s)</span>}
      </span>
        );
    };

    // Select all drivers from a team
    const selectTeamDrivers = (team) => {
        const teamDrivers = Object.entries(drivers)
            .filter(([id, driver]) => driver.team === team)
            .map(([id]) => parseInt(id));

        // Fill remaining slots with other drivers if needed
        let newSelection = [...teamDrivers];
        if (newSelection.length < 4) {
            const otherDrivers = Object.keys(drivers)
                .map(id => parseInt(id))
                .filter(id => !teamDrivers.includes(id));

            newSelection = [...newSelection, ...otherDrivers.slice(0, 4 - newSelection.length)];
        }

        setSelectedDrivers(newSelection.slice(0, 4));
    };

    // Get all available teams
    const getTeams = () => {
        const teams = new Set();
        Object.values(drivers).forEach(driver => teams.add(driver.team));
        return Array.from(teams);
    };

    // Generate synthetic pit stops for demonstration
    const generateSyntheticPitStops = (driverId) => {
        const pitStops = [];
        const numberOfStops = driverId % 3 === 0 ? 3 : driverId % 2 === 0 ? 2 : 1;

        for (let i = 0; i < numberOfStops; i++) {
            const lapNumber = 15 + i * 20 + (driverId % 5);

            pitStops.push({
                lap: lapNumber,
                duration: 2.1 + (Math.random() * 0.8)
            });
        }

        return pitStops;
    };

    // Get tire strategy based on stints data
    const getDriverTireStrategy = (driverId) => {
        const driverStints = stints.filter(stint => stint.driver_number === driverId);

        if (driverStints.length > 0) {
            // Real data - extract compound names
            return driverStints
                .map(stint => stint.compound || "unknown")
                .join(" → ");
        } else {
            // Synthetic data
            const syntheticCompounds = ["medium", "hard", "soft"];
            const numStops = driverId % 3 === 0 ? 3 : driverId % 2 === 0 ? 2 : 1;

            return Array(numStops + 1)
                .fill()
                .map((_, i) => syntheticCompounds[i % syntheticCompounds.length])
                .join(" → ");
        }
    };

    // Get tire compound for a specific lap
    const getTireCompound = (driverId, lapNumber) => {
        const driverStints = stints.filter(stint => stint.driver_number === driverId);

        if (driverStints.length > 0) {
            // Find which stint this lap belongs to
            const stint = driverStints.find(s =>
                (s.start_lap <= lapNumber) &&
                (s.end_lap >= lapNumber || s.end_lap === null)
            );

            return stint ? stint.compound : "medium";
        } else {
            // Synthetic data
            if (lapNumber < 20) return "soft";
            if (lapNumber < 40) return "medium";
            return "hard";
        }
    };

    // Generate pit stop strategy data
    const preparePitStopData = () => {
        const pitStopData = [];

        selectedDrivers.forEach(driverId => {
            const driverPitStops = pitStops.filter(pit => pit.driver_number === driverId);
            const driverName = drivers[driverId]?.name || `Driver ${driverId}`;
            const driverColor = drivers[driverId]?.color || "#999999";

            // If no real pit stop data, generate synthetic data
            const pitStopsToUse = driverPitStops.length > 0 ? driverPitStops : generateSyntheticPitStops(driverId);

            pitStopData.push({
                driver: driverName,
                color: driverColor,
                stops: pitStopsToUse.length,
                strategy: getDriverTireStrategy(driverId),
                totalPitTime: pitStopsToUse.reduce((sum, stop) => sum + (stop.pit_duration || 3.0), 0),
                pitStops: pitStopsToUse.map(stop => ({
                    lap: stop.lap_number || stop.lap,
                    duration: stop.pit_duration || stop.duration,
                    tireCompound: getTireCompound(driverId, stop.lap_number || stop.lap)
                }))
            });
        });

        return pitStopData;
    };

    // Format weather data for radar chart
    const formatWeatherRadarData = () => {
        // Use a default weather condition if the selected session doesn't match any weather data
        const weather = weatherData[selectedSession] || weatherData.clear;
        return [
            { subject: 'Temperature', A: weather.temperature / 40 * 100, fullMark: 100 },
            { subject: 'Humidity', A: weather.humidity, fullMark: 100 },
            { subject: 'Wind Speed', A: (weather.windSpeed / 30) * 100, fullMark: 100 },
            { subject: 'Track Temp', A: weather.trackTemp / 60 * 100, fullMark: 100 },
            { subject: 'Precipitation', A: weather.precipitation, fullMark: 100 }
        ];
    };

    // Helper function to calculate tire score based on weather conditions
    const calculateTireScore = (tire, weather) => {
        // Temperature factor
        const tempDiff = Math.abs(weather.trackTemp - tire.optimal_temp);
        const tempFactor = Math.max(0, 1 - (tempDiff / 30));

        // Rain factor
        const rainFactor = weather.precipitation > 20 ?
            (tire.name === 'wet' || tire.name === 'intermediate' ? 1 : 0.3) :
            (tire.name === 'wet' || tire.name === 'intermediate' ? 0.4 : 1);

        // Combined score
        return (tire.grip * 0.6 + tire.durability * 0.4) * tempFactor * rainFactor;
    };

    // Generate weather-specific strategy recommendations
    // generateWeatherRecommendations function
    const generateWeatherRecommendations = (condition) => {
        switch (condition) {
            case 'clear':
                return [
                    "Track temperature is high - monitor tire degradation closely",
                    "Consider starting on medium compound for better longevity",
                    "Optimal DRS zones will provide significant overtaking opportunities",
                    "Expect higher brake temperatures - manage cooling accordingly",
                    "Front-left tire will experience highest degradation on this circuit"
                ];
            case 'cloudy':
                return [
                    "Cooler temperatures may lead to graining on softer compounds",
                    "Track evolution will be significant as rubber is laid down",
                    "Medium to soft strategy likely optimal for most teams",
                    "Watch for changing cloud cover affecting track temperature",
                    "Two-stop strategy may be more competitive than three-stop"
                ];
            case 'lightRain':
                return [
                    "Intermediate tires optimal in current conditions",
                    "Track is drying in sectors 1 and 3 - monitor crossover point",
                    "Pit wall timing for slick transition will be critical",
                    "Expect 3-4 second delta between wet and dry lines",
                    "Some drivers may gamble on early switch to slicks"
                ];
            case 'heavyRain':
                return [
                    "Full wet tires required - aquaplaning risk in sector 2",
                    "Visibility will be severely compromised for trailing cars",
                    "Safety car or red flag probability is high",
                    "Brake and tire temperature management crucial",
                    "Conservative engine modes recommended to maintain control"
                ];
            default:
                return [];
        }
    };

    // Prepare the data for rendering
    const chartData = prepareChartData();
    const sectorTimes = getSectorTimes();
    const bestSectorTimes = findBestSectorTimes(sectorTimes);
    const teams = getTeams();
    const pitStopData = preparePitStopData();
    const weather = weatherData[selectedSession] || weatherData.clear;
    const weatherRadarData = formatWeatherRadarData();

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Fixed header bar */}
            <div className={`fixed top-0 left-0 right-0 z-40 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-md px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center">
                    <F1StoriesLogo size="md" />
                    <span className="font-bold text-lg ml-2">F1Stories</span>
                </div>
                <F1StoriesPoweredBy />
            </div>

            {/* Add padding to account for fixed header */}
            <div className="pt-16">
                <header className="py-6 text-center relative">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold" style={{ textShadow: isDarkMode ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none' }}>
                            F1 Telemetry Multi-Driver Comparison
                        </h1>
                        <p className="mt-2 text-cyan-400">Advanced Formula 1 data analysis with tire & weather strategy</p>
                    </div>
                </header>

                <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800 bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gray-100'}`}>
                    {/* Data Source Selection */}
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Data Source</label>
                        <div className="flex space-x-2">
                            <button
                                className={`py-1 px-3 rounded-full text-sm ${dataSource === 'sample' ? 'bg-cyan-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => {
                                    console.log("Sample data button clicked");
                                    handleDataSourceChange('sample');
                                }}
                                disabled={isLoading}
                            >
                                Sample Data
                            </button>
                            <button
                                className={`py-1 px-3 rounded-full text-sm ${dataSource === 'local' ? 'bg-cyan-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => {
                                    console.log("Local data button clicked");
                                    handleDataSourceChange('local');
                                }}
                                disabled={isLoading}
                            >
                                2025 Calendar Data
                            </button>
                            <button
                                className={`py-1 px-3 rounded-full text-sm ${dataSource === 'api' ? 'bg-cyan-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                onClick={() => {
                                    console.log("API data button clicked");
                                    handleDataSourceChange('api');
                                }}
                                disabled={isLoading}
                            >
                                Live API
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Circuit</label>
                            <select
                                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                value={selectedCircuit || ''}
                                onChange={(e) => setSelectedCircuit(e.target.value || null)}
                                disabled={isLoading}
                            >
                                <option value="">Select a circuit</option>
                                {circuits.map(circuit => {
                                    const circuitName = typeof circuit === 'object' ? circuit.circuit_short_name : circuit;
                                    const meeting = meetings.find(m => m.circuit_short_name === circuitName);
                                    const displayName = meeting
                                        ? `${circuitName} (${meeting.location}, ${meeting.country_name})`
                                        : circuitName;

                                    return (
                                        <option key={`circuit-${circuitName}`} value={circuitName}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Session</label>
                            <select
                                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                value={selectedSession || ''}
                                onChange={(e) => setSelectedSession(e.target.value || null)}
                                disabled={isLoading || sessions.length === 0}
                            >
                                <option value="">Select a session</option>
                                {sessions.map(session => (
                                    <option key={`session-${session.session_key}`} value={session.session_name}>
                                        {session.session_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Team Selection */}
                    {teams.length > 0 && (
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Quick Team Selection</label>
                            <div className="flex flex-wrap gap-2">
                                {teams.map(team => (
                                    <button
                                        key={team}
                                        className={`py-1 px-3 rounded-full text-sm ${selectedSession === team ? 'bg-cyan-600 text-white' : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                        onClick={() => selectTeamDrivers(team)}
                                        disabled={isLoading}
                                    >
                                        {team}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Multi-Driver Selection Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[0, 1, 2, 3].map(index => (
                            <div key={index}>
                                <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">
                                    Driver {index + 1}
                                </label>
                                <select
                                    className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={selectedDrivers[index] || ''}
                                    onChange={(e) => {
                                        const newDrivers = [...selectedDrivers];
                                        newDrivers[index] = e.target.value ? parseInt(e.target.value) : null;
                                        setSelectedDrivers(newDrivers);
                                    }}
                                    disabled={isLoading || Object.keys(drivers).length === 0}
                                >
                                    <option value="">Select a driver</option>
                                    {Object.entries(drivers).map(([id, driver]) => (
                                        <option key={`driver-${id}`} value={id}>
                                            {driver.name} ({driver.team})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Lap Selection */}
                    {laps.length > 0 && (
                        <div className="mb-6">
                            <div className="w-full">
                                <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-300">Lap</label>
                                <select
                                    className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={selectedLap}
                                    onChange={(e) => setSelectedLap(parseInt(e.target.value))}
                                    disabled={isLoading}
                                >
                                    {laps.map(lap => (
                                        <option key={`lap-${lap}`} value={lap}>Lap {lap}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Lap Times Section */}
                    {selectedDrivers.length > 0 && Object.keys(sectorTimes).length > 0 && (
                        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} p-4 rounded-xl mb-6`}>
                            <h3 className="text-xl font-bold mb-4 text-center">Sector Times Comparison</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-2">Driver</th>
                                        <th className="p-2">Sector 1</th>
                                        <th className="p-2">Sector 2</th>
                                        <th className="p-2">Sector 3</th>
                                        <th className="p-2">Lap Time</th>
                                        <th className="p-2">Gap to Leader</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedDrivers.map(driverId => {
                                        if (!sectorTimes[driverId]) return null;
                                        const times = sectorTimes[driverId];
                                        const hasData = times.total > 0;
                                        
                                        return (
                                            <tr key={driverId} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                                                <td className="p-2 font-medium" style={{ color: drivers[driverId]?.color || '#999' }}>
                                                    {drivers[driverId]?.name || `Driver ${driverId}`}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {hasData ? formatTimeWithColor(times.s1, bestSectorTimes.s1) : <span className="text-gray-400">No data</span>}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {hasData ? formatTimeWithColor(times.s2, bestSectorTimes.s2) : <span className="text-gray-400">No data</span>}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {hasData ? formatTimeWithColor(times.s3, bestSectorTimes.s3) : <span className="text-gray-400">No data</span>}
                                                </td>
                                                <td className="p-2 text-center font-bold">
                                                    {hasData ? formatTimeWithColor(times.total, bestSectorTimes.total) : <span className="text-gray-400">No data</span>}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {hasData && times.total === bestSectorTimes.total ?
                                                        <span className="text-purple-500">LEADER</span> :
                                                        hasData ? <span className="text-gray-400">+{(times.total - bestSectorTimes.total).toFixed(3)}s</span> :
                                                        <span className="text-gray-400">No data</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Debug Info Panel */}
                    <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                        <h3 className="font-bold mb-2">Debug Information</h3>
                        <div className="text-sm">
                            <p>Current data source: <span className="font-mono bg-gray-800 px-1 rounded">{dataSource}</span></p>
                            <p>Local data loaded: <span className="font-mono bg-gray-800 px-1 rounded">{localData ? `Yes (${meetings.length} meetings)` : 'No'}</span></p>
                            <p>Selected circuit: <span className="font-mono bg-gray-800 px-1 rounded">{selectedCircuit || 'None'}</span></p>
                            <p>Available sessions: <span className="font-mono bg-gray-800 px-1 rounded">{sessions.length}</span></p>
                            <p>Selected session: <span className="font-mono bg-gray-800 px-1 rounded">{selectedSession || 'None'}</span></p>
                            <p>Available drivers: <span className="font-mono bg-gray-800 px-1 rounded">{Object.keys(drivers).length}</span></p>
                            <p>Available lap data: <span className="font-mono bg-gray-800 px-1 rounded">
                                {selectedDrivers.map(driverId => 
                                    laps.some(lap => lap.driver_number === driverId) ? driverId : null
                                ).filter(Boolean).join(', ') || 'None'}
                            </span></p>
                        </div>
                    </div>
                </div>
                {/* Charts Section */}
                {chartData.length > 0 && (
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
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`speed${driverId}`}
                                                    name={`${drivers[driverId].name} Speed`}
                                                    stroke={drivers[driverId].color}
                                                    dot={false}
                                                    strokeWidth={2}
                                                    activeDot={{ r: 6 }}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                />
                                            )
                                        ))}
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
                                        {selectedDrivers.map(driverId => (
                                            drivers[driverId] && (
                                                <React.Fragment key={`throttle-${driverId}`}>
                                                    <Line
                                                        type="monotone"
                                                        dataKey={`throttle${driverId}`}
                                                        name={`${drivers[driverId].name} Throttle`}
                                                        stroke={`${drivers[driverId].color}99`}
                                                        dot={false}
                                                        strokeWidth={2}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey={`brake${driverId}`}
                                                        name={`${drivers[driverId].name} Brake`}
                                                        stroke={`${drivers[driverId].color}`}
                                                        dot={false}
                                                        strokeWidth={2}
                                                        strokeDasharray="5 5"
                                                    />
                                                </React.Fragment>
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tire Temperature Chart (Synthetic data for demo) */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4">Tire Temperature (Estimated)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="time" />
                                        <YAxis
                                            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                            domain={[60, 120]}
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
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`tireTemp${driverId}`}
                                                    name={`${drivers[driverId].name} Tire Temp`}
                                                    stroke={drivers[driverId].color}
                                                    dot={false}
                                                    strokeWidth={2}
                                                    activeDot={{ r: 6 }}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tire Wear Chart (Synthetic data for demo) */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4">Tire Wear (Estimated)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="time" />
                                        <YAxis
                                            label={{ value: 'Tire Life (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
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
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`tireWear${driverId}`}
                                                    name={`${drivers[driverId].name} Tire Wear`}
                                                    stroke={drivers[driverId].color}
                                                    dot={false}
                                                    strokeWidth={2}
                                                    activeDot={{ r: 6 }}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pit Stop Strategy Section */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4">Pit Stop Strategy</h3>

                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-2">Driver</th>
                                        <th className="p-2">Strategy</th>
                                        <th className="p-2">Stops</th>
                                        <th className="p-2">Total Pit Time</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pitStopData.map((data, index) => (
                                        <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                                            <td className="p-2 font-medium" style={{ color: data.color }}>
                                                {data.driver}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center">
                                                    {data.pitStops.map((stop, i) => (
                                                        <React.Fragment key={`stop-${i}-${stop.lap}`}>
                                                            {i > 0 && <span className="mx-1">→</span>}
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: tireCompounds[stop.tireCompound]?.color || '#999', border: '1px solid #666' }}
                                                                title={`${stop.tireCompound?.charAt(0).toUpperCase() + stop.tireCompound?.slice(1) || 'Unknown'} (Lap ${stop.lap})`}
                                                            ></div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">{data.stops}</td>
                                            <td className="p-2 text-center">{data.totalPitTime.toFixed(3)}s</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pit Stop Timeline Visualization */}
                            <h4 className="text-lg font-bold mb-2">Pit Stop Timeline</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={pitStopData}
                                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                        <XAxis type="number" domain={[0, 70]} label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }} />
                                        <YAxis type="category" dataKey="driver" width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: isDarkMode ? '#222' : '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                            formatter={(value, name, props) => {
                                                if (name === 'stop') {
                                                    const stop = pitStopData[props.index].pitStops[value];
                                                    return [`Lap ${stop.lap}: ${stop.tireCompound} tires (${stop.duration.toFixed(2)}s)`, 'Pit Stop'];
                                                }
                                                return [value, name];
                                            }}
                                        />
                                        <Legend />
                                        {pitStopData.map((data, driverIndex) => (
                                            data.pitStops.map((stop, stopIndex) => (
                                                <Bar
                                                    key={`pit-${driverIndex}-${stopIndex}-${stop.lap}`}
                                                    dataKey={() => stop.lap}
                                                    name={`stop-${stopIndex}`}
                                                    fill={tireCompounds[stop.tireCompound]?.color || '#999'}
                                                    barSize={15}
                                                    background={{ fill: 'transparent' }}
                                                >
                                                    <Cell key={`cell-${driverIndex}-${stopIndex}`} fill={tireCompounds[stop.tireCompound]?.color || '#999'} />
                                                </Bar>
                                            ))
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Tire Compound Performance */}
                            <h4 className="text-lg font-bold mt-6 mb-2">Tire Compound Performance</h4>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                                {Object.entries(tireCompounds).map(([name, data]) => (
                                    <div key={`tire-${name}`} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex flex-col items-center`}>
                                    <div className="w-6 h-6 rounded-full mb-2" style={{ backgroundColor: data.color, border: '1px solid #666' }}></div>
                                        <h5 className="font-bold capitalize">{name}</h5>
                                        <div className="w-full mt-2 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Grip:</span>
                                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${data.grip * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Durability:</span>
                                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${data.durability * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Optimal:</span>
                                                <span>{data.optimal_temp}°C</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weather Impact Analysis */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4">Weather Impact Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Weather Conditions Panel */}
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Current Conditions</h4>
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="flex items-center">
                                                <Thermometer size={18} className="mr-2 text-red-500" />
                                                <div>
                                                    <div className="text-sm opacity-70">Air Temperature</div>
                                                    <div className="font-bold">{weather?.temperature || 'N/A'}°C</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Thermometer size={18} className="mr-2 text-orange-500" />
                                                <div>
                                                    <div className="text-sm opacity-70">Track Temperature</div>
                                                    <div className="font-bold">{weather?.trackTemp || 'N/A'}°C</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Droplet size={18} className="mr-2 text-blue-500" />
                                                <div>
                                                    <div className="text-sm opacity-70">Humidity</div>
                                                    <div className="font-bold">{weather?.humidity || 'N/A'}%</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Wind size={18} className="mr-2 text-cyan-500" />
                                                <div>
                                                    <div className="text-sm opacity-70">Wind Speed</div>
                                                    <div className="font-bold">{weather?.windSpeed || 'N/A'} km/h</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Strategy Recommendations */}
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Strategy Recommendations</h4>
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                                        <ul className="space-y-2">
                                            {generateWeatherRecommendations(selectedSession || 'clear').map((rec, i) => (
                                                <li key={`weather-rec-${i}`} className="flex items-start">
                                                    <div className="text-cyan-400 mr-2">•</div>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state with more helpful message */}
                {chartData.length === 0 && selectedSession && selectedCircuit && selectedDrivers.length > 0 && (
                    <div className={`p-12 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                        <h3 className="text-xl font-bold mb-4">Limited Telemetry Data Available</h3>
                        <p className="mb-2">Telemetry data is only available for some drivers in this session.</p>
                        <p>Available lap data for: {selectedDrivers.map(driverId => 
                            laps.some(lap => lap.driver_number === driverId) ? drivers[driverId]?.name : null
                        ).filter(Boolean).join(', ') || 'None'}</p>
                    </div>
                )}

                {/* Initial state */}
                {chartData.length === 0 && (!selectedSession || !selectedCircuit) && (
                    <div className={`p-12 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                        <h3 className="text-xl font-bold mb-4">Welcome to F1 Telemetry Dashboard</h3>
                        <p>Please select a circuit and session to begin analyzing telemetry data.</p>
                    </div>
                )}

                <footer className="mt-12 text-center text-sm">
                    <F1StoriesPoweredBy textColor="text-cyan-400" size="md" />
                    <p className="text-gray-500">Data provided by OpenF1 API • {new Date().getFullYear()}</p>
                    <p className="mt-1 text-gray-500">Lap data updated every 5 minutes during live sessions</p>
                </footer>
            </div>
        </div>
    );
};

export default TelemetryVisualizations;
