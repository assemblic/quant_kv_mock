/**
 * Main entry point for the quant_kv_mock package
 */
import mockKvImplementation from './mockKvImplementation.js';
import createKVStore, { KVStore } from './kvStore.js';

// Export both the createKVStore function (default) and KVStore class (named)
export { KVStore };
export default createKVStore; 