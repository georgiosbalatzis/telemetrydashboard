import { useState, useEffect } from 'react';
import { loadData } from '../utils/dataLoader';

export function useCircuits() {
  const [circuits, setCircuits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCircuits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const meetings = await loadData('meetings', {});
        const uniqueCircuits = [...new Set(meetings.map(m => m.circuit_short_name))];
        setCircuits(uniqueCircuits);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCircuits();
  }, []);

  return { circuits, isLoading, error };
}

export function useSessions(circuit) {
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
        const data = await loadData('sessions', { circuit_name: circuit });
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [circuit]);

  return { sessions, isLoading, error };
}

export function useDrivers(circuit, session) {
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
        });

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
  }, [circuit, session]);

  return { drivers, isLoading, error };
}

export function useLaps(circuit, session, driverNumbers) {
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
        });

        setLaps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLaps();
  }, [circuit, session, driverNumbers]);

  return { laps, isLoading, error };
}

export function useCarData(circuit, session, driverNumbers, lap) {
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
        });

        setCarData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCarData();
  }, [circuit, session, driverNumbers, lap]);

  return { carData, isLoading, error };
}