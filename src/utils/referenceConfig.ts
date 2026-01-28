// @ts-nocheck
import type { ReferenceElement } from "../types";

/**
 * Type definitions for reference element configuration
 */
export type ReferenceValueType = "absolute" | "percentage" | "data-based";

export interface ReferenceLineStyle {
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

export interface ReferenceAreaStyle {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeDasharray?: string;
}

/**
 * Validation result for reference values
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedValue?: number | number[];
}

/**
 * Parse a reference value from various formats
 * Supports:
 * - Absolute values: 5000
 * - Percentage values: "50%"
 * - Data-based values: "average", "max", "min"
 *
 * @param value - The value to parse
 * @param data - The chart data for computing statistics
 * @param dataKey - The key to extract values from data objects
 * @returns The parsed numeric value or array for ranges
 */
export function parseReferenceValue(
  value: number | string | undefined,
  data: Record<string, unknown>[],
  dataKey?: string
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  // If it's already a number, return it
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    console.warn(`Invalid reference value type: ${typeof value}`);
    return undefined;
  }

  // Handle percentage values (e.g., "50%")
  if (value.endsWith("%")) {
    const percentageStr = value.slice(0, -1);
    const percentage = parseFloat(percentageStr);

    if (isNaN(percentage)) {
      console.warn(`Invalid percentage value: ${value}`);
      return undefined;
    }

    // Calculate percentage of max value in data
    const numericValues = extractNumericValues(data, dataKey);
    if (numericValues.length === 0) {
      console.warn("No numeric values found in data for percentage calculation");
      return undefined;
    }

    const maxValue = Math.max(...numericValues);
    return (maxValue * percentage) / 100;
  }

  // Handle data-based values (average, max, min, median)
  const lowerValue = value.toLowerCase();

  const numericValues = extractNumericValues(data, dataKey);
  if (numericValues.length === 0) {
    console.warn("No numeric values found in data for statistic calculation");
    return undefined;
  }

  switch (lowerValue) {
    case "average":
    case "mean":
      return calculateAverage(numericValues);
    case "max":
    case "maximum":
      return Math.max(...numericValues);
    case "min":
    case "minimum":
      return Math.min(...numericValues);
    case "median":
      return calculateMedian(numericValues);
    default:
      // If it's not a recognized keyword, try to parse it as a number
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return numValue;
      }
      console.warn(`Unrecognized reference value: ${value}`);
      return undefined;
  }
}

/**
 * Extract numeric values from data
 *
 * @param data - The chart data
 * @param dataKey - Optional specific key to extract; if not provided, extracts all numeric values
 * @returns Array of numeric values
 */
export function extractNumericValues(
  data: Record<string, unknown>[],
  dataKey?: string
): number[] {
  const values: number[] = [];

  for (const item of data) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    if (dataKey) {
      // Extract specific key
      const value = item[dataKey];
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        values.push(numValue);
      }
    } else {
      // Extract all numeric values
      for (const key in item) {
        const value = item[key];
        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        if (!isNaN(numValue) && typeof value !== "string") {
          values.push(numValue);
        }
      }
    }
  }

  return values;
}

/**
 * Calculate average of numeric values
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate median of numeric values
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Validate a reference value
 *
 * @param value - The value to validate
 * @param data - The chart data
 * @param dataKey - Optional key for data-based calculations
 * @returns Validation result
 */
export function validateReferenceValue(
  value: number | string | undefined,
  data: Record<string, unknown>[],
  dataKey?: string
): ValidationResult {
  if (value === undefined) {
    return { valid: false, error: "Reference value is undefined" };
  }

  if (typeof value === "number") {
    return { valid: true, normalizedValue: value };
  }

  if (typeof value !== "string") {
    return {
      valid: false,
      error: `Invalid reference value type: ${typeof value}`,
    };
  }

  // Try to parse the value
  const parsed = parseReferenceValue(value, data, dataKey);

  if (parsed === undefined) {
    return {
      valid: false,
      error: `Unable to parse reference value: ${value}`,
    };
  }

  return { valid: true, normalizedValue: parsed };
}

/**
 * Create a reference line helper
 *
 * @param value - The value at which to place the line
 * @param label - Optional label for the line
 * @param style - Optional styling for the line
 * @returns ReferenceElement configuration for a line
 */
export function createReferenceLine(
  value: number | string,
  label?: string,
  style?: ReferenceLineStyle
): ReferenceElement {
  return {
    type: "line",
    value,
    label,
    stroke: style?.stroke || "#999",
    strokeDasharray: style?.strokeDasharray,
    labelPosition: "top",
  };
}

/**
 * Create a reference area helper
 *
 * @param yAxisStart - The start value for the area (for Y-axis reference areas)
 * @param yAxisEnd - The end value for the area (for Y-axis reference areas)
 * @param label - Optional label for the area
 * @param style - Optional styling for the area
 * @returns ReferenceElement configuration for an area
 */
export function createReferenceArea(
  yAxisStart: number | string,
  yAxisEnd: number | string,
  label?: string,
  style?: ReferenceAreaStyle
): ReferenceElement {
  return {
    type: "area",
    value: [yAxisStart, yAxisEnd] as unknown as string,
    label,
    fill: style?.fill || "#ccc",
    fillOpacity: style?.fillOpacity ?? 0.1,
    stroke: style?.stroke,
    strokeDasharray: style?.strokeDasharray,
    labelPosition: "top",
  };
}

/**
 * Build reference elements from an array of element configurations
 * This processes raw element definitions and normalizes them for use in charts
 *
 * @param elements - Array of reference element configurations
 * @param data - The chart data (used for resolving data-based values)
 * @param dataKey - Optional key for numeric value extraction
 * @returns Array of processed ReferenceElement configurations
 */
export function buildReferenceElements(
  elements: ReferenceElement[] | undefined,
  data: Record<string, unknown>[],
  dataKey?: string
): ReferenceElement[] {
  if (!elements || elements.length === 0) {
    return [];
  }

  return elements.map((element) => {
    // Parse and normalize the value
    const parsedValue = parseReferenceValue(element.value, data, dataKey);

    // Create normalized element
    const normalized: ReferenceElement = {
      ...element,
      value: parsedValue,
    };

    return normalized;
  });
}

/**
 * Validate all reference elements
 *
 * @param elements - Array of reference elements
 * @param data - The chart data
 * @param dataKey - Optional key for numeric value extraction
 * @returns Object with validation results and any errors
 */
export function validateReferenceElements(
  elements: ReferenceElement[] | undefined,
  data: Record<string, unknown>[],
  dataKey?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!elements || elements.length === 0) {
    return { valid: true, errors };
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Validate type
    if (!["line", "area"].includes(element.type)) {
      errors.push(`Reference element ${i}: invalid type "${element.type}"`);
    }

    // Validate value
    if (element.value === undefined) {
      errors.push(`Reference element ${i}: missing value`);
    } else {
      const validation = validateReferenceValue(element.value, data, dataKey);
      if (!validation.valid) {
        errors.push(
          `Reference element ${i}: ${validation.error}`
        );
      }
    }

    // Validate styling
    if (element.fillOpacity !== undefined) {
      if (typeof element.fillOpacity !== "number" || element.fillOpacity < 0 || element.fillOpacity > 1) {
        errors.push(`Reference element ${i}: fillOpacity must be between 0 and 1`);
      }
    }

    // Validate position if provided
    if (element.position) {
      const validPositions = ["top", "bottom", "left", "right", "inside", "outside", "center"];
      if (!validPositions.includes(element.position)) {
        errors.push(`Reference element ${i}: invalid position "${element.position}"`);
      }
    }

    // Validate labelPosition if provided
    if (element.labelPosition) {
      const validLabelPositions = ["top", "bottom", "left", "right", "inside", "outside", "center", "insideTopRight", "insideTopLeft", "insideBottomRight", "insideBottomLeft"];
      if (!validLabelPositions.includes(element.labelPosition)) {
        errors.push(`Reference element ${i}: invalid labelPosition "${element.labelPosition}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create reference lines for data statistics
 * Useful for adding average, min, max lines automatically
 *
 * @param data - The chart data
 * @param dataKey - The key to extract values from
 * @param includeStats - Which statistics to include (e.g., ["average", "max", "min"])
 * @param style - Optional styling for all lines
 * @returns Array of ReferenceElement configurations
 */
export function createStatisticLines(
  data: Record<string, unknown>[],
  dataKey: string,
  includeStats: ("average" | "max" | "min" | "median")[] = ["average"],
  style?: ReferenceLineStyle
): ReferenceElement[] {
  const elements: ReferenceElement[] = [];
  const numericValues = extractNumericValues(data, dataKey);

  if (numericValues.length === 0) {
    console.warn(`No numeric values found for key: ${dataKey}`);
    return elements;
  }

  for (const stat of includeStats) {
    let value: number | undefined;
    let label: string;

    switch (stat) {
      case "average":
      case "mean":
        value = calculateAverage(numericValues);
        label = `Average: ${value.toFixed(2)}`;
        break;
      case "max":
        value = Math.max(...numericValues);
        label = `Max: ${value.toFixed(2)}`;
        break;
      case "min":
        value = Math.min(...numericValues);
        label = `Min: ${value.toFixed(2)}`;
        break;
      case "median":
        value = calculateMedian(numericValues);
        label = `Median: ${value.toFixed(2)}`;
        break;
    }

    if (value !== undefined) {
      elements.push(createReferenceLine(value, label, style));
    }
  }

  return elements;
}
