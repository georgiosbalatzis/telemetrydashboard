import { readJsonFile } from './fileSystem';
import { generateSampleTelemetryData } from '../data/sampleData';
import localMeetings2025 from '../data/2025/meetings_2025.json';
import localSessions2025 from '../data/2025/sessions_2025.json';
import localDriversLatest from '../data/data/drivers_latest.json';
import localLapsLatest from '../data/data/laps_latest.json';
import localPitsLatest from '../data/data/pit_latest.json';
import localStintsLatest from '../data/data/stints_latest.json';

export const DataSources = {
  SAMPLE: 'sample',
  LOCAL: 'local',
  API: 'api'
};

// Prepare a structured local data object
export const prepareLocalData = async () => {
  try {
    // Load all JSON files
    const meetings = localMeetings2025;
    const sessions = localSessions2025;
    const drivers = localDriversLatest;
    const laps = localLapsLatest;
    const pits = localPitsLatest;
    const stints = localStintsLatest;

    // Create a sessions map for quick lookup
    const sessionsMap = new Map(sessions.map(session => [session.session_key, session]));
    
    // Create a meetings map for quick lookup
    const meetingsMap = new Map(meetings.map(meeting => [meeting.meeting_key, meeting]));

    // Enhance drivers with circuit and session info
    const enhancedDrivers = drivers.map(driver => {
      const session = sessionsMap.get(driver.session_key);
      const meeting = meetingsMap.get(driver.meeting_key);
      
      // Log for debugging
      console.log('Enhancing driver:', {
        driver_number: driver.driver_number,
        session_key: driver.session_key,
        meeting_key: driver.meeting_key,
        session: session ? session.session_name : 'not found',
        meeting: meeting ? meeting.circuit_short_name : 'not found'
      });

      return {
        ...driver,
        circuit_short_name: meeting?.circuit_short_name || 'Unknown',
        session_name: session?.session_name || 'Unknown',
        team_name: driver.team_name || 'Unknown',
        team_colour: driver.team_colour || '000000',
        full_name: driver.full_name || `${driver.first_name} ${driver.last_name}`
      };
    });

    // Log the enhanced drivers for debugging
    console.log('Enhanced drivers sample:', enhancedDrivers.slice(0, 5));

    // Enhance laps with circuit and session info
    const enhancedLaps = laps.map(lap => {
      const session = sessionsMap.get(lap.session_key);
      const meeting = meetingsMap.get(lap.meeting_key);
      return {
        ...lap,
        circuit_short_name: meeting?.circuit_short_name || 'Unknown',
        session_name: session?.session_name || 'Unknown'
      };
    });

    // Enhance pits with circuit and session info
    const enhancedPits = pits.map(pit => {
      const session = sessionsMap.get(pit.session_key);
      const meeting = meetingsMap.get(pit.meeting_key);
      return {
        ...pit,
        circuit_short_name: meeting?.circuit_short_name || 'Unknown',
        session_name: session?.session_name || 'Unknown'
      };
    });

    // Enhance stints with circuit and session info
    const enhancedStints = stints.map(stint => {
      const session = sessionsMap.get(stint.session_key);
      const meeting = meetingsMap.get(stint.meeting_key);
      return {
        ...stint,
        circuit_short_name: meeting?.circuit_short_name || 'Unknown',
        session_name: session?.session_name || 'Unknown'
      };
    });

    return {
      meetings,
      sessions,
      drivers: enhancedDrivers,
      laps: enhancedLaps,
      pits: enhancedPits,
      stints: enhancedStints
    };
  } catch (error) {
    console.error('Error preparing local data:', error);
    throw error;
  }
};

export const loadData = async (endpoint, params = {}, dataSource = DataSources.LOCAL) => {
  try {
    if (dataSource === DataSources.LOCAL) {
      const data = await prepareLocalData();
      switch (endpoint) {
        case 'meetings':
          return data.meetings;
        case 'sessions':
          return data.sessions.filter(session => 
            session.circuit_short_name === params.circuit_name
          );
        case 'drivers':
          return data.drivers.filter(driver => 
            driver.circuit_short_name === params.circuit_name &&
            driver.session_name === params.session_name
          );
        case 'laps':
          return data.laps.filter(lap => 
            lap.circuit_short_name === params.circuit_name &&
            lap.session_name === params.session_name &&
            params.driver_number.includes(lap.driver_number)
          );
        case 'car_data':
          return data.laps.filter(lap => 
            lap.circuit_short_name === params.circuit_name &&
            lap.session_name === params.session_name &&
            params.driver_number.includes(lap.driver_number) &&
            lap.lap_number === params.lap_number
          );
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
    } else if (dataSource === DataSources.SAMPLE) {
      // Handle sample data
      return [];
    } else if (dataSource === DataSources.API) {
      // Handle API data
      return [];
    }
  } catch (error) {
    console.error(`Error loading ${endpoint} data:`, error);
    throw error;
  }
};

async function loadLocalData(entityType, params) {
  const filePath = getFilePath(entityType, params);
  const data = await readJsonFile(filePath);
  
  // Apply filters
  return filterData(data, params);
}

function getFilePath(entityType, params) {
  const basePath = 'src/data/data';
  
  // Handle driver-specific files
  if (params.driver_number) {
    return `${basePath}/${entityType}_latest_drv${params.driver_number}.json`;
  }
  
  // Handle regular files
  return `${basePath}/${entityType}_latest.json`;
}

function filterData(data, params) {
  if (!params || !data) return data;
  
  return data.filter(item => {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        if (!value.includes(item[key])) return false;
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

function generateSampleData(entityType, params) {
  switch (entityType) {
    case 'car_data':
      return generateSampleTelemetryData(
        params.circuit_name,
        params.session_name,
        params.driver_number,
        params.lap_number
      );
    // Add other entity types as needed
    default:
      throw new Error(`No sample data generator for ${entityType}`);
  }
} 