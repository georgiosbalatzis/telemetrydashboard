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
    const [dataSource, setDataSource] = useState('local');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMeetings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('meetings', {}, dataSource);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dataSource]);

    const fetchSessions = useCallback(async (circuit) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('sessions', { circuit_name: circuit }, dataSource);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dataSource]);

    const fetchDrivers = useCallback(async (circuit, session) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('drivers', { circuit_name: circuit, session_name: session }, dataSource);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dataSource]);

    const fetchLaps = useCallback(async (circuit, session, driverNumbers) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('laps', { 
                circuit_name: circuit, 
                session_name: session, 
                driver_number: driverNumbers 
            }, dataSource);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dataSource]);

    const fetchCarData = useCallback(async (circuit, session, driverNumbers, lap) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadData('car_data', { 
                circuit_name: circuit, 
                session_name: session, 
                driver_number: driverNumbers, 
                lap_number: lap 
            }, dataSource);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [dataSource]);

    const value = {
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
        setIsLoading,
        error,
        setError,
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