// utils/openF1DataLoader.js

import { fetchData } from '../api/client';

// Cache for API data
let apiDataCache = null;

// Main function to fetch F1 data from OpenF1 API
export const fetchErgastData = async (year = '2025') => {
    try {
        console.log(`Fetching F1 data for ${year} season from OpenF1 API...`);

        if (apiDataCache) {
            console.log('Using cached data');
            return apiDataCache;
        }

        // 1. Fetch circuits (meetings)
        console.log('Fetching meetings (circuits)...');
        const meetingsResponse = await fetchData('meetings', { year });
        const circuits = processMeetings(meetingsResponse);

        // 2. Fetch sessions
        console.log('Fetching sessions...');
        const sessionsResponse = await fetchData('sessions', { year });
        const sessions = processSessions(sessionsResponse);

        // 3. Find a valid session to get drivers
        let drivers = [];
        if (sessions.length > 0) {
            // Get the first session key to fetch drivers
            const sampleSessionKey = sessionsResponse[0]?.session_key;
            if (sampleSessionKey) {
                console.log(`Fetching drivers for session ${sampleSessionKey}...`);
                const driversResponse = await fetchData('drivers', { session_key: sampleSessionKey });
                drivers = processDrivers(driversResponse);
            }
        }

        // 4. For lap data, we'll fetch on demand
        const laps = [];

        // Combine all data
        apiDataCache = {
            circuits,
            schedule: sessions,
            drivers,
            laps
        };

        return apiDataCache;
    } catch (error) {
        console.error('Error fetching OpenF1 data:', error);

        // Return empty data on error
        return {
            circuits: [],
            schedule: [],
            drivers: [],
            laps: []
        };
    }
};

// Process meetings data to get circuits
const processMeetings = (data) => {
    if (!data || !Array.isArray(data)) {
        console.warn('Invalid meetings data:', data);
        return [];
    }

    return data.map(meeting => ({
        circuit_short_name: meeting.circuit_short_name || `circuit_${meeting.meeting_key}`,
        circuit_name: meeting.circuit_name || `Circuit ${meeting.meeting_key}`,
        location: meeting.location || 'Unknown',
        country_name: meeting.country_name || 'Unknown',
        meeting_key: meeting.meeting_key,
        meeting_name: meeting.meeting_name || meeting.circuit_name,
        meeting_official_name: meeting.meeting_official_name || meeting.meeting_name,
        start_date: meeting.start_date,
        end_date: meeting.end_date
    }));
};

// Process sessions data
const processSessions = (data) => {
    if (!data || !Array.isArray(data)) {
        console.warn('Invalid sessions data:', data);
        return [];
    }

    // Map session types to more user-friendly names
    const sessionTypeMap = {
        'practice_1': 'Practice 1',
        'practice_2': 'Practice 2',
        'practice_3': 'Practice 3',
        'qualifying': 'Qualifying',
        'sprint': 'Sprint',
        'sprint_qualifying': 'Sprint Qualifying',
        'race': 'Race'
    };

    return data.map(session => {
        // Extract circuit short name from the data or use meeting_key
        const circuit_short_name = session.circuit_short_name || `circuit_${session.meeting_key}`;

        return {
            circuit_short_name,
            session_key: `${circuit_short_name}-${session.session_key}`,
            session_name: sessionTypeMap[session.session_type] || session.session_type,
            original_session_key: session.session_key,
            meeting_key: session.meeting_key,
            date: session.date_start || '',
            time: session.time_start || '',
            session_type: session.session_type
        };
    });
};

// Process drivers data
const processDrivers = (data) => {
    if (!data || !Array.isArray(data)) {
        console.warn('Invalid drivers data:', data);
        return [];
    }

    // Process each driver
    return data.map(driver => {
        return {
            driver_number: driver.driver_number,
            full_name: driver.full_name || `Driver ${driver.driver_number}`,
            driver_id: driver.driver_id || `driver_${driver.driver_number}`,
            team_name: driver.team_name || 'Unknown Team',
            team_colour: driver.team_color?.replace('#', '') || '999999',
            // Include the circuit and session info if available
            circuit_short_name: driver.circuit_short_name || 'all',
            session_name: driver.session_name || 'all',
            session_key: driver.session_key
        };
    });
};


export const fetchLapData = async (sessionKey, driverNumbers) => {
    try {
        console.log(`Fetching lap data for session ${sessionKey}, drivers ${driverNumbers.join(', ')}...`);

        // Initialize results array
        const results = [];

        // Fetch data for each driver
        for (const driverNumber of driverNumbers) {
            const lapData = await fetchData('laps', {
                session_key: sessionKey,
                driver_number: driverNumber
            });

            if (Array.isArray(lapData) && lapData.length > 0) {
                console.log(`Found ${lapData.length} laps for driver ${driverNumber}`);

                // Log the complete structure of the first lap for debugging
                console.log(`Example lap data structure for driver ${driverNumber}:`, JSON.stringify(lapData[0], null, 2));

                // Transform the lap data to match our expected format
                const processedLaps = lapData.map(lap => {
                    // Convert durations from milliseconds to seconds if needed
                    const convertToSeconds = (timeInMs) => {
                        if (timeInMs === null || timeInMs === undefined) return 0;
                        // If already in seconds (less than 300), return as is
                        if (timeInMs < 300) return timeInMs;
                        // Otherwise convert from ms to seconds
                        return timeInMs / 1000;
                    };

                    const s1 = convertToSeconds(lap.duration_sector_1);
                    const s2 = convertToSeconds(lap.duration_sector_2);
                    const s3 = convertToSeconds(lap.duration_sector_3);
                    const totalTime = convertToSeconds(lap.lap_duration);

                    // Log processed timings for debugging
                    console.log(`Driver ${driverNumber}, Lap ${lap.lap_number} times:`, {
                        s1, s2, s3, totalTime,
                        originalS1: lap.duration_sector_1,
                        originalS2: lap.duration_sector_2,
                        originalS3: lap.duration_sector_3,
                        originalTotal: lap.lap_duration
                    });

                    return {
                        driver_number: parseInt(lap.driver_number),
                        lap_number: parseInt(lap.lap_number),
                        sector_1_time: s1,
                        sector_2_time: s2,
                        sector_3_time: s3,
                        lap_time: totalTime,
                        circuit_short_name: lap.circuit_short_name || 'unknown',
                        session_name: lap.session_name || 'unknown',
                        position: lap.position || 0,
                        session_key: lap.session_key
                    };
                });

                results.push(...processedLaps);
            } else {
                console.warn(`No lap data found for driver ${driverNumber} in session ${sessionKey}`);
            }
        }

        console.log(`Returning ${results.length} total laps for all drivers`);

        // Log a sample of the processed data
        if (results.length > 0) {
            console.log('Sample of processed lap data:', results[0]);
        }

        return results;
    } catch (error) {
        console.error('Error fetching lap data:', error);
        return [];
    }
};