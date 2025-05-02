export const readJsonFile = async (filePath) => {
  try {
    // Ensure the path is relative to the project root
    const fullPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const content = await window.fs.readFile(fullPath, { encoding: 'utf8' });
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Failed to read ${filePath}: ${error.message}`);
  }
};

export const batchLoadFiles = async (fileNames) => {
  try {
    const results = {};
    await Promise.all(
      fileNames.map(async (fileName) => {
        try {
          // Ensure paths are relative to src/data
          const fullPath = fileName.startsWith('data/') 
            ? `src/${fileName}`
            : `src/data/${fileName}`;
          results[fileName] = await readJsonFile(fullPath);
        } catch (error) {
          console.warn(`Unable to load ${fileName}: ${error.message}`);
          results[fileName] = null;
        }
      })
    );
    return results;
  } catch (error) {
    console.error("Error in batch loading files:", error);
    throw error;
  }
};

// Example batch loading
export const loadAllF1Data = async () => {
  const dataFiles = [
    'data/laps_latest.json',
    'data/drivers_latest.json',
    'data/pit_latest.json',
    'data/stints_latest.json',
    'data/sessions_latest.json'
  ];
  
  return batchLoadFiles(dataFiles);
};

// For driver-specific data
export const loadDriverTelemetry = async (driverNumbers = []) => {
  const driverFiles = driverNumbers.map(driverId => `data/car_data_latest_drv${driverId}.json`);
  return batchLoadFiles(driverFiles);
}; 