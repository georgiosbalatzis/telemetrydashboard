import { readJsonFile } from '../utils/fileSystem';

export async function loadLocalJsonFile(filePath) {
  try {
    // Handle both direct file paths and paths relative to src/data
    const fullPath = filePath.startsWith('data/') 
      ? `src/${filePath}`
      : `src/data/${filePath}`;
    
    return await readJsonFile(fullPath);
  } catch (error) {
    console.error(`Error loading local file ${filePath}:`, error);
    throw error;
  }
} 