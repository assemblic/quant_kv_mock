import KVStore from './kvStore.js';
import quantKvImplementation from './quantKvImplementation.js';
import mockKvImplementation from './mockKvImplementation.js';

/**
 * Factory function to create a KV Store instance
 * @param {string} storeName - The name of the store to create
 * @returns {KVStore} A new KV Store instance
 */
export const createKVStore = (storeName) => {
  const implementation = process.env.USE_MOCK_KV === 'true'
    ? mockKvImplementation
    : quantKvImplementation;
  
  return new KVStore(storeName, implementation);
};

// Export the KVStore class for direct use if needed
export { default as KVStore } from './kvStore.js'; 