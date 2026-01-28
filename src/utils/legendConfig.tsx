import React from "react";
import type { LegendConfig, IconType } from "../types";

/**
 * Maps string icon types to Recharts icon types
 */
export function getIconType(type: IconType | undefined): string {
  const iconMap: Record<IconType, string> = {
    circle: "circle",
    cross: "cross",
    diamond: "diamond",
    line: "line",
    none: "none",
    rect: "rect",
    square: "square",
    star: "star",
    triangle: "triangle",
    wye: "wye",
  };

  return iconMap[type || "circle"];
}

/**
 * Builds a Recharts Legend configuration from ChartConfig.legend
 */
export function buildLegendConfig(config: LegendConfig | undefined) {
  if (!config || config.enabled === false) {
    return null;
  }

  const legendProps: Record<string, unknown> = {};

  // Layout: horizontal or vertical
  if (config.layout) {
    legendProps.layout = config.layout;
  }

  // Alignment: center, left, right
  if (config.align) {
    legendProps.align = config.align;
  }

  // Vertical alignment: top, bottom, middle
  if (config.verticalAlign) {
    legendProps.verticalAlign = config.verticalAlign;
  }

  // Icon type configuration
  if (config.iconType) {
    legendProps.iconType = getIconType(config.iconType);
  }

  // Icon size
  if (config.iconSize !== undefined) {
    legendProps.iconSize = config.iconSize;
  }

  // Inactive color for hidden series
  if (config.inactiveColor) {
    legendProps.inactiveColor = config.inactiveColor;
  }

  // Styling
  if (config.wrapperStyle) {
    legendProps.wrapperStyle = config.wrapperStyle;
  }

  if (config.textStyle) {
    legendProps.textStyle = config.textStyle;
  }

  // Note: itemStyle is applied differently in Recharts
  // It's typically handled through the formatter or custom content component
  if (config.itemStyle) {
    legendProps.itemStyle = config.itemStyle;
  }

  // Custom formatter for legend labels
  // The formatter in config is stored as a string (function code)
  // For now, we'll skip it here and handle it in the chart components
  // if needed through custom content rendering

  // Return the legend props object
  return legendProps;
}

/**
 * Interface for legend click handler parameters
 */
export interface LegendClickParams {
  dataKey: string;
  value: string;
  payload: {
    value: string;
    type: string;
    color?: string;
  };
}

/**
 * Interface for hidden series state
 */
export interface HiddenSeriesState {
  [key: string]: boolean; // key is dataKey, value indicates if hidden
}

/**
 * Handles legend item click for filter/highlight/none actions
 * Returns the updated hidden series state
 */
export function handleLegendClick(
  params: LegendClickParams,
  currentHiddenSeries: HiddenSeriesState,
  action: "filter" | "highlight" | "none" | undefined
): HiddenSeriesState {
  if (action === "none") {
    return currentHiddenSeries;
  }

  const { dataKey } = params;
  const newHiddenSeries = { ...currentHiddenSeries };

  if (action === "filter") {
    // Toggle visibility of the clicked series
    newHiddenSeries[dataKey] = !newHiddenSeries[dataKey];
  } else if (action === "highlight") {
    // Hide all series except the clicked one
    // First, check if this series was already the only visible one
    const visibleSeries = Object.entries(newHiddenSeries)
      .filter(([, hidden]) => !hidden)
      .map(([key]) => key);

    if (visibleSeries.length === 1 && visibleSeries[0] === dataKey) {
      // Show all series again
      Object.keys(newHiddenSeries).forEach((key) => {
        newHiddenSeries[key] = false;
      });
    } else {
      // Hide all series except the clicked one
      Object.keys(newHiddenSeries).forEach((key) => {
        newHiddenSeries[key] = key !== dataKey;
      });
    }
  }

  return newHiddenSeries;
}

/**
 * Custom legend content component for advanced styling and interactions
 * Can be used with recharts Legend's content prop
 */
export interface CustomLegendContentProps {
  verticalAlign: "top" | "middle" | "bottom";
  height?: number;
  iconType?: string;
  layout?: "horizontal" | "vertical";
  align?: "left" | "center" | "right";
  wrapperStyle?: React.CSSProperties;
  payload?: Array<{
    value: string;
    type: string;
    color?: string;
    inactive?: boolean;
  }>;
  onLegendItemClick?: (params: {
    dataKey: string;
    value: string;
    payload: {
      value: string;
      type: string;
      color?: string;
    };
  }) => void;
  inactiveColor?: string;
}

/**
 * Creates a custom legend content renderer
 * This allows for more control over legend appearance and interactions
 */
export function createCustomLegendContent(
  textStyle?: React.CSSProperties,
  itemStyle?: React.CSSProperties
) {
  return function CustomLegendContent({
    verticalAlign,
    layout = "horizontal",
    align = "center",
    wrapperStyle,
    payload = [],
    onLegendItemClick,
    inactiveColor,
  }: CustomLegendContentProps) {
    if (!payload || payload.length === 0) {
      return null;
    }

    const containerStyle: React.CSSProperties = {
      display: layout === "horizontal" ? "flex" : "flex",
      flexDirection: layout === "horizontal" ? "row" : "column",
      flexWrap: layout === "horizontal" ? "wrap" : "nowrap",
      justifyContent:
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      gap: "12px",
      padding: "8px 0",
      ...wrapperStyle,
    };

    return (
      <div style={containerStyle}>
        {payload.map((entry, index) => (
          <div
            key={`legend-item-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: onLegendItemClick ? "pointer" : "default",
              opacity: entry.inactive ? 0.5 : 1,
              ...itemStyle,
            }}
            onClick={() => {
              if (onLegendItemClick) {
                onLegendItemClick({
                  dataKey: entry.value,
                  value: entry.value,
                  payload: {
                    value: entry.value,
                    type: entry.type,
                    color: entry.color,
                  },
                });
              }
            }}
          >
            {/* Legend icon */}
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: entry.inactive ? (inactiveColor || "#ccc") : entry.color,
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            {/* Legend text */}
            <span
              style={{
                fontSize: "12px",
                color: entry.inactive ? (inactiveColor || "#999") : "currentColor",
                ...textStyle,
              }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };
}

/**
 * Determines if a series should be visible based on hidden series state
 */
export function isSeriesVisible(dataKey: string, hiddenSeries: HiddenSeriesState): boolean {
  return !hiddenSeries[dataKey];
}

/**
 * Gets the effective inactiveColor based on theme
 */
export function getInactiveColor(
  configColor: string | undefined,
  theme: "light" | "dark"
): string {
  if (configColor) {
    return configColor;
  }

  // Default inactive colors based on theme
  return theme === "dark" ? "#6b7280" : "#d1d5db";
}

/**
 * Validates legend configuration
 */
export function validateLegendConfig(config: LegendConfig | undefined): boolean {
  if (!config) {
    return true; // Legend config is optional
  }

  // Validate layout
  if (config.layout && !["horizontal", "vertical"].includes(config.layout)) {
    console.warn(`Invalid legend layout: ${config.layout}`);
    return false;
  }

  // Validate align
  if (config.align && !["center", "left", "right"].includes(config.align)) {
    console.warn(`Invalid legend align: ${config.align}`);
    return false;
  }

  // Validate verticalAlign
  if (
    config.verticalAlign &&
    !["top", "bottom", "middle"].includes(config.verticalAlign)
  ) {
    console.warn(`Invalid legend verticalAlign: ${config.verticalAlign}`);
    return false;
  }

  // Validate iconSize
  if (config.iconSize !== undefined && config.iconSize < 0) {
    console.warn(`Invalid legend iconSize: ${config.iconSize}`);
    return false;
  }

  // Validate onClick action
  if (config.onClick && !["filter", "highlight", "none"].includes(config.onClick)) {
    console.warn(`Invalid legend onClick action: ${config.onClick}`);
    return false;
  }

  return true;
}
