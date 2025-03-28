/**
 * In-memory storage for mock data
 */
import defaultMockData from './defaultMockData.json';
import { validateMockData } from './validateMockData';
import fs from 'fs';
import path from 'path';

// Default mock data that will be used if no local file exists
const defaultData = {
  // Secret store data
  'dash_jwt_secret': 'mock-jwt-secret-123456',
  'git_encryption_key': 'mock-encryption-key-abcdef',
  
  // Store references
  'user_store': 'mock-user-store',
  'team_store': 'mock-team-store',
  'project_store': 'mock-project-store',
  
  // Mock user data
  'mock-user-store': {
    'auth0-123456': {
      username: 'mockuser',
      password: 'mockpassword123',
      teams: [
        {
          id: 'mock-team-1',
          role: 'owner',
          joined_at: new Date().toISOString()
        }
      ]
    }
  },
  
  // Mock team data
  'mock-team-store': {
    'mock-team-1': {
      name: 'Mock Team',
      owner: 'auth0-123456',
      members: ['auth0-123456'],
      projects: ['mock-project-1'],
      created_at: new Date().toISOString()
    }
  },
  
  // Mock project data
  'mock-project-store': {
    'mock-project-1': {
      name: 'Mock Project',
      team: 'mock-team-1',
      created_at: new Date().toISOString()
    }
  }
};

// Try to load local mock data if it exists
let mockData = { ...defaultData };
try {
  const localMockDataPath = path.join(process.cwd(), 'mockData.json');
  if (fs.existsSync(localMockDataPath)) {
    const localMockData = JSON.parse(fs.readFileSync(localMockDataPath, 'utf8'));
    
    // Validate the local mock data
    const validation = validateMockData(localMockData);
    if (!validation.isValid) {
      console.error('Invalid mock data structure in mockData.json:');
      validation.errors.forEach(error => console.error(`- ${error}`));
      console.warn('Using default mock data instead');
    } else {
      mockData = { ...mockData, ...localMockData };
      console.log('Successfully loaded custom mock data from mockData.json');
    }
  }
} catch (error) {
  console.warn('Failed to load local mock data, using defaults:', error.message);
}

/**
 * Get the actual store name from a store reference or return the given name
 * @param {string} storeName - The store name or reference
 * @returns {string} The actual store name
 */
function resolveStoreName(storeName) {
  // If it's a store reference, return the actual store name
  if (mockData[storeName] && typeof mockData[storeName] === 'string') {
    return mockData[storeName];
  }
  // Otherwise, return the name as is
  return storeName;
}

/**
 * Mock implementation of KV Store for local development
 */
const mockKvImplementation = {
  // Expose the mock data for testing
  _mockData: mockData,
  
  /**
   * Reset the mock data to the provided value or the default
   * @param {Object} data - The data to set
   */
  _reset(data = null) {
    this._mockData = data || { ...defaultData };
    mockData = this._mockData;
  },

  /**
   * Get a value from the store
   * @param {string} storeName - The name of the store
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} The stored value
   */
  async get(storeName, key) {
    // If storeName is null, look for key in root
    if (!storeName) {
      return mockData[key] || null;
    }
    
    // Resolve the actual store name
    const actualStoreName = resolveStoreName(storeName);
    
    // If the store doesn't exist, return null
    if (!mockData[actualStoreName]) {
      return null;
    }
    
    return mockData[actualStoreName][key] || null;
  },

  /**
   * Set a value in the store
   * @param {string} storeName - The name of the store
   * @param {string} key - The key to set
   * @param {any} value - The value to store
   * @returns {Promise<boolean>} Success status
   */
  async set(storeName, key, value) {
    // If storeName is null, store in root
    if (!storeName) {
      mockData[key] = value;
      return true;
    }
    
    // Resolve the actual store name
    const actualStoreName = resolveStoreName(storeName);
    
    // Create the store if it doesn't exist
    if (!mockData[actualStoreName]) {
      mockData[actualStoreName] = {};
    }
    
    // Set the value in the store
    mockData[actualStoreName][key] = value;
    return true;
  },

  /**
   * Delete a value from the store
   * @param {string} storeName - The name of the store
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} Success status
   */
  async delete(storeName, key) {
    // If storeName is null, delete from root
    if (!storeName) {
      delete mockData[key];
      return true;
    }
    
    // Resolve the actual store name
    const actualStoreName = resolveStoreName(storeName);
    
    if (mockData[actualStoreName]) {
      delete mockData[actualStoreName][key];
    }
    return true;
  }
};

export default mockKvImplementation; 