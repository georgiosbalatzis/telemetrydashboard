import { loadLocalJsonFile } from './localDataLoader';

// Map of entity types to their JSON files
const entityToFileMap = {
  meetings: 'data/meetings_latest.json',
  sessions: 'data/sessions_latest.json',
  drivers: 'data/drivers_latest.json',
  laps: 'data/laps_latest.json',
  car_data: 'data/car_data_latest.json',
  location: 'data/location_latest.json',
  intervals: 'data/intervals_latest.json',
  race_control: 'data/race_control_latest.json',
  pit: 'data/pit_latest.json',
  stints: 'data/stints_latest.json',
  team_radio: 'data/team_radio_latest.json',
  position: 'data/position_latest.json'
};

// Driver-specific files
const driverSpecificFiles = ['car_data', 'team_radio', 'location'];

export async function loadEntityData(entityType, filters = {}) {
  try {
    // Get the appropriate file name
    let fileName = entityToFileMap[entityType];
    
    if (!fileName) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }
    
    // For driver-specific files, append driver number if provided
    if (driverSpecificFiles.includes(entityType) && filters.driver_number) {
      fileName = fileName.replace('_latest.json', `_latest_drv${filters.driver_number}.json`);
    }
    
    // Load file
    const data = await loadLocalJsonFile(fileName);
    
    // Apply filters
    let filteredData = data;
    
    if (filters) {
      filteredData = data.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          // Handle array values (e.g. multiple driver numbers)
          if (Array.isArray(value)) {
            if (!value.includes(item[key])) {
              return false;
            }
          } 
          // Handle single values
          else if (item[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return filteredData;
  } catch (error) {
    console.error(`Error loading entity ${entityType}:`, error);
    throw error;
  }
}

// Example usage:
// const lapData = await loadEntityData('laps', { 
//   driver_number: [1, 44], 
//   lap_number: 5 
// }); 