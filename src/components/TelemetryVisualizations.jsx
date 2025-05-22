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
// Update the teamColors to ensure Red Bull has the right color
const teamColors = {
    "Ferrari":      "#D40000",  // Rosso Corsa
    "Mercedes":     "#00A19B",  // Tiffany Green
    "Red Bull":     "#0600EF",  // Red Bull Racing Blue - make sure this is right
    "McLaren":      "#FF8000",
    "Sauber":       "#52E252",  // Kick Sauber
    "Alpine":       "#EA80B0",
    "Aston Martin": "#229971",
    "Haas F1 Team": "#B6BABD",
    "RB":           "#6692FF",  // Racing Bulls (different from Red Bull Racing)
    "Williams":     "#1868DB"
};
// Updated tire compounds with more variations
const tireCompounds = {
    soft: { color: "#FF3333", durability: 0.7, grip: 0.95, optimal_temp: 90 },
    medium: { color: "#FFCC33", durability: 0.85, grip: 0.8, optimal_temp: 85 },
    hard: { color: "#FFFFFF", durability: 1, grip: 0.7, optimal_temp: 80 },
    intermediate: { color: "#33CC33", durability: 0.8, grip: 0.75, optimal_temp: 75 },
    wet: { color: "#3333FF", durability: 0.9, grip: 0.6, optimal_temp: 65 },

};

// Helper function to get tire compound color
const getTireCompoundColor = (compound) => {
    if (!compound) return '#999999';

    const normalizedCompound = compound.toLowerCase().trim();

    // Direct mapping
    const colorMap = {
        'soft': '#FF3333',
        'medium': '#FFCC33',
        'hard': '#FFFFFF',
        'intermediate': '#33CC33',
        'wet': '#3333FF',
        //Variations
        'SOFT': '#FF3333',
        'MEDIUM': '#FFCC33',
        'HARD': '#FFFFFF',
        'INTERMEDIATE': '#33CC33',
        'WET': '#3333FF',
        // Handle variations
        's': '#FF3333',
        'm': '#FFCC33',
        'h': '#FFFFFF',
        'i': '#33CC33',
        'w': '#3333FF'
    };

    return colorMap[normalizedCompound] || '#999999';
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

    // Color management functions
    const getEnhancedTeamColor = (teamName) => {
        // When in dark mode, use even more vibrant colors for better visibility
        const darkModeColors = {
            "Ferrari": "#FF1E1E",      // Brighter Ferrari red
            "Mercedes": "#00FFE0",     // Brighter Mercedes teal
            "Red Bull": "#0F6FFF",     // Brighter Red Bull blue
            "McLaren": "#FFA000",      // Brighter McLaren orange
            "Sauber": "#5CFF5C",       // Brighter Sauber green
            "Alpine": "#FF8EC0",       // Brighter Alpine pink
            "Aston Martin": "#00FFB9", // Brighter Aston Martin green
            "Haas F1 Team": "#FFFFFF", // Pure white for Haas
            "RB": "#80B0FF",           // Brighter Racing Bulls blue
            "Williams": "#2180FF"      // Brighter Williams blue
        };

        return isDarkMode && darkModeColors[teamName]
            ? darkModeColors[teamName]
            : teamColors[teamName] || "#999999";
    };

    // Function to get driver color with enhancements
    const getDriverColor = (driverId) => {
        if (!drivers[driverId]) return "#999999";

        const driver = drivers[driverId];
        // Try to use team color from teamColors constant
        if (driver.team && teamColors[driver.team]) {
            return getEnhancedTeamColor(driver.team);
        }

        // If driver has a team_colour property, use that
        if (driver.team_colour) {
            return `#${driver.team_colour}`;
        }

        // Fallback to default color or any color in the driver object
        return driver.color || "#999999";
    };

    const [circuits, setCircuits] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [drivers, setDrivers] = useState({});
    const [laps, setLaps] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [carData, setCarData] = useState([]);
    const [pitStops, setPitStops] = useState([]);
    const [stints, setStints] = useState([]);
    const [usingRealData, setUsingRealData] = useState(false);

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
                    // First identify the team name
                    const teamName = driver.team_name;

                    // Add specific logging for Red Bull drivers
                    if (driver.full_name && (driver.full_name.includes('Verstappen') || driver.full_name.includes('Perez') || driver.full_name.includes('Pérez'))) {
                        console.log(`🔍 RED BULL DRIVER DEBUG:`, {
                            name: driver.full_name,
                            teamName: teamName,
                            teamColour: driver.team_colour,
                            driverNumber: driver.driver_number
                        });
                    }

                    // Log the team name to see what we're getting from the API
                    console.log(`Driver ${driver.driver_number} (${driver.full_name}): Team = "${teamName}"`);

                    // Enhanced team name matching with more Red Bull variations
                    const teamMappings = {
                        'Red Bull Racing': 'Red Bull',
                        'Oracle Red Bull Racing': 'Red Bull',
                        'Red Bull Racing Honda RBPT': 'Red Bull',
                        'Red Bull Racing RBPT': 'Red Bull',
                        'Red Bull': 'Red Bull',
                        'RBR': 'Red Bull',
                        'Scuderia Ferrari': 'Ferrari',
                        'Ferrari': 'Ferrari',
                        'Scuderia Ferrari HP': 'Ferrari',
                        'Mercedes-AMG Petronas F1 Team': 'Mercedes',
                        'Mercedes': 'Mercedes',
                        'McLaren F1 Team': 'McLaren',
                        'McLaren': 'McLaren',
                        'Alpine F1 Team': 'Alpine',
                        'Alpine': 'Alpine',
                        'Aston Martin Aramco Cognizant F1 Team': 'Aston Martin',
                        'Aston Martin': 'Aston Martin',
                        'MoneyGram Haas F1 Team': 'Haas F1 Team',
                        'Haas F1 Team': 'Haas F1 Team',
                        'Haas': 'Haas F1 Team',
                        'Visa Cash App RB F1 Team': 'RB',
                        'AlphaTauri': 'RB',
                        'RB': 'RB',
                        'Williams Racing': 'Williams',
                        'Williams': 'Williams',
                        'Kick Sauber F1 Team': 'Sauber',
                        'Sauber': 'Sauber',
                        'Alfa Romeo': 'Sauber'
                    };

                    let enhancedColor = null;
                    let matchedTeam = null;

                    // Try exact match first
                    if (teamName && teamColors[teamName]) {
                        enhancedColor = getEnhancedTeamColor(teamName);
                        matchedTeam = teamName;
                        console.log(`Exact match found for "${teamName}"`);
                    } else if (teamName) {
                        // Try partial matches for common team name variations
                        const mappedTeam = teamMappings[teamName];
                        if (mappedTeam && teamColors[mappedTeam]) {
                            enhancedColor = getEnhancedTeamColor(mappedTeam);
                            matchedTeam = mappedTeam;
                            console.log(`Mapped "${teamName}" to "${mappedTeam}"`);
                        } else {
                            // Try substring matching for Red Bull specifically
                            if (teamName.toLowerCase().includes('red bull')) {
                                enhancedColor = getEnhancedTeamColor('Red Bull');
                                matchedTeam = 'Red Bull';
                                console.log(`Substring matched "${teamName}" to "Red Bull"`);
                            }
                            // Try substring matching for other teams
                            else if (teamName.toLowerCase().includes('ferrari')) {
                                enhancedColor = getEnhancedTeamColor('Ferrari');
                                matchedTeam = 'Ferrari';
                                console.log(`Substring matched "${teamName}" to "Ferrari"`);
                            }
                            else if (teamName.toLowerCase().includes('mercedes')) {
                                enhancedColor = getEnhancedTeamColor('Mercedes');
                                matchedTeam = 'Mercedes';
                                console.log(`Substring matched "${teamName}" to "Mercedes"`);
                            }
                            else if (teamName.toLowerCase().includes('mclaren')) {
                                enhancedColor = getEnhancedTeamColor('McLaren');
                                matchedTeam = 'McLaren';
                                console.log(`Substring matched "${teamName}" to "McLaren"`);
                            }
                            else if (teamName.toLowerCase().includes('alpine')) {
                                enhancedColor = getEnhancedTeamColor('Alpine');
                                matchedTeam = 'Alpine';
                                console.log(`Substring matched "${teamName}" to "Alpine"`);
                            }
                            else if (teamName.toLowerCase().includes('aston martin')) {
                                enhancedColor = getEnhancedTeamColor('Aston Martin');
                                matchedTeam = 'Aston Martin';
                                console.log(`Substring matched "${teamName}" to "Aston Martin"`);
                            }
                            else if (teamName.toLowerCase().includes('haas')) {
                                enhancedColor = getEnhancedTeamColor('Haas F1 Team');
                                matchedTeam = 'Haas F1 Team';
                                console.log(`Substring matched "${teamName}" to "Haas F1 Team"`);
                            }
                            else if (teamName.toLowerCase().includes('williams')) {
                                enhancedColor = getEnhancedTeamColor('Williams');
                                matchedTeam = 'Williams';
                                console.log(`Substring matched "${teamName}" to "Williams"`);
                            }
                            else if (teamName.toLowerCase().includes('sauber') || teamName.toLowerCase().includes('kick')) {
                                enhancedColor = getEnhancedTeamColor('Sauber');
                                matchedTeam = 'Sauber';
                                console.log(`Substring matched "${teamName}" to "Sauber"`);
                            }
                            else if (teamName.toLowerCase().includes('alphatauri') || (teamName.toLowerCase().includes('rb') && !teamName.toLowerCase().includes('red bull'))) {
                                enhancedColor = getEnhancedTeamColor('RB');
                                matchedTeam = 'RB';
                                console.log(`Substring matched "${teamName}" to "RB"`);
                            }
                        }
                    }

                    // Special handling for Red Bull drivers if color still not found
                    if (!enhancedColor && driver.full_name &&
                        (driver.full_name.includes('Verstappen') || driver.full_name.includes('Pérez') || driver.full_name.includes('Perez'))) {
                        console.warn(`🚨 Red Bull driver ${driver.full_name} not getting team color! Forcing Red Bull color.`);
                        enhancedColor = getEnhancedTeamColor('Red Bull');
                        matchedTeam = 'Red Bull (forced)';
                    }

                    // Additional fallback for specific driver numbers if we know them
                    if (!enhancedColor) {
                        // Max Verstappen is typically #1 or #33, Sergio Perez is typically #11
                        if (driver.driver_number === 1 || driver.driver_number === 33) {
                            console.warn(`🚨 Driver #${driver.driver_number} appears to be Verstappen, forcing Red Bull color`);
                            enhancedColor = getEnhancedTeamColor('Red Bull');
                            matchedTeam = 'Red Bull (by driver number)';
                        } else if (driver.driver_number === 11) {
                            console.warn(`🚨 Driver #${driver.driver_number} appears to be Perez, forcing Red Bull color`);
                            enhancedColor = getEnhancedTeamColor('Red Bull');
                            matchedTeam = 'Red Bull (by driver number)';
                        }
                    }

                    // Fallback to API color or default
                    const finalColor = enhancedColor || `#${driver.team_colour || "999999"}`;

                    // Log color assignment for Red Bull drivers
                    if (driver.full_name && (driver.full_name.includes('Verstappen') || driver.full_name.includes('Perez') || driver.full_name.includes('Pérez'))) {
                        console.log(`🎨 RED BULL COLOR ASSIGNMENT:`, {
                            name: driver.full_name,
                            teamName: teamName,
                            matchedTeam: matchedTeam,
                            enhancedColor: enhancedColor,
                            finalColor: finalColor,
                            expectedColor: teamColors['Red Bull']
                        });
                    }

                    acc[driver.driver_number] = {
                        ...driver,
                        name: driver.full_name || `Driver ${driver.driver_number}`,
                        team: matchedTeam || teamName || "Unknown Team",
                        color: finalColor,
                        originalColor: `#${driver.team_colour || "999999"}`,
                        originalTeamName: teamName // Keep original for debugging
                    };
                    return acc;
                }, {});

                setDrivers(driversMap);
                console.log('Drivers loaded with enhanced colors:', driversMap);
            } catch (error) {
                console.error('Error loading driver data:', error);
            }
        };

        loadDriverData();
    }, [selectedCircuit, selectedSession, fetchDrivers, isDarkMode]);

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

    useEffect(() => {
        const loadCarData = async () => {
            if (!selectedLap || !selectedDrivers.length || !selectedSession || !selectedCircuit) return;

            try {
                // Try to load real car telemetry data first
                // Initialize realCarData array BEFORE using it
                let realCarData = [];

                // For each selected driver, try to get car data
                for (const driverId of selectedDrivers) {
                    try {
                        const driverCarData = await loadData('car_data', {
                            circuit_name: selectedCircuit,
                            session_name: selectedSession,
                            driver_number: driverId,
                            lap_number: selectedLap
                        });

                        if (driverCarData && driverCarData.length > 0) {
                            console.log(`Found real car data for driver ${driverId}, lap ${selectedLap}:`, driverCarData.length, 'data points');

                            // Tag each data point with the driver ID
                            const taggedData = driverCarData.map(point => ({
                                ...point,
                                driver_number: driverId
                            }));

                            realCarData = [...realCarData, ...taggedData];
                        } else {
                            console.log(`No real car data found for driver ${driverId}, lap ${selectedLap}`);
                        }
                    } catch (err) {
                        console.warn(`Error fetching car data for driver ${driverId}:`, err);
                    }
                }

                // AFTER collecting all the data, THEN set the flag
                // Store whether we're using real data
                const isUsingRealData = realCarData.length > 0;
                setUsingRealData(isUsingRealData);

                // Prepare chart data, using real data when available
                const chartData = prepareChartData(realCarData);
                setCarData(chartData);

                // Only get pit stop data for race sessions
                if (selectedSession && selectedSession.toLowerCase().includes('race')) {
                    console.log('🔧 Loading pit stop data using OpenF1 API...');

                    // First, get the session_key for OpenF1 API
                    const sessions = await loadData('schedule', {
                        circuit_name: selectedCircuit,
                        session_name: selectedSession
                    });

                    const sessionKey = sessions.length > 0 ? sessions[0].original_session_key : null;

                    if (sessionKey) {
                        console.log(`Found session key: ${sessionKey}`);

                        // Load pit stops using OpenF1 API format
                        try {
                            const pitResponse = await fetch(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`);
                            if (pitResponse.ok) {
                                const allPitData = await pitResponse.json();
                                console.log(`OpenF1 pit data:`, allPitData.length, 'records');

                                // Filter for selected drivers
                                const filteredPitData = allPitData.filter(pit =>
                                    selectedDrivers.includes(parseInt(pit.driver_number))
                                );

                                setPitStops(filteredPitData);
                                console.log(`Filtered pit stops:`, filteredPitData.length);
                            }
                        } catch (error) {
                            console.error('Error loading pit data:', error);
                            setPitStops([]);
                        }

                        // Load stints using OpenF1 API format
                        try {
                            const stintsResponse = await fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`);
                            if (stintsResponse.ok) {
                                const allStintData = await stintsResponse.json();
                                console.log(`OpenF1 stint data:`, allStintData.length, 'records');

                                // Filter for selected drivers
                                const filteredStintData = allStintData.filter(stint =>
                                    selectedDrivers.includes(parseInt(stint.driver_number))
                                );

                                setStints(filteredStintData);
                                console.log(`Filtered stints:`, filteredStintData.length);
                            }
                        } catch (error) {
                            console.error('Error loading stint data:', error);
                            setStints([]);
                        }
                    } else {
                        console.warn('No session key found for OpenF1 API calls');
                        setPitStops([]);
                        setStints([]);
                    }
                } else {
                    setPitStops([]);
                    setStints([]);
                }
            } catch (error) {
                console.error('Error loading car data:', error);
            }
        };


        // Add this debugging function to test what endpoints exist
        const testAvailableEndpoints = async () => {
            const testEndpoints = [
                'pit',
                'pit_stops',
                'pitstops',
                'pits',
                'stints',
                'stint',
                'tire_stints',
                'compounds',
                'position',
                'intervals',
                'team_radio',
                'race_control',
                'car_data',
                'location'
            ];

            console.log('🔍 Testing available OpenF1 API endpoints...');

            for (const endpoint of testEndpoints) {
                try {
                    const response = await fetch(`https://api.openf1.org/v1/${endpoint}?session_key=9158`); // Use a known session key
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ ${endpoint}: Available (${Array.isArray(data) ? data.length : 'object'} records)`);
                        if (Array.isArray(data) && data.length > 0) {
                            console.log(`   Sample ${endpoint} data:`, data[0]);
                        }
                    } else {
                        console.log(`❌ ${endpoint}: Not available (${response.status})`);
                    }
                } catch (error) {
                    console.log(`❌ ${endpoint}: Error (${error.message})`);
                }
            }
        };

        loadCarData();
    }, [selectedLap, selectedDrivers, selectedSession, selectedCircuit]);

    // Debug driver colors
    useEffect(() => {
        if (selectedDrivers.length > 0) {
            const colorDebug = selectedDrivers.map(id => ({
                id,
                name: drivers[id]?.name || `Driver ${id}`,
                team: drivers[id]?.team || "Unknown",
                color: getDriverColor(id)
            }));
            console.log("Chart driver colors:", colorDebug);
        }
    }, [selectedDrivers, drivers, isDarkMode]);

    // Debug chart data
    useEffect(() => {
        if (carData.length > 0 && selectedDrivers.length > 0) {
            console.log("Sample data point:", carData[0]);
            console.log("Chart data series:",
                selectedDrivers.map(id => `speed${id}`),
                selectedDrivers.map(id => `throttle${id}`),
                selectedDrivers.map(id => `brake${id}`)
            );
        }
    }, [carData, selectedDrivers]);

    // Add this function to calculate the actual lap duration
    const getActualLapDuration = () => {
        // First, try to get the maximum lap time from the actual lap data
        if (laps.length > 0) {
            const lapTimes = laps
                .filter(lap => lap.lap_time && lap.lap_time > 0)
                .map(lap => lap.lap_time);

            if (lapTimes.length > 0) {
                const maxLapTime = Math.max(...lapTimes);
                console.log(`Found real lap times, max: ${maxLapTime}s`);
                return maxLapTime;
            }
        }

        // Fallback to circuit-specific approximate lap times
        const circuitLapTimes = {
            'monaco': 78,          // Monaco GP
            'monza': 80,           // Italian GP
            'silverstone': 90,     // British GP
            'spa': 105,            // Belgian GP (longest)
            'suzuka': 90,          // Japanese GP
            'interlagos': 70,      // Brazilian GP
            'austin': 95,          // US GP
            'bahrain': 87,         // Bahrain GP
            'jeddah': 90,          // Saudi Arabia GP
            'australia': 78,       // Australian GP
            'imola': 75,           // Emilia Romagna GP
            'miami': 90,           // Miami GP
            'spain': 78,           // Spanish GP
            'canada': 70,          // Canadian GP
            'austria': 65,         // Austrian GP
            'france': 90,          // French GP (if still on calendar)
            'hungary': 75,         // Hungarian GP
            'netherlands': 72,     // Dutch GP
            'singapore': 100,      // Singapore GP
            'japan': 90,           // Japanese GP
            'qatar': 85,           // Qatar GP
            'mexico': 75,          // Mexican GP
            'vegas': 95,           // Las Vegas GP
            'abu-dhabi': 85,       // Abu Dhabi GP
            'zandvoort': 72,       // Dutch GP
            'paul-ricard': 90,     // French GP
            'hungaroring': 75,     // Hungarian GP
            'spa-francorchamps': 105 // Belgian GP
        };

        // Try to match the selected circuit to known lap times
        if (selectedCircuit) {
            const circuitKey = selectedCircuit.toLowerCase().replace(/\s+/g, '-');

            // Try direct match first
            if (circuitLapTimes[circuitKey]) {
                console.log(`Using circuit-specific lap time for ${selectedCircuit}: ${circuitLapTimes[circuitKey]}s`);
                return circuitLapTimes[circuitKey];
            }

            // Try partial matching
            for (const [key, time] of Object.entries(circuitLapTimes)) {
                if (circuitKey.includes(key) || key.includes(circuitKey)) {
                    console.log(`Using partial match lap time for ${selectedCircuit}: ${time}s`);
                    return time;
                }
            }
        }

        // Final fallback
        console.log(`Using default lap time for ${selectedCircuit || 'unknown circuit'}: 90s`);
        return 90;
    };

    // Updated prepareChartData function with dynamic lap duration
    const prepareChartData = (realData = []) => {
        console.log('Preparing chart data with real data:', realData.length > 0);
        const chartData = [];

        // Get the actual lap duration for this circuit/session
        const actualLapDuration = getActualLapDuration();
        console.log(`Using lap duration: ${actualLapDuration}s for circuit: ${selectedCircuit}`);

        // Check if we have real data to use
        if (realData && realData.length > 0) {
            // ... existing real data handling code remains the same ...
            const groupedData = {};

            const samplePoint = realData[0];
            const hasDistance = 'distance' in samplePoint;
            const hasTime = 'time' in samplePoint;

            const xAxisKey = hasDistance ? 'distance' : hasTime ? 'time' : 'index';

            realData.forEach(point => {
                const key = point[xAxisKey] || point.timestamp || point.index || 0;

                if (!groupedData[key]) {
                    groupedData[key] = {
                        distance: point.distance || 0,
                        time: point.time || '0:00.00',
                        index: point.index || Object.keys(groupedData).length
                    };
                }

                const driverId = point.driver_number;
                if (driverId) {
                    // ... existing data mapping code ...
                    if ('speed' in point) {
                        groupedData[key][`speed${driverId}`] = point.speed;
                    } else if ('Speed' in point) {
                        groupedData[key][`speed${driverId}`] = point.Speed;
                    }

                    if ('throttle' in point) {
                        const throttleValue = point.throttle > 1 ? point.throttle : point.throttle * 100;
                        groupedData[key][`throttle${driverId}`] = throttleValue;
                    } else if ('Throttle' in point) {
                        const throttleValue = point.Throttle > 1 ? point.Throttle : point.Throttle * 100;
                        groupedData[key][`throttle${driverId}`] = throttleValue;
                    }

                    if ('brake' in point) {
                        const brakeValue = point.brake > 1 ? point.brake : point.brake * 100;
                        groupedData[key][`brake${driverId}`] = brakeValue;
                    } else if ('Brake' in point) {
                        const brakeValue = point.Brake > 1 ? point.Brake : point.Brake * 100;
                        groupedData[key][`brake${driverId}`] = brakeValue;
                    }

                    const dataKeys = Object.keys(point);

                    if (dataKeys.some(k => k.includes('temp') || k.includes('Temp'))) {
                        const tempKey = dataKeys.find(k => k.includes('temp') || k.includes('Temp'));
                        if (tempKey) {
                            groupedData[key][`tireTemp${driverId}`] = point[tempKey];
                        }
                    } else {
                        groupedData[key][`tireTemp${driverId}`] = 85 + (Math.random() * 15);
                    }

                    if (dataKeys.some(k => k.includes('wear') || k.includes('Wear'))) {
                        const wearKey = dataKeys.find(k => k.includes('wear') || k.includes('Wear'));
                        if (wearKey) {
                            groupedData[key][`tireWear${driverId}`] = point[wearKey];
                        }
                    } else {
                        groupedData[key][`tireWear${driverId}`] = Math.max(0, 100 - (selectedLap * 2) - (Math.random() * 5));
                    }

                    if ('drs' in point) {
                        groupedData[key][`drs${driverId}`] = point.drs;
                    }

                    if ('rpm' in point || 'RPM' in point || 'engine_rpm' in point) {
                        groupedData[key][`rpm${driverId}`] = point.rpm || point.RPM || point.engine_rpm || 0;
                    }
                }
            });

            chartData.push(...Object.values(groupedData));

            if (hasDistance) {
                chartData.sort((a, b) => a.distance - b.distance);
            } else if (hasTime) {
                chartData.sort((a, b) => {
                    if (typeof a.time === 'string' && typeof b.time === 'string') {
                        return a.time.localeCompare(b.time);
                    }
                    return a.index - b.index;
                });
            } else {
                chartData.sort((a, b) => a.index - b.index);
            }

            console.log('Prepared real chart data:', chartData.length, 'points');
        } else {
            // Generate synthetic data points with the correct lap duration
            console.log(`Generating synthetic chart data with ${actualLapDuration}s lap duration`);
            const numPoints = 50; // Number of data points per lap

            // Create base data points with the actual lap duration
            for (let i = 0; i < numPoints; i++) {
                const time = (i * actualLapDuration / numPoints);
                const minutes = Math.floor(time / 60);
                const seconds = (time % 60).toFixed(2);

                chartData.push({
                    index: i,
                    distance: i * 100, // Approximate distance in meters
                    time: `${minutes}:${seconds.padStart(5, '0')}`
                });
            }

            // Define track sections that scale with lap duration
            const sectionCount = Math.max(8, Math.floor(actualLapDuration / 10)); // More sections for longer tracks
            const trackSections = [];

            // Dynamically create track sections based on lap duration
            let currentStart = 0;
            const sectionTypes = ['straight', 'hardBraking', 'corner', 'straight', 'hardBraking', 'corner', 'chicane', 'straight'];

            for (let i = 0; i < sectionCount; i++) {
                const sectionLength = Math.floor(numPoints / sectionCount);
                const sectionEnd = Math.min(currentStart + sectionLength, numPoints);

                trackSections.push({
                    start: currentStart,
                    end: sectionEnd,
                    type: sectionTypes[i % sectionTypes.length]
                });

                currentStart = sectionEnd;
            }

            console.log(`Created ${trackSections.length} track sections for ${actualLapDuration}s lap`);

            // Add data for each selected driver with the correct timing
            selectedDrivers.forEach(driverId => {
                if (drivers[driverId]) {
                    const driverIndex = parseInt(driverId) % 5;
                    const baseSpeed = 280 - (driverIndex * 5);
                    const baseThrottle = 0.8 + (Math.random() * 0.2);

                    const driverLateBreaking = 0.7 + (((parseInt(driverId) % 10) / 10) * 0.6);
                    const driverCornerSpeed = 0.8 + (((parseInt(driverId) % 7) / 10) * 0.4);
                    const driverAcceleration = 0.9 + (((parseInt(driverId) % 5) / 10) * 0.3);

                    chartData.forEach((point, index) => {
                        const currentSection = trackSections.find(
                            section => index >= section.start && index < section.end
                        ) || { type: 'straight' };

                        let speedVariation = 0;
                        let isBraking = false;

                        switch (currentSection.type) {
                            case 'straight':
                                speedVariation = 40 + Math.sin(index * 0.8) * 10;
                                break;
                            case 'hardBraking':
                                speedVariation = -70 - (Math.random() * 30);
                                isBraking = true;
                                break;
                            case 'corner':
                                speedVariation = -50 * driverCornerSpeed - (Math.sin(index) * 10);
                                break;
                            case 'chicane':
                                speedVariation = -30 + Math.sin(index * 1.5) * 25;
                                isBraking = index % 2 === 0;
                                break;
                            default:
                                speedVariation = 0;
                        }

                        const speed = Math.max(
                            70,
                            Math.min(
                                330,
                                baseSpeed + speedVariation * (isBraking ? driverLateBreaking : driverAcceleration)
                            )
                        );

                        const throttle = isBraking
                            ? Math.max(0, Math.min(30, Math.random() * 30))
                            : Math.min(100, baseThrottle * 100 * (
                                currentSection.type === 'straight'
                                    ? 1
                                    : 0.6 + (driverAcceleration * 0.4)
                            ));

                        const brake = isBraking
                            ? 70 + (Math.random() * 30)
                            : Math.max(0, Math.min(20, (-speedVariation / 5) * driverLateBreaking));

                        const cornerIntensity = currentSection.type === 'corner' ? 8 :
                            currentSection.type === 'chicane' ? 6 : 0;

                        const baseTemp = 85 + (Math.random() * 10);
                        const tempVariation = Math.sin(index / numPoints * Math.PI * 2) * 10;
                        const tireTemp = baseTemp + tempVariation + cornerIntensity;

                        const baseWear = 100 - (selectedLap * 2);
                        const cornerWear = currentSection.type === 'corner' ? 0.3 :
                            currentSection.type === 'hardBraking' ? 0.2 : 0;
                        const wearVariation = (Math.random() * 5) + cornerWear;
                        const tireWear = Math.max(0, baseWear - wearVariation);

                        point[`speed${driverId}`] = Math.floor(speed);
                        point[`throttle${driverId}`] = Math.floor(throttle);
                        point[`brake${driverId}`] = Math.floor(brake);
                        point[`tireTemp${driverId}`] = Math.floor(tireTemp);
                        point[`tireWear${driverId}`] = Math.floor(tireWear);
                    });
                }
            });

            // Add DRS zones based on lap duration
            const drsZoneStart1 = Math.floor(numPoints * 0.2);
            const drsZoneEnd1 = Math.floor(numPoints * 0.4);
            const drsZoneStart2 = Math.floor(numPoints * 0.8);

            chartData.forEach((point, index) => {
                if ((index >= drsZoneStart1 && index <= drsZoneEnd1) || index >= drsZoneStart2) {
                    selectedDrivers.forEach(driverId => {
                        point[`drs${driverId}`] = Math.random() > 0.5 ? 1 : 0;
                    });
                }
            });
        }

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
                const lapData = driverLapData[0];
                console.log(`Lap data for driver ${driverId}, lap ${selectedLap}:`, lapData);

                // Extract sector times - handle different possible field names
                let s1 = lapData.sector_1_time || lapData.duration_sector_1 || lapData.s1;
                let s2 = lapData.sector_2_time || lapData.duration_sector_2 || lapData.s2;
                let s3 = lapData.sector_3_time || lapData.duration_sector_3 || lapData.s3;
                let total = lapData.lap_time || lapData.lap_duration || lapData.total_time;

                // Convert times to seconds if they're in milliseconds
                const convertToSeconds = (time) => {
                    if (!time || time === 0) return null;
                    // If the time is greater than 300 seconds (5 minutes), it's likely in milliseconds
                    return time > 300 ? time / 1000 : time;
                };

                s1 = convertToSeconds(s1);
                s2 = convertToSeconds(s2);
                s3 = convertToSeconds(s3);
                total = convertToSeconds(total);

                // Check if we have valid data for sectors
                const hasS1 = s1 !== null && s1 !== undefined && s1 > 0;
                const hasS2 = s2 !== null && s2 !== undefined && s2 > 0;
                const hasS3 = s3 !== null && s3 !== undefined && s3 > 0;
                const hasTotal = total !== null && total !== undefined && total > 0;

                // Strategy for handling missing sector 1 times:
                // 1. If we have total and other sectors, calculate S1
                // 2. If we only have S2 and S3, estimate total and calculate S1
                // 3. If we have no sector data but have total, distribute it roughly

                if (!hasS1 && hasTotal && hasS2 && hasS3) {
                    // Calculate S1 from total minus other sectors
                    s1 = total - s2 - s3;
                    if (s1 < 0 || s1 > 60) { // Sanity check - S1 shouldn't be negative or too large
                        s1 = null;
                    }
                } else if (!hasS1 && hasS2 && hasS3 && !hasTotal) {
                    // Estimate total from S2 and S3, then estimate S1
                    // Typical S1 is about 30-35% of lap time
                    const estimatedTotal = (s2 + s3) / 0.65; // S2+S3 typically ~65% of lap
                    s1 = estimatedTotal * 0.35; // S1 typically ~35% of lap
                    total = estimatedTotal;
                } else if (!hasS1 && !hasS2 && !hasS3 && hasTotal) {
                    // Distribute total time across sectors (rough estimates)
                    s1 = total * 0.35; // ~35% for sector 1
                    s2 = total * 0.33; // ~33% for sector 2
                    s3 = total * 0.32; // ~32% for sector 3
                }

                // Final validation and fallback
                const finalS1 = (hasS1 || s1 > 0) ? s1 : null;
                const finalS2 = hasS2 ? s2 : null;
                const finalS3 = hasS3 ? s3 : null;
                const finalTotal = hasTotal ? total : (finalS1 && finalS2 && finalS3) ? finalS1 + finalS2 + finalS3 : null;

                const hasAnyData = finalS1 || finalS2 || finalS3 || finalTotal;

                sectorTimes[driverId] = {
                    s1: finalS1 || 0,
                    s2: finalS2 || 0,
                    s3: finalS3 || 0,
                    total: finalTotal || 0,
                    hasData: hasAnyData,
                    hasS1: !!finalS1,
                    hasS2: !!finalS2,
                    hasS3: !!finalS3,
                    isS1Estimated: !hasS1 && !!finalS1, // Track if S1 was estimated
                    isS2Estimated: !hasS2 && !!finalS2,
                    isS3Estimated: !hasS3 && !!finalS3,
                    rawData: { // Keep raw data for debugging
                        originalS1: lapData.sector_1_time,
                        originalS2: lapData.sector_2_time,
                        originalS3: lapData.sector_3_time,
                        originalTotal: lapData.lap_time
                    }
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
                    hasS1: false,
                    hasS2: false,
                    hasS3: false,
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
            // Only consider times that have real data
            if (times.hasS1 && times.s1 > 0 && times.s1 < best.s1) best.s1 = times.s1;
            if (times.hasS2 && times.s2 > 0 && times.s2 < best.s2) best.s2 = times.s2;
            if (times.hasS3 && times.s3 > 0 && times.s3 < best.s3) best.s3 = times.s3;
            if (times.hasData && times.total > 0 && times.total < best.total) best.total = times.total;
        });

        return best;
    };

    // Format time with appropriate color based on comparison to best time
    const formatTimeWithColor = (time, bestTime, noData, isEstimated = false, hasRealData = true) => {
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

        // Show different indicators for estimated vs real data
        const indicator = isEstimated ? '≈' : hasRealData ? '' : '*';

        return (
            <span className={color}>
            {indicator}{timeValue.toFixed(3)}s {diff !== 0 && <span className="text-xs">({sign}{diff.toFixed(3)}s)</span>}
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

    // Update the preparePitStopData function to handle the starting compound
    const preparePitStopData = () => {
        console.log('🔧 preparePitStopData called');
        const pitStopData = [];

        selectedDrivers.forEach(driverId => {
            const driverName = drivers[driverId]?.name || `Driver ${driverId}`;
            const driverColor = getDriverColor(driverId);

            const driverPitStops = pitStops.filter(pit => {
                const pitDriverId = pit.driver_number || pit.driver_id || pit.driverId;
                return pitDriverId == driverId;
            });

            const driverStints = stints.filter(stint => {
                const stintDriverId = stint.driver_number || stint.driver_id || stint.driverId;
                return stintDriverId == driverId;
            });

            let processedPitStops = [];
            let totalPitTime = 0;
            let hasRealData = false;
            let strategy = 'No data';

            if (driverPitStops.length > 0) {
                hasRealData = true;
                processedPitStops = driverPitStops.map(stop => {
                    const lapNumber = stop.lap_number || stop.lap || stop.pit_lap || 0;
                    const duration = stop.pit_duration || stop.duration || stop.pit_time || 0;
                    const durationInSeconds = duration > 100 ? duration / 1000 : duration;

                    totalPitTime += durationInSeconds;

                    let tireCompound = stop.compound || stop.tire_compound || stop.tyre_compound || 'medium';
                    tireCompound = tireCompound.toLowerCase();

                    return {
                        lap: lapNumber,
                        duration: durationInSeconds,
                        tireCompound: tireCompound
                    };
                });

                processedPitStops.sort((a, b) => a.lap - b.lap);
            }

            // Build complete strategy including starting compound
            if (driverStints.length > 0) {
                // Sort stints by stint number or start lap
                const sortedStints = driverStints.sort((a, b) => {
                    const aStart = a.stint_number || a.lap_start || a.start_lap || 0;
                    const bStart = b.stint_number || b.lap_start || b.start_lap || 0;
                    return aStart - bStart;
                });

                strategy = sortedStints
                    .map(stint => {
                        const compound = stint.compound || stint.tire_compound || stint.tyre_compound || 'Medium';
                        return compound.charAt(0).toUpperCase() + compound.slice(1).toLowerCase();
                    })
                    .join(' → ');

                // Update pit stop compounds based on stint transitions
                if (processedPitStops.length > 0 && sortedStints.length > 1) {
                    processedPitStops.forEach((stop, index) => {
                        // The pit stop should lead to the next stint
                        if (index + 1 < sortedStints.length) {
                            const nextStint = sortedStints[index + 1];
                            if (nextStint && nextStint.compound) {
                                stop.tireCompound = nextStint.compound.toLowerCase();
                            }
                        }
                    });
                }
            }

            pitStopData.push({
                driver: driverName,
                color: driverColor,
                stops: processedPitStops.length,
                strategy: strategy,
                totalPitTime: totalPitTime,
                pitStops: processedPitStops,
                hasRealData: hasRealData
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

    // Create a reusable chart theme object
    const chartTheme = {
        cartesianGrid: {
            strokeDasharray: "3 3",
            opacity: 0.2, // Increase from 0.1 for better visibility
            stroke: isDarkMode ? "#555" : "#ccc" // Darker grid in dark mode
        },
        xAxis: {
            tick: { fill: isDarkMode ? "#f0f0f0" : "#333" },
            label: { fill: isDarkMode ? "#f0f0f0" : "#333" }
        },
        yAxis: {
            tick: { fill: isDarkMode ? "#f0f0f0" : "#333" },
            label: { fill: isDarkMode ? "#f0f0f0" : "#333" }
        },
        tooltip: {
            contentStyle: {
                backgroundColor: isDarkMode ? "#333" : "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                color: isDarkMode ? "#f0f0f0" : "#333"
            }
        },
        legend: {
            wrapperStyle: {
                color: isDarkMode ? "#f0f0f0" : "#333",
                paddingTop: "10px"
            }
        },
        lineStyle: {
            strokeWidth: 2.5, // Thicker lines
            dot: false,
            activeDot: {
                r: 7,
                strokeWidth: 1.5,
                stroke: isDarkMode ? "#222" : "#fff"
            }
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
                                                <td className="p-2 font-medium" style={{ color: getDriverColor(driverId) }}>
                                                    {drivers[driverId]?.name || `Driver ${driverId}`}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(
                                                        times.s1,
                                                        bestSectorTimes.s1,
                                                        !times.hasS1,
                                                        times.isS1Estimated,
                                                        times.hasData
                                                    )}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(
                                                        times.s2,
                                                        bestSectorTimes.s2,
                                                        !times.hasS2,
                                                        times.isS2Estimated,
                                                        times.hasData
                                                    )}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {formatTimeWithColor(
                                                        times.s3,
                                                        bestSectorTimes.s3,
                                                        !times.hasS3,
                                                        times.isS3Estimated,
                                                        times.hasData
                                                    )}
                                                </td>
                                                <td className="p-2 text-center font-bold">
                                                    {formatTimeWithColor(
                                                        times.total,
                                                        bestSectorTimes.total,
                                                        !times.hasData,
                                                        false, // Total time is rarely estimated
                                                        times.hasData
                                                    )}
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

                            {/* Add legend for sector times */}
                            <div className="text-xs text-gray-400 mt-2 text-center">
                                <div>≈ = Estimated time | * = Synthetic data | No symbol = Real telemetry</div>
                                {Object.values(sectorTimes).some(times => times.isS1Estimated) && (
                                    <div>Note: Some sector 1 times are estimated due to timing system limitations</div>
                                )}
                            </div>
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
                    {/* Error notification for data loading issues */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300">
                            <h4 className="font-bold mb-1">Error Loading Data</h4>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
                {/* Charts Section */}
                {chartData.length > 0 && (
                    <div className="space-y-8">
                        {/* Data source indicator */}
                        <div className="flex justify-between items-center mb-4">
                            <div></div>
                            <div className="text-xs text-gray-400">
                                {usingRealData ? (
                                    <span className="text-cyan-400">Using real telemetry data</span>
                                ) : (
                                    <span>Using synthetic telemetry simulation</span>
                                )}
                            </div>
                        </div>
                        {/* Speed Chart - Enhanced with Spiky Appearance */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span>Speed Comparison</span>
                                {usingRealData && (
                                    <span className="text-xs text-cyan-400 ml-2 font-normal">(Using Real Telemetry)</span>
                                )}
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid {...chartTheme.cartesianGrid} />
                                        <XAxis
                                            dataKey={usingRealData && chartData[0]?.distance ? "distance" : "time"}
                                            tick={chartTheme.xAxis.tick}
                                            label={{
                                                value: usingRealData && chartData[0]?.distance ? 'Distance (m)' : 'Time',
                                                position: 'insideBottom',
                                                offset: -5,
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                        />
                                        <YAxis
                                            label={{
                                                value: 'Speed (km/h)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { textAnchor: 'middle' },
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                            domain={[0, 'auto']}
                                            tick={chartTheme.yAxis.tick}
                                        />
                                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                        <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && chartData.some(point => `speed${driverId}` in point) && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`speed${driverId}`}
                                                    name={`${drivers[driverId].name} Speed`}
                                                    stroke={getDriverColor(driverId)}
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 1, stroke: isDarkMode ? "#222" : "#fff" }}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                    connectNulls={true}
                                                    // The settings below create a more pronounced "spiky" look
                                                    isAnimationActive={true}
                                                    animationDuration={500}
                                                    // Use 'linear' instead of 'monotone' for sharper corners
                                                    type="linear"
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Throttle/Brake Chart - Enhanced with Real Data Handling */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span>Throttle & Brake Comparison</span>
                                {usingRealData && (
                                    <span className="text-xs text-cyan-400 ml-2 font-normal">(Using Real Telemetry)</span>
                                )}
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid {...chartTheme.cartesianGrid} />
                                        <XAxis
                                            dataKey={usingRealData && chartData[0]?.distance ? "distance" : "time"}
                                            tick={chartTheme.xAxis.tick}
                                            label={{
                                                value: usingRealData && chartData[0]?.distance ? 'Distance (m)' : 'Time',
                                                position: 'insideBottom',
                                                offset: -5,
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                        />
                                        <YAxis
                                            label={{
                                                value: 'Percentage (%)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { textAnchor: 'middle' },
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                            domain={[0, 100]}
                                            tick={chartTheme.yAxis.tick}
                                        />
                                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                        <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />
                                        {selectedDrivers.map(driverId => (
                                            drivers[driverId] && (
                                                <React.Fragment key={`controls-${driverId}`}>
                                                    {chartData.some(point => `throttle${driverId}` in point) && (
                                                        <Line
                                                            type="monotone"
                                                            dataKey={`throttle${driverId}`}
                                                            name={`${drivers[driverId].name} Throttle`}
                                                            stroke={getDriverColor(driverId)}
                                                            dot={chartTheme.lineStyle.dot}
                                                            strokeWidth={chartTheme.lineStyle.strokeWidth}
                                                            activeDot={chartTheme.lineStyle.activeDot}
                                                            connectNulls={true}
                                                        />
                                                    )}
                                                    {chartData.some(point => `brake${driverId}` in point) && (
                                                        <Line
                                                            type="monotone"
                                                            dataKey={`brake${driverId}`}
                                                            name={`${drivers[driverId].name} Brake`}
                                                            stroke={getDriverColor(driverId)}
                                                            dot={chartTheme.lineStyle.dot}
                                                            strokeWidth={chartTheme.lineStyle.strokeWidth - 0.5}
                                                            strokeDasharray="5 5"
                                                            strokeOpacity={0.8}
                                                            connectNulls={true}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tire Temperature Chart - Enhanced with Real Data Handling */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span>Tire Temperature (Estimated)</span>
                                {usingRealData && (
                                    <span className="text-xs text-cyan-400 ml-2 font-normal">
                {chartData.some(point => Object.keys(point).some(key => key.includes('tireTemp')))
                    ? "(Using Real Telemetry)"
                    : "(Using Synthetic Data)"}
            </span>
                                )}
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid {...chartTheme.cartesianGrid} />
                                        <XAxis
                                            dataKey={usingRealData && chartData[0]?.distance ? "distance" : "time"}
                                            tick={chartTheme.xAxis.tick}
                                            label={{
                                                value: usingRealData && chartData[0]?.distance ? 'Distance (m)' : 'Time',
                                                position: 'insideBottom',
                                                offset: -5,
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                        />
                                        <YAxis
                                            label={{
                                                value: 'Temperature (°C)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { textAnchor: 'middle' },
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                            domain={[60, 120]}
                                            tick={chartTheme.yAxis.tick}
                                        />
                                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                        <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && chartData.some(point => `tireTemp${driverId}` in point) && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`tireTemp${driverId}`}
                                                    name={`${drivers[driverId].name} Tire Temp`}
                                                    stroke={getDriverColor(driverId)}
                                                    dot={chartTheme.lineStyle.dot}
                                                    strokeWidth={chartTheme.lineStyle.strokeWidth}
                                                    activeDot={chartTheme.lineStyle.activeDot}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                    connectNulls={true}
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Tire Wear Chart - Enhanced with Real Data Handling */}
                        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <span>Tire Wear (Estimated)</span>
                                {usingRealData && (
                                    <span className="text-xs text-cyan-400 ml-2 font-normal">
                {chartData.some(point => Object.keys(point).some(key => key.includes('tireWear')))
                    ? "(Using Real Telemetry)"
                    : "(Using Synthetic Data)"}
            </span>
                                )}
                            </h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid {...chartTheme.cartesianGrid} />
                                        <XAxis
                                            dataKey={usingRealData && chartData[0]?.distance ? "distance" : "time"}
                                            tick={chartTheme.xAxis.tick}
                                            label={{
                                                value: usingRealData && chartData[0]?.distance ? 'Distance (m)' : 'Time',
                                                position: 'insideBottom',
                                                offset: -5,
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                        />
                                        <YAxis
                                            label={{
                                                value: 'Tire Life (%)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { textAnchor: 'middle' },
                                                fill: chartTheme.yAxis.label.fill
                                            }}
                                            domain={[0, 100]}
                                            tick={chartTheme.yAxis.tick}
                                        />
                                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                        <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />
                                        {selectedDrivers.map((driverId, index) => (
                                            drivers[driverId] && chartData.some(point => `tireWear${driverId}` in point) && (
                                                <Line
                                                    key={driverId}
                                                    type="monotone"
                                                    dataKey={`tireWear${driverId}`}
                                                    name={`${drivers[driverId].name} Tire Wear`}
                                                    stroke={getDriverColor(driverId)}
                                                    dot={chartTheme.lineStyle.dot}
                                                    strokeWidth={chartTheme.lineStyle.strokeWidth}
                                                    activeDot={chartTheme.lineStyle.activeDot}
                                                    strokeDasharray={index % 2 === 1 ? "5 5" : undefined}
                                                    connectNulls={true}
                                                />
                                            )
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Add this before the pit stop strategy table */}
                        <div className="mb-4 p-3 rounded-lg bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-300">
                            <h4 className="font-bold mb-1">Data Availability</h4>
                            <p className="text-sm">
                                Pit Stops: {pitStops.length > 0 ? `${pitStops.length} records found` : 'No data available'} |
                                Stints: {stints.length > 0 ? `${stints.length} records found` : 'No data available'}
                            </p>
                            {pitStops.length === 0 && stints.length === 0 && (
                                <p className="text-xs mt-1 text-yellow-300">
                                    ⚠️ Using synthetic data for demonstration. Real pit stop data may not be available for this session.
                                </p>
                            )}
                        </div>

                        {/* Pit Stop Strategy Section - Enhanced */}
                        {selectedSession && selectedSession.toLowerCase().includes('race') && (
                            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <span>Pit Stop Strategy</span>
                                    {pitStops.length > 0 && (
                                        <span className="text-xs text-cyan-400 ml-2 font-normal">(Using Real Data)</span>
                                    )}
                                </h3>

                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-2">Driver</th>
                                            <th className="p-2">Strategy</th>
                                            <th className="p-2">Stops</th>
                                            <th className="p-2">Total Pit Time</th>
                                            <th className="p-2">Data Source</th>
                                        </tr>
                                        </thead>
                                        {/* Update the table to use memoized data */}
                                        <tbody>
                                        {pitStopData.map((data, index) => (
                                            <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300'}`}>
                                                <td className="p-2 font-medium" style={{ color: data.color }}>
                                                    {data.driver}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center space-x-1">
                                                        {data.strategy.split(' → ').map((compound, i) => (
                                                            <React.Fragment key={i}>
                                                                {i > 0 && <span className="text-gray-400">→</span>}
                                                                <div className="flex items-center space-x-1">
                                                                    <div
                                                                        className="w-3 h-3 rounded-full border border-gray-500"
                                                                        style={{
                                                                            backgroundColor: getTireCompoundColor(compound.toLowerCase()),
                                                                        }}
                                                                        title={compound}
                                                                    ></div>
                                                                    <span className="text-xs text-gray-300">{compound.charAt(0)}</span>
                                                                </div>
                                                            </React.Fragment>
                                                        ))}
                                                        {data.strategy === 'No data' && (
                                                            <span className="text-gray-400 text-xs">No strategy data</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">{data.stops}</td>
                                                <td className="p-2 text-center">
                                                    {data.totalPitTime > 0 ? `${data.totalPitTime.toFixed(3)}s` : 'N/A'}
                                                </td>
                                                <td className="p-2 text-center">
            <span className={`text-xs px-2 py-1 rounded ${
                data.hasRealData
                    ? 'bg-green-500 bg-opacity-20 text-green-400'
                    : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
            }`}>
                {data.hasRealData ? 'Real' : 'Inferred'}
            </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Updated Pit Stop Timeline */}
                                <h4 className="text-lg font-bold mb-2">Pit Stop Timeline</h4>
                                <div className="h-96 p-4 bg-gray-800 rounded-lg">
                                    {(() => {
                                        const data = pitStopData.filter(data => data.pitStops.length > 0);
                                        if (data.length === 0) {
                                            return <div className="text-center text-gray-400">No pit stop data available</div>;
                                        }

                                        // Calculate the actual race length from pit stops
                                        const maxPitStopLap = Math.max(
                                            ...data.flatMap(driver => driver.pitStops.map(stop => stop.lap))
                                        );

                                        // Set realistic race length (typical F1 races are 50-70 laps)
                                        const raceLength = Math.max(maxPitStopLap + 5, 50); // Add 5 laps buffer or minimum 50
                                        const timelineWidth = Math.min(raceLength, 70); // Cap at 70 laps for display

                                        return (
                                            <div className="relative w-full h-full">
                                                {/* Lap scale */}
                                                <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-600">
                                                    <div className="relative h-full">
                                                        {Array.from({length: Math.floor(timelineWidth/10) + 1}, (_, i) => i * 10)
                                                            .filter(lap => lap <= timelineWidth)
                                                            .map(lap => (
                                                                <div
                                                                    key={lap}
                                                                    className="absolute top-0 h-full flex flex-col items-center"
                                                                    style={{ left: `${(lap / timelineWidth) * 100}%` }}
                                                                >
                                                                    <div className="w-px h-2 bg-gray-500"></div>
                                                                    <span className="text-xs text-gray-400 mt-1">L{lap}</span>
                                                                </div>
                                                            ))}

                                                        {/* Race finish line */}
                                                        <div
                                                            className="absolute top-0 h-full flex flex-col items-center border-l-2 border-white border-dashed"
                                                            style={{ left: `${(raceLength / timelineWidth) * 100}%` }}
                                                        >
                                                            <div className="text-xs text-white mt-1 bg-red-600 px-1 rounded">FINISH</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Driver timeline rows */}
                                                <div className="mt-12 space-y-3 pb-20">
                                                    {data.map((driver, driverIndex) => (
                                                        <div key={driverIndex} className="relative h-10 bg-gray-700 rounded-md">
                                                            {/* Driver name */}
                                                            <div className="absolute left-0 top-0 h-full w-20 flex items-center justify-center bg-gray-600 rounded-l-md">
                                <span
                                    className="text-xs font-bold truncate px-1"
                                    style={{ color: driver.color }}
                                >
                                    {driver.driver.split(' ').pop()}
                                </span>
                                                            </div>

                                                            {/* Race timeline - only up to race finish */}
                                                            <div className="absolute left-20 top-1 bottom-1 bg-gradient-to-r from-gray-600 to-gray-500 rounded-r-md"
                                                                 style={{ width: `${(raceLength / timelineWidth) * (100 - (20/100*100))}%` }}>

                                                                {/* Pit stops */}
                                                                {driver.pitStops
                                                                    .filter(stop => stop.lap <= raceLength) // Don't show stops beyond finish
                                                                    .map((stop, stopIndex) => {
                                                                        const position = (stop.lap / timelineWidth) * 100;
                                                                        return (
                                                                            <div
                                                                                key={stopIndex}
                                                                                className="absolute top-0 bottom-0 group z-10"
                                                                                style={{ left: `${position / (raceLength/timelineWidth)}%` }}
                                                                            >
                                                                                {/* Pit stop marker */}
                                                                                <div
                                                                                    className="w-3 h-full rounded cursor-pointer border-2 border-white transform hover:scale-110 transition-transform shadow-lg"
                                                                                    style={{
                                                                                        backgroundColor: getTireCompoundColor(stop.tireCompound),
                                                                                    }}
                                                                                >
                                                                                </div>

                                                                                {/* Tooltip on hover */}
                                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                                                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                                                                        <div className="font-bold">Lap {stop.lap}</div>
                                                                                        <div className="capitalize">{stop.tireCompound} tires</div>
                                                                                        <div>{stop.duration.toFixed(2)}s stop</div>
                                                                                    </div>
                                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Legend - moved to bottom with more space */}
                                                <div className="absolute bottom-2 left-0 right-0 h-16 border-t border-gray-600 pt-3">
                                                    <div className="flex justify-center space-x-6 text-xs">
                                                        {Object.entries(tireCompounds).slice(0, 5).map(([compound, data]) => (
                                                            <div key={compound} className="flex items-center space-x-2">
                                                                <div
                                                                    className="w-4 h-4 rounded border-2 border-white shadow"
                                                                    style={{ backgroundColor: data.color }}
                                                                ></div>
                                                                <span className="text-gray-300 capitalize font-medium">{compound}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-center mt-2">
                                                        <span className="text-xs text-gray-400">• Real: Data from actual pit stop telemetry</span>
                                                        <span className="text-xs text-gray-400 ml-4">• Inferred: Estimated from tire stint changes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Data Source Legend */}
                                <div className="mt-4 text-xs text-gray-400">
                                    <p>• <strong>Real:</strong> Data from actual pit stop telemetry</p>
                                    <p>• <strong>Inferred:</strong> Estimated from tire stint changes</p>
                                    {preparePitStopData().filter(data => data.pitStops.length === 0).length > 0 && (
                                        <p className="text-yellow-400 mt-2">
                                            ⚠️ Some drivers have no pit stop data available for this session
                                        </p>
                                    )}
                                </div>

                                {/* Tire Compound Performance - Enhanced */}
                                <h4 className="text-lg font-bold mt-6 mb-2">Tire Compound Performance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                                    {Object.entries(tireCompounds).map(([name, data]) => (
                                        <div
                                            key={`tire-${name}`}
                                            className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} flex flex-col items-center`}
                                            style={{
                                                boxShadow: isDarkMode ? `0 4px 12px rgba(${name === 'soft' ? '255,0,0' : name === 'medium' ? '255,204,0' : name === 'hard' ? '255,255,255' : name === 'intermediate' ? '0,255,0' : '0,0,255'},0.1)` : 'none'
                                            }}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full mb-2"
                                                style={{
                                                    backgroundColor: data.color,
                                                    border: '1px solid #666',
                                                    boxShadow: isDarkMode ? '0 0 10px rgba(255,255,255,0.2)' : '0 0 5px rgba(0,0,0,0.2)'
                                                }}
                                            ></div>
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
                        )}

                        {/* Weather Impact Analysis - Enhanced */}
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