# Brush Component Usage Guide

This guide explains how to use the brush configuration utilities in `src/utils/brushConfig.ts` for implementing range selection support in Recharts visualizations.

## Overview

The brush utilities provide:
- Configuration building for Recharts Brush component
- Range selection state management
- Touch event handling (mobile)
- Keyboard controls (arrow keys)
- Data filtering based on brush range
- Brush synchronization across multiple charts
- Validation and edge case handling

## Core Functions

### 1. `buildBrushConfig(config, dataLength): BuiltBrushConfig`

Builds Recharts Brush configuration from ChartConfig.brush settings.

```typescript
import { buildBrushConfig } from './src/utils/brushConfig';
import type { BrushConfig } from './src/types';

const brushConfig: BrushConfig = {
  enabled: true,
  dataStartIndex: 0,
  dataEndIndex: 50,
  height: 40,
  travelAxis: 'x',
  fill: '#8884d8',
  stroke: '#666',
  fillOpacity: 0.1,
  showPreview: true,
};

const builtConfig = buildBrushConfig(brushConfig, 100);
// Returns: {
//   dataStartIndex: 0,
//   dataEndIndex: 50,
//   height: 40,
//   travelAxis: 'x',
//   fill: '#8884d8',
//   ...
// }
```

### 2. `onBrushChange(startIndex, endIndex, dataLength): BrushChangeResult`

Handles brush range changes with validation.

```typescript
import { onBrushChange } from './src/utils/brushConfig';

const result = onBrushChange(10, 50, 100);
// Returns: {
//   startIndex: 10,
//   endIndex: 50,
//   range: 40
// }
```

### 3. `resetBrush(dataLength): BrushChangeResult`

Resets brush to show full data range.

```typescript
import { resetBrush } from './src/utils/brushConfig';

const result = resetBrush(100);
// Returns: {
//   startIndex: 0,
//   endIndex: 100,
//   range: 100
// }
```

### 4. `filterDataByBrushRange(data, startIndex, endIndex): T[]`

Filters data array based on brush selection range.

```typescript
import { filterDataByBrushRange } from './src/utils/brushConfig';

const data = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  // ... more data
];

const filtered = filterDataByBrushRange(data, 0, 5);
// Returns first 5 items
```

## State Management

### `BrushState` Interface

```typescript
interface BrushState {
  isEnabled: boolean;
  dataStartIndex: number;
  dataEndIndex: number;
  isResetting: boolean;
}
```

### `createInitialBrushState(dataLength, enabled): BrushState`

Creates initial brush state.

```typescript
import { createInitialBrushState } from './src/utils/brushConfig';

const initialState = createInitialBrushState(100, true);
// Returns: {
//   isEnabled: true,
//   dataStartIndex: 0,
//   dataEndIndex: 100,
//   isResetting: false
// }
```

## Keyboard Controls

### `handleBrushKeyboard(key, currentStart, currentEnd, dataLength, stepSize): BrushChangeResult | null`

Supports arrow key controls for brush manipulation:
- **ArrowLeft**: Move selection left
- **ArrowRight**: Move selection right
- **ArrowUp**: Expand selection (increase range)
- **ArrowDown**: Collapse selection (decrease range)

```typescript
import { handleBrushKeyboard } from './src/utils/brushConfig';

const result = handleBrushKeyboard('ArrowRight', 10, 50, 100, 5);
// Moves selection 5 items to the right
```

## Touch Events (Mobile)

### `handleBrushTouch(touchX, containerWidth, dataLength, isTouchStart): number`

Converts touch coordinates to brush index for mobile support.

```typescript
import { handleBrushTouch } from './src/utils/brushConfig';

const index = handleBrushTouch(150, 400, 100, true);
// Returns: 37 (approximately 37% of data)
```

## Synchronization

### `syncBrushState(brushState, syncId): BrushState`

Stores brush state in sessionStorage for cross-chart sync.

```typescript
import { syncBrushState } from './src/utils/brushConfig';

const synced = syncBrushState(brushState, 'chart-group-1');
// Stores state in sessionStorage under 'brush-sync-chart-group-1'
```

### `getSyncedBrushState(syncId): BrushState | null`

Retrieves synchronized brush state from sessionStorage.

```typescript
import { getSyncedBrushState } from './src/utils/brushConfig';

const recovered = getSyncedBrushState('chart-group-1');
// Retrieves previously stored state or null
```

## Validation

### `validateBrushConfig(config, data): string | null`

Validates brush configuration against data.

```typescript
import { validateBrushConfig } from './src/utils/brushConfig';

const error = validateBrushConfig(brushConfig, data);
if (error) {
  console.error('Brush config error:', error);
}
```

## Utility Functions

### `calculateVisibleDataPercentage(startIndex, endIndex, dataLength): number`

Calculates percentage of data currently visible.

```typescript
import { calculateVisibleDataPercentage } from './src/utils/brushConfig';

const percentage = calculateVisibleDataPercentage(0, 50, 100);
// Returns: 50 (50% of data is visible)
```

### `calculateOptimalBrushHeight(dataLength): number`

Returns suggested brush height based on data size.

```typescript
import { calculateOptimalBrushHeight } from './src/utils/brushConfig';

const height = calculateOptimalBrushHeight(100);
// Returns: 40 (optimal height for 100 items)
```

## Integration with Charts

### Example: Using Brush in BarChart

```typescript
import { buildBrushConfig, onBrushChange } from './src/utils/brushConfig';
import { BarChart } from 'recharts';

export function MyBarChart({ config }) {
  const [brushState, setBrushState] = useState(() =>
    createInitialBrushState(config.data.length)
  );

  const brushProps = buildBrushConfig(config.brush, config.data.length);

  const handleBrushChange = (newState) => {
    const result = onBrushChange(
      newState.startIndex,
      newState.endIndex,
      config.data.length
    );
    setBrushState(result);
  };

  const filteredData = filterDataByBrushRange(
    config.data,
    brushState.dataStartIndex,
    brushState.dataEndIndex
  );

  return (
    <BarChart data={filteredData}>
      {/* Chart components */}
      {config.brush?.enabled && <Brush {...brushProps} onChange={handleBrushChange} />}
    </BarChart>
  );
}
```

## Configuration Examples

### Basic Brush Configuration

```typescript
const basicBrush: BrushConfig = {
  enabled: true,
  height: 40,
  travelAxis: 'x',
};
```

### Styled Brush

```typescript
const styledBrush: BrushConfig = {
  enabled: true,
  height: 50,
  travelAxis: 'x',
  fill: '#1f77b4',
  stroke: '#ff7f0e',
  fillOpacity: 0.15,
  showPreview: true,
};
```

### Positioned Brush (Y-axis)

```typescript
const verticalBrush: BrushConfig = {
  enabled: true,
  travelAxis: 'y',
  y: 100,
  height: 30,
};
```

### Initial Range Selection

```typescript
const rangedBrush: BrushConfig = {
  enabled: true,
  dataStartIndex: 20,
  dataEndIndex: 80,
  height: 40,
  travelAxis: 'x',
};
```

## Edge Cases

The utilities handle edge cases automatically:

- **Empty data**: Validation will return an error
- **Single point**: Brush range is automatically adjusted to include at least 1 item
- **Invalid indices**: Indices are clamped to valid ranges
- **Out of bounds**: End index is clamped to data length
- **Reversed range**: Start and end indices are automatically corrected

## TypeScript Interfaces

### BrushState
```typescript
interface BrushState {
  isEnabled: boolean;
  dataStartIndex: number;
  dataEndIndex: number;
  isResetting: boolean;
}
```

### BrushChangeResult
```typescript
interface BrushChangeResult {
  startIndex: number;
  endIndex: number;
  range: number;
}
```

### BuiltBrushConfig
```typescript
interface BuiltBrushConfig {
  dataStartIndex: number;
  dataEndIndex?: number;
  y?: number;
  height: number;
  travelAxis: 'x' | 'y';
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  showPreview?: boolean;
}
```

## Best Practices

1. **Always validate**: Use `validateBrushConfig` before building config
2. **Handle edge cases**: Check data length > 0 before creating brush state
3. **Sync across charts**: Use `syncBrushState` when multiple charts share the same brush
4. **Mobile support**: Integrate touch handlers for better mobile UX
5. **Keyboard accessibility**: Use `handleBrushKeyboard` for accessible navigation
6. **Performance**: Filter data based on brush range to optimize chart rendering
7. **Clear feedback**: Show visible percentage and current range to user

## Common Patterns

### Reset to Full View
```typescript
const fullRange = resetBrush(data.length);
setBrushState(fullRange);
```

### Zoom to Selection
```typescript
const zoomed = onBrushChange(startIdx, endIdx, data.length);
const filtered = filterDataByBrushRange(data, zoomed.startIndex, zoomed.endIndex);
```

### Show Visible Percentage
```typescript
const percentage = calculateVisibleDataPercentage(
  brushState.dataStartIndex,
  brushState.dataEndIndex,
  data.length
);
console.log(`Showing ${percentage}% of data`);
```

### Mobile Touch Support
```typescript
const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  const index = handleBrushTouch(
    touch.clientX,
    containerWidth,
    data.length,
    false
  );
  // Update brush state with new index
};
```
