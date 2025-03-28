# Quant KVStore Mock Implementation

## The Problem
I'm currently working with some code that's deployed into QuantCDN. The app uses astro to generate a static site, then uses Quant edge functions to do any backend functionality.  https://docs.quantcdn.io/compute/functions/ 
The main issue here is that I don't have access to logs and I can't run the functions on my local, because we're storing data in Quant VK Stores which can't be access locally, https://docs.quantcdn.io/compute/kv-stores/.
I can get around this partially by using the Quant Web Code Editor, making my changes and testing them there, then copying my code locally, but this still doesn't give me access to logs and is a little bit painful. Also, once we're done, the only way to test the code properly is merging the code into develop to test on the dev environment.

## Proposed Solution
Create two separate mock libraries:
1. `quant_kv_mock`: A mock implementation of Quant's KV Store functionality
2. `quant_api_mock`: A separate mock implementation for the API endpoints (see separate repository)

This separation allows for:
- Cleaner architecture with single responsibility for each mock
- Independent versioning and maintenance
- Ability to use KV Store mock without API mock if needed
- Easier testing and development of each component

## KV Store Online Docs
You can read the QuantCDN documenattion for KV Store here, https://docs.quantcdn.io/compute/kv-stores/

I've included the content here as well for simplicity.

```
Key Value Stores
Key Value (KV) Stores provide a simple and efficient way to store and retrieve data at the edge. They can be used to store configuration data, user preferences, or any other data that needs to be quickly accessed by your edge functions.

Getting Started
To begin using KV Stores:

Navigate to the "Compute > K/V Stores" section in the QuantCDN dashboard
Click "Create New Store" to create a new KV store
Give your store a name and description
Once created, you'll receive a unique identifier for your store
Managing Data
The QuantCDN dashboard provides a simple interface to:

Add new key-value pairs
Edit existing values
View all stored data
Search for specific keys
Delete key-value pairs
Using KV Stores in Edge Functions
KV Stores can be easily integrated into your edge functions using the kvStore object.

Storing Data
To store data in a KV store:

await kvStore.set(KV_STORE_ID, key, data);

Retrieving Data
To retrieve data from a KV store:

const data = await kvStore.get(KV_STORE_ID, key);

Deleting Data
To delete data from a KV store:

await kvStore.delete(KV_STORE_ID, key);

JSON Data Handling
When storing JSON data in a KV store, the data is automatically encoded when stored and decoded when retrieved. This means you can directly store and retrieve JavaScript objects without manual JSON parsing.

// Storing an object
const user = { name: 'John', age: 30 };
await kvStore.set(USERS_KV_STORE, 'user123', user);

// Retrieving the object
const userData = await kvStore.get(USERS_KV_STORE, 'user123');
// userData is automatically parsed as { name: 'John', age: 30 }

Example Use Cases
KV Stores can be used for various purposes, such as:

Storing user preferences or settings
Caching API responses
Managing feature flags
Storing configuration data
Maintaining rate limiting counters
Storing temporary session data
```

## Implementation Steps

1. Create the KV Store Abstraction (Interface)
```javascript
// kvStore.js
class KVStore {
  constructor(storeName, storeImplementation) {
    this.storeName = storeName;
    this.storeImplementation = storeImplementation;
  }

  async get(key) {
    return this.storeImplementation.get(this.storeName, key);
  }

  async set(key, value) {
    return this.storeImplementation.set(this.storeName, key, value);
  }

  async delete(key) {
    return this.storeImplementation.delete(this.storeName, key);
  }
}

export default KVStore;
```

2. Implement the Real KV Store Interface
```javascript
// quantKvImplementation.js
import { kvStore as quantKvStore } from '@quantcdn/quant-edge-functions';

export default {
  async get(storeName, key) {
    return quantKvStore.get(storeName, key);
  },

  async set(storeName, key, value) {
    return quantKvStore.put(storeName, key, value);
  },

  async delete(storeName, key) {
    return quantKvStore.delete(storeName, key);
  }
};
```

3. Implement the Mock KV Store Interface
```javascript
// mockKvImplementation.js
const mockData = {
  'dash_jwt_secret': 'mock-jwt-secret-123456',
  'git_encryption_key': 'mock-encryption-key-abcdef',
  'user_store': 'mock-user-store',
  'team_store': 'mock-team-store',
  'project_store': 'mock-project-store',
  'mock-user-store': {
    'auth0-123456': {
      username: 'mockuser',
      password: 'mockpassword123'
    },
  },
  // add additional mock keys and data here
};

export default {
  async get(storeName, key) {
    const store = mockData[storeName];
    if (store && typeof store === 'object') {
      return store[key] || null;
    }
    return mockData[key] || null;
  },

  async set(storeName, key, value) {
    if (!mockData[storeName]) {
      mockData[storeName] = {};
    }
    mockData[storeName][key] = value;
    return true;
  },

  async delete(storeName, key) {
    if (mockData[storeName]) {
      delete mockData[storeName][key];
    }
    return true;
  }
};
```

4. Create Package Entry Point
```javascript
// index.js
import KVStore from './kvStore.js';
import quantKvImplementation from './quantKvImplementation.js';
import mockKvImplementation from './mockKvImplementation.js';

const implementation = process.env.NODE_ENV === 'production'
  ? quantKvImplementation
  : mockKvImplementation;

export const createKVStore = (storeName) => new KVStore(storeName, implementation);
```

## Usage in Dash Project

1. Add to package.json:
```json
{
  "devDependencies": {
    "@assemblic/quant-kv-mock": "file:../quant_kv_mock"
  }
}
```

2. Use in edge functions:
```javascript
import { createKVStore } from '@assemblic/quant-kv-mock';

const kvStore = createKVStore('my-store');
const data = await kvStore.get('my-key');
```

## Testing

1. Unit tests for mock implementation
2. Integration tests with the API mock
3. End-to-end tests in the dash project

## Next Steps

1. Implement the basic KV Store mock functionality
2. Add comprehensive test suite
3. Document usage and configuration
4. Create example implementations
5. Integrate with the API mock project
6. Test in the dash project

## Notes
- This implementation focuses solely on KV Store functionality
- API endpoint mocking is handled in the separate quant_api_mock repository
- The mock implementation should closely mirror the Quant KV Store API
- Consider adding persistence options for mock data in development

---

# Quant API Mock Implementation Plan

## Overview
The API mock will provide a local Express server that simulates Quant's edge functions, enabling local development and testing of the dash application.

## Implementation Steps

1. Create Express Server Setup
```javascript
// server.js
const express = require('express');
const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  // Simulate authenticated user
  req.user = {
    sub: 'auth0|123456',
    email: 'test@example.com'
  };
  next();
});

// Mount edge functions as routes
app.use('/api/v1/context', require('./routes/context'));
app.use('/api/v1/teams', require('./routes/teams'));
// ... other routes

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Mock server running on port ${PORT}`);
});
```

2. Create Route Handlers
```javascript
// routes/context.js
const express = require('express');
const router = express.Router();
const { createKVStore } = require('@assemblic/quant-kv-mock');

router.get('/', async (req, res) => {
  const kvStore = createKVStore('context-store');
  const context = await kvStore.get(req.user.sub);
  res.json(context || {
    teamId: 'mock-team-1',
    team: {
      name: 'Mock Team',
      role: 'owner'
    }
  });
});

module.exports = router;
```

3. Package Structure
```
quant_api_mock/
├── src/
│   ├── server.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── context.js
│       ├── teams.js
│       └── index.js
├── package.json
└── README.md
```

4. Package Configuration
```json
{
  "name": "@assemblic/quant-api-mock",
  "version": "1.0.0",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "@assemblic/quant-kv-mock": "file:../quant_kv_mock"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## Integration with Dash Project

1. Add to package.json:
```json
{
  "devDependencies": {
    "@assemblic/quant-api-mock": "file:../quant_api_mock"
  }
}
```

2. Configure Vite/Astro for development:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}
```

## Testing Strategy

1. Unit Tests
- Test individual route handlers
- Test middleware functionality
- Test error handling

2. Integration Tests
- Test API endpoints with KV Store mock
- Test authentication flow
- Test error scenarios

3. End-to-End Tests
- Test complete flows in dash project
- Test with different user roles
- Test error handling and recovery

## Mock Data Management

1. Create mock data structure:
```javascript
// src/mock-data/index.js
module.exports = {
  teams: {
    'mock-team-1': {
      name: 'Mock Team',
      owner: 'auth0|123456',
      members: ['auth0|123456'],
      projects: ['mock-project-1']
    }
  },
  projects: {
    'mock-project-1': {
      name: 'Mock Project',
      team: 'mock-team-1'
    }
  }
};
```

2. Add data seeding functionality:
```javascript
// src/utils/seed.js
const mockData = require('../mock-data');
const { createKVStore } = require('@assemblic/quant-kv-mock');

async function seedMockData() {
  const teamStore = createKVStore('team-store');
  const projectStore = createKVStore('project-store');
  
  // Seed teams
  for (const [id, team] of Object.entries(mockData.teams)) {
    await teamStore.set(id, team);
  }
  
  // Seed projects
  for (const [id, project] of Object.entries(mockData.projects)) {
    await projectStore.set(id, project);
  }
}
```

## Next Steps

1. Set up basic Express server
2. Implement core route handlers
3. Add authentication middleware
4. Create mock data structure
5. Add data seeding functionality
6. Set up testing infrastructure
7. Document usage and configuration
8. Integrate with dash project
9. Add monitoring and logging
10. Create development scripts

## Notes
- Keep mock data structure close to production
- Implement proper error handling
- Add logging for debugging
- Consider adding data persistence options
- Document all available endpoints and their behavior
- Include examples for common use cases
