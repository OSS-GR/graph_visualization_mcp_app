# Graph Visualization MCP App

An interactive data visualization MCP App built with React and recharts. Create beautiful charts from raw JSON data or stored datasets.

## Features

- **Multiple Chart Types**: Bar, Line, Area, Pie, and combined Bar+Line charts
- **Flexible Data Input**: Accept raw JSON or reference stored datasets by ID
- **Smart Chart Selection**: LLM or user-specified chart type with intelligent defaults
- **Theme Support**: Light and dark theme presets
- **Interactive Elements**: Tooltips on hover, legends, and customizable titles
- **Dual Y-Axes**: Support for bar+line charts with dual Y-axis configuration
- **Column Flexibility**: No strict data format - works with any JSON structure

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

#### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | array \| object | ✓ | Raw JSON data array OR `{ datasetId: string }` for stored datasets |
| `chartType` | string | | Chart type: `bar`, `line`, `area`, `pie`, `bar-line`, `bar-line-dual`. If omitted, inferred from data. |
| `title` | string | | Chart title |
| `xAxis` | string | | Column name for X-axis (defaults to first column) |
| `yAxis` | string | | Column name for primary Y-axis (defaults to first numeric column) |
| `series` | string[] | | Column names to visualize (defaults to all numeric columns) |
| `theme` | string | | `light` or `dark` (default: `light`) |

#### Examples

**Raw JSON Data - Bar Chart:**
```json
{
  "data": [
    { "month": "Jan", "sales": 4000, "revenue": 2400 },
    { "month": "Feb", "sales": 3000, "revenue": 1398 },
    { "month": "Mar", "sales": 2000, "revenue": 9800 }
  ],
  "chartType": "bar",
  "title": "Monthly Sales"
}
```

**Dataset ID Reference:**
```json
{
  "data": { "datasetId": "sales-2024" },
  "chartType": "line",
  "title": "2024 Sales Trends"
}
```

**Auto-Detected Chart Type:**
```json
{
  "data": [
    { "product": "A", "value": 100 },
    { "product": "B", "value": 200 },
    { "product": "C", "value": 150 }
  ],
  "title": "Product Distribution"
}
```

## Chart Type Selection

When `chartType` is not specified, the app intelligently chooses based on:

- **Pie Chart**: Single series, 3-20 categories
- **Area Chart**: 1-2 series, 5+ data points
- **Line Chart**: Multiple series or time-series data
- **Bar Chart**: Default for single series

## Supported Datasets

The mock database currently includes:

- `sales-2024`: Monthly sales, revenue, and profit data

## Project Structure

```
src/
├── app.tsx                 # React app entry point with MCP App lifecycle
├── types.ts               # TypeScript type definitions
├── components/
│   ├── ChartRenderer.tsx   # Main chart routing component
│   └── charts/
│       ├── BarChart.tsx
│       ├── LineChart.tsx
│       ├── AreaChart.tsx
│       ├── PieChart.tsx
│       ├── ComposedChart.tsx  # Bar+Line combination
│       └── CustomTooltip.tsx
├── utils/
│   ├── parseConfig.ts      # Configuration parsing and validation
│   └── chartColors.ts      # Theme color definitions
├── index.html              # HTML template
server.ts                   # MCP server setup
vite.config.ts             # Vite build configuration
```

## Theme Customization

Themes are preset and cannot be customized by users. The app provides:

- **Light Theme**: Bright backgrounds with dark text
- **Dark Theme**: Dark backgrounds with light text

Both themes use carefully selected color palettes optimized for chart readability.

## Development

The app uses:

- **React 19**: UI framework
- **Recharts**: Chart library
- **MCP Apps SDK**: For MCP host integration
- **TypeScript**: Type safety
- **Vite**: Build tool with single-file bundling
- **Bun**: Package manager

## Testing

To test locally with Claude Desktop or another MCP host:

1. Build the app: `bun run build`
2. Configure your MCP host to use this server
3. Call the `create_visualization` tool with your data

## Notes

- Data format is flexible - any JSON structure works as long as it's an array of objects
- Numeric columns are automatically detected and can be used for visualization
- The UI adapts to the host's theme and styling when available
- Large datasets are handled efficiently with recharts' virtualization
