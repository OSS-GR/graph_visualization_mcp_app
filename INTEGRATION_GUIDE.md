# Integration Guide - Graph Visualization MCP App

## Quick Start

### Installation

```bash
npm install
```

### Build

The application uses TypeScript and Vite for bundling:

```bash
npm run build
```

### Running the Server

```bash
npm run serve
```

### Development Mode

```bash
npm run dev
```

---

## Architecture Overview

### Directory Structure

```
src/
├── components/
│   ├── ChartRenderer.tsx          # Main chart router
│   ├── charts/                    # 10 chart type components
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── AreaChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── ComposedChart.tsx
│   │   ├── ScatterChart.tsx
│   │   ├── RadarChart.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── SankeyChart.tsx
│   │   ├── TreemapChart.tsx
│   │   └── CustomTooltip.tsx
│   ├── context/
│   │   └── SyncStateContext.tsx   # Cross-chart synchronization
│   └── examples/
│       └── SyncedChartsExample.tsx # Multi-chart example
├── hooks/
│   └── useBrush.ts                # Brush state management hook
├── utils/
│   ├── types.ts                   # TypeScript type definitions
│   ├── referenceConfig.ts         # Reference line/area utilities
│   ├── brushConfig.ts             # Brush configuration utilities
│   ├── parseConfig.ts             # Configuration parser
│   ├── tooltipConfig.ts           # Tooltip utilities
│   ├── legendConfig.tsx           # Legend utilities
│   ├── labelConfig.ts             # Label utilities
│   ├── a11y.ts                    # Accessibility utilities
│   ├── syncConfig.ts              # Synchronization utilities
│   ├── chartColors.ts             # Color palette utilities
│   └── *.test.ts                  # Unit tests
├── app.tsx                        # React app component
├── index.html                     # HTML entry point
└── index.ts                       # Entry point

server.ts                          # MCP server with Zod schema
main.ts                            # Server startup
package.json                       # Dependencies and scripts
tsconfig.json                      # TypeScript configuration
```

### Component Hierarchy

```
ChartRenderer
├── BarChart / LineChart / AreaChart...
│   ├── ResponsiveContainer
│   │   ├── XAxis / YAxis / YAxis2
│   │   ├── CartesianGrid
│   │   ├── Tooltip
│   │   ├── Legend
│   │   ├── Bar / Line / Area (series)
│   │   ├── ReferenceLine / ReferenceArea
│   │   ├── Brush
│   │   └── LabelList
│   └── CustomTooltip (for advanced formatting)
└── SyncStateContext (for multi-chart sync)
```

---

## Common Integration Scenarios

### Scenario 1: Simple Single Chart

Create a single bar chart with minimal configuration:

```typescript
import { ChartRenderer } from './components/ChartRenderer';
import type { ParsedChartConfig } from './types';

const config: ParsedChartConfig = {
  chartType: 'bar',
  title: 'Sales Data',
  data: [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 2000 }
  ],
  xAxis: 'month',
  series: ['sales'],
  seriesConfig: { sales: 'bar' },
  theme: 'light'
};

export function App() {
  return <ChartRenderer config={config} />;
}
```

### Scenario 2: Multi-Series Composed Chart

Display mixed chart types with reference lines:

```typescript
const config: ParsedChartConfig = {
  chartType: 'composed',
  title: 'Business Metrics',
  data: businessData,
  xAxis: 'date',
  series: ['revenue', 'profit', 'costs'],
  seriesConfig: {
    revenue: 'bar',
    profit: 'line',
    costs: 'area'
  },
  yAxis: 'revenue',
  yAxis2: 'profit',
  label: {
    enabled: true,
    position: 'top'
  },
  legend: {
    enabled: true,
    layout: 'horizontal',
    align: 'center'
  },
  tooltip: {
    enabled: true,
    trigger: 'hover',
    shared: true,
    animate: true,
    animationDuration: 200
  },
  referenceElements: [
    {
      type: 'line',
      value: 'average',
      label: 'Avg Revenue',
      stroke: '#ff0000',
      strokeDasharray: '5,5'
    },
    {
      type: 'area',
      value: [0, 5000],
      label: 'Target Range',
      fill: '#ccc',
      fillOpacity: 0.1
    }
  ],
  brush: {
    enabled: true,
    height: 50,
    fill: '#8884d8',
    stroke: '#666',
    fillOpacity: 0.1
  },
  theme: 'light',
  styling: {
    margin: { top: 20, right: 30, bottom: 20, left: 30 }
  }
};
```

### Scenario 3: Synchronized Multi-Chart Dashboard

Sync multiple charts with the same syncId:

```typescript
import { SyncStateContext } from './context/SyncStateContext';

const dashboardConfigs = [
  {
    chartType: 'bar',
    title: 'Sales by Region',
    data: salesData,
    xAxis: 'region',
    series: ['value'],
    seriesConfig: { value: 'bar' },
    syncId: 'dashboard-1',
    theme: 'light'
  },
  {
    chartType: 'line',
    title: 'Sales Trend',
    data: trendData,
    xAxis: 'date',
    series: ['value'],
    seriesConfig: { value: 'line' },
    syncId: 'dashboard-1',
    brush: { enabled: true, height: 40 },
    theme: 'light'
  },
  {
    chartType: 'pie',
    title: 'Sales Distribution',
    data: distributionData,
    xAxis: 'category',
    series: ['value'],
    seriesConfig: { value: 'bar' },
    syncId: 'dashboard-1',
    cx: '50%',
    cy: '50%',
    innerRadius: 40,
    outerRadius: 100,
    theme: 'light'
  }
];

export function Dashboard() {
  return (
    <SyncStateContext>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {dashboardConfigs.map((config, index) => (
          <ChartRenderer key={index} config={config} />
        ))}
      </div>
    </SyncStateContext>
  );
}
```

### Scenario 4: Data-Driven Dashboard with API Integration

Load chart data from an API and dynamically create visualizations:

```typescript
import { useEffect, useState } from 'react';
import { ChartRenderer } from './components/ChartRenderer';
import type { ParsedChartConfig } from './types';

export function ApiDashboard() {
  const [configs, setConfigs] = useState<ParsedChartConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartConfigs() {
      try {
        const response = await fetch('/api/chart-configs');
        const data = await response.json();
        setConfigs(data);
      } catch (error) {
        console.error('Failed to load chart configs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChartConfigs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {configs.map((config, index) => (
        <div key={index} style={{ marginBottom: '40px' }}>
          <ChartRenderer config={config} />
        </div>
      ))}
    </div>
  );
}
```

---

## Data Format

### Expected Data Structure

All charts expect data as an array of objects:

```typescript
const data = [
  { date: '2024-01-01', sales: 1000, profit: 200, region: 'US' },
  { date: '2024-01-02', sales: 1200, profit: 250, region: 'US' },
  { date: '2024-01-03', sales: 1100, profit: 220, region: 'EU' }
];
```

### Data Type Support

- **Numbers**: Used for Y-axis values and calculations
- **Strings**: Used for categories, labels, and X-axis
- **Dates**: Can be ISO strings or date objects
- **Objects**: Nested objects in data are flattened for Sankey/Treemap

### Handling Large Datasets

For optimal performance with large datasets:

```typescript
const config = {
  // ... other config
  brush: {
    enabled: true,
    height: 60,
    dataStartIndex: 0,
    dataEndIndex: 100  // Show first 100 items, user can brush for more
  }
};
```

---

## Customization Guide

### Custom Color Palettes

```typescript
const config = {
  theme: 'light',
  palette: [
    '#FF6B6B',  // Red
    '#4ECDC4',  // Teal
    '#45B7D1',  // Blue
    '#FFA07A',  // Light Salmon
    '#98D8C8'   // Mint
  ]
};
```

### Custom Styling

```typescript
const config = {
  styling: {
    margin: { top: 20, right: 30, bottom: 20, left: 30 },
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1
  }
};
```

### Custom Tooltip Formatting

```typescript
const config = {
  tooltip: {
    enabled: true,
    formatter: {
      sales: 'Currency',     // Special formatter
      profit: 'Decimal',
      count: 'Integer'
    }
  }
};
```

### Custom Labels

```typescript
const config = {
  label: {
    enabled: true,
    position: 'top',
    offset: 5,
    angle: 0,
    color: '#333',
    formatter: '${value}',
    fontSize: 12,
    fontWeight: 'bold'
  }
};
```

---

## MCP Server Integration

The application includes an MCP (Model Context Protocol) server with Zod schema validation:

### Server Startup

```typescript
// server.ts
import { createServer } from './server';

const server = createServer();

// Register the MCP server with your host application
```

### Zod Schema

All inputs are validated using Zod schema that includes:
- All 50+ configuration properties
- Enum validation for enumerated types
- Optional chaining for optional properties
- Type narrowing and validation

### Tool: create_visualization

**Input Schema:**
```typescript
{
  data: array<object> | { datasetId: string },
  chartType?: enum["bar", "line", "area", "pie", ...],
  title?: string,
  // ... 50+ more properties
}
```

**Returns:** Visualization configuration as JSON

---

## Performance Optimization

### Data Slicing with Brush

For large datasets (>1000 points), enable brush by default:

```typescript
const config = {
  brush: {
    enabled: true,
    dataStartIndex: 0,
    dataEndIndex: Math.min(100, data.length)
  }
};
```

### Memoization

Chart components use React.memo and useMemo for optimization:

```typescript
// Automatically optimized - don't pass new config objects
const [config] = useState(initialConfig);
```

### Responsive Sizing

Enable responsive mode for auto-sizing:

```typescript
const config = {
  responsive: true,
  width: '100%',
  height: '400px'  // Will be ignored when responsive=true
};
```

---

## Testing

### Unit Tests

Run tests for utility functions:

```bash
npm test
```

Tests are located in `src/utils/*.test.ts`:
- `referenceConfig.test.ts` - Reference line utilities
- `labelConfig.test.ts` - Label utilities
- `syncConfig.test.ts` - Synchronization utilities

### Manual Testing

Test a specific chart type:

```typescript
// In your component
const testConfigs = {
  bar: { chartType: 'bar', /* ... */ },
  line: { chartType: 'line', /* ... */ },
  // etc.
};

export function ChartGallery() {
  return Object.entries(testConfigs).map(([type, config]) => (
    <div key={type}>
      <h2>{type}</h2>
      <ChartRenderer config={config} />
    </div>
  ));
}
```

---

## Troubleshooting

### Chart Not Rendering

**Problem:** Chart appears blank
**Solution:** Check console for errors; verify:
- Data format is correct (array of objects)
- `xAxis` property matches a key in data
- `series` keys exist in data

```typescript
// Debug
console.log('Chart data:', data);
console.log('Series:', series);
console.log('Data sample:', data[0]);
```

### Reference Lines Not Showing

**Problem:** Reference lines not visible
**Solution:** Ensure:
- `referenceElements` array is defined
- `value` is numeric or valid keyword ("average", "max", "min")
- Stroke color is contrasting with chart background

### Brush Not Working

**Problem:** Brush component disabled
**Solution:** Check:
- `brush.enabled` is `true`
- Data length is sufficient (>1 point)
- `brush.dataStartIndex` < `brush.dataEndIndex`

### Performance Issues

**Problem:** Chart rendering is slow
**Solution:**
- Enable brush to limit visible data
- Use `responsive: false` and set explicit dimensions
- Reduce number of series
- Use lighter theme
- Check for console warnings about re-renders

---

## Migration Guide

### From Previous Versions

If migrating from version < 1.0:

1. **Update Configuration Format:**
```typescript
// Old
const config = {
  type: 'bar',  // Changed to chartType
  values: [...]  // Changed to series
};

// New
const config = {
  chartType: 'bar',
  series: ['value1', 'value2']
};
```

2. **Update Imports:**
```typescript
// Old
import Chart from './Chart';

// New
import { ChartRenderer } from './components/ChartRenderer';
```

3. **Update Data Format:**
```typescript
// Old
const data = [[1000, 2000, 3000]];

// New
const data = [
  { category: 'A', value: 1000 },
  { category: 'B', value: 2000 },
  { category: 'C', value: 3000 }
];
```

---

## Best Practices

1. **Always specify chartType explicitly** - Avoid relying on auto-detection
2. **Use syncId for related charts** - Keeps UX consistent
3. **Enable brush for large datasets** - Improves performance
4. **Set responsive: true** - Adapts to container size
5. **Use TypeScript** - Get full type safety
6. **Memoize config objects** - Prevents unnecessary re-renders
7. **Validate data format** - Check data before passing to charts
8. **Test all chart types** - Ensure your data works with each type

---

## Support & Documentation

- **Feature Documentation:** See `FEATURES.md`
- **Type Definitions:** Import from `src/types.ts`
- **Utility Functions:** See util files in `src/utils/`
- **Examples:** See `src/examples/`

---

**Last Updated:** 2026-01-28
**Version:** 1.0.0
