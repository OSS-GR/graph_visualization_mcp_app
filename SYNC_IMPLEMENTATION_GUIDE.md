# Multi-Chart Synchronization (syncId) Implementation Guide

This document describes the synchronization utilities and patterns for coordinating interactions across multiple Recharts charts in the visualization app.

## Overview

The synchronization system enables multiple charts to:
- Share tooltip states (synchronized tooltips across charts)
- Coordinate brush selections (synchronized range selections)
- Support index-based and value-based synchronization
- Follow cursor across multiple charts

## Core Concepts

### Sync ID (syncId)
A unique string identifier that groups charts for synchronization. Charts with the same `syncId` will coordinate their interactions.

### Sync Method (syncMethod)
Determines how data is matched between charts:
- **`'index'`**: Position-based synchronization. Charts sync by array index position.
- **`'value'`**: Categorical value synchronization. Charts sync by matching categorical axis values.

## API Reference

### `src/utils/syncConfig.ts`

#### Types

```typescript
type SyncMethod = 'index' | 'value';

interface SyncConfig {
  syncId: string;
  syncMethod: SyncMethod;
  enableTooltipSync: boolean;
  enableBrushSync: boolean;
}

interface GlobalSyncState {
  tooltips: Map<string, SyncedTooltipState>;
  brushes: Map<string, SyncedBrushState>;
  listeners: Map<string, Set<(state: GlobalSyncState) => void>>;
}
```

#### Core Functions

##### `buildSyncConfig(syncId, syncMethod, enableTooltipSync, enableBrushSync)`
Builds a sync configuration object.

```typescript
const config = buildSyncConfig('sales-charts', 'value');
// Returns:
// {
//   syncId: 'sales-charts',
//   syncMethod: 'value',
//   enableTooltipSync: true,
//   enableBrushSync: true
// }
```

##### `createGlobalSyncState()`
Creates a new global sync state manager for tracking synchronized interactions.

```typescript
const syncState = createGlobalSyncState();
```

##### `handleSyncedTooltip(state, syncId, tooltipData)`
Updates tooltip state and notifies all listeners.

```typescript
handleSyncedTooltip(syncState, 'sales-charts', {
  active: true,
  index: 2,
  value: 'March'
});
```

##### `getActiveSyncedTooltip(state, syncId)`
Retrieves the active tooltip state for a sync group.

```typescript
const tooltip = getActiveSyncedTooltip(syncState, 'sales-charts');
if (tooltip?.active) {
  console.log('Tooltip is active at index:', tooltip.index);
}
```

##### `clearSyncedTooltip(state, syncId)`
Clears the tooltip state for a sync group.

```typescript
clearSyncedTooltip(syncState, 'sales-charts');
```

##### `handleSyncedBrush(state, syncId, brushData)`
Updates brush state and notifies all listeners.

```typescript
handleSyncedBrush(syncState, 'sales-charts', {
  dataStartIndex: 2,
  dataEndIndex: 8
});
```

##### `getActiveSyncedBrush(state, syncId)`
Retrieves the active brush state for a sync group.

```typescript
const brush = getActiveSyncedBrush(syncState, 'sales-charts');
if (brush) {
  console.log(`Brush range: ${brush.dataStartIndex} to ${brush.dataEndIndex}`);
}
```

##### `clearSyncedBrush(state, syncId)`
Clears the brush state for a sync group.

```typescript
clearSyncedBrush(syncState, 'sales-charts');
```

#### Listener Management

##### `registerSyncListener(state, syncId, listener)`
Registers a callback to be notified of sync state changes.

```typescript
const listener = (state: GlobalSyncState) => {
  console.log('Sync state changed');
};
registerSyncListener(syncState, 'sales-charts', listener);
```

##### `unregisterSyncListener(state, syncId, listener)`
Removes a registered listener.

```typescript
unregisterSyncListener(syncState, 'sales-charts', listener);
```

#### Data Transformation Utilities

##### `findIndexByValue(data, dataKey, syncValue)`
Finds the array index of a data item by its categorical value.

```typescript
const data = [
  { month: 'Jan', sales: 100 },
  { month: 'Feb', sales: 150 },
  { month: 'Mar', sales: 200 }
];

const index = findIndexByValue(data, 'month', 'Feb'); // Returns: 1
```

##### `findValueByIndex(data, dataKey, index)`
Finds the categorical value at a given array index.

```typescript
const value = findValueByIndex(data, 'month', 1); // Returns: 'Feb'
```

##### `transformTooltipIndex(sourceData, targetData, sourceIndex, sourceDataKey, targetDataKey, syncMethod)`
Transforms a tooltip index from one chart to another based on sync method.

```typescript
// Index-based sync: use same position
const targetIndex = transformTooltipIndex(
  sourceData,
  targetData,
  2,           // Source index
  'month',     // Source categorical key
  'period',    // Target categorical key
  'index'      // Sync method
);

// Value-based sync: match by categorical value
const targetIndex = transformTooltipIndex(
  sourceData,
  targetData,
  2,           // Source index (contains 'Mar')
  'month',     // Source categorical key
  'period',    // Target categorical key
  'value'      // Sync method (finds 'Mar' in target)
);
```

##### `transformBrushRange(sourceData, targetData, sourceStart, sourceEnd, sourceDataKey, targetDataKey, syncMethod)`
Transforms a brush selection range from one chart to another.

```typescript
const range = transformBrushRange(
  sourceData,
  targetData,
  2,           // Source start index
  5,           // Source end index
  'month',     // Source categorical key
  'period',    // Target categorical key
  'value'      // Sync method
);
// Returns: { start: 2, end: 5 } or undefined if cannot transform
```

#### Validation Utilities

##### `isValidSyncId(syncId)`
Validates that a syncId is a non-empty string.

```typescript
isValidSyncId('sales-charts');  // true
isValidSyncId('');              // false
isValidSyncId(undefined);       // false
```

##### `extractSyncConfig(chartConfig)`
Extracts sync configuration from a chart config object.

```typescript
const chartConfig = {
  syncId: 'sales-charts',
  syncMethod: 'value'
};

const syncConfig = extractSyncConfig(chartConfig);
// Returns: SyncConfig object or undefined
```

## Usage Examples

### Example 1: Index-Based Synchronization

```typescript
import {
  buildSyncConfig,
  createGlobalSyncState,
  registerSyncListener,
  handleSyncedTooltip,
  getActiveSyncedTooltip
} from './utils/syncConfig';

// Create sync state manager
const syncState = createGlobalSyncState();

// Define sync configuration
const syncConfig = buildSyncConfig('sales-charts', 'index');

// Register a listener for state changes
registerSyncListener(syncState, 'sales-charts', (state) => {
  const tooltip = getActiveSyncedTooltip(state, 'sales-charts');
  console.log('Tooltip updated:', tooltip);
});

// When user hovers over a chart
function handleChartHover(index: number) {
  handleSyncedTooltip(syncState, 'sales-charts', {
    active: true,
    index: index
  });
}

// In the chart component, listen for sync state changes
const activeTooltip = getActiveSyncedTooltip(syncState, 'sales-charts');
if (activeTooltip?.index !== undefined) {
  // Show tooltip at this index
}
```

### Example 2: Value-Based Synchronization

```typescript
const syncConfig = buildSyncConfig('revenue-charts', 'value');

// When user hovers over month "March" in first chart
function handleChartHover(dataIndex: number, data: any[]) {
  const monthValue = data[dataIndex].month;

  handleSyncedTooltip(syncState, 'revenue-charts', {
    active: true,
    index: dataIndex,
    value: monthValue  // Store the categorical value
  });
}

// In second chart with different data structure
function renderChart2(syncState: GlobalSyncState) {
  const activeTooltip = getActiveSyncedTooltip(syncState, 'revenue-charts');

  if (activeTooltip?.value) {
    // Find matching month in this chart's data
    const chart2Index = findIndexByValue(
      chart2Data,
      'period',  // This chart uses 'period' instead of 'month'
      activeTooltip.value
    );

    if (chart2Index !== undefined) {
      // Show tooltip at matching index
    }
  }
}
```

### Example 3: Brush Synchronization

```typescript
const syncConfig = buildSyncConfig('sales-charts', 'index');

// When user adjusts brush in first chart
function handleBrushChange(startIndex: number, endIndex: number) {
  handleSyncedBrush(syncState, 'sales-charts', {
    dataStartIndex: startIndex,
    dataEndIndex: endIndex
  });
}

// In other charts, respond to brush changes
function renderChart2(syncState: GlobalSyncState) {
  const brush = getActiveSyncedBrush(syncState, 'sales-charts');

  if (brush) {
    // Apply the brush range to this chart's rendering
    console.log(`Show data from ${brush.dataStartIndex} to ${brush.dataEndIndex}`);
  }
}
```

### Example 4: Cross-Chart Tooltip with Value Transformation

```typescript
import {
  buildSyncConfig,
  createGlobalSyncState,
  handleSyncedTooltip,
  getActiveSyncedTooltip,
  transformTooltipIndex
} from './utils/syncConfig';

const syncState = createGlobalSyncState();
const syncConfig = buildSyncConfig('multi-chart', 'value');

// Chart 1 data
const chart1Data = [
  { month: 'Jan', sales: 100 },
  { month: 'Feb', sales: 150 },
  { month: 'Mar', sales: 200 }
];

// Chart 2 data (different structure)
const chart2Data = [
  { period: 'Jan', revenue: 5000 },
  { period: 'Feb', revenue: 6500 },
  { period: 'Mar', revenue: 8000 }
];

// When user hovers on Chart 1
function chart1OnHover(index: number) {
  handleSyncedTooltip(syncState, 'multi-chart', {
    active: true,
    index: index,
    value: chart1Data[index].month
  });
}

// Chart 2 component
function Chart2Component() {
  const activeTooltip = getActiveSyncedTooltip(syncState, 'multi-chart');

  if (activeTooltip?.active) {
    // Transform the tooltip to this chart's data
    const chart2Index = transformTooltipIndex(
      chart1Data,
      chart2Data,
      activeTooltip.index || 0,
      'month',
      'period',
      'value'
    );

    if (chart2Index !== undefined) {
      // Show tooltip at chart2Index
      return <ChartWithHighlightedIndex index={chart2Index} />;
    }
  }

  return <Chart />;
}
```

### Example 5: Brush Range Transformation

```typescript
const syncState = createGlobalSyncState();
const syncConfig = buildSyncConfig('analysis-charts', 'value');

function chart1OnBrushChange(startIndex: number, endIndex: number) {
  handleSyncedBrush(syncState, 'analysis-charts', {
    dataStartIndex: startIndex,
    dataEndIndex: endIndex
  });
}

function Chart2Component() {
  const brush = getActiveSyncedBrush(syncState, 'analysis-charts');

  if (brush) {
    // Transform the brush range to this chart's data
    const transformedRange = transformBrushRange(
      chart1Data,
      chart2Data,
      brush.dataStartIndex,
      brush.dataEndIndex,
      'month',   // Chart 1 categorical key
      'period',  // Chart 2 categorical key
      'value'    // Sync method
    );

    if (transformedRange) {
      return (
        <ChartWithBrush
          brushStart={transformedRange.start}
          brushEnd={transformedRange.end}
        />
      );
    }
  }

  return <Chart />;
}
```

## Integration with React Components

### Using React Context

For React components, you can use React Context to provide sync state throughout the component tree:

```typescript
import { createContext, useContext, ReactNode } from 'react';
import { createGlobalSyncState, GlobalSyncState } from './utils/syncConfig';

// Create context
const SyncStateContext = createContext<GlobalSyncState | null>(null);

// Provider component
export function SyncStateProvider({ children }: { children: ReactNode }) {
  const syncState = createGlobalSyncState();

  return (
    <SyncStateContext.Provider value={syncState}>
      {children}
    </SyncStateContext.Provider>
  );
}

// Hook to use sync state
export function useSyncState(): GlobalSyncState {
  const context = useContext(SyncStateContext);
  if (!context) {
    throw new Error('useSyncState must be used within SyncStateProvider');
  }
  return context;
}
```

### Using React Hooks

Create a custom hook for sync interactions:

```typescript
import { useEffect, useState } from 'react';
import { useSyncState } from './SyncStateContext';
import {
  getActiveSyncedTooltip,
  registerSyncListener,
  unregisterSyncListener
} from './utils/syncConfig';

export function useSyncedTooltip(syncId: string) {
  const syncState = useSyncState();
  const [tooltip, setTooltip] = useState(getActiveSyncedTooltip(syncState, syncId));

  useEffect(() => {
    const listener = (state) => {
      setTooltip(getActiveSyncedTooltip(state, syncId));
    };

    registerSyncListener(syncState, syncId, listener);

    return () => {
      unregisterSyncListener(syncState, syncId, listener);
    };
  }, [syncState, syncId]);

  return tooltip;
}
```

## Recharts Integration

Recharts already has built-in support for `syncId`. Simply pass the `syncId` to chart components:

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function Chart1({ data }: { data: any[] }) {
  return (
    <LineChart data={data} syncId="sales-charts">
      <XAxis dataKey="month" />
      <YAxis />
      <Line dataKey="sales" />
    </LineChart>
  );
}

function Chart2({ data }: { data: any[] }) {
  return (
    <LineChart data={data} syncId="sales-charts">
      <XAxis dataKey="period" />
      <YAxis />
      <Line dataKey="revenue" />
    </LineChart>
  );
}
```

## Testing

Unit tests are provided in `src/utils/syncConfig.test.ts`. Run tests with:

```bash
bun test src/utils/syncConfig.test.ts
```

### Test Coverage

- Configuration building and validation
- Sync state creation and management
- Listener registration and notification
- Tooltip state management
- Brush state management
- Data transformation utilities
- Index and value-based synchronization

## Best Practices

1. **Use consistent syncIds**: All charts that should synchronize must use the same `syncId`.

2. **Choose appropriate sync method**:
   - Use `'index'` when charts have the same data structure
   - Use `'value'` when charts have different data but shared categorical values

3. **Handle missing data**: When using value-based sync, handle cases where a value doesn't exist in the target chart.

4. **Unsubscribe from listeners**: Always unregister listeners when components unmount to prevent memory leaks.

5. **Isolate sync state**: Keep sync state isolated per sync group to prevent cross-contamination.

6. **Document sync configuration**: Document which charts share `syncIds` in your application.

## Troubleshooting

### Charts not synchronizing
- Verify all charts have the same `syncId`
- Check that the sync method matches the data structure
- Ensure listeners are properly registered

### Tooltips appearing in wrong positions
- For value-based sync, verify categorical keys exist in all charts
- Use `findIndexByValue` to debug value lookups
- Check that data is loaded before charts render

### Brush not synchronizing
- Verify `dataStartIndex` and `dataEndIndex` are valid
- Check that brush ranges don't exceed chart data bounds
- Use `transformBrushRange` to handle different data sizes

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│         Global Sync State (createGlobalSyncState)   │
│  ┌──────────────────────────────────────────────┐  │
│  │  tooltips: Map<syncId, SyncedTooltipState>   │  │
│  │  brushes: Map<syncId, SyncedBrushState>      │  │
│  │  listeners: Map<syncId, Set<Listeners>>      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
          ↑                     ↑                    ↑
    handleSyncedTooltip   handleSyncedBrush   registerListener
          │                     │                    │
   ┌──────┴─────────────────────┴────────────────────┴──────┐
   │                                                        │
   │  Chart 1        Chart 2        Chart 3     ...   Chart N
   │  syncId: "X"    syncId: "X"    syncId: "X"      syncId: "X"
   │  (index/value)  (index/value)  (index/value)    (index/value)
   │
   └────────────────────────────────────────────────────────┘
```

## Future Enhancements

Potential future features:
- Animated cursor that follows across charts
- Animated brush transitions
- Custom sync handlers for domain-specific logic
- Performance optimization for large datasets
- Cross-chart filtering and aggregation
- Synchronized legend interactions
