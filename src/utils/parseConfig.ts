// @ts-nocheck
import type { ChartConfig, ParsedChartConfig, ChartType } from "../types";

// Mock database of datasets
const mockDatabase: Record<string, Record<string, unknown>[]> = {
  "sales-2024": [
    { month: "Jan", sales: 4000, revenue: 2400, profit: 2400 },
    { month: "Feb", sales: 3000, revenue: 1398, profit: 2210 },
    { month: "Mar", sales: 2000, revenue: 9800, profit: 2290 },
    { month: "Apr", sales: 2780, revenue: 3908, profit: 2000 },
    { month: "May", sales: 1890, revenue: 4800, profit: 2181 },
    { month: "Jun", sales: 2390, revenue: 3800, profit: 2500 },
  ],
};

export function parseConfig(config: ChartConfig): ParsedChartConfig {
  // Validate input data
  let data: Record<string, unknown>[] = [];

  if (Array.isArray(config.data)) {
    // Raw JSON data provided
    data = config.data as Record<string, unknown>[];
  } else if (
    typeof config.data === "object" &&
    config.data !== null &&
    "datasetId" in config.data
  ) {
    // Dataset ID provided
    const datasetId = (config.data as { datasetId: string }).datasetId;
    const dataset = mockDatabase[datasetId];
    if (!dataset) {
      throw new Error(`Dataset with ID "${datasetId}" not found`);
    }
    data = dataset;
  } else {
    throw new Error("Invalid data: must be an array or have a datasetId property");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data must be a non-empty array");
  }

  // Infer keys from first data item
  const sampleItem = data[0];
  if (typeof sampleItem !== "object" || sampleItem === null) {
    throw new Error("Data items must be objects");
  }

  const availableKeys = Object.keys(sampleItem);
  if (availableKeys.length === 0) {
    throw new Error("Data items must have at least one property");
  }

  // Determine X-axis
  const xAxis = config.xAxis ?? availableKeys[0];
  if (typeof xAxis !== "string" || !availableKeys.includes(xAxis)) {
    throw new Error(`X-axis column "${xAxis}" not found in data`);
  }

  // Determine series (Y-axis columns)
  let series = config.series || [];
  if (series.length === 0) {
    // Use all non-x-axis columns that are numeric
    series = availableKeys.filter(
      (key) =>
        key !== xAxis &&
        data.some(
          (item) =>
            typeof item[key] === "number" || !isNaN(Number(item[key]))
        )
    );
  }

  if (series.length === 0) {
    throw new Error(
      "No numeric columns found for visualization. Provide series in config."
    );
  }

  // Determine chart type intelligently
  let chartType = config.chartType || inferChartType(data, series);

  // Build series config - which series is which type (bar/line/area)
  // Only used for composed charts; simple charts ignore this
  const seriesConfig: Record<string, "bar" | "line" | "area"> = {};

  if (config.seriesConfig) {
    // User provided explicit config
    Object.assign(seriesConfig, config.seriesConfig);
  }

  // IMPORTANT: Only fill in defaults if chart will be composed
  // For bar/line/area charts, all series use the same type - don't set seriesConfig
  if (chartType === "composed") {
    // Fill in any missing series with default types for composed charts only
    for (const s of series) {
      if (!seriesConfig[s]) {
        // For composed charts, default: first series as bar, rest as line
        seriesConfig[s] = series.indexOf(s) === 0 ? "bar" : "line";
      }
    }
  }

  // Determine theme
  const theme = (config.theme ?? "light") as "light" | "dark";

  const parsedConfig: ParsedChartConfig = {
    chartType,
    title: config.title ?? "Data Visualization",
    data,
    xAxis,
    series,
    seriesConfig,
    theme,
  };

  // Add subtitle if provided
  if (config.subtitle !== undefined) {
    parsedConfig.subtitle = config.subtitle;
  }

  // Pass through optional enhanced configs
  if (config.layout !== undefined) {
    parsedConfig.layout = config.layout;
  }
  if (config.barSize !== undefined) {
    parsedConfig.barSize = config.barSize;
  }
  if (config.barGap !== undefined) {
    parsedConfig.barGap = config.barGap;
  }
  if (config.barCategoryGap !== undefined) {
    parsedConfig.barCategoryGap = config.barCategoryGap;
  }
  if (config.maxBarSize !== undefined) {
    parsedConfig.maxBarSize = config.maxBarSize;
  }
  if (config.barRadius !== undefined) {
    parsedConfig.barRadius = config.barRadius;
  }
  if (config.stackOffset !== undefined) {
    parsedConfig.stackOffset = config.stackOffset;
  }
  if (config.reverseStackOrder !== undefined) {
    parsedConfig.reverseStackOrder = config.reverseStackOrder;
  }
  if (config.baseValue !== undefined) {
    parsedConfig.baseValue = config.baseValue;
  }
  if (config.curveType !== undefined) {
    parsedConfig.curveType = config.curveType;
  }
  if (config.strokeWidth !== undefined) {
    parsedConfig.strokeWidth = config.strokeWidth;
  }
  if (config.fillOpacity !== undefined) {
    parsedConfig.fillOpacity = config.fillOpacity;
  }
  if (config.dotSize !== undefined) {
    parsedConfig.dotSize = config.dotSize;
  }
  if (config.dotColor !== undefined) {
    parsedConfig.dotColor = config.dotColor;
  }
  if (config.animationDuration !== undefined) {
    parsedConfig.animationDuration = config.animationDuration;
  }
  if (config.animationEasing !== undefined) {
    parsedConfig.animationEasing = config.animationEasing;
  }
  if (config.label !== undefined) {
    parsedConfig.label = config.label;
  }
  if (config.tooltip !== undefined) {
    parsedConfig.tooltip = config.tooltip;
  }
  if (config.legend !== undefined) {
    parsedConfig.legend = config.legend;
  }
  if (config.brush !== undefined) {
    parsedConfig.brush = config.brush;
  }
  if (config.referenceElements !== undefined) {
    parsedConfig.referenceElements = config.referenceElements;
  }
  if (config.axisConfig !== undefined) {
    parsedConfig.axisConfig = config.axisConfig;
  }
  if (config.syncId !== undefined) {
    parsedConfig.syncId = config.syncId;
  }
  if (config.styling !== undefined) {
    parsedConfig.styling = config.styling;
  }
  if (config.palette !== undefined) {
    parsedConfig.palette = config.palette;
  }
  if (config.cx !== undefined) {
    parsedConfig.cx = config.cx;
  }
  if (config.cy !== undefined) {
    parsedConfig.cy = config.cy;
  }
  if (config.innerRadius !== undefined) {
    parsedConfig.innerRadius = config.innerRadius;
  }
  if (config.outerRadius !== undefined) {
    parsedConfig.outerRadius = config.outerRadius;
  }
  if (config.startAngle !== undefined) {
    parsedConfig.startAngle = config.startAngle;
  }
  if (config.endAngle !== undefined) {
    parsedConfig.endAngle = config.endAngle;
  }

  // Build seriesYAxisMap for composed charts with dual axes
  if (config.yAxis || config.yAxis2) {
    const seriesYAxisMap: Record<string, "left" | "right"> = {};

    // Map yAxis series to left axis
    if (config.yAxis) {
      const leftAxisSeries = Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis];
      leftAxisSeries.forEach((s) => {
        if (series.includes(s)) {
          seriesYAxisMap[s] = "left";
        }
      });
    }

    // Map yAxis2 series to right axis
    if (config.yAxis2) {
      const rightAxisSeries = Array.isArray(config.yAxis2) ? config.yAxis2 : [config.yAxis2];
      rightAxisSeries.forEach((s) => {
        if (series.includes(s)) {
          seriesYAxisMap[s] = "right";
        }
      });
    }

    parsedConfig.seriesYAxisMap = seriesYAxisMap;
  }

  // Pass through yAxis and yAxis2 if provided
  if (config.yAxis !== undefined) {
    parsedConfig.yAxis = config.yAxis;
  }
  if (config.yAxis2 !== undefined) {
    parsedConfig.yAxis2 = config.yAxis2;
  }

  return parsedConfig;
}

function inferChartType(
  data: Record<string, unknown>[],
  series: string[]
): ChartType {
  const dataLength = data.length;

  // Check for Sankey pattern (source/target/value)
  if (
    data.every(
      (item) =>
        "source" in item &&
        "target" in item &&
        "value" in item
    )
  ) {
    console.info("Detected Sankey chart type from data pattern");
    return "sankey";
  }

  // Check for Treemap pattern (hierarchical with children or name/value pairs)
  const firstItem = data[0];
  if (firstItem && "children" in firstItem && "name" in firstItem) {
    console.info("Detected Treemap chart type from hierarchical pattern");
    return "treemap";
  }

  if (
    data.every(
      (item) =>
        "name" in item &&
        "value" in item &&
        typeof (item as Record<string, unknown>).value === "number"
    )
  ) {
    console.info("Detected Treemap chart type from name/value pattern");
    return "treemap";
  }

  // For scatter charts: 2 series with numeric data (x, y coordinates)
  if (series.length === 2 && dataLength >= 3) {
    // Check if both series are numeric
    const firstSeries = series[0]!;
    const secondSeries = series[1]!;
    const allNumeric =
      data.every((item) => {
        const val1 = item[firstSeries];
        const val2 = item[secondSeries];
        return (
          (typeof val1 === "number" || !isNaN(Number(val1))) &&
          (typeof val2 === "number" || !isNaN(Number(val2)))
        );
      }) && dataLength >= 3;

    if (allNumeric) {
      console.info("Detected Scatter chart type from 2-series numeric pattern");
      return "scatter";
    }
  }

  // For radar charts: 3+ series with comparable numeric values
  if (series.length >= 3) {
    const allNumeric = data.every((item) =>
      series.every((s) => {
        const val = item[s];
        return typeof val === "number" || !isNaN(Number(val));
      })
    );

    if (allNumeric && dataLength >= 3) {
      console.info("Detected Radar chart type from 3+ series numeric pattern");
      return "radar";
    }
  }

  // For funnel charts: single series with decreasing values (conversion flow)
  if (series.length === 1 && dataLength >= 2 && dataLength <= 15) {
    const values = data
      .map((item) => Number(item[series[0]!]) || 0)
      .filter((v) => v > 0);

    // Check if values are generally decreasing (indicating conversion flow)
    let decreasingCount = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] <= values[i - 1]) {
        decreasingCount++;
      }
    }

    if (decreasingCount >= values.length * 0.6) {
      console.info("Detected Funnel chart type from decreasing single-series pattern");
      return "funnel";
    }
  }

  // For pie charts: single series with many categories (typically >= 3)
  if (series.length === 1 && dataLength >= 3 && dataLength <= 20) {
    return "pie";
  }

  // For composed/overlaid charts: 2+ series
  // This allows bars, lines, and areas to be mixed
  if (series.length >= 2) {
    return "composed";
  }

  // Default to bar chart for single series
  return "bar";
}
