# Graph Visualization MCP App - Features Guide

## Overview

This application provides a comprehensive chart visualization system with support for 10 different chart types and 50+ configuration properties. All charts are built with React and Recharts, designed for interactivity, accessibility, and customization.

## Chart Types

### 1. Bar Chart
**File:** `src/components/charts/BarChart.tsx`

Display categorical data as vertical bars.

**Key Features:**
- Horizontal or vertical layout
- Multiple series support
- Bar grouping and spacing control
- Stacking options (none, expand, positive, sign, silhouette, wiggle)
- Reference lines and areas
- Brush for range selection
- Data labels
- Interactive legend (filter/highlight)

**Configuration Example:**
```typescript
{
  chartType: "bar",
  data: [...],
  xAxis: "category",
  series: ["value1", "value2"],
  layout: "vertical",
  barSize: "80%",
  barGap: "8%",
  barCategoryGap: "10%",
  stackOffset: "expand",
  label: { enabled: true, position: "top" },
  legend: { enabled: true, layout: "horizontal" },
  brush: { enabled: true, height: 40 }
}
```

### 2. Line Chart
**File:** `src/components/charts/LineChart.tsx`

Visualize trends with line series.

**Key Features:**
- Multiple curves per chart
- Curve type control (monotone, natural, linear, cardinal, catmullRom)
- Stroke and opacity customization
- Dot styling and size
- Reference lines and areas
- Brush for range selection
- Data labels
- Interactive legend
- Animation control

**Configuration Example:**
```typescript
{
  chartType: "line",
  data: [...],
  xAxis: "date",
  series: ["sales", "profit"],
  curveType: "monotone",
  strokeWidth: 2,
  dotSize: 6,
  fillOpacity: 0.3,
  animationDuration: 300,
  animationEasing: "easeInOut"
}
```

### 3. Area Chart
**File:** `src/components/charts/AreaChart.tsx`

Stacked area visualization with gradient fills.

**Key Features:**
- Area stacking and fill options
- Curve customization
- Fill opacity control
- Reference lines and areas
- Brush for range selection
- Data labels
- Interactive legend
- Margin and padding control

**Configuration Example:**
```typescript
{
  chartType: "area",
  data: [...],
  xAxis: "month",
  series: ["revenue", "expense"],
  stackOffset: "expand",
  fillOpacity: 0.6,
  curveType: "natural"
}
```

### 4. Pie Chart
**File:** `src/components/charts/PieChart.tsx`

Display proportional data as pie slices.

**Key Features:**
- Pie and donut variations (inner radius)
- Custom size and positioning (cx, cy)
- Start and end angles
- Data labels with custom formatting
- Interactive legend
- Tooltip support
- Color customization per segment

**Configuration Example:**
```typescript
{
  chartType: "pie",
  data: [...],
  xAxis: "category",
  series: ["value"],
  cx: "50%",
  cy: "50%",
  innerRadius: 60,
  outerRadius: 120,
  startAngle: 0,
  endAngle: 360,
  label: { enabled: true, position: "outside" }
}
```

### 5. Composed Chart
**File:** `src/components/charts/ComposedChart.tsx`

Combine multiple chart types (bar, line, area) in one visualization.

**Key Features:**
- Mixed series types (bar, line, area)
- Dual Y-axes support
- Per-series type configuration
- All standard features (reference lines, brush, labels, etc.)
- Series synchronization

**Configuration Example:**
```typescript
{
  chartType: "composed",
  data: [...],
  xAxis: "month",
  series: ["sales", "profit", "expenses"],
  seriesConfig: {
    sales: "bar",
    profit: "line",
    expenses: "area"
  },
  yAxis: "sales",
  yAxis2: "profit"
}
```

### 6. Scatter Chart
**File:** `src/components/charts/ScatterChart.tsx`

Plot data points in X-Y coordinate space.

**Key Features:**
- Multiple series support
- Bubble sizing options
- Reference lines and areas
- Data point customization
- Tooltip with coordinate display

**Configuration Example:**
```typescript
{
  chartType: "scatter",
  data: [...],
  xAxis: "age",
  series: ["weight"],
  bubbleSize: "auto",
  bubbleColor: "#8884d8"
}
```

### 7. Radar Chart
**File:** `src/components/charts/RadarChart.tsx`

Multi-dimensional data visualization in polar coordinates.

**Key Features:**
- Multi-axis support
- Multiple series comparison
- Customizable angles and curves
- Filled or outline style
- Interactive legend

**Configuration Example:**
```typescript
{
  chartType: "radar",
  data: [...],
  xAxis: "metric",
  series: ["product1", "product2"],
  startAngle: 0,
  endAngle: 360
}
```

### 8. Funnel Chart
**File:** `src/components/charts/FunnelChart.tsx`

Visualize sequential conversion stages.

**Key Features:**
- Multi-step funnel visualization
- Percentage and value display
- Conversion rate calculation
- Interactive segments
- Data labels with formatting

**Configuration Example:**
```typescript
{
  chartType: "funnel",
  data: [...],
  xAxis: "stage",
  series: ["users"],
  label: { enabled: true, position: "right" }
}
```

### 9. Sankey Chart
**File:** `src/components/charts/SankeyChart.tsx`

Flow diagram showing data movement between nodes.

**Key Features:**
- Node and link customization
- Color-coded flows
- Interactive tooltips
- Node labeling
- Data transformation utilities

**Configuration Example:**
```typescript
{
  chartType: "sankey",
  data: [...],
  xAxis: "source",
  series: ["target"],
  palette: ["#8884d8", "#82ca9d", "#ffc658"]
}
```

### 10. Treemap Chart
**File:** `src/components/charts/TreemapChart.tsx`

Hierarchical data visualization using nested rectangles.

**Key Features:**
- Hierarchical node structure
- Color coding by value
- Size proportional to value
- Interactive drill-down capability
- Custom coloring

**Configuration Example:**
```typescript
{
  chartType: "treemap",
  data: [...],
  xAxis: "category",
  series: ["value"],
  palette: ["#8884d8", "#82ca9d", "#ffc658"]
}
```

---

## Configuration Properties (50+)

### Basic Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chartType` | `ChartType` | required | Type of chart to render |
| `data` | `array\|object` | required | Chart data or dataset reference |
| `title` | `string` | - | Chart title |
| `subtitle` | `string` | - | Chart subtitle |

### Axes Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `xAxis` | `string` | auto-detected | Column name for X-axis |
| `yAxis` | `string` | auto-detected | Column name for primary Y-axis |
| `yAxis2` | `string` | - | Column name for secondary Y-axis |
| `axisConfig` | `object` | - | Advanced axis configuration |

### Series Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `series` | `array` | auto-detected | Array of series keys |
| `seriesConfig` | `object` | - | Type mapping for each series |

### Layout and Sizing

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layout` | `"horizontal"\|"vertical"` | "vertical" | Chart orientation |
| `width` | `number\|string` | "100%" | Chart width |
| `height` | `number\|string` | "400px" | Chart height |
| `responsive` | `boolean` | true | Enable responsive sizing |

### Bar Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `barSize` | `number\|string` | "auto" | Width of bars |
| `barGap` | `number\|string` | "4%" | Gap between series |
| `barCategoryGap` | `number\|string` | "8%" | Gap between categories |
| `maxBarSize` | `number` | - | Maximum bar width |

### Stacking Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `stackOffset` | enum | "none" | Stacking method (none, expand, positive, sign, silhouette, wiggle) |
| `reverseStackOrder` | `boolean` | false | Reverse stack order |
| `baseValue` | `number\|string` | 0 | Base value for stacking |

### Line and Area Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `curveType` | enum | "monotone" | Curve interpolation (monotone, natural, linear, cardinal, catmullRom) |
| `strokeWidth` | `number` | 2 | Line thickness |
| `fillOpacity` | `number` | 1 | Fill transparency (0-1) |
| `dotSize` | `number` | 4 | Data point size |
| `dotColor` | `string` | auto | Data point color |

### Animation

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `animationDuration` | `number` | 300 | Animation duration (ms) |
| `animationEasing` | enum | "ease" | Animation function (ease, linear, easeIn, easeOut, easeInOut) |

### Data Labels

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label.enabled` | `boolean` | false | Show data labels |
| `label.position` | enum | - | Label position (top, bottom, left, right, inside, outside, center) |
| `label.offset` | `number` | 0 | Label offset from data point |
| `label.angle` | `number` | 0 | Label rotation angle |
| `label.color` | `string` | inherit | Label color |
| `label.fontSize` | `number` | 12 | Label font size |
| `label.fontWeight` | enum | "normal" | Font weight (normal, bold, lighter) |

### Tooltip Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tooltip.enabled` | `boolean` | true | Show tooltip |
| `tooltip.trigger` | enum | "hover" | Trigger mode (hover, click) |
| `tooltip.shared` | `boolean` | true | Show all series in tooltip |
| `tooltip.contentType` | enum | "default" | Tooltip format (default, custom) |
| `tooltip.formatter` | `object` | - | Value formatting per series |
| `tooltip.animate` | `boolean` | true | Animate tooltip |
| `tooltip.animationDuration` | `number` | 300 | Tooltip animation duration |
| `tooltip.filterNull` | `boolean` | true | Hide null values |
| `tooltip.offset` | `number` | 10 | Tooltip offset from cursor |

### Legend Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `legend.enabled` | `boolean` | true | Show legend |
| `legend.layout` | enum | "horizontal" | Legend layout |
| `legend.align` | enum | "center" | Horizontal alignment |
| `legend.verticalAlign` | enum | "bottom" | Vertical alignment |
| `legend.iconType` | enum | "circle" | Legend icon shape |
| `legend.iconSize` | `number` | 18 | Icon size |
| `legend.inactiveColor` | `string` | - | Color of hidden series |
| `legend.onClick` | enum | "filter" | Click action (filter, highlight, none) |

### Reference Elements

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `referenceElements` | `array` | - | Array of reference lines/areas |
| `referenceElements[].type` | enum | required | "line" or "area" |
| `referenceElements[].value` | `number\|string` | - | Position (supports "average", "max", "min", "median", percentages) |
| `referenceElements[].stroke` | `string` | "#999" | Line color |
| `referenceElements[].strokeDasharray` | `string` | - | Dash pattern |
| `referenceElements[].fill` | `string` | - | Fill color for areas |
| `referenceElements[].fillOpacity` | `number` | 0.1 | Fill transparency |
| `referenceElements[].label` | `string` | - | Reference label text |

### Brush Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `brush.enabled` | `boolean` | false | Enable brush for range selection |
| `brush.dataStartIndex` | `number` | 0 | Initial start index |
| `brush.dataEndIndex` | `number` | data.length | Initial end index |
| `brush.height` | `number` | 40 | Brush height |
| `brush.travelAxis` | enum | "x" | Travel axis (x, y) |
| `brush.fill` | `string` | "#8884d8" | Brush fill color |
| `brush.stroke` | `string` | "#666" | Brush stroke color |
| `brush.fillOpacity` | `number` | 0.1 | Brush transparency |
| `brush.showPreview` | `boolean` | true | Show preview curve |

### Pie/Radar Specific

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `cx` | `number\|string` | "50%" | Center X position |
| `cy` | `number\|string` | "50%" | Center Y position |
| `innerRadius` | `number` | 0 | Inner radius (donut) |
| `outerRadius` | `number` | - | Outer radius |
| `startAngle` | `number` | 0 | Start angle in degrees |
| `endAngle` | `number` | 360 | End angle in degrees |

### Interactivity

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `clickable` | `boolean` | true | Enable click events |
| `syncId` | `string` | - | ID for cross-chart synchronization |
| `syncMethod` | enum | "index" | Sync method (index, value) |

### Styling

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `theme` | enum | "light" | Color theme (light, dark) |
| `palette` | `array` | theme-default | Custom color palette |
| `styling.margin` | `object` | - | Chart margins |
| `styling.padding` | `number` | - | Inner padding |
| `styling.backgroundColor` | `string` | - | Background color |
| `styling.borderRadius` | `number` | - | Border radius |
| `styling.borderColor` | `string` | - | Border color |
| `styling.borderWidth` | `number` | - | Border width |

---

## Utility Functions

### Reference Configuration (referenceConfig.ts)

#### parseReferenceValue()
Parse reference values supporting:
- Absolute values: `5000`
- Percentages: `"50%"`
- Statistics: `"average"`, `"max"`, `"min"`, `"median"`

```typescript
const value = parseReferenceValue("average", data, "sales");
```

#### createReferenceLine()
Create a reference line helper:

```typescript
const refLine = createReferenceLine(5000, "Target Sales", {
  stroke: "#ff0000",
  strokeDasharray: "5,5"
});
```

#### createReferenceArea()
Create a reference area helper:

```typescript
const refArea = createReferenceArea(4000, 6000, "Target Range", {
  fill: "#ccc",
  fillOpacity: 0.2
});
```

#### createStatisticLines()
Generate statistic-based reference lines:

```typescript
const lines = createStatisticLines(
  data,
  "sales",
  ["average", "max", "min"],
  { stroke: "#999" }
);
```

#### buildReferenceElements()
Process reference element configurations:

```typescript
const elements = buildReferenceElements(
  config.referenceElements,
  data,
  "value"
);
```

#### validateReferenceElements()
Validate reference configurations:

```typescript
const validation = validateReferenceElements(
  config.referenceElements,
  data,
  "value"
);
```

### Brush Configuration (brushConfig.ts)

#### buildBrushConfig()
Create Recharts Brush props:

```typescript
const brushProps = buildBrushConfig(config.brush, data.length);
```

#### onBrushChange()
Handle brush range changes:

```typescript
const result = onBrushChange(startIdx, endIdx, data.length);
```

#### filterDataByBrushRange()
Filter data by brush selection:

```typescript
const filtered = filterDataByBrushRange(data, 10, 50);
```

#### handleBrushKeyboard()
Support keyboard controls:

```typescript
const result = handleBrushKeyboard("ArrowLeft", 10, 50, 100);
```

#### syncBrushState()
Synchronize brush across charts:

```typescript
const synced = syncBrushState(brushState, syncId);
```

### useBrush Hook

React hook for brush state management:

```typescript
const {
  brushState,
  builtConfig,
  filteredData,
  isValid,
  validationError,
  handlers
} = useBrush({
  config: brushConfig,
  data: chartData,
  syncId: "chart-sync-1",
  onBrushChangeCallback: (result) => {
    console.log(`Range: ${result.startIndex} to ${result.endIndex}`);
  }
});
```

---

## Examples

### Basic Bar Chart

```typescript
const config = {
  chartType: "bar",
  data: [
    { month: "Jan", sales: 4000, profit: 2400 },
    { month: "Feb", sales: 3000, profit: 2210 },
    { month: "Mar", sales: 2000, profit: 2290 }
  ],
  xAxis: "month",
  series: ["sales", "profit"],
  title: "Monthly Sales"
};
```

### Composed Chart with Dual Axes

```typescript
const config = {
  chartType: "composed",
  data: salesData,
  xAxis: "month",
  series: ["sales", "profit", "expenses"],
  seriesConfig: {
    sales: "bar",
    profit: "line",
    expenses: "area"
  },
  yAxis: "sales",
  yAxis2: "profit",
  label: { enabled: true },
  brush: { enabled: true, height: 50 },
  referenceElements: [
    {
      type: "line",
      value: "average",
      label: "Avg Sales",
      stroke: "#ff0000"
    }
  ]
};
```

### Interactive Pie Chart

```typescript
const config = {
  chartType: "pie",
  data: categoryData,
  xAxis: "category",
  series: ["value"],
  cx: "50%",
  cy: "50%",
  innerRadius: 60,
  outerRadius: 120,
  label: {
    enabled: true,
    position: "outside"
  },
  legend: {
    enabled: true,
    layout: "vertical",
    align: "right"
  }
};
```

### Synchronized Multi-Chart Layout

```typescript
const config1 = {
  chartType: "bar",
  data: data,
  xAxis: "date",
  series: ["value1"],
  syncId: "chart-group-1",
  brush: { enabled: true }
};

const config2 = {
  chartType: "line",
  data: data,
  xAxis: "date",
  series: ["value2"],
  syncId: "chart-group-1"
};

// Both charts will sync selection and tooltip state
```

---

## Accessibility Features

- Semantic HTML with proper ARIA labels
- Keyboard navigation support for brushes
- High contrast mode support
- Reduced motion preference respect
- Screen reader friendly tooltips
- Color blind friendly palettes

## Type Definitions

All configuration properties are fully typed with TypeScript. Import from `types.ts`:

```typescript
import type {
  ChartConfig,
  ParsedChartConfig,
  TooltipConfig,
  LegendConfig,
  BrushConfig,
  ReferenceElement,
  AxisConfig,
  LabelConfig
} from './types';
```

## Error Handling

The application includes comprehensive validation:
- Zod schema validation on server
- Type checking at component level
- Configuration validation in utilities
- Data format checking

## Performance Considerations

- Responsive rendering with data limits
- Memoized computations for large datasets
- Lazy loading for chart components
- Efficient re-render optimization

---

**Last Updated:** 2026-01-28
**Version:** 1.0.0
