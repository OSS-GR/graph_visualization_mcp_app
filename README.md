# Graph Visualization MCP App

An interactive data visualization MCP App built with React and Recharts. Create beautiful, interactive charts from raw JSON data or stored datasets. Supports 10 chart types with comprehensive customization options including tooltips, legends, labels, reference elements, brushing, and chart synchronization.

## Features

- **10 Chart Types**: Bar, Line, Area, Pie, Composed, Scatter, Radar, Funnel, Sankey, Treemap
- **Flexible Data Input**: Raw JSON arrays or dataset IDs
- **Smart Chart Detection**: Automatically selects optimal chart type based on data structure
- **Advanced Interactivity**:
  - Tooltips with custom formatting
  - Click-filtering legends
  - Data labels with formatters (Percentage, Currency, Decimal, and chart-specific)
  - Reference lines and areas
  - Range selection with brush tool
  - Multi-chart synchronization
- **Layout Options**: Horizontal/vertical layouts, stacking modes including population pyramids
- **Dual Y-Axes**: For composed charts with different scales
- **Responsive Design**: Adapts to any container size
- **Theme Support**: Light and dark themes with CSS variable integration
- **Data Flexibility**: Works with any JSON structure - automatically detects numeric columns

## Installation

```bash
bun install
```

## Building

```bash
bun run build
```

This builds the React UI into a single HTML file that can be embedded in MCP hosts.

## Running the Server

```bash
bun run serve
```

Or in development mode:

```bash
bun run dev
```

The server listens on stdio and communicates with MCP hosts (like Claude Desktop).

## API Reference

### Tool: `create_visualization`

Creates an interactive chart from your data.

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | array \| object | Raw JSON data array OR `{ datasetId: string }` for stored datasets |

#### Chart Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `chartType` | string | Chart type: `bar`, `line`, `area`, `pie`, `composed`, `scatter`, `radar`, `funnel`, `sankey`, `treemap`. If omitted, auto-detected from data. |
| `title` | string | Chart title |
| `subtitle` | string | Optional subtitle |
| `theme` | string | `light` or `dark` (default: `light`) |
| `responsive` | boolean | Auto-resize to container (default: true) |

#### Axis Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `xAxis` | string | Column name for X-axis (defaults to first column) |
| `yAxis` | string \| string[] | Column name(s) for left Y-axis (defaults to first numeric column) |
| `yAxis2` | string \| string[] | Column name(s) for right Y-axis (composed charts only) |
| `layout` | string | `horizontal` or `vertical` for bar/area charts |
| `axisConfig` | object | Advanced axis configuration (see Axis Configuration section) |

#### Series and Data Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `series` | string[] | Column names to visualize (auto-detected if omitted) |
| `seriesConfig` | object | For composed charts: map series to type (`bar`, `line`, `area`) |

#### Bar Chart Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `barSize` | number \| string | Width/height of bars |
| `barGap` | number \| string | Gap between bar groups (e.g., `"20%"`) |
| `barCategoryGap` | number \| string | Gap between categories |
| `barRadius` | number \| number[] | Corner radius (number or `[topLeft, topRight, bottomRight, bottomLeft]`) |
| `maxBarSize` | number | Maximum bar size |
| `stackOffset` | string | Stacking mode: `none`, `expand`, `positive`, `sign`, `silhouette`, `wiggle`. Use `sign` for population pyramids. |
| `reverseStackOrder` | boolean | Reverse stacking order |
| `baseValue` | number \| string | Base value for stacking (`dataMax`, `dataMin`, or number) |

#### Line and Area Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `curveType` | string | Curve type: `monotone`, `natural`, `linear`, `cardinal`, `catmullRom` |
| `strokeWidth` | number | Line width |
| `fillOpacity` | number | Fill transparency (0-1) |
| `dotSize` | number | Data point marker size |
| `dotColor` | string | Data point color |

#### Animation

| Parameter | Type | Description |
|-----------|------|-------------|
| `animationDuration` | number | Animation duration in milliseconds (default: 800) |
| `animationEasing` | string | Easing function: `ease`, `linear`, `easeIn`, `easeOut`, `easeInOut` |

#### Labels

| Parameter | Type | Description |
|-----------|------|-------------|
| `label` | object | Label configuration (see Label Configuration section) |

#### Components

| Parameter | Type | Description |
|-----------|------|-------------|
| `tooltip` | object | Tooltip configuration (see Tooltip Configuration section) |
| `legend` | object | Legend configuration (see Legend Configuration section) |
| `brush` | object | Range selection brush (see Brush Configuration section) |
| `referenceElements` | array | Reference lines and areas (see Reference Elements section) |

#### Styling

| Parameter | Type | Description |
|-----------|------|-------------|
| `palette` | string[] | Custom color palette (array of hex colors) |
| `styling` | object | Margins, padding, background, border styling |
| `width` | number \| string | Chart width |
| `height` | number \| string | Chart height |

#### Interactivity

| Parameter | Type | Description |
|-----------|------|-------------|
| `syncId` | string | Synchronize multiple charts with same ID |
| `syncMethod` | string | Sync by: `index` or `value` |
| `clickable` | boolean | Enable click interactions |

#### Pie/Radar Specific

| Parameter | Type | Description |
|-----------|------|-------------|
| `cx` | number \| string | Center X position (default: `50%`) |
| `cy` | number \| string | Center Y position (default: `50%`) |
| `innerRadius` | number | Inner radius for donut charts |
| `outerRadius` | number | Outer radius |
| `startAngle` | number | Start angle in degrees (default: 0) |
| `endAngle` | number | End angle in degrees (default: 360) |

#### Scatter Specific

| Parameter | Type | Description |
|-----------|------|-------------|
| `bubbleSize` | number \| string | Size mapping (use `auto` or number) |
| `bubbleColor` | string | Bubble color |

### Configuration Details

#### Label Configuration

Controls how data labels appear on chart elements:

```json
{
  "label": {
    "enabled": true,
    "position": "top",
    "formatter": "Percentage",
    "offset": 5,
    "angle": 0,
    "color": "#333",
    "fontSize": 12
  }
}
```

**Formatter Options:**
- **Standard Formatters**: `Percentage`, `Currency`, `Decimal`, `default`
- **Chart-Specific Formatters**: `percentage`, `value`, `name`, `conversion`

#### Tooltip Configuration

Customize hover/click tooltips:

```json
{
  "tooltip": {
    "enabled": true,
    "trigger": "hover",
    "shared": true,
    "position": "auto",
    "contentStyle": { "backgroundColor": "#fff", "border": "1px solid #ccc" },
    "wrapperStyle": { "outline": "none" }
  }
}
```

#### Legend Configuration

Control legend appearance and behavior:

```json
{
  "legend": {
    "enabled": true,
    "layout": "horizontal",
    "align": "center",
    "verticalAlign": "bottom",
    "iconType": "square",
    "onClick": "filter"
  }
}
```

`onClick` values: `filter` (hide series), `highlight`, `none`

#### Brush Configuration

Add range selection tool to charts:

```json
{
  "brush": {
    "enabled": true,
    "dataStartIndex": 0,
    "dataEndIndex": 10,
    "height": 40,
    "fill": "rgba(0,0,0,0.1)",
    "stroke": "#999"
  }
}
```

#### Reference Elements

Add reference lines and areas:

```json
{
  "referenceElements": [
    {
      "type": "line",
      "value": 5000,
      "stroke": "#ff0000",
      "strokeDasharray": "5 5",
      "label": "Target"
    },
    {
      "type": "area",
      "value": [3000, 7000],
      "fill": "#00ff00",
      "fillOpacity": 0.1
    }
  ]
}
```

#### Axis Configuration

Advanced axis customization:

```json
{
  "axisConfig": {
    "x": {
      "type": "category",
      "label": "Time",
      "labelAngle": 45,
      "hide": false,
      "scale": "linear",
      "tickCount": 5
    },
    "y": {
      "type": "number",
      "label": "Value",
      "scale": "linear",
      "domain": [0, 10000]
    },
    "y2": {
      "type": "number",
      "label": "Other",
      "scale": "logarithmic"
    }
  }
}
```

#### Styling Configuration

```json
{
  "styling": {
    "margin": { "top": 20, "right": 20, "bottom": 20, "left": 60 },
    "padding": 10,
    "backgroundColor": "#ffffff",
    "borderRadius": 4,
    "borderColor": "#e0e0e0",
    "borderWidth": 1
  }
}
```

#### Examples

**Bar Chart - Monthly Sales:**
```json
{
  "data": [
    { "month": "Jan", "sales": 4000, "revenue": 2400 },
    { "month": "Feb", "sales": 3000, "revenue": 1398 },
    { "month": "Mar", "sales": 2000, "revenue": 9800 }
  ],
  "chartType": "bar",
  "title": "Monthly Sales",
  "xAxis": "month",
  "series": ["sales", "revenue"],
  "theme": "light"
}
```

**Composed Chart - Sales with Profit Margin:**
```json
{
  "data": [
    { "month": "Jan", "sales": 4000, "margin": 24 },
    { "month": "Feb", "sales": 3000, "margin": 22 },
    { "month": "Mar", "sales": 2000, "margin": 32 }
  ],
  "chartType": "composed",
  "title": "Sales and Profit Margin",
  "seriesConfig": { "sales": "bar", "margin": "line" },
  "label": { "enabled": true }
}
```

**Scatter Plot - 2D Analysis:**
```json
{
  "data": [
    { "temperature": 20, "humidity": 40, "location": "A" },
    { "temperature": 25, "humidity": 55, "location": "B" }
  ],
  "chartType": "scatter",
  "title": "Temperature vs Humidity",
  "xAxis": "temperature",
  "series": ["humidity"],
  "bubbleSize": "auto"
}
```

**Stacked Bar - Population Pyramid:**
```json
{
  "data": [
    { "ageGroup": "0-10", "male": -50, "female": 48 },
    { "ageGroup": "10-20", "male": -60, "female": 58 }
  ],
  "chartType": "bar",
  "title": "Population Pyramid",
  "layout": "horizontal",
  "stackOffset": "sign",
  "barGap": "-100%",
  "series": ["male", "female"]
}
```

**Radar Chart - Multi-Metric Comparison:**
```json
{
  "data": [
    { "metric": "Speed", "product_a": 85, "product_b": 70 },
    { "metric": "Reliability", "product_a": 78, "product_b": 90 }
  ],
  "chartType": "radar",
  "title": "Product Comparison",
  "theme": "dark"
}
```

**Pie Chart - Market Share:**
```json
{
  "data": [
    { "company": "A", "share": 30 },
    { "company": "B", "share": 25 },
    { "company": "C", "share": 45 }
  ],
  "chartType": "pie",
  "title": "Market Share",
  "label": { "enabled": true, "formatter": "percentage" }
}
```

**Sankey Diagram - Data Flow:**
```json
{
  "data": [
    { "source": "A", "target": "B", "value": 100 },
    { "source": "B", "target": "C", "value": 80 }
  ],
  "chartType": "sankey",
  "title": "Data Flow"
}
```

**Treemap - Hierarchical Data:**
```json
{
  "data": [
    { "name": "A", "value": 100 },
    { "name": "B", "value": 200 }
  ],
  "chartType": "treemap",
  "title": "Hierarchy"
}
```

**Synchronized Charts:**
```json
{
  "data": [...],
  "syncId": "chart-group-1",
  "syncMethod": "index"
}
```

## Chart Type Auto-Detection

When `chartType` is not specified, the app intelligently analyzes data structure and detects the best visualization:

| Condition | Auto-Selected Type | Example Data |
|-----------|-------------------|--------------|
| Data with `source`, `target`, `value` columns | **Sankey** | Flow diagrams, migration patterns |
| Data with `children` and `name` properties OR `name`/`value` pairs | **Treemap** | Hierarchical data, disk usage |
| Exactly 2 numeric series | **Scatter** | X-Y coordinate data |
| 3+ numeric series | **Radar** | Multi-metric comparison |
| Single series, 2-15 items with generally decreasing values | **Funnel** | Conversion funnels |
| Single series, 3-20 categories | **Pie** | Proportional data |
| 2+ series | **Composed** | Mixed chart types (bar + line) |
| Single series (default) | **Bar** | Categorical data |

## Supported Datasets

The mock database currently includes:

- `sales-2024`: Monthly sales, revenue, and profit data (Jan-Jun with values up to 9800)

## Project Structure

```
src/
├── app.tsx                 # React app entry point with MCP App lifecycle
├── types.ts               # TypeScript type definitions (ChartConfig, ParsedChartConfig)
├── components/
│   ├── ChartRenderer.tsx   # Main chart routing component
│   └── charts/
│       ├── BarChart.tsx         # Bar charts (horizontal & vertical layouts)
│       ├── LineChart.tsx        # Line and spline charts
│       ├── AreaChart.tsx        # Area and stacked area charts
│       ├── PieChart.tsx         # Pie and donut charts
│       ├── ComposedChart.tsx    # Mixed bar/line/area charts with dual Y-axes
│       ├── ScatterChart.tsx     # Scatter and bubble charts with category support
│       ├── RadarChart.tsx       # Radar charts with auto-transposition
│       ├── FunnelChart.tsx      # Funnel and conversion charts
│       ├── SankeyChart.tsx      # Sankey/flow diagrams
│       ├── TreemapChart.tsx     # Treemap hierarchical charts
│       └── CustomTooltip.tsx    # Shared tooltip component
├── utils/
│   ├── parseConfig.ts       # Configuration parsing, chart type inference, data validation
│   ├── chartColors.ts       # Theme color palettes (light & dark)
│   ├── labelConfig.ts       # Label formatter implementations
│   ├── tooltipConfig.ts     # Tooltip configuration helpers
│   └── legendConfig.ts      # Legend configuration and click handlers
├── index.html              # HTML template
server.ts                   # MCP server with tool & resource registration
vite.config.ts             # Vite build configuration with single-file bundling
package.json               # Dependencies and build scripts
```

## Advanced Features

### Label Formatters

The app supports multiple label formatting options to display data in different ways:

**Standard Formatters** (all chart types):
- `Percentage`: Shows value as percentage of total
- `Currency`: Formats as currency
- `Decimal`: Shows numeric value
- `default`: Shows raw value

**Chart-Specific Formatters**:
- `percentage`: Chart-specific percentage formatting
- `value`: Raw numeric value
- `name`: Series/category name
- `conversion`: Conversion rate formatting

### Stacking Modes

For bar and area charts, choose how overlapping series stack:

- `none`: Side-by-side bars
- `expand`: Stack to 100%
- `positive`: Stack positive values upward
- `sign`: Stack positive up, negative down (for population pyramids)
- `silhouette`: Center stacked area
- `wiggle`: Minimize wiggle in stacked area

### Population Pyramids

Create age/gender pyramids with:
```json
{
  "chartType": "bar",
  "layout": "horizontal",
  "stackOffset": "sign",
  "barGap": "-100%",
  "series": ["male", "female"]
}
```

With negative values for the left side and positive for the right.

### Dual Y-Axes

Combine charts with different scales using `composed` chart type:
```json
{
  "chartType": "composed",
  "series": ["sales", "margin"],
  "seriesConfig": { "sales": "bar", "margin": "line" },
  "yAxis": "sales",
  "yAxis2": "margin"
}
```

### Legend Click Filtering

Click legend items to show/hide series (set `legend.onClick` to `"filter"`).

### Range Selection Brush

Add an interactive range selector with `brush` configuration to zoom into data ranges.

### Multi-Chart Synchronization

Synchronize tooltips and selection across multiple charts using `syncId`:
```json
{
  "syncId": "dashboard-1",
  "syncMethod": "index"
}
```

### Radar Chart Data Transposition

Radar charts automatically detect and handle two data patterns:
- **Standard**: Data items are angle points, series are polygons
- **Transposed**: Series are angle points, data items are polygons

The app automatically transposes when series count exceeds data item count.

### Categorical Scatter Plots

Scatter plots automatically detect categorical data and render with proper legends and distinct colors per category.

## Theme Customization

Themes are preset and automatically matched to the host's theme when available:

- **Light Theme**: Bright backgrounds (#fff) with dark text (#333)
- **Dark Theme**: Dark backgrounds (#1e1e1e) with light text (#e0e0e0)

Both use carefully selected color palettes optimized for readability and accessibility.

## Development

### Technologies

- **React 19**: Modern UI framework with hooks and automatic batching
- **Recharts**: Composable chart library built on D3 with responsive containers
- **MCP Apps SDK**: Model Context Protocol extension for interactive UIs
- **TypeScript**: Strict type safety for configuration and components
- **Zod**: Schema validation for tool inputs
- **Vite**: Fast build tool with HMR support
- **Bun**: JavaScript runtime and package manager with native TypeScript support

### Prerequisites

- Bun runtime (installation: `curl -fsSL https://bun.sh/install | bash`)

### Local Development

Install dependencies:
```bash
bun install
```

Start development server with hot reload:
```bash
bun run dev
```

Build for production:
```bash
bun run build
```

Run the MCP server (production):
```bash
bun run serve
```

### Build Output

The build process generates:
- `dist/src/index.html` - Single-file bundled HTML with all JS, CSS, and dependencies embedded
- Ready for deployment to any MCP-compatible host

### Architecture Notes

1. **Server Side** (`server.ts`):
   - Registers `create_visualization` MCP tool with Zod schema validation
   - Registers UI resource endpoint serving bundled HTML
   - Tool receives configuration and echoes it back to UI

2. **Client Side** (`src/app.tsx`):
   - MCP App lifecycle handlers receive tool input and results
   - Parses configuration with `parseConfig()` utility
   - Routes to appropriate chart component based on type
   - Handles responsive sizing and theme integration

3. **Chart Components**:
   - Each chart type is a separate React component
   - Shared utilities for colors, labels, tooltips, legends
   - Responsive containers adapt to parent size
   - Click handlers for legend filtering

4. **Data Flow**:
   - User calls tool → Server validates with Zod → Returns config as text
   - UI receives and parses config → Detects chart type → Renders chart
   - User interacts with chart (legend click, tooltip hover, etc.)

## Testing

### With Claude Desktop

1. Build the app: `bun run build`
2. Configure `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "graph-viz": {
         "command": "bun",
         "args": ["run", "serve"],
         "cwd": "/path/to/graph_visualization_mcp_app"
       }
     }
   }
   ```
3. Start Claude Desktop and use the `create_visualization` tool

### With HTTP Transport

For testing during development, modify `server.ts` to use HTTP instead of stdio:

```typescript
const server = createServer();
Bun.serve({
  port: 3000,
  routes: {
    "/mcp": {
      POST: async (req) => {
        // Handle JSON-RPC requests
      }
    }
  }
});
```

## Performance Notes

- Data sets up to ~10,000 items render smoothly
- Recharts handles responsive resizing efficiently
- Labels disabled by default for large datasets (enable with `label.enabled`)
- Brush component recommended for datasets > 1,000 items for interactive filtering

## Notes

- **Data Format**: Flexible - any JSON array of objects works. Numeric columns auto-detected.
- **Missing Data**: Non-numeric values are skipped; series auto-detected from numeric columns.
- **Axis Labels**: For category axes, data is assumed to have repeating values. For numeric axes, continuous ranges are used.
- **Theme Integration**: Automatically uses host's theme CSS variables when available (Claude Desktop).
- **Accessibility**: Charts include proper ARIA labels and keyboard navigation support in Recharts.
- **Export**: Charts can be screenshotted but don't have built-in export functionality.
