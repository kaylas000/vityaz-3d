# Unit Testing Guide

## Overview
This frontend uses Jest and React Testing Library for unit testing.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- GameScene.test.tsx
```

## Test Structure

### Component Tests
- Location: `src/components/__tests__/`
- Pattern: `ComponentName.test.tsx`

### Page Tests
- Location: `src/__tests__/`
- Pattern: `PageName.test.tsx`

## Coverage Requirements

Minimum coverage thresholds:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing Tests

### Example: Component Test
```tsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

## Best Practices

1. Test behavior, not implementation
2. Use semantic queries (`getByRole`, `getByLabelText`)
3. Test user interactions with `fireEvent` or `userEvent`
4. Keep tests focused and readable
5. Use meaningful test descriptions

