import React, { useState } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { createLabelListConfig } from "../../utils/labelConfig";
import { CustomTooltip } from "./CustomTooltip";
import { buildTooltipConfig } from "../../utils/tooltipConfig";
import {
  buildLegendConfig,
  handleLegendClick,
  getInactiveColor,
  isSeriesVisible,
  type HiddenSeriesState,
} from "../../utils/legendConfig";

interface BarChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function BarChart({ config, theme, reducedMotion }: BarChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<HiddenSeriesState>({});
  const colors = getChartColors(config.theme);
  const palette = config.palette || colors.palette;
  const inactiveColor = getInactiveColor(config.legend?.inactiveColor, config.theme);

  // Debug logging
  console.info("BarChart rendering:", {
    chartType: config.chartType,
    layout: config.layout || "vertical",
    barSize: config.barSize,
    stackOffset: config.stackOffset,
    reverseStackOrder: config.reverseStackOrder,
    baseValue: config.baseValue,
    seriesCount: config.series.length,
    dataLength: config.data.length,
    hasLabels: config.label?.enabled,
    hasReferenceElements: (config.referenceElements?.length ?? 0) > 0,
    hasBrush: config.brush?.enabled,
    syncId: config.syncId,
    hasLegendConfig: !!config.legend,
    hiddenSeriesCount: Object.keys(hiddenSeries).length,
  });

  // Handle legend click for filtering
  const handleLegendItemClick = (params: any) => {
    const newHiddenSeries = handleLegendClick(
      {
        dataKey: params.dataKey,
        value: params.value,
        payload: params.payload,
      },
      hiddenSeries,
      config.legend?.onClick
    );
    setHiddenSeries(newHiddenSeries);
  };

  // Build BarChart props
  const barChartProps: Record<string, unknown> = {
    data: config.data,
    layout: config.layout || "horizontal",
  };

  // Add optional properties
  if (config.barGap !== undefined) {
    barChartProps.barGap = config.barGap;
  }
  if (config.barCategoryGap !== undefined) {
    barChartProps.barCategoryGap = config.barCategoryGap;
  }
  if (config.stackOffset !== undefined) {
    barChartProps.stackOffset = config.stackOffset;
  }
  if (config.reverseStackOrder !== undefined) {
    barChartProps.reverseStackOrder = config.reverseStackOrder;
  }
  if (config.syncId !== undefined) {
    barChartProps.syncId = config.syncId;
  }

  // Animation settings
  const animationDuration = config.animationDuration ?? 800;
  const animationEasing = config.animationEasing || "ease";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart {...barChartProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          vertical={config.layout === "vertical"}
        />
        {config.layout === "vertical" ? (
          <>
            <XAxis
              type="number"
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.x?.hide}
            />
            <YAxis
              type="category"
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.y?.hide}
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.x?.hide}
            />
            <YAxis
              type="number"
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.y?.hide}
            />
          </>
        )}
        <Tooltip
          content={
            <CustomTooltip
              colors={colors}
              config={config.tooltip}
            />
          }
          trigger={config.tooltip?.trigger || "hover"}
          contentStyle={{
            backgroundColor: colors.backgroundColor,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: "4px",
            padding: "8px 12px",
            color: colors.textColor,
            ...config.tooltip?.contentStyle,
          }}
          shared={config.tooltip?.shared}
        />
        {config.legend?.enabled !== false && (
          <Legend
            {...(buildLegendConfig(config.legend) || {})}
            onClick={(e) => handleLegendItemClick(e)}
            wrapperStyle={{
              color: colors.textColor,
              ...config.legend?.wrapperStyle,
            }}
          />
        )}

        {/* Render bars with label support */}
        {config.series.map((series, index) => {
          const isVisible = isSeriesVisible(series, hiddenSeries);
          // Default radius depends on layout
          const defaultRadius = config.layout === "vertical" ? [0, 5, 5, 0] : [8, 8, 0, 0];

          const barProps: Record<string, unknown> = {
            key: series,
            dataKey: series,
            fill: isVisible ? palette[index % palette.length] : inactiveColor,
            radius: config.barRadius ?? defaultRadius,
            stackId: config.stackOffset ? "stack" : undefined,
            animationDuration,
            animationEasing,
            isAnimationActive: isVisible,
            hide: !isVisible,
          };

          // Add bar-specific properties
          if (config.barSize !== undefined) {
            barProps.barSize = config.barSize;
          }
          if (config.maxBarSize !== undefined) {
            barProps.maxBarSize = config.maxBarSize;
          }
          if (config.strokeWidth !== undefined) {
            barProps.stroke = palette[index % palette.length];
            barProps.strokeWidth = config.strokeWidth;
          }
          if (config.baseValue !== undefined) {
            barProps.baseValue = config.baseValue;
          }

          const labelConfig = createLabelListConfig(config.label, colors.textColor);

          return (
            <Bar {...barProps}>
              {/* Render LabelList if labels are enabled */}
              {labelConfig && (
                <LabelList
                  dataKey={series}
                  {...labelConfig}
                />
              )}
            </Bar>
          );
        })}

        {/* Render reference elements (ReferenceLine and ReferenceArea) */}
        {config.referenceElements && config.referenceElements.length > 0 && (
          <>
            {config.referenceElements.map((refElement, index) => {
              if (refElement.type === "line") {
                return (
                  <ReferenceLine
                    key={`ref-line-${index}`}
                    y={refElement.value as number | undefined}
                    stroke={refElement.stroke || colors.gridStroke}
                    strokeDasharray={refElement.strokeDasharray}
                    label={refElement.label}
                  />
                );
              } else if (refElement.type === "area") {
                return (
                  <ReferenceArea
                    key={`ref-area-${index}`}
                    y1={Array.isArray(refElement.value) ? refElement.value[0] : undefined}
                    y2={Array.isArray(refElement.value) ? refElement.value[1] : undefined}
                    fill={refElement.fill || colors.gridStroke}
                    fillOpacity={refElement.fillOpacity ?? 0.1}
                    stroke={refElement.stroke}
                  />
                );
              }
              return null;
            })}
          </>
        )}

        {/* Render Brush if enabled */}
        {config.brush?.enabled && (
          <Brush
            startIndex={config.brush.dataStartIndex || 0}
            endIndex={config.brush.dataEndIndex}
            y={config.brush.y}
            height={config.brush.height || 40}
            fill={config.brush.fill}
            stroke={config.brush.stroke}
            fillOpacity={config.brush.fillOpacity}
          />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
