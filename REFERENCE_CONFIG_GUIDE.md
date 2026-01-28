# Reference Lines and Reference Areas Configuration Guide

## Overview

The `referenceConfig.ts` utility module provides comprehensive support for creating and managing reference lines and reference areas in Recharts visualizations. It enables advanced data visualization features like showing average lines, target ranges, and statistical indicators on charts.

## Features

### Supported Reference Value Types

1. **Absolute Values**
   - Plain numeric values: `5000`
   - Used for fixed thresholds or targets

2. **Percentage Values**
   - Format: `"50%"`
   - Calculated as a percentage of the maximum value in the dataset

3. **Data-Based Statistics**
   - `"average"` or `"mean"`: Calculates the average of values
   - `"max"` or `"maximum"`: Finds the maximum value
   - `"min"` or `"minimum"`: Finds the minimum value
   - `"median"`: Calculates the median value

4. **Label Positioning**
   - `"top"`, `"bottom"`, `"left"`, `"right"`
   - `"inside"`, `"outside"`, `"center"`
   - `"insideTopRight"`, `"insideTopLeft"`, `"insideBottomRight"`, `"insideBottomLeft"`

## API Reference

### Core Functions

#### `parseReferenceValue(value, data, dataKey?)`

Parses a reference value from various formats and converts it to a numeric value.

**Parameters:**
- `value`: `number | string | undefined` - The value to parse
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` (optional) - The key to extract numeric values from

**Returns:** `number | undefined`

**Example:**
```typescript
const data = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 2000 },
];

parseReferenceValue(5000, data); // Returns 5000
parseReferenceValue("50%", data, "sales"); // Returns 2000 (50% of max)
parseReferenceValue("average", data, "sales"); // Returns ~3000
parseReferenceValue("max", data, "sales"); // Returns 4000
```

#### `extractNumericValues(data, dataKey?)`

Extracts numeric values from the chart data.

**Parameters:**
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` (optional) - Specific key to extract; if omitted, extracts all numeric values

**Returns:** `number[]`

**Example:**
```typescript
const data = [
  { month: "Jan", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
];

extractNumericValues(data, "sales"); // [4000, 3000]
extractNumericValues(data); // [4000, 2400, 3000, 1398]
```

#### `calculateAverage(values)`

Calculates the average of numeric values.

**Parameters:**
- `values`: `number[]` - Array of numbers

**Returns:** `number`

**Example:**
```typescript
calculateAverage([10, 20, 30, 40, 50]); // 30
```

#### `calculateMedian(values)`

Calculates the median of numeric values.

**Parameters:**
- `values`: `number[]` - Array of numbers

**Returns:** `number`

**Example:**
```typescript
calculateMedian([10, 20, 30, 40, 50]); // 30
calculateMedian([10, 20, 30, 40]); // 25
```

### Helper Functions

#### `createReferenceLine(value, label?, style?)`

Creates a reference line configuration.

**Parameters:**
- `value`: `number | string` - The value at which to place the line
- `label`: `string` (optional) - Label text to display
- `style`: `ReferenceLineStyle` (optional) - Styling configuration

**Returns:** `ReferenceElement`

**Example:**
```typescript
createReferenceLine(5000, "Target", {
  stroke: "#ff0000",
  strokeDasharray: "5 5"
});
```

#### `createReferenceArea(yAxisStart, yAxisEnd, label?, style?)`

Creates a reference area configuration for highlighting a range.

**Parameters:**
- `yAxisStart`: `number | string` - Start value of the range
- `yAxisEnd`: `number | string` - End value of the range
- `label`: `string` (optional) - Label text to display
- `style`: `ReferenceAreaStyle` (optional) - Styling configuration

**Returns:** `ReferenceElement`

**Example:**
```typescript
createReferenceArea(3000, 5000, "Target Range", {
  fill: "#cccccc",
  fillOpacity: 0.2,
  stroke: "#999999"
});
```

#### `createStatisticLines(data, dataKey, includeStats?, style?)`

Automatically creates reference lines for data statistics.

**Parameters:**
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` - The key to extract values from
- `includeStats`: `("average" | "max" | "min" | "median")[]` (optional) - Which statistics to include
- `style`: `ReferenceLineStyle` (optional) - Styling for all created lines

**Returns:** `ReferenceElement[]`

**Example:**
```typescript
const referenceLines = createStatisticLines(
  data,
  "sales",
  ["average", "max", "min"],
  { stroke: "#999", strokeDasharray: "5 5" }
);
```

### Processing Functions

#### `buildReferenceElements(elements, data, dataKey?)`

Processes and normalizes reference element configurations for use in charts.

**Parameters:**
- `elements`: `ReferenceElement[] | undefined` - Array of reference elements
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` (optional) - Key for numeric value extraction

**Returns:** `ReferenceElement[]`

**Example:**
```typescript
const elements = [
  { type: "line", value: "average", label: "Average" },
  { type: "area", value: [3000, 5000], label: "Target Range" },
];

const processed = buildReferenceElements(elements, data, "sales");
```

### Validation Functions

#### `validateReferenceValue(value, data, dataKey?)`

Validates a single reference value.

**Parameters:**
- `value`: `number | string | undefined` - The value to validate
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` (optional) - Key for numeric value extraction

**Returns:** `ValidationResult`

**Example:**
```typescript
const result = validateReferenceValue(5000, data);
if (result.valid) {
  console.log("Valid value:", result.normalizedValue);
} else {
  console.error("Validation error:", result.error);
}
```

#### `validateReferenceElements(elements, data, dataKey?)`

Validates an array of reference elements.

**Parameters:**
- `elements`: `ReferenceElement[] | undefined` - Array of reference elements
- `data`: `Record<string, unknown>[]` - The chart data
- `dataKey`: `string` (optional) - Key for numeric value extraction

**Returns:** `{ valid: boolean; errors: string[] }`

**Example:**
```typescript
const result = validateReferenceElements(elements, data);
if (!result.valid) {
  console.error("Validation errors:", result.errors);
}
```

## Type Definitions

### `ReferenceLineStyle`

```typescript
interface ReferenceLineStyle {
  stroke?: string;           // Line color (e.g., "#ff0000")
  strokeDasharray?: string;  // Dash pattern (e.g., "5 5")
  strokeWidth?: number;      // Line width in pixels
}
```

### `ReferenceAreaStyle`

```typescript
interface ReferenceAreaStyle {
  fill?: string;           // Area fill color (e.g., "#cccccc")
  fillOpacity?: number;    // Transparency (0-1)
  stroke?: string;         // Border color
  strokeDasharray?: string; // Border dash pattern
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedValue?: number | number[];
}
```

### `ReferenceValueType`

```typescript
type ReferenceValueType = "absolute" | "percentage" | "data-based";
```

## Usage Examples

### Example 1: Simple Target Line

```typescript
import { createReferenceLine } from "./utils/referenceConfig";

const targetLine = createReferenceLine(5000, "Target", {
  stroke: "#ff0000",
  strokeDasharray: "5 5"
});

// Use in chart config
const config = {
  chartType: "line",
  data: [...],
  referenceElements: [targetLine]
};
```

### Example 2: Average Line with Automatic Calculation

```typescript
import { createStatisticLines } from "./utils/referenceConfig";

const referenceLines = createStatisticLines(
  data,
  "sales",
  ["average"],
  { stroke: "#999" }
);

// Use in chart config
const config = {
  chartType: "line",
  data,
  referenceElements: referenceLines
};
```

### Example 3: Target Range Area

```typescript
import { createReferenceArea } from "./utils/referenceConfig";

const targetRange = createReferenceArea(
  3000,
  5000,
  "Acceptable Range",
  {
    fill: "#90EE90",
    fillOpacity: 0.2
  }
);

// Use in chart config
const config = {
  chartType: "bar",
  data,
  referenceElements: [targetRange]
};
```

### Example 4: Mixed Reference Elements

```typescript
import {
  createReferenceLine,
  createReferenceArea,
  createStatisticLines
} from "./utils/referenceConfig";

const mixedElements = [
  ...createStatisticLines(data, "sales", ["average", "max", "min"]),
  createReferenceArea(3000, 5000, "Target Range", {
    fill: "#cccccc",
    fillOpacity: 0.1
  }),
  createReferenceLine(6000, "Stretch Goal", {
    stroke: "#ff0000",
    strokeDasharray: "3 3"
  })
];

// Use in chart config
const config = {
  chartType: "composed",
  data,
  referenceElements: mixedElements
};
```

### Example 5: Percentage-Based Reference

```typescript
import { parseReferenceValue, createReferenceLine } from "./utils/referenceConfig";

const fiftyPercentLine = parseReferenceValue("50%", data, "revenue");
const refLine = createReferenceLine(fiftyPercentLine, "50% of Max");

// Use in chart config
const config = {
  chartType: "area",
  data,
  referenceElements: [refLine]
};
```

## Integration with Chart Components

The reference elements are automatically rendered by chart components (LineChart, BarChart, AreaChart, ComposedChart) when provided in the `ParsedChartConfig`.

### Chart Component Usage

```typescript
import { ChartRenderer } from "./components/ChartRenderer";

const chartConfig = {
  chartType: "line",
  data: salesData,
  series: ["sales", "revenue"],
  xAxis: "month",
  referenceElements: [
    { type: "line", value: "average", label: "Average Sales" },
    { type: "area", value: [3000, 5000], label: "Target Range", fill: "#90EE90", fillOpacity: 0.2 }
  ]
};

export function MyChart() {
  return <ChartRenderer config={chartConfig} />;
}
```

## Validation and Error Handling

All functions include built-in validation and graceful error handling:

```typescript
import { validateReferenceElements } from "./utils/referenceConfig";

const result = validateReferenceElements(elements, data);

if (!result.valid) {
  result.errors.forEach(error => {
    console.error(error);
  });
}
```

Validation checks include:
- Invalid element types
- Missing or invalid values
- Out-of-range fillOpacity values (0-1)
- Invalid position and labelPosition values
- Data-based value calculation failures

## Performance Considerations

- Numeric value extraction is optimized and cached within function calls
- Statistics calculations (average, median) are performed once per function call
- Large datasets are handled efficiently without iterations over the full dataset

## Browser Compatibility

The utility functions are compatible with all modern browsers and Node.js environments that support ES6+ features.

## Testing

Comprehensive unit tests are provided in `referenceConfig.test.ts`. Run tests using:

```bash
bun test src/utils/referenceConfig.test.ts
```

Test coverage includes:
- Value parsing (absolute, percentage, statistics)
- Data extraction and calculation
- Element creation and building
- Validation logic
- Edge cases and error handling
