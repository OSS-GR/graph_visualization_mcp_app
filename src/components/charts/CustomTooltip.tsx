import React from "react";
import type { TooltipConfig } from "../../types";
import {
  processTooltipPayload,
  formatLabel,
} from "../../utils/tooltipConfig";

interface ChartColors {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  palette: string[];
  gridStroke: string;
  axisStroke: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: number | string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  colors: ChartColors;
  config?: TooltipConfig;
}

/**
 * Custom Tooltip Component
 * Renders a formatted tooltip with support for:
 * - Custom value formatters (Currency, Percentage, Decimal)
 * - Label formatting
 * - Item sorting
 * - Null value filtering
 * - Theme-aware styling
 */
export function CustomTooltip({
  active,
  payload,
  label,
  colors,
  config,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Process payload with formatters, filtering, and sorting
  const processedPayload = processTooltipPayload(payload, config);

  // If all items were filtered out, return null
  if (processedPayload.length === 0) {
    return null;
  }

  // Format the label
  // For pie charts, the label comes from payload's name property
  // For cartesian charts, it comes from the label prop
  const displayLabel = label ?? (processedPayload.length === 1 ? (processedPayload[0]?.name as string | number | undefined) : undefined);

  let labelFormatter: ((label: string | number) => string) | undefined;
  if (config?.labelFormatter && typeof config.labelFormatter === "string") {
    // If labelFormatter is a string like "Month: {label}", use template
    labelFormatter = (val) =>
      config.labelFormatter!.replace("{label}", String(val));
  }

  const formattedLabel = displayLabel !== undefined
    ? formatLabel(displayLabel, labelFormatter)
    : undefined;

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundColor,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: "4px",
    padding: "8px 12px",
    color: colors.textColor,
    ...config?.contentStyle,
  };

  const labelStyle: React.CSSProperties = {
    margin: "0 0 4px 0",
    fontWeight: 600,
    fontSize: "14px",
  };

  const itemStyle: React.CSSProperties = {
    margin: "4px 0",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      {formattedLabel && (
        <p style={labelStyle}>{formattedLabel}</p>
      )}
      {processedPayload.map((entry, index) => {
        // For scatter plots, check if there's a category field in the raw payload
        const rawPayload = (payload?.[index] as any)?.payload;
        const category = rawPayload?.category;

        return (
          <div key={index}>
            <p
              style={{
                ...itemStyle,
                color: entry.color,
              }}
            >
              {entry.name}: {entry.value}
            </p>
            {category && (
              <p
                style={{
                  ...itemStyle,
                  color: entry.color,
                  opacity: 0.8,
                  fontSize: "12px",
                  margin: "2px 0 4px 0",
                }}
              >
                Label: {String(category)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
