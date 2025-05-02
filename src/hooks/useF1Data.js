import { useState, useEffect } from 'react';
import { loadData, DataSources } from '../utils/dataLoader';

export function useCircuits(dataSource = DataSources.LOCAL) {
  const [circuits, setCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCircuits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const meetings = await loadData('meetings', {}, dataSource);
        const uniqueCircuits = [...new Set(meetings.map(m => m.circuit_short_name))];
        setCircuits(uniqueCircuits);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCircuits();
  }, [dataSource]);

  return { circuits, isLoading, error };
}

export function useSessions(circuit, dataSource = DataSources.LOCAL) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!circuit) {
      setSessions([]);
      return;
    }

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadData('sessions', { circuit_name: circuit }, dataSource);
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [circuit, dataSource]);

  return { sessions, isLoading, error };
}

export function useDrivers(circuit, session, dataSource = DataSources.LOCAL) {
  const [drivers, setDrivers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!circuit || !session) {
      setDrivers({});
      return;
    }

    const loadDrivers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadData('drivers', {
          circuit_name: circuit,
          session_name: session
        }, dataSource);
        
        // Format drivers data
        const driversObj = {};
        data.forEach(driver => {
          if (driver.driver_number) {
            const driverNum = String(driver.driver_number);
            driversObj[driverNum] = {
              number: driver.driver_number,
              name: driver.first_name && driver.last_name 
                ? `${driver.first_name} ${driver.last_name}`
                : `Driver ${driver.driver_number}`,
              team: driver.team_name || 'Unknown Team',
              color: driver.team_color || "#999999",
              data: []
            };
          }
        });
        
        setDrivers(driversObj);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrivers();
  }, [circuit, session, dataSource]);

  return { drivers, isLoading, error };
}

export function useLaps(circuit, session, driverNumbers, dataSource = DataSources.LOCAL) {
  const [laps, setLaps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!circuit || !session || !driverNumbers.length) {
      setLaps([]);
      return;
    }

    const loadLaps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadData('laps', {
          circuit_name: circuit,
          session_name: session,
          driver_number: driverNumbers
        }, dataSource);
        
        setLaps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLaps();
  }, [circuit, session, driverNumbers, dataSource]);

  return { laps, isLoading, error };
}

export function useCarData(circuit, session, driverNumbers, lap, dataSource = DataSources.LOCAL) {
  const [carData, setCarData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!circuit || !session || !driverNumbers.length || !lap) {
      setCarData([]);
      return;
    }

    const loadCarData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadData('car_data', {
          circuit_name: circuit,
          session_name: session,
          driver_number: driverNumbers,
          lap_number: lap
        }, dataSource);
        
        setCarData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCarData();
  }, [circuit, session, driverNumbers, lap, dataSource]);

  return { carData, isLoading, error };
} 