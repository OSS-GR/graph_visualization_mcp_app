// @ts-nocheck
import React from "react";
import type { TooltipConfig } from "../types";

/**
 * Format value as currency
 * @param value - The numeric value to format
 * @param currency - ISO currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | undefined,
  currency: string = "USD"
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }

  const numValue = Number(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue);
  } catch {
    // Fallback if currency code is invalid
    return `$${numValue.toFixed(2)}`;
  }
}

/**
 * Format value as percentage (0-100 range)
 * @param value - The numeric value to format (0-100)
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | undefined,
  decimalPlaces: number = 1
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }

  const numValue = Number(value);

  return `${numValue.toFixed(decimalPlaces)}%`;
}

/**
 * Format value with specified decimal places
 * @param value - The numeric value to format
 * @param places - Number of decimal places (default: 2)
 * @returns Formatted decimal string
 */
export function formatDecimal(
  value: number | string | undefined,
  places: number = 2
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return "N/A";
  }

  const numValue = Number(value);

  return numValue.toFixed(places);
}

/**
 * Format tooltip label
 * @param label - The label text
 * @param formatter - Optional custom formatter function
 * @returns Formatted label string
 */
export function formatLabel(
  label: string | number | undefined,
  formatter?: (label: string | number) => string
): string {
  if (label === null || label === undefined) {
    return "N/A";
  }

  if (formatter && typeof formatter === "function") {
    return formatter(label);
  }

  return String(label);
}

/**
 * Apply custom formatter to a value based on format type
 * @param value - The value to format
 * @param formatType - Format type: "Currency", "Decimal", "Percentage"
 * @param currency - Optional currency code for currency format
 * @returns Formatted value string
 */
export function applyFormatter(
  value: number | string | undefined,
  formatType?: string,
  currency?: string
): string {
  if (!formatType) {
    return String(value ?? "N/A");
  }

  switch (formatType.toLowerCase()) {
    case "currency":
      return formatCurrency(value, currency);
    case "percentage":
      return formatPercentage(value);
    case "decimal":
      return formatDecimal(value, 2);
    default:
      return String(value ?? "N/A");
  }
}

/**
 * Sort tooltip items based on configuration
 * @param a - First item
 * @param b - Second item
 * @param sortBy - Sort type: "name" | "value" | "dataKey"
 * @returns Sort result
 */
export function sortTooltipItems(
  a: { name?: string; value?: number | string; dataKey?: string },
  b: { name?: string; value?: number | string; dataKey?: string },
  sortBy: "name" | "value" | "dataKey" = "name"
): number {
  switch (sortBy) {
    case "name":
      return (a.name || "").localeCompare(b.name || "");
    case "value":
      const aVal = Number(a.value || 0);
      const bVal = Number(b.value || 0);
      return bVal - aVal; // Descending order
    case "dataKey":
      return (a.dataKey || "").localeCompare(b.dataKey || "");
    default:
      return 0;
  }
}

/**
 * Filter out null and undefined values from tooltip payload
 * @param payload - Array of tooltip items
 * @returns Filtered array
 */
export function filterNullValues(
  payload: Array<{ value?: number | string | null }> | undefined
): Array<{ value?: number | string | null }> {
  if (!payload) {
    return [];
  }

  return payload.filter((item) => {
    if (item.value === null || item.value === undefined) {
      return false;
    }
    if (typeof item.value === "string" && item.value.trim() === "") {
      return false;
    }
    if (typeof item.value === "number" && isNaN(item.value)) {
      return false;
    }
    return true;
  });
}

/**
 * Build Recharts Tooltip configuration from TooltipConfig
 * @param config - Tooltip configuration from ChartConfig
 * @param colors - Chart colors for styling
 * @returns Tooltip props for Recharts Tooltip component
 */
export function buildTooltipConfig(
  config: TooltipConfig | undefined,
  colors?: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  }
) {
  if (!config || config.enabled === false) {
    return { content: () => null };
  }

  const tooltipProps: Record<string, unknown> = {};

  // Set trigger (hover or click)
  if (config.trigger === "click") {
    tooltipProps.trigger = "click";
  } else {
    tooltipProps.trigger = "hover";
  }

  // Set shared (show single or all data points)
  if (config.shared !== undefined) {
    tooltipProps.shared = config.shared;
  }

  // Set cursor style
  if (config.cursorStyle) {
    tooltipProps.cursor = config.cursorStyle;
  } else {
    tooltipProps.cursor = {
      strokeDasharray: "3 3",
      stroke: colors?.borderColor || "#e5e7eb",
    };
  }

  // Set animation
  if (config.animate !== undefined) {
    tooltipProps.isAnimationActive = config.animate;
  }

  if (config.animationDuration !== undefined) {
    tooltipProps.animationDuration = config.animationDuration;
  }

  // Set position
  if (config.position === "fixed") {
    tooltipProps.position = "right";
  } else {
    tooltipProps.position = "auto";
  }

  // Set offset
  if (config.offset !== undefined) {
    tooltipProps.offset = config.offset;
  }

  // Set content styling
  const contentStyle: Record<string, unknown> = {
    backgroundColor: colors?.backgroundColor || "#ffffff",
    border: `1px solid ${colors?.borderColor || "#e5e7eb"}`,
    borderRadius: "4px",
    padding: "8px 12px",
    color: colors?.textColor || "#1f2937",
    ...config.contentStyle,
  };
  tooltipProps.contentStyle = contentStyle;

  // Set wrapper styling
  if (config.wrapperStyle) {
    tooltipProps.wrapperStyle = config.wrapperStyle;
  }

  // Store config for use in custom content component
  tooltipProps.config = config;
  tooltipProps.colors = colors;

  return tooltipProps;
}

/**
 * Type for custom tooltip props
 */
export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: number | string;
    dataKey?: string;
  }>;
  label?: string | number;
  config?: TooltipConfig;
  colors?: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
}

/**
 * Process tooltip payload with formatting
 * @param payload - Raw tooltip payload
 * @param config - Tooltip configuration
 * @returns Processed payload with formatted values
 */
export function processTooltipPayload(
  payload: CustomTooltipProps["payload"],
  config?: TooltipConfig
): Array<{
  color?: string;
  name?: string;
  value?: string | number | undefined;
  dataKey?: string;
}> {
  if (!payload) {
    return [];
  }

  let processed = [...payload];

  // Filter null values if enabled
  if (config?.filterNull) {
    processed = filterNullValues(processed);
  }

  // Apply custom formatters from config
  if (config?.formatter) {
    processed = processed.map((item) => {
      const formatType = config.formatter?.[item.dataKey || item.name || ""];
      if (formatType) {
        return {
          ...item,
          value: applyFormatter(item.value, formatType),
        };
      }
      return item;
    });
  }

  // Sort items if specified
  if (config?.itemSorter) {
    processed.sort((a, b) =>
      sortTooltipItems(a, b, config.itemSorter as any)
    );
  }

  return processed;
}
