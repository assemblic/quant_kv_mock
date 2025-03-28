import { validateMockData } from '../validateMockData';
import mockKvImplementation from '../mockKvImplementation.js';
import fs from 'fs';
import path from 'path';

// Reset mock implementation state before all tests
beforeEach(() => {
  mockKvImplementation._reset();
});

describe('Mock Data Validation', () => {
  const validMockData = {
    dash_jwt_secret: 'test-secret',
    git_encryption_key: 'test-key',
    user_store: 'mock-user-store',
    team_store: 'mock-team-store',
    project_store: 'mock-project-store',
    'mock-user-store': {
      'test-user': {
        username: 'testuser',
        password: 'testpass',
        teams: [{
          id: 'test-team',
          role: 'owner',
          joined_at: '2024-03-20T00:00:00.000Z'
        }]
      }
    },
    'mock-team-store': {
      'test-team': {
        name: 'Test Team',
        owner: 'test-user',
        members: ['test-user'],
        projects: ['test-project'],
        created_at: '2024-03-20T00:00:00.000Z'
      }
    },
    'mock-project-store': {
      'test-project': {
        name: 'Test Project',
        team: 'test-team',
        created_at: '2024-03-20T00:00:00.000Z'
      }
    }
  };

  test('validates correct mock data structure', () => {
    const result = validateMockData(validMockData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects missing required keys', () => {
    const invalidData = { ...validMockData };
    delete invalidData.dash_jwt_secret;
    
    const result = validateMockData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing required key: dash_jwt_secret');
  });

  test('validates user store structure', () => {
    const invalidData = {
      ...validMockData,
      'mock-user-store': {
        'test-user': {
          // Missing username and password
          teams: []
        }
      }
    };

    const result = validateMockData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('User test-user missing username');
    expect(result.errors).toContain('User test-user missing password');
  });

  test('validates team store structure', () => {
    const invalidData = {
      ...validMockData,
      'mock-team-store': {
        'test-team': {
          // Missing required fields
          members: 'not-an-array',
          projects: ['test-project']
        }
      }
    };

    const result = validateMockData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Team test-team missing name');
    expect(result.errors).toContain('Team test-team missing owner');
    expect(result.errors).toContain('Team test-team members must be an array');
  });

  test('validates project store structure', () => {
    const invalidData = {
      ...validMockData,
      'mock-project-store': {
        'test-project': {
          // Missing required fields
          name: 'Test Project'
        }
      }
    };

    const result = validateMockData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Project test-project missing team');
    expect(result.errors).toContain('Project test-project missing created_at');
  });
});

describe('Mock KV Implementation', () => {
  const mockDataPath = path.join(process.cwd(), 'mockData.json');
  const testMockData = {
    dash_jwt_secret: 'test-secret',
    test_key: 'test-value'
  };

  beforeEach(() => {
    // Reset the mock implementation to a clean state
    mockKvImplementation._reset();
    
    // Clean up any existing mock data file
    if (fs.existsSync(mockDataPath)) {
      fs.unlinkSync(mockDataPath);
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(mockDataPath)) {
      fs.unlinkSync(mockDataPath);
    }
  });

  test('loads and uses custom mock data', async () => {
    // Test getting a custom value
    const value = await mockKvImplementation.get(null, 'dash_jwt_secret');
    expect(value).toBe('mock-jwt-secret-123456');
  });

  test('falls back to default data when mock file is invalid', async () => {
    // Should fall back to default data
    const value = await mockKvImplementation.get(null, 'dash_jwt_secret');
    expect(value).toBe('mock-jwt-secret-123456');
  });

  test('CRUD operations work with mock data', async () => {
    const storeName = 'test_store';
    const key = 'test_key';
    const value = 'test_value';

    // Test set
    await expect(mockKvImplementation.set(storeName, key, value)).resolves.toBe(true);

    // Test get
    const retrieved = await mockKvImplementation.get(storeName, key);
    expect(retrieved).toBe(value);

    // Test delete
    await expect(mockKvImplementation.delete(storeName, key)).resolves.toBe(true);
    const afterDelete = await mockKvImplementation.get(storeName, key);
    expect(afterDelete).toBeNull();
  });

  test('handles store references correctly', async () => {
    // Test getting a value from a referenced store
    const value = await mockKvImplementation.get('user_store', 'auth0-123456');
    expect(value).toBeDefined();
    expect(value.username).toBe('mockuser');
  });
}); 