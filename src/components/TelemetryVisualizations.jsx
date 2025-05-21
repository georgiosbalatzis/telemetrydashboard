// Import React and other dependencies first
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Sun, Moon, Thermometer, Wind, Droplet } from 'lucide-react';
import { F1StoriesLogo, F1StoriesPoweredBy } from './F1StoriesBranding';
import { Card, Row, Col, Select, Button, Spin, Alert, Space, Typography } from 'antd';
import { useTelemetryContext } from '../context/TelemetryContext';
import { loadData } from '../utils/dataLoader';
import { Box, MenuItem, FormControl, InputLabel } from '@mui/material';

const { Title } = Typography;
const { Option } = Select;

// F1 team colors for 2024/2025 season
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
        isLoading,
        error,
        isDarkMode,
        toggleTheme,
        fetchMeetings,
        fetchSessions,
        fetchDrivers,
        fetchLaps,
        fetchCarData
    } = useTelemetryContext();

    const [circuits, setCircuits] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [drivers, setDrivers] = useState({});
    const [laps, setLaps] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [carData, setCarData] = useState([]);
    const [pitStops, setPitStops] = useState([]);
    const [stints, setStints] = useState([]);

    // Load meeting data when component mounts
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load circuits data
                const meetingsData = await fetchMeetings();
                setMeetings(meetingsData);

                // Extract circuits from meetings
                const uniqueCircuits = [...new Set(meetingsData.map(m => m.circuit_short_name))];
                setCircuits(uniqueCircuits);
                console.log('Circuits loaded:', uniqueCircuits);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        loadInitialData();
    }, [fetchMeetings]);

    // Load sessions when circuit changes
    useEffect(() => {
        const loadSessionData = async () => {
            if (!selectedCircuit) return;

            try {
                const sessionsData = await fetchSessions();
                setSessions(sessionsData);
                console.log('Sessions loaded for circuit:', selectedCircuit, sessionsData);
            } catch (error) {
                console.error('Error loading session data:', error);
            }
        };

        loadSessionData();
    }, [selectedCircuit, fetchSessions]);

    // Load drivers when session changes
    useEffect(() => {
        const loadDriverData = async () => {
            if (!selectedCircuit || !selectedSession) return;

            try {
                const driversData = await fetchDrivers();

                // Convert to a map with driver_number as key and add color
                const driversMap = driversData.reduce((acc, driver) => {
                    acc[driver.driver_number] = {
                        ...driver,
                        name: driver.full_name,
                        team: driver.team_name,
                        color: `#${driver.team_colour}`
                    };
                    return acc;
                }, {});

                setDrivers(driversMap);
                console.log('Drivers loaded:', driversMap);
            } catch (error) {
                console.error('Error loading driver data:', error);
            }
        };

        loadDriverData();
    }, [selectedCircuit, selectedSession, fetchDrivers]);

    // Load lap data when drivers are selected
    useEffect(() => {
        const loadLapData = async () => {
            if (!selectedCircuit || !selectedSession || !selectedDrivers.length) {
                setLaps([]);
                return;
            }

            try {
                const lapData = await fetchLaps();

                // Store the full lap data
                setLaps(lapData);

                // Extract unique lap numbers for the lap selector dropdown
                const uniqueLapNumbers = [...new Set(lapData.map(lap => lap.lap_number))].sort((a, b) => a - b);

                console.log('Available lap numbers:', uniqueLapNumbers);

                // Set the first lap as selected if none is selected
                if (uniqueLapNumbers.length > 0 && !selectedLap) {
                    setSelectedLap(uniqueLapNumbers[0]);
                }
            } catch (error) {
                console.error('Error loading lap data:', error);
            }
        };

        loadLapData();
    }, [selectedCircuit, selectedSession, selectedDrivers, fetchLaps]);

    // Load car data when lap changes
    useEffect(() => {
        const loadCarData = async () => {
            if (!selectedLap || !selectedDrivers.length || !selectedSession || !selectedCircuit) return;

            try {
                // Get car telemetry data
                // Note: Since the Ergast API doesn't provide this level of detail,
                // we'll generate synthetic data
                const chartData = prepareChartData();
                setCarData(chartData);

                // Also get pit stop data
                const pitData = await loadData('pit_stops', {
                    circuit_name: selectedCircuit,
                    session_name: selectedSession,
                    driver_number: selectedDrivers
                });
                setPitStops(pitData || []);

                // Get stint data
                const stintData = await loadData('stints', {
                    circuit_name: selectedCircuit,
                    session_name: selectedSession,
                    driver_number: selectedDrivers
                });
                setStints(stintData || []);
            } catch (error) {
                console.error('Error loading car data:', error);
            }
        };

        loadCarData();
    }, [selectedLap, selectedDrivers, selectedSession, selectedCircuit]);

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

    // Update to getSectorTimes function to handle retired drivers
    const getSectorTimes = () => {
        const sectorTimes = {};

        console.log('Getting sector times for drivers:', selectedDrivers);
        console.log('Selected lap:', selectedLap);
        console.log('Total available laps:', laps.length);

        // Log a sample lap to see its structure
        if (laps.length > 0) {
            console.log('Sample lap data structure:', laps[0]);
        }

        selectedDrivers.forEach(driverId => {
            // Find the lap data for this driver and the selected lap
            const driverLapData = laps.filter(lap =>
                (lap.driver_number === driverId || lap.driver_number === parseInt(driverId)) &&
                (lap.lap_number === selectedLap || lap.lap_number === parseInt(selectedLap))
            );

            console.log(`Found ${driverLapData.length} laps for driver ${driverId} and lap ${selectedLap}`);

            if (driverLapData.length > 0) {
                // Log the exact lap data we found for debugging
                console.log(`Lap data for driver ${driverId}, lap ${selectedLap}:`, driverLapData[0]);

                // For lap 1, handle the special case where sector 1 is missing
                let s1 = driverLapData[0].sector_1_time;
                const s2 = driverLapData[0].sector_2_time;
                const s3 = driverLapData[0].sector_3_time;
                let total = driverLapData[0].lap_time;

                // Check if we have valid data for sectors 2 and 3
                const hasS2 = s2 !== null && s2 !== undefined && s2 > 0;
                const hasS3 = s3 !== null && s3 !== undefined && s3 > 0;

                // For lap 1, calculate total from sectors 2 and 3 if it's missing
                if (selectedLap === 1 && !total && hasS2 && hasS3) {
                    // For first lap, we know sector 1 timing isn't recorded
                    // so calculate a reasonable total from just sectors 2 and 3
                    total = s2 + s3;
                }

                // If we still don't have valid sector 1 but have valid total and other sectors,
                // try to calculate it
                if ((!s1 || s1 === 0) && total && hasS2 && hasS3) {
                    s1 = total - s2 - s3;
                    if (s1 < 0) s1 = 0; // Sanity check
                }

                const hasData = (s1 && s1 > 0) || (s2 && s2 > 0) || (s3 && s3 > 0) || (total && total > 0);

                sectorTimes[driverId] = {
                    s1: s1 || 0,
                    s2: s2 || 0,
                    s3: s3 || 0,
                    total: total || 0,
                    hasData: hasData,
                    // For lap 1, we know sector 1 data is estimated
                    isS1Estimated: selectedLap === 1
                };

                console.log(`Processed sector times for driver ${driverId}:`, sectorTimes[driverId]);
            } else {
                // Fallback to synthetic data if no real data exists
                sectorTimes[driverId] = {
                    s1: 28.5 + (Math.random() * 0.5),
                    s2: 31.2 + (Math.random() * 0.5),
                    s3: 30.8 + (Math.random() * 0.5),
                    total: 90.5 + (Math.random() * 1.5),
                    hasData: false,
                    isSynthetic: true
                };
                console.log(`No lap data found for driver ${driverId}, lap ${selectedLap}, using synthetic data`);
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
    const formatTimeWithColor = (time, bestTime, noData, isEstimated = false) => {
        if (noData || time === null || time === undefined || time === 0) {
            return <span className="text-gray-400">No data</span>;
        }

        // Make sure we're comparing numbers
        const timeValue = Number(time);
        const bestTimeValue = Number(bestTime);

        if (isNaN(timeValue) || isNaN(bestTimeValue)) {
            console.warn('Invalid time values:', { time, bestTime });
            return <span className="text-gray-400">Invalid data</span>;
        }

        const diff = timeValue - bestTimeValue;
        const color = diff === 0 ? 'text-purple-500' : diff < 0.2 ? 'text-green-500' : diff < 0.5 ? 'text-yellow-500' : 'text-red-500';
        const sign = diff > 0 ? '+' : '';

        return (
            <span className={color}>
      {timeValue.toFixed(3)}s{isEstimated ? '*' : ''} {diff !== 0 && <span className="text-xs">({sign}{diff.toFixed(3)}s)</span>}
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
                <div className="flex items-center">
                    <button
                        onClick={toggleTheme}
                        className="mr-4 p-2 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <F1StoriesPoweredBy />
                </div>
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
                                        setSelectedDrivers(newDrivers.filter(Boolean));
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
                                    {/* This is where the error is happening - we need to get the lap numbers, not the full lap objects */}
                                    {[...new Set(laps.map(lap => lap.lap_number))].sort((a, b) => a - b).map(lapNumber => (
                                        <option key={`lap-${lapNumber}`} value={lapNumber}>Lap {lapNumber}</option>
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

                                        return (
                                            <tr key={driverId} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                                                <td className="p-2 font-medium" style={{ color: drivers[driverId]?.color || '#999' }}>
                                                    {drivers[driverId]?.name || `Driver ${driverId}`}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(times.s1, bestSectorTimes.s1, !times.hasData, times.isS1Estimated)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(times.s2, bestSectorTimes.s2, !times.hasData)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(times.s3, bestSectorTimes.s3, !times.hasData)}
                                                </td>
                                                <td className="p-2 text-center font-bold">
                                                    {formatTimeWithColor(times.total, bestSectorTimes.total, !times.hasData)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {times.hasData && times.total === bestSectorTimes.total ?
                                                        <span className="text-purple-500">LEADER</span> :
                                                        times.hasData && times.total > 0 && bestSectorTimes.total > 0 ?
                                                            <span className="text-gray-400">+{(times.total - bestSectorTimes.total).toFixed(3)}s</span> :
                                                            <span className="text-gray-400">No data</span>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add note about estimated values */}
                            {selectedLap === 1 && (
                                <div className="text-xs text-gray-400 mt-2 text-center">
                                    * Sector 1 times for lap 1 are estimated based on available sector data
                                </div>
                            )}
                        </div>
                    )}

                    {/* Debug Info Panel */}
                    <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
                        <h3 className="font-bold mb-2">Debug Information</h3>
                        <div className="text-sm">
                            <p>API: <span className="font-mono bg-gray-800 px-1 rounded">http://api.jolpi.ca/ergast/f1</span></p>
                            <p>Selected circuit: <span className="font-mono bg-gray-800 px-1 rounded">{selectedCircuit || 'None'}</span></p>
                            <p>Available sessions: <span className="font-mono bg-gray-800 px-1 rounded">{sessions.length}</span></p>
                            <p>Selected session: <span className="font-mono bg-gray-800 px-1 rounded">{selectedSession || 'None'}</span></p>
                            <p>Available drivers: <span className="font-mono bg-gray-800 px-1 rounded">{Object.keys(drivers).length}</span></p>
                            <p>Selected drivers: <span className="font-mono bg-gray-800 px-1 rounded">
                               {selectedDrivers.map(driverId =>
                                   drivers[driverId]?.name || driverId
                               ).join(', ') || 'None'}
                           </span></p>
                            <p>Selected lap: <span className="font-mono bg-gray-800 px-1 rounded">{selectedLap || 'None'}</span></p>
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
                            drivers[driverId]?.name
                        ).filter(Boolean).join(', ') || 'None'}</p>
                        <p className="mt-4 text-cyan-400">Using Ergast API data from: http://api.jolpi.ca/ergast/f1</p>
                    </div>
                )}

                {/* Initial state */}
                {chartData.length === 0 && (!selectedSession || !selectedCircuit) && (
                    <div className={`p-12 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                        <h3 className="text-xl font-bold mb-4">Welcome to F1 Telemetry Dashboard</h3>
                        <p>Please select a circuit and session to begin analyzing telemetry data.</p>
                        <p className="mt-4 text-cyan-400">Using live data from Ergast API</p>
                    </div>
                )}

                <footer className="mt-12 text-center text-sm">
                    <F1StoriesPoweredBy textColor="text-cyan-400" size="md" />
                    <p className="text-gray-500">Data provided by Ergast F1 API • {new Date().getFullYear()}</p>
                    <p className="mt-1 text-gray-500">API URL: http://api.jolpi.ca/ergast/f1</p>
                </footer>
            </div>
        </div>
    );
};

export default TelemetryVisualizations;