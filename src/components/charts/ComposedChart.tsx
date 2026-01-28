import React, { useState } from "react";
import {
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  Area,
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
import type { ParsedChartConfig, ReferenceElement } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";
import {
  buildLegendConfig,
  handleLegendClick,
  getInactiveColor,
  isSeriesVisible,
  type HiddenSeriesState,
} from "../../utils/legendConfig";

interface ComposedChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function ComposedChart({ config, theme, reducedMotion }: ComposedChartProps) {
  const colors = getChartColors(config.theme);
  const customPalette = config.palette || colors.palette;

  // Group series by their type (bar, line, area)
  const barSeries = config.series.filter((s) => config.seriesConfig[s] === "bar");
  const lineSeries = config.series.filter((s) => config.seriesConfig[s] === "line");
  const areaSeries = config.series.filter((s) => config.seriesConfig[s] === "area");

  // Get series-to-yaxis mapping
  const seriesYAxisMap = config.seriesYAxisMap || {};
  const hasDualAxes = config.yAxis2 && Object.values(seriesYAxisMap).some((axis) => axis === "right");

  // Determine curve type (default: monotone)
  const curveType = config.curveType || "monotone";

  // Get styling properties
  const strokeWidth = config.strokeWidth ?? 2;
  const dotSize = config.dotSize ?? 4;
  const fillOpacity = config.fillOpacity ?? 0.3;
  const animationDuration = config.animationDuration ?? 300;
  const animationEasing = config.animationEasing || "ease";

  console.info("ComposedChart rendering:", {
    chartType: config.chartType,
    barSeries,
    lineSeries,
    areaSeries,
    dataLength: config.data.length,
    hasDualAxes,
    layout: config.layout,
    stackOffset: config.stackOffset,
    curveType,
    syncId: config.syncId,
  });

  if (config.series.length === 0) {
    return <div style={{ padding: "16px", color: "red" }}>No series to display</div>;
  }

  // Helper function to get y-axis ID for a series
  const getYAxisId = (series: string) => {
    return seriesYAxisMap[series] === "right" ? "right" : "left";
  };

  // Helper function to get color for a series
  const getSeriesColor = (seriesName: string) => {
    const allSeries = [...barSeries, ...lineSeries, ...areaSeries];
    const index = allSeries.indexOf(seriesName);
    return customPalette[index % customPalette.length];
  };

  const chartProps: Record<string, unknown> = {
    data: config.data,
    layout: config.layout || "horizontal",
    stackOffset: config.stackOffset,
    margin: config.styling?.margin || { top: 20, right: 30, left: 20, bottom: 20 },
  };

  if (config.syncId) {
    chartProps.syncId = config.syncId;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsComposedChart {...chartProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          vertical={config.layout === "vertical"}
        />

        {config.layout === "vertical" ? (
          <>
            <XAxis
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              {...(config.axisConfig?.x && {
                label: config.axisConfig.x.label,
                angle: config.axisConfig.x.labelAngle,
                hide: config.axisConfig.x.hide,
                domain: config.axisConfig.x.domain,
                tickCount: config.axisConfig.x.tickCount,
              })}
            />

            <YAxis
              yAxisId="left"
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              {...(config.axisConfig?.y && {
                label: config.axisConfig.y.label,
                angle: config.axisConfig.y.labelAngle,
                hide: config.axisConfig.y.hide,
                domain: config.axisConfig.y.domain,
                tickCount: config.axisConfig.y.tickCount,
              })}
            />

            {hasDualAxes && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={colors.axisStroke}
                style={{ fontSize: "12px" }}
                {...(config.axisConfig?.y2 && {
                  label: config.axisConfig.y2.label,
                  angle: config.axisConfig.y2.labelAngle,
                  hide: config.axisConfig.y2.hide,
                  domain: config.axisConfig.y2.domain,
                  tickCount: config.axisConfig.y2.tickCount,
                })}
              />
            )}
          </>
        ) : (
          <>
            <XAxis
              dataKey={config.xAxis}
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              {...(config.axisConfig?.x && {
                label: config.axisConfig.x.label,
                angle: config.axisConfig.x.labelAngle,
                hide: config.axisConfig.x.hide,
                domain: config.axisConfig.x.domain,
                tickCount: config.axisConfig.x.tickCount,
              })}
            />

            <YAxis
              yAxisId="left"
              stroke={colors.axisStroke}
              style={{ fontSize: "12px" }}
              {...(config.axisConfig?.y && {
                label: config.axisConfig.y.label,
                angle: config.axisConfig.y.labelAngle,
                hide: config.axisConfig.y.hide,
                domain: config.axisConfig.y.domain,
                tickCount: config.axisConfig.y.tickCount,
              })}
            />

            {hasDualAxes && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={colors.axisStroke}
                style={{ fontSize: "12px" }}
                {...(config.axisConfig?.y2 && {
                  label: config.axisConfig.y2.label,
                  angle: config.axisConfig.y2.labelAngle,
                  hide: config.axisConfig.y2.hide,
                  domain: config.axisConfig.y2.domain,
                  tickCount: config.axisConfig.y2.tickCount,
                })}
              />
            )}
          </>
        )}

        {config.tooltip?.enabled !== false && (
          <Tooltip
            content={
              <CustomTooltip
                colors={colors}
                config={config.tooltip}
              />
            }
            trigger={config.tooltip?.trigger || "hover"}
            shared={config.tooltip?.shared}
            contentStyle={{
              backgroundColor: colors.backgroundColor,
              border: `1px solid ${colors.borderColor}`,
              borderRadius: "4px",
              padding: "8px 12px",
              color: colors.textColor,
              ...config.tooltip?.contentStyle,
            }}
            wrapperStyle={{
              color: colors.textColor,
              ...config.tooltip?.wrapperStyle,
            }}
          />
        )}

        {config.legend?.enabled !== false && (
          <Legend
            wrapperStyle={{ color: colors.textColor, ...config.legend?.wrapperStyle }}
            layout={config.legend?.layout}
            align={config.legend?.align}
            verticalAlign={config.legend?.verticalAlign}
            iconType={config.legend?.iconType}
          />
        )}

        {/* Render Reference Elements */}
        {config.referenceElements && config.referenceElements.length > 0 && (
          <>
            {config.referenceElements.map((ref, idx) => {
              if (ref.type === "line") {
                return (
                  <ReferenceLine
                    key={`ref-line-${idx}`}
                    y={ref.value}
                    stroke={ref.stroke || "#ccc"}
                    strokeDasharray={ref.strokeDasharray}
                    label={ref.label}
                  />
                );
              } else if (ref.type === "area") {
                return (
                  <ReferenceArea
                    key={`ref-area-${idx}`}
                    y1={Array.isArray(ref.value) ? ref.value[0] : ref.value}
                    y2={Array.isArray(ref.value) ? ref.value[1] : undefined}
                    fill={ref.fill || "#ccc"}
                    fillOpacity={ref.fillOpacity ?? 0.1}
                  />
                );
              }
              return null;
            })}
          </>
        )}

        {/* Render Bar Series */}
        {barSeries.map((series, index) => {
          const barColor = getSeriesColor(series);
          const barProps: Record<string, unknown> = {
            key: `bar-${series}`,
            dataKey: series,
            fill: barColor,
            radius: [8, 8, 0, 0],
            yAxisId: getYAxisId(series),
            stackId: config.stackOffset ? "composed-stack" : undefined,
            reverseStackOrder: config.reverseStackOrder,
            isAnimationActive: true,
            animationDuration: animationDuration,
            animationEasing: animationEasing,
          };

          if (config.barSize !== undefined) {
            barProps.barSize = config.barSize;
          }
          if (config.barGap !== undefined) {
            barProps.barGap = config.barGap;
          }
          if (config.barCategoryGap !== undefined) {
            barProps.barCategoryGap = config.barCategoryGap;
          }
          if (config.maxBarSize !== undefined) {
            barProps.maxBarSize = config.maxBarSize;
          }

          return (
            <Bar {...(barProps as any)}>
              {config.label?.enabled && <LabelList dataKey={series} position={config.label.position || "top"} />}
            </Bar>
          );
        })}

        {/* Render Line Series */}
        {lineSeries.map((series, index) => {
          const lineColor = getSeriesColor(series);
          const dotColor = config.dotColor || lineColor;

          const lineProps: Record<string, unknown> = {
            key: `line-${series}`,
            dataKey: series,
            stroke: lineColor,
            strokeWidth: strokeWidth,
            type: curveType,
            dot: {
              fill: dotColor,
              r: dotSize,
            },
            activeDot: {
              r: dotSize + 2,
            },
            yAxisId: getYAxisId(series),
            isAnimationActive: true,
            animationDuration: animationDuration,
            animationEasing: animationEasing,
          };

          return (
            <Line {...(lineProps as any)}>
              {config.label?.enabled && (
                <LabelList dataKey={series} position={config.label.position || "top"} />
              )}
            </Line>
          );
        })}

        {/* Render Area Series */}
        {areaSeries.map((series, index) => {
          const areaColor = getSeriesColor(series);

          const areaProps: Record<string, unknown> = {
            key: `area-${series}`,
            type: curveType,
            dataKey: series,
            fill: areaColor,
            stroke: areaColor,
            fillOpacity: fillOpacity,
            yAxisId: getYAxisId(series),
            stackId: config.stackOffset ? "composed-stack" : undefined,
            reverseStackOrder: config.reverseStackOrder,
            isAnimationActive: true,
            animationDuration: animationDuration,
            animationEasing: animationEasing,
          };

          return (
            <Area {...(areaProps as any)}>
              {config.label?.enabled && (
                <LabelList dataKey={series} position={config.label.position || "top"} />
              )}
            </Area>
          );
        })}

        {/* Render Brush */}
        {config.brush?.enabled && (
          <Brush
            startIndex={config.brush.dataStartIndex}
            endIndex={config.brush.dataEndIndex}
            y={config.brush.y}
            height={config.brush.height}
            fill={config.brush.fill}
            stroke={config.brush.stroke}
            fillOpacity={config.brush.fillOpacity}
          />
        )}
      </RechartsComposedChart>
    </ResponsiveContainer>
  );
}
