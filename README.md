# Quant KV Store Mock

A mock implementation of Quant's KV Store for local development and testing.

## Overview

This package provides a mock implementation of Quant's KV Store functionality, allowing you to develop and test your application locally without needing access to the actual Quant infrastructure. The mock implementation stores data in-memory and can be configured with custom data via a JSON file.

## Quick Start

```bash
# Install the package
npm install @assemblic/quant-kv-mock

# Set environment variable for local development
export USE_MOCK_KV=true

# Or set it in your .env file
USE_MOCK_KV=true
```

## Usage

### Basic Usage

```javascript
import { createKVStore } from '@assemblic/quant-kv-mock';

// Create a store instance
const kvStore = createKVStore('my-store');

// Store a value
await kvStore.set('my-key', 'my-value');

// Retrieve a value
const value = await kvStore.get('my-key');

// Delete a value
await kvStore.delete('my-key');
```

### Integration with Your Project

In your application code, you can conditionally use either the mock or real implementation:

```javascript
import dotenv from 'dotenv';
dotenv.config();

let kvStoreImplementation;

if (process.env.USE_MOCK_KV === 'true') {
  const { createKVStore } = await import('@assemblic/quant-kv-mock');
  kvStoreImplementation = createKVStore;
} else {
  const { kvStore } = await import('@quantcdn/quant-edge-functions');
  kvStoreImplementation = kvStore;
}

// Now use kvStoreImplementation throughout your code
const userStore = kvStoreImplementation('user-store');
```

## Features

- In-memory storage for development
- Customisable mock data via JSON configuration
- Automatic switching between mock and real implementations based on environment variables
- Full implementation of Quant's KV Store API
- TypeScript support
- Comprehensive test suite

## Mock Data

The mock implementation includes sample data for:
- User authentication
- Team management
- Project management

### Customising Mock Data

You can customise the mock data for your local development by creating a `mockData.json` file in your project root:

1. Copy the example file:
```bash
cp node_modules/@assemblic/quant-kv-mock/example-mockData.json ./mockData.json
```

2. Modify the values in `mockData.json` to match your local development needs. The file includes placeholders for:
   - JWT and encryption secrets
   - User credentials and team memberships
   - Team configurations
   - Project settings

3. The mock KV store will automatically load your custom values while maintaining the default structure for any values you don't override.

**Important: Add `mockData.json` to your `.gitignore` file to prevent committing sensitive local data.**

### Mock Data Structure

The mock data is structured as follows:

```javascript
{
  // Secret store data
  "dash_jwt_secret": "your-local-jwt-secret",
  "git_encryption_key": "your-local-encryption-key",
  
  // Store references
  "user_store": "mock-user-store",
  "team_store": "mock-team-store",
  "project_store": "mock-project-store",
  
  // Mock user data
  "mock-user-store": {
    "user-id": {
      "username": "your-username",
      "password": "your-password",
      "teams": [...]
    }
  },
  
  // Additional stores...
}
```

## Environment Configuration

The package uses the following environment variables:

- `USE_MOCK_KV`: Set to 'true' to use the mock implementation, any other value or unset will use the real Quant KV Store implementation

## Development

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd quant-kv-mock

# Install dependencies
npm install
```

Note: You may see some deprecation warnings during installation. These are related to internal dependencies and don't affect the functionality of the package. The warnings are being addressed in future updates.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run tests in watch mode (tests re-run when files change)
npm test -- --watch
```

### Linting

```bash
# Run linter
npm run lint
```

### Test Configuration

The project uses Jest for testing with the following configuration:
- ES Modules support enabled
- Node.js test environment
- Tests located in `src/__tests__` directory
- Coverage reporting available

### GitHub Actions

The project includes several GitHub Actions workflows:

1. **Test KV Store Mock** - Runs all tests when code is pushed or a PR is created
   - Runs on self-hosted runners
   - Triggered on push to main/develop or pull requests

2. **Mock Data Tests** - Runs only the mock data tests
   - Runs on self-hosted runners
   - Triggered when changes are made to mock data files
   - Can be manually triggered

3. **Scheduled Tests** - Runs all tests with coverage reporting on a schedule
   - Runs daily at midnight
   - Runs on self-hosted runners
   - Generates and archives coverage reports
   - Can be manually triggered

### Writing Tests

Tests are written using Jest's standard syntax. Example:

```javascript
describe('Feature', () => {
  test('should do something', () => {
    expect(someFunction()).toBe(expectedValue);
  });
});
```

## Troubleshooting

### Common Issues

1. **Mock data not loading**: Ensure your `mockData.json` file is properly formatted JSON and located in your project root.

2. **Store references not working**: If you're having issues with store references, check that your store names match the references in your mock data.

3. **Tests failing**: Reset the mock implementation between tests to avoid state contamination:
```javascript
beforeEach(() => {
  mockKvImplementation._reset();
});
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 