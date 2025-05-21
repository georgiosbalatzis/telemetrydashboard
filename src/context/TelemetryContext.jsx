import React, { createContext, useContext, useState, useCallback } from 'react';
import { loadData } from '../utils/dataLoader';

// Create context at the top level
const TelemetryContext = createContext();

// Define provider component
export const TelemetryProvider = ({ children }) => {
    const [selectedCircuit, setSelectedCircuit] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedDrivers, setSelectedDrivers] = useState([]);
    const [selectedLap, setSelectedLap] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode);
    }, []);

    const fetchMeetings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('circuits', {});
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('schedule', { circuit_name: selectedCircuit });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [selectedCircuit]);

    const fetchDrivers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('drivers', {
                circuit_name: selectedCircuit,
                session_name: selectedSession
            });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [selectedCircuit, selectedSession]);

    // Modified version of fetchLaps function in TelemetryContext.jsx
    const fetchLaps = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Find the session key for the selected circuit and session
            const sessions = await loadData('schedule', {
                circuit_name: selectedCircuit,
                session_name: selectedSession
            });

            const sessionKey = sessions.length > 0
                ? sessions[0].original_session_key
                : null;

            if (!sessionKey) {
                console.error('Could not find session key for', selectedCircuit, selectedSession);
                console.log('Available sessions:', sessions);
                throw new Error('Could not find session key for selected circuit and session');
            }

            console.log(`Found session key ${sessionKey} for ${selectedCircuit} ${selectedSession}`);

            const data = await loadData('laps', {
                session_key: sessionKey,
                driver_number: selectedDrivers
            });

            console.log(`Fetch laps returned ${data.length} laps`);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [selectedCircuit, selectedSession, selectedDrivers, loadData]);

    const fetchCarData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('car_data', {
                circuit_name: selectedCircuit,
                session_name: selectedSession,
                driver_number: selectedDrivers,
                lap_number: selectedLap
            });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [selectedCircuit, selectedSession, selectedDrivers, selectedLap]);

    const value = {
        selectedCircuit,
        setSelectedCircuit,
        selectedSession,
        setSelectedSession,
        selectedDrivers,
        setSelectedDrivers,
        selectedLap,
        setSelectedLap,
        isLoading,
        setIsLoading,
        error,
        setError,
        isDarkMode,
        toggleTheme,
        fetchMeetings,
        fetchSessions,
        fetchDrivers,
        fetchLaps,
        fetchCarData
    };

    return (
        <TelemetryContext.Provider value={value}>
            {children}
        </TelemetryContext.Provider>
    );
};

// Define hook after provider
export const useTelemetryContext = () => {
    const context = useContext(TelemetryContext);
    if (!context) {
        throw new Error('useTelemetryContext must be used within a TelemetryProvider');
    }
    return context;
};