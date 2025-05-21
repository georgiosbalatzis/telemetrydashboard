// utils/dataLoader.js

import { fetchErgastData, fetchLapData } from './openF1DataLoader';

// API data cache to avoid repeated fetching
let apiDataCache = null;

// Load data from API based on entity type and parameters
export const loadData = async (entityType, params = {}) => {
  try {
    // Load API data if not already cached
    if (!apiDataCache) {
      apiDataCache = await fetchErgastData();
    }

    // Special handling for laps - we need to fetch them on demand
    if (entityType === 'laps' && params.session_key && params.driver_number) {
      const lapData = await fetchLapData(
          params.session_key,
          Array.isArray(params.driver_number) ? params.driver_number : [params.driver_number]
      );
      return lapData;
    }

    // Get the requested entity data
    let data = apiDataCache[entityType] || [];

    // Apply filters based on params
    if (params.circuit_name) {
      data = data.filter(item =>
          item.circuit_short_name === params.circuit_name ||
          item.circuit_short_name === 'all'
      );
    }

    if (params.session_name) {
      data = data.filter(item =>
          item.session_name === params.session_name ||
          item.session_name === 'all'
      );
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
    console.error(`Error loading ${entityType} data:`, error);
    throw error;
  }
};