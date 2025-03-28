/**
 * Implementation of KV Store for local development
 */
import mockKvImplementation from './mockKvImplementation.js';

/**
 * Creates a new KV store instance
 * @param {string} storeName - The name of the store to create
 * @returns {Object} A KV store instance with get, set, and delete methods
 */
export const createKVStore = (storeName) => {
  return {
    /**
     * Get a value from the store
     * @param {string} key - The key to retrieve
     * @returns {Promise<any>} The stored value
     */
    async get(key) {
      return mockKvImplementation.get(storeName, key);
    },

    /**
     * Set a value in the store
     * @param {string} key - The key to set
     * @param {any} value - The value to store
     * @returns {Promise<boolean>} Success status
     */
    async set(key, value) {
      return mockKvImplementation.set(storeName, key, value);
    },

    /**
     * Delete a value from the store
     * @param {string} key - The key to delete
     * @returns {Promise<boolean>} Success status
     */
    async delete(key) {
      return mockKvImplementation.delete(storeName, key);
    }
  };
}; 