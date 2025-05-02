const BASE_URL = 'https://api.openf1.org/v1';
const LOCAL_DATA_PATH = '/data';

export const DataSources = {
  SAMPLE: 'sample',
  LOCAL: 'local',
  API: 'api'
};

export const fetchData = async (endpoint, params = {}, dataSource = DataSources.API) => {
  if (dataSource === DataSources.SAMPLE) {
    // Return sample data
    return getSampleData(endpoint, params);
  }
  
  if (dataSource === DataSources.LOCAL) {
    // Load from local files
    return getLocalData(endpoint, params);
  }
  
  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => queryParams.append(key, v));
    } else {
      queryParams.append(key, value);
    }
  });
  
  const url = `${BASE_URL}/${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to get local data
const getLocalData = async (endpoint, params = {}) => {
  try {
    let fileName;
    
    // Map endpoints to file names
    switch (endpoint) {
      case 'meetings':
        fileName = '/2025/meetings_2025.json';
        break;
      case 'sessions':
        fileName = '/2025/sessions_2025.json';
        break;
      case 'drivers':
        fileName = '/data/drivers_latest.json';
        break;
      case 'laps':
        fileName = '/data/laps_latest.json';
        break;
      case 'pit':
        fileName = '/data/pit_latest.json';
        break;
      case 'stints':
        fileName = '/data/stints_latest.json';
        break;
      case 'car_data':
        fileName = `/data/car_data_latest_drv${params.driver_number}.json`;
        break;
      default:
        fileName = `/data/${endpoint}_latest.json`;
    }
    
    const response = await fetch(`${LOCAL_DATA_PATH}${fileName}`);
    let data = await response.json();
    
    // Filter data based on params
    if (params.circuit_name) {
      data = data.filter(item => item.circuit_short_name === params.circuit_name);
    }
    
    if (params.session_name) {
      data = data.filter(item => item.session_name === params.session_name);
    }
    
    if (params.driver_number) {
      const driverNumbers = Array.isArray(params.driver_number) 
        ? params.driver_number 
        : [params.driver_number];
      data = data.filter(item => driverNumbers.includes(item.driver_number));
    }
    
    if (params.lap_number) {
      data = data.filter(item => item.lap_number === params.lap_number);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching local data for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to get sample data
const getSampleData = (endpoint, params) => {
  // Import sample data
  const sampleData = {
    meetings: require('../data/sampleData').sampleMeetings,
    sessions: require('../data/sampleData').sampleSessions,
    drivers: require('../data/sampleData').sampleDrivers,
    laps: (circuit, session, drivers) => 
      require('../data/sampleData').generateSampleLapData(circuit, session, drivers),
    car_data: (circuit, session, driver, lap) =>
      require('../data/sampleData').generateSampleTelemetryData(circuit, session, driver, lap),
    pit: (circuit, session, drivers) =>
      require('../data/sampleData').generateSamplePitStops(circuit, session, drivers),
    stints: (circuit, session, drivers) =>
      require('../data/sampleData').generateSampleStints(circuit, session, drivers)
  };

  // Get the appropriate sample data generator
  const dataGenerator = sampleData[endpoint];
  if (!dataGenerator) {
    throw new Error(`No sample data generator for ${endpoint}`);
  }

  // Generate sample data based on parameters
  if (typeof dataGenerator === 'function') {
    return dataGenerator(
      params.circuit_name,
      params.session_name,
      params.driver_number,
      params.lap_number
    );
  }

  return dataGenerator;
}; 