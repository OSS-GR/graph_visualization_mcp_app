# Brush Configuration Utilities

## Overview

The `brushConfig.ts` module provides comprehensive utilities for implementing brush-based range selection in Recharts visualizations. It supports single and multiple brushes, touch events, keyboard controls, and cross-chart synchronization.

## File Structure

```
src/utils/brushConfig.ts - Core brush utility functions and types
src/hooks/useBrush.ts - React hook wrapper for brush management
```

## Key Concepts

### Brush State
The brush state tracks the current selection range in the data:
```typescript
interface BrushState {
  isEnabled: boolean;           // Whether brush is active
  dataStartIndex: number;       // Start of selected range (inclusive)
  dataEndIndex: number;         // End of selected range (exclusive)
  isResetting: boolean;         // Flag indicating reset animation
}
```

### Brush Change Result
Returned when brush range changes:
```typescript
interface BrushChangeResult {
  startIndex: number;  // Validated start index
  endIndex: number;    // Validated end index
  range: number;       // Number of items in range
}
```

### Built Brush Configuration
Final configuration ready for Recharts Brush component:
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

## Feature Support

### Core Features
- [x] Build Recharts Brush config from ChartConfig
- [x] State management for brush selection
- [x] Enabled/disabled toggle
- [x] DataStartIndex and dataEndIndex configuration
- [x] Y position and height configuration
- [x] TravelAxis support (x or y)
- [x] Fill, stroke, and opacity customization
- [x] ShowPreview support

### Interaction Features
- [x] Single and multiple brushes
- [x] Touch event handling (mobile)
- [x] Keyboard controls (arrow keys)
- [x] Reset capability
- [x] Range filtering

### State Management
- [x] Track selected range
- [x] Filter data based on range
- [x] Synchronize with other charts (syncId)
- [x] Recover synced state from sessionStorage

### Validation & Edge Cases
- [x] Proper TypeScript types
- [x] Empty data handling
- [x] Single point handling
- [x] Invalid index handling
- [x] Out of bounds checking

## API Reference

### Configuration Functions

#### `buildBrushConfig(config, dataLength): BuiltBrushConfig`
Builds Recharts Brush configuration with defaults and validation.

**Parameters:**
- `config`: BrushConfig | undefined - Configuration from ChartConfig
- `dataLength`: number - Total data length

**Returns:** BuiltBrushConfig ready for Recharts Brush component

**Throws:** Error if config is missing or data length is invalid

**Example:**
```typescript
const config = buildBrushConfig(brushConfig, 100);
<Brush {...config} onChange={handleChange} />
```

### State Management Functions

#### `createInitialBrushState(dataLength, enabled): BrushState`
Creates initial brush state for the given data length.

**Parameters:**
- `dataLength`: number - Total data length
- `enabled`: boolean = true - Initial enabled state

**Returns:** Initial BrushState object

**Throws:** Error if data length is invalid

#### `onBrushChange(startIndex, endIndex, dataLength): BrushChangeResult`
Validates and processes brush range changes.

**Parameters:**
- `startIndex`: number - New start index
- `endIndex`: number - New end index
- `dataLength`: number - Total data length

**Returns:** BrushChangeResult with validated indices

**Behavior:**
- Clamps indices to valid range [0, dataLength]
- Ensures startIndex < endIndex
- Provides range information

#### `resetBrush(dataLength): BrushChangeResult`
Resets brush to show all data.

**Parameters:**
- `dataLength`: number - Total data length

**Returns:** BrushChangeResult for full range

#### `filterDataByBrushRange(data, startIndex, endIndex): T[]`
Filters data array based on brush selection.

**Parameters:**
- `data`: T[] - Full dataset
- `startIndex`: number - Start of range
- `endIndex`: number - End of range

**Returns:** Filtered data array

### Interaction Functions

#### `handleBrushKeyboard(key, currentStart, currentEnd, dataLength, stepSize): BrushChangeResult | null`
Handles keyboard controls for brush manipulation.

**Supported Keys:**
- `ArrowLeft`: Move selection left by stepSize
- `ArrowRight`: Move selection right by stepSize
- `ArrowUp`: Expand selection (increase range)
- `ArrowDown`: Collapse selection (decrease range)

**Parameters:**
- `key`: string - Keyboard key pressed
- `currentStart`: number - Current start index
- `currentEnd`: number - Current end index
- `dataLength`: number - Total data length
- `stepSize`: number = 1 - Items per key press

**Returns:** BrushChangeResult or null if key not handled

#### `handleBrushTouch(touchX, containerWidth, dataLength, isTouchStart): number`
Converts touch coordinates to brush index for mobile.

**Parameters:**
- `touchX`: number - X coordinate from touch event
- `containerWidth`: number - Chart container width
- `dataLength`: number - Total data length
- `isTouchStart`: boolean = true - Is this touch start

**Returns:** Calculated index for touch position

### Synchronization Functions

#### `syncBrushState(brushState, syncId): BrushState`
Stores brush state in sessionStorage for cross-chart sync.

**Parameters:**
- `brushState`: BrushState - Current state
- `syncId`: string | undefined - Sync identifier

**Returns:** The brush state (stored if syncId provided)

**Behavior:**
- Stores in sessionStorage under key: `brush-sync-{syncId}`
- Silently fails if sessionStorage unavailable

#### `getSyncedBrushState(syncId): BrushState | null`
Retrieves brush state from sessionStorage.

**Parameters:**
- `syncId`: string | undefined - Sync identifier

**Returns:** Retrieved BrushState or null

### Validation Functions

#### `validateBrushConfig(config, data): string | null`
Validates brush configuration against data.

**Parameters:**
- `config`: BrushConfig | undefined - Configuration to validate
- `data`: unknown[] | null | undefined - Data to validate against

**Returns:** Error message string or null if valid

**Validates:**
- Data is an array and non-empty
- dataStartIndex >= 0
- dataEndIndex <= data.length
- dataStartIndex < dataEndIndex
- height > 0
- fillOpacity in range [0, 1]

### Utility Functions

#### `calculateVisibleDataPercentage(startIndex, endIndex, dataLength): number`
Calculates percentage of data currently visible.

**Returns:** Percentage (0-100)

**Example:**
```typescript
const percent = calculateVisibleDataPercentage(25, 75, 100);
// Returns: 50
```

#### `calculateOptimalBrushHeight(dataLength): number`
Determines optimal brush height based on data size.

**Returns:** Suggested height in pixels

**Rules:**
- <= 10 items: 30px
- <= 50 items: 40px
- <= 200 items: 60px
- > 200 items: 80px

## React Hook: useBrush

The `useBrush` hook simplifies brush management in React components.

### Usage

```typescript
import { useBrush } from '../hooks/useBrush';

function MyChart({ config, data }) {
  const { brushState, builtConfig, filteredData, isValid, handlers } = useBrush({
    config: config.brush,
    data,
    syncId: config.syncId,
    onBrushChangeCallback: (result) => console.log('Range changed:', result),
  });

  if (!isValid) {
    return <div>Brush configuration error</div>;
  }

  return (
    <div
      onKeyDown={(e) => handlers.onKeyDown(e.key)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handlers.onTouch(touch.clientX, ref.current?.offsetWidth || 0, false);
      }}
    >
      <BarChart data={filteredData}>
        {builtConfig && <Brush {...builtConfig} />}
      </BarChart>
      <button onClick={handlers.onReset}>Reset Zoom</button>
    </div>
  );
}
```

### Hook Return Value

```typescript
interface UseBrushReturn {
  brushState: BrushState;                    // Current brush state
  builtConfig: BuiltBrushConfig | null;      // Recharts configuration
  filteredData: unknown[];                   // Data filtered by range
  isValid: boolean;                          // Configuration is valid
  validationError: string | null;            // Validation error if any
  handlers: {
    onBrushChange: (start: number, end: number) => void;
    onReset: () => void;
    onKeyDown: (key: string) => void;
    onTouch: (touchX: number, width: number, isStart?: boolean) => void;
  };
}
```

## Configuration Examples

### Basic Configuration
```typescript
const config: BrushConfig = {
  enabled: true,
  height: 40,
  travelAxis: 'x',
};
```

### With Custom Styling
```typescript
const config: BrushConfig = {
  enabled: true,
  height: 50,
  travelAxis: 'x',
  fill: '#1f77b4',
  stroke: '#ff7f0e',
  fillOpacity: 0.15,
  showPreview: true,
};
```

### With Initial Range
```typescript
const config: BrushConfig = {
  enabled: true,
  dataStartIndex: 10,
  dataEndIndex: 50,
  height: 40,
  travelAxis: 'x',
};
```

### Vertical Brush
```typescript
const config: BrushConfig = {
  enabled: true,
  travelAxis: 'y',
  y: 100,
  height: 30,
  fill: '#8884d8',
};
```

## Error Handling

All functions gracefully handle invalid inputs:

```typescript
try {
  const config = buildBrushConfig(undefined, 100);
} catch (error) {
  console.error('Brush config error:', error.message);
  // Defaults are applied
}

const error = validateBrushConfig(config, []);
if (error) {
  console.warn('Configuration issue:', error);
}
```

## Performance Considerations

1. **Data Filtering**: Filtering is O(n) but only on visible range
2. **State Updates**: Use React's useBrush hook to prevent unnecessary re-renders
3. **Touch Events**: Debounce touch handlers if needed for large datasets
4. **SessionStorage**: Sync state is stored in sessionStorage (not persistent)

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile, Firefox Mobile)
- Touch events work on all touch-capable devices

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  BrushConfig,
  BrushState,
  BrushChangeResult,
  BuiltBrushConfig,
} from '../utils/brushConfig';
```

## Integration with Existing Charts

The utilities work seamlessly with existing chart components:

```typescript
{config.brush?.enabled && (
  <Brush
    {...buildBrushConfig(config.brush, config.data.length)}
    onChange={(state) => {
      const result = onBrushChange(state.startIndex, state.endIndex, config.data.length);
      setBrushState(result);
    }}
  />
)}
```

## Testing

The utilities are designed to be easily testable:

```typescript
describe('brushConfig', () => {
  it('should validate brush configuration', () => {
    const error = validateBrushConfig(config, data);
    expect(error).toBeNull();
  });

  it('should filter data correctly', () => {
    const filtered = filterDataByBrushRange(data, 0, 5);
    expect(filtered).toHaveLength(5);
  });

  it('should handle keyboard navigation', () => {
    const result = handleBrushKeyboard('ArrowRight', 10, 50, 100);
    expect(result?.startIndex).toBe(11);
  });
});
```

## Best Practices

1. **Validate early**: Check config validity before building
2. **Handle edge cases**: Always check data length > 0
3. **Sync state**: Use syncId for multi-chart scenarios
4. **Provide feedback**: Show visible percentage to users
5. **Mobile first**: Test touch interactions thoroughly
6. **Accessibility**: Implement keyboard controls
7. **Performance**: Filter data before passing to chart

## Common Issues

### Issue: Brush not responding to changes
**Solution**: Ensure `onChange` handler is properly connected and updating brush state

### Issue: Synced charts not updating
**Solution**: Verify `syncId` matches across charts and sessionStorage is available

### Issue: Touch events not working
**Solution**: Check that `handleBrushTouch` is called with correct container width

### Issue: Keyboard controls not working
**Solution**: Ensure element is focused and `handleBrushKeyboard` is connected to keydown event

## Related Files

- `src/types.ts` - BrushConfig type definition
- `src/hooks/useBrush.ts` - React hook wrapper
- `src/components/charts/*.tsx` - Chart component implementations
- `src/utils/syncConfig.ts` - Sync configuration utilities

## References

- [Recharts Brush Component](https://recharts.org/en-US/api/Brush)
- [Browser Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Keyboard Events](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
