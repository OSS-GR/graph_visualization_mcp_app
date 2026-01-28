// @ts-nocheck
import type { LabelConfig, Position } from "../types";

/**
 * Label formatter types supported
 */
export type LabelFormatterType =
  | "Currency"
  | "Percentage"
  | "Decimal"
  | "default"
  | string;

/**
 * Formats a value based on the formatter type
 */
export function applyLabelFormatting(
  value: number | string,
  formatterType?: LabelFormatterType
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return String(value);
  }

  switch (formatterType) {
    case "Currency":
      return formatCurrency(numValue);
    case "Percentage":
      return formatPercentage(numValue);
    case "Decimal":
      return formatDecimal(numValue);
    case "default":
    default:
      // Return the value as-is, slightly formatted
      return numValue.toString();
  }
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Formats a number as percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Formats a number with decimal places
 */
export function formatDecimal(value: number, places: number = 2): string {
  return value.toFixed(places);
}

/**
 * Builds a LabelList configuration from ChartConfig.label
 * Used for Bar, Line, and Area charts
 */
export function buildLabelConfig(config?: LabelConfig): Record<string, unknown> {
  if (!config?.enabled) {
    return {};
  }

  const labelConfig: Record<string, unknown> = {
    position: config.position || "top",
  };

  if (config.offset !== undefined) {
    labelConfig.offset = config.offset;
  }

  if (config.angle !== undefined && config.angle !== 0) {
    labelConfig.angle = config.angle;
  }

  if (config.color) {
    labelConfig.fill = config.color;
  }

  if (config.fontSize !== undefined) {
    labelConfig.fontSize = config.fontSize;
  }

  if (config.fontWeight) {
    labelConfig.fontWeight = config.fontWeight;
  }

  if (config.zIndex !== undefined) {
    labelConfig.zIndex = config.zIndex;
  }

  // Add custom formatter if needed
  if (config.formatter && config.formatter !== "default") {
    labelConfig.formatter = (value: number | string) =>
      applyLabelFormatting(value, config.formatter as LabelFormatterType);
  }

  return labelConfig;
}

/**
 * Builds a custom label content renderer for Pie charts
 * Returns a function that renders the label content
 */
export function buildCustomLabelContent(
  config?: LabelConfig,
  dataType: "pie" | "bar" | "line" | "area" = "bar"
) {
  if (!config?.enabled) {
    return undefined;
  }

  return (entry: Record<string, unknown>) => {
    if (dataType === "pie") {
      return formatPieLabel(entry, config);
    }
    // For bar/line/area, we'll use LabelList with formatter
    return formatDataLabel(entry, config);
  };
}

/**
 * Formats a label for pie chart
 */
function formatPieLabel(entry: Record<string, unknown>, config: LabelConfig): string {
  const parts: string[] = [];

  if (config.formatter === "percentage") {
    const percentage = (entry.percentage as number | string) || "0";
    parts.push(`${percentage}%`);
  } else if (config.formatter === "value") {
    parts.push(String(entry.value || ""));
  } else if (config.formatter === "name") {
    parts.push(String(entry.name || ""));
  } else {
    // Default: show name and value
    const name = entry.name ? String(entry.name) : "";
    const value = entry.value ? String(entry.value) : "";
    if (name && value) {
      parts.push(`${name}: ${value}`);
    } else {
      parts.push(name || value);
    }
  }

  return parts.join(" ");
}

/**
 * Formats a label for bar/line/area charts
 */
function formatDataLabel(entry: Record<string, unknown>, config: LabelConfig): string {
  const value = entry.value;

  if (value === null || value === undefined) {
    return "";
  }

  return applyLabelFormatting(value, config.formatter as LabelFormatterType);
}

/**
 * Validates label position for a given chart type
 */
export function isValidLabelPosition(
  position: Position | undefined,
  chartType: "bar" | "line" | "area" | "pie"
): boolean {
  if (!position) return true;

  const validPositions: Record<string, Position[]> = {
    bar: ["top", "bottom", "left", "right", "inside", "outside", "center"],
    line: ["top", "bottom", "left", "right", "inside", "outside", "center"],
    area: ["top", "bottom", "left", "right", "inside", "outside", "center"],
    pie: ["center", "inside", "outside"],
  };

  const allowed = validPositions[chartType] || [];
  return allowed.includes(position);
}

/**
 * Gets the recommended offset for a given position and chart type
 */
export function getRecommendedOffset(
  position: Position | undefined,
  chartType: string
): number {
  if (!position) return 0;

  const offsetMap: Record<string, number> = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    inside: 0,
    outside: 5,
    center: 0,
  };

  return offsetMap[position] || 0;
}

/**
 * Creates a complete label configuration for LabelList component
 * Handles all formatting and styling
 */
export function createLabelListConfig(
  config?: LabelConfig,
  defaultColor?: string
): Record<string, unknown> | undefined {
  if (!config?.enabled) {
    return undefined;
  }

  const baseConfig = buildLabelConfig(config);

  // If no custom formatter, don't add one - LabelList will use raw values
  if (!config.formatter || config.formatter === "default") {
    delete baseConfig.formatter;
  }

  // Ensure we have sensible defaults
  if (!baseConfig.fontSize) {
    baseConfig.fontSize = 12;
  }

  if (!baseConfig.fill && defaultColor) {
    baseConfig.fill = defaultColor;
  }

  if (!baseConfig.position) {
    baseConfig.position = "top";
  }

  return baseConfig;
}

/**
 * Creates a complete label configuration for Pie chart Label component
 */
export function createPieLabelConfig(
  config?: LabelConfig,
  defaultColor?: string
): Record<string, unknown> | undefined {
  if (!config?.enabled) {
    return undefined;
  }

  const labelConfig: Record<string, unknown> = {
    position: config.position || "center",
  };

  if (config.offset !== undefined) {
    labelConfig.offset = config.offset;
  }

  if (config.color) {
    labelConfig.fill = config.color;
  } else if (defaultColor) {
    labelConfig.fill = defaultColor;
  }

  if (config.fontSize !== undefined) {
    labelConfig.fontSize = config.fontSize;
  } else {
    labelConfig.fontSize = 14; // Pie labels are typically larger
  }

  if (config.fontWeight) {
    labelConfig.fontWeight = config.fontWeight;
  }

  return labelConfig;
}

/**
 * Determines if labels should use a label line (for pie charts)
 */
export function shouldUseLabelLine(position?: Position): boolean {
  return position !== "center" && position !== "inside";
}

/**
 * Gets the display name for a formatter type
 */
export function getFormatterDisplayName(formatter?: LabelFormatterType): string {
  switch (formatter) {
    case "Currency":
      return "Currency ($)";
    case "Percentage":
      return "Percentage (%)";
    case "Decimal":
      return "Decimal";
    case "default":
    default:
      return "Default";
  }
}

/**
 * Validates formatter type
 */
export function isValidFormatter(formatter?: string): boolean {
  const validFormatters = ["Currency", "Percentage", "Decimal", "default"];
  return !formatter || validFormatters.includes(formatter);
}

/**
 * Type guard for checking if a label formatter is a standard type
 */
export function isStandardFormatter(
  formatter?: string
): formatter is LabelFormatterType {
  return (
    !formatter ||
    ["Currency", "Percentage", "Decimal", "default"].includes(formatter)
  );
}
