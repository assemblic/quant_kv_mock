import { createKVStore } from '../quantKvImplementation.js';

describe('KV Store', () => {
  test('creates a store instance', () => {
    const store = createKVStore('test-store');
    expect(store).toBeDefined();
    expect(typeof store.get).toBe('function');
    expect(typeof store.set).toBe('function');
    expect(typeof store.delete).toBe('function');
  });
});

describe('KVStore', () => {
  let kvStore;

  beforeEach(() => {
    kvStore = createKVStore('test-store');
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await kvStore.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return stored value', async () => {
      await kvStore.set('test-key', 'test-value');
      const result = await kvStore.get('test-key');
      expect(result).toBe('test-value');
    });
  });

  describe('set', () => {
    it('should store and retrieve value', async () => {
      await kvStore.set('test-key', 'test-value');
      const result = await kvStore.get('test-key');
      expect(result).toBe('test-value');
    });

    it('should overwrite existing value', async () => {
      await kvStore.set('test-key', 'old-value');
      await kvStore.set('test-key', 'new-value');
      const result = await kvStore.get('test-key');
      expect(result).toBe('new-value');
    });
  });

  describe('delete', () => {
    it('should delete stored value', async () => {
      await kvStore.set('test-key', 'test-value');
      await kvStore.delete('test-key');
      const result = await kvStore.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle deleting non-existent key', async () => {
      const result = await kvStore.delete('non-existent');
      expect(result).toBe(true);
    });
  });
}); 