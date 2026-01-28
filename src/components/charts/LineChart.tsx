import React, { useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
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
import type { ParsedChartConfig, CurveType } from "../../types";
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

interface LineChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function LineChart({ config, theme, reducedMotion }: LineChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<HiddenSeriesState>({});
  const colors = getChartColors(config.theme);
  const palette = config.palette || colors.palette;
  const inactiveColor = getInactiveColor(config.legend?.inactiveColor, config.theme);

  // Log configuration for debugging
  console.info("LineChart rendering:", {
    chartType: config.chartType,
    series: config.series,
    dataLength: config.data.length,
    layout: config.layout,
    stackOffset: config.stackOffset,
    curveType: config.curveType,
    hasLabels: config.label?.enabled,
    hasReferences: config.referenceElements && config.referenceElements.length > 0,
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

  // Default values for enhanced properties
  const layout = config.layout || "horizontal";
  const stackOffset = config.stackOffset || "none";
  const reverseStackOrder = config.reverseStackOrder ?? false;
  const baseValue = config.baseValue ?? 0;
  const curveType = (config.curveType || "monotone") as CurveType;
  const strokeWidth = config.strokeWidth ?? 2;
  const fillOpacity = config.fillOpacity ?? 0.1;
  const dotSize = config.dotSize ?? 4;
  const animationDuration = config.animationDuration ?? 300;
  const animationEasing = config.animationEasing || "ease";

  // Build chart props with optional properties
  const chartProps: Record<string, unknown> = {
    data: config.data,
    layout,
    stackOffset: stackOffset !== "none" ? stackOffset : undefined,
    reverseStackOrder: reverseStackOrder || undefined,
    margin: config.styling?.margin || { top: 5, right: 30, left: 0, bottom: 5 },
  };

  if (config.syncId) {
    chartProps.syncId = config.syncId;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart {...chartProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          vertical={layout === "vertical"}
        />
        {layout === "vertical" ? (
          <>
            <XAxis
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.x?.hide}
            />
            <YAxis
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.y?.hide}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.x?.hide}
            />
            <YAxis
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              hide={config.axisConfig?.y?.hide}
            />
          </>
        )}
        <Tooltip
          content={<CustomTooltip colors={colors} config={config.tooltip} />}
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

        {config.series.map((series, index) => {
          const isVisible = isSeriesVisible(series, hiddenSeries);
          const lineProps: Record<string, unknown> = {
            key: series,
            type: curveType,
            dataKey: series,
            stroke: isVisible ? palette[index % palette.length] : inactiveColor,
            strokeWidth,
            isAnimationActive: isVisible,
            animationDuration,
            animationEasing,
            hide: !isVisible,
          };

          // Add base value if not the default
          if (baseValue !== 0) {
            lineProps.baseValue = baseValue;
          }

          // Add dot configuration if dotSize is set
          if (dotSize > 0) {
            lineProps.dot = {
              fill: config.dotColor || palette[index % palette.length],
              r: dotSize,
            };
            lineProps.activeDot = { r: dotSize + 2 };
          }

          // Add stack configuration if stacking is enabled
          if (stackOffset && stackOffset !== "none") {
            lineProps.stackId = "stack";
          }

          // Add fill opacity for area effect
          if (fillOpacity > 0) {
            lineProps.fillOpacity = fillOpacity;
          }

          const labelConfig = createLabelListConfig(config.label, colors.textColor);

          return (
            <React.Fragment key={`line-fragment-${series}`}>
              <Line {...lineProps}>
                {labelConfig && (
                  <LabelList
                    dataKey={series}
                    {...labelConfig}
                  />
                )}
              </Line>
            </React.Fragment>
          );
        })}

        {config.referenceElements && config.referenceElements.length > 0 && (
          <>
            {config.referenceElements.map((refElement, index) => {
              if (refElement.type === "line") {
                return (
                  <ReferenceLine
                    key={`ref-line-${index}`}
                    y={typeof refElement.value === "number" ? refElement.value : undefined}
                    stroke={refElement.stroke || "#999"}
                    strokeDasharray={refElement.strokeDasharray}
                    label={refElement.label}
                  />
                );
              } else if (refElement.type === "area") {
                return (
                  <ReferenceArea
                    key={`ref-area-${index}`}
                    x1={typeof refElement.value === "number" ? refElement.value : undefined}
                    fill={refElement.fill || "#999"}
                    fillOpacity={refElement.fillOpacity || 0.1}
                    label={{
                      value: refElement.label,
                      position: refElement.labelPosition || "insideTopRight",
                      fill: colors.textColor,
                      fontSize: 12,
                    }}
                  />
                );
              }
              return null;
            })}
          </>
        )}

        {config.brush?.enabled && (
          <Brush
            startIndex={config.brush?.dataStartIndex || 0}
            endIndex={config.brush?.dataEndIndex}
            height={config.brush?.height || 40}
            fill={config.brush?.fill || "#8884d8"}
            stroke={config.brush?.stroke || "#666"}
            fillOpacity={config.brush?.fillOpacity ?? 0.1}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
