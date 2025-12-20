# Error Handling & Logging Guide

## Overview
The application includes a comprehensive error handling and logging system to help diagnose and fix issues.

## Using the Logger

### Import the Logger
```typescript
import { logger } from './utils/errorHandler';
```

### Log Levels

#### Debug (Development)
```typescript
logger.debug('Debug message', { additionalData: true });
```

#### Info (General Information)
```typescript
logger.info('Game initialized successfully');
```

#### Warning (Potential Issues)
```typescript
logger.warn('Low memory warning', { memory: '256MB' });
```

#### Error (Critical Issues)
```typescript
logger.error('Failed to load asset', { assetId: 'sprite-001' });
```

## Using the Error Handler

### Import the Error Handler
```typescript
import { errorHandler } from './utils/errorHandler';
```

### Handle Synchronous Errors
```typescript
try {
  // Some operation
} catch (error) {
  errorHandler.handleError(error, 'OperationName');
}
```

### Handle Asynchronous Errors
```typescript
const fetchData = async () => {
  // Some async operation
};

await errorHandler.handleAsyncError(
  fetchData(),
  'DataFetching'
);
```

## Global Error Handling

The system automatically catches:
1. Uncaught JavaScript errors
2. Unhandled promise rejections
3. Global exceptions

These are logged with the context "Global Error Handler" or "Unhandled Promise Rejection".

## Viewing Logs

### Get All Logs
```typescript
import { logger } from './utils/errorHandler';

const allLogs = logger.getLogs();
console.table(allLogs);
```

### Clear Logs
```typescript
logger.clearLogs();
```

## Best Practices

1. **Be Specific**: Use meaningful context messages
2. **Log Data**: Include relevant data with logs
3. **Use Appropriate Levels**: Choose the right log level
4. **Handle Async Errors**: Always handle promise rejections
5. **User Feedback**: Show user-friendly error messages

## Troubleshooting

### Check Console
Open browser console (F12) to see real-time logs

### Retrieve Logs Programmatically
Use `logger.getLogs()` to get all recorded logs

### Clear Logs When Needed
Use `logger.clearLogs()` to start fresh

## Log Entry Structure

```typescript
interface LogEntry {
  timestamp: string;    // ISO 8601 format
  level: LogLevel;      // DEBUG, INFO, WARN, ERROR
  message: string;      // Log message
  data?: any;           // Optional additional data
}
```
