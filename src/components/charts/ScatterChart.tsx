import React, { useMemo } from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";

interface ScatterChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

interface ScatterPoint {
  x: number;
  y: number;
  category?: string;
  size?: number;
  [key: string]: unknown;
}

export function ScatterChart({ config, theme, reducedMotion }: ScatterChartProps) {
  const colors = getChartColors(config.theme);
  const paletteToUse = config.palette || colors.palette;

  // Console logging for debugging
  console.log("[ScatterChart] Rendering with config:", {
    chartType: config.chartType,
    series: config.series,
    dataPoints: config.data.length,
    xAxis: config.xAxis,
    yAxis: config.yAxis,
    animationDuration: config.animationDuration,
    syncId: config.syncId,
  });

  const xAxisKey = config.xAxis || "x";
  const yAxisKey = config.yAxis || "y";

  // Find category field - look for a string field that isn't x or y
  const categoryField = useMemo(() => {
    if (!config.data || config.data.length === 0) return null;

    const firstItem = config.data[0] as Record<string, unknown>;
    const fields = Object.keys(firstItem);

    const catField = fields.find((field) => {
      if (field === xAxisKey || field === yAxisKey) return false;
      return config.data.some((item) => {
        const value = (item as Record<string, unknown>)[field];
        return typeof value === "string";
      });
    });

    return catField || null;
  }, [config.data, xAxisKey, yAxisKey]);

  // Find size field - look for a numeric field that isn't x, y, or category
  const sizeField = useMemo(() => {
    if (!config.data || config.data.length === 0) return null;

    const firstItem = config.data[0] as Record<string, unknown>;
    const fields = Object.keys(firstItem);

    const sizeFieldCandidate = fields.find((field) => {
      if (field === xAxisKey || field === yAxisKey || field === categoryField) return false;
      return config.data.some((item) => {
        const value = (item as Record<string, unknown>)[field];
        return typeof value === "number";
      });
    });

    return sizeFieldCandidate || null;
  }, [config.data, xAxisKey, yAxisKey, categoryField]);

  // Prepare scatter data with x and y coordinates, and optional size for bubble charts
  const scatterData = useMemo(() => {
    return config.data.map((item) => {
      const dataObj = item as Record<string, unknown>;
      const point: ScatterPoint = {
        x: Number(dataObj[xAxisKey]) || 0,
        y: Number(dataObj[yAxisKey]) || 0,
      };

      if (categoryField) {
        point.category = String(dataObj[categoryField] || "");
      }

      if (sizeField) {
        point.size = Number(dataObj[sizeField]) || 0;
      }

      return point;
    });
  }, [config.data, xAxisKey, yAxisKey, categoryField, sizeField]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!categoryField) return [];
    return Array.from(new Set(scatterData.map((d) => d.category).filter(Boolean)));
  }, [scatterData, categoryField]);

  const isCategoricalScatter = categories.length > 0;

  // Animation configuration
  const animationDuration = reducedMotion ? 0 : (config.animationDuration ?? 800);
  const animationEasing = config.animationEasing ?? "ease";

  // Build reference elements
  const referenceElements = config.referenceElements || [];

  // Brush configuration
  const brushConfig = config.brush;
  const showBrush = brushConfig?.enabled ?? false;

  console.log("[ScatterChart] Scatter data prepared:", {
    dataPoints: scatterData.length,
    isCategoricalScatter,
    categories,
    xAxisKey,
    yAxisKey,
    sizeField,
    showBrush,
    animationDuration,
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        data={scatterData}
        syncId={config.syncId}
        margin={{
          top: config.styling?.margin?.top ?? 20,
          right: config.styling?.margin?.right ?? 60,
          left: config.styling?.margin?.left ?? 60,
          bottom: config.styling?.margin?.bottom ?? 20,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.gridStroke}
          horizontal={true}
          vertical={true}
        />
        <XAxis
          dataKey="x"
          stroke={colors.axisStroke}
          style={{ fontSize: "12px" }}
          label={{
            value: config.axisConfig?.x?.label || "x",
            position: "bottom",
            offset: 10,
            style: { fill: colors.textColor },
          }}
        />
        <YAxis
          dataKey="y"
          stroke={colors.axisStroke}
          style={{ fontSize: "12px" }}
          label={{
            value: config.axisConfig?.y?.label || "y",
            angle: -90,
            position: "left",
            style: { fill: colors.textColor },
          }}
        />
        {sizeField && (
          <ZAxis
            zAxisId="z"
            dataKey="size"
            range={[50, 400]}
            name="Size"
            unit="px"
          />
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
        <Legend wrapperStyle={{ color: colors.textColor }} />

        {/* Render reference elements */}
        {referenceElements.map((refElement, index) => {
          if (refElement.type === "line") {
            return (
              <ReferenceLine
                key={`ref-line-${index}`}
                x={refElement.value}
                stroke={refElement.stroke || "#999"}
                strokeDasharray={refElement.strokeDasharray}
                label={refElement.label}
              />
            );
          }

          if (refElement.type === "area") {
            return (
              <ReferenceArea
                key={`ref-area-${index}`}
                x1={Array.isArray(refElement.value) ? refElement.value[0] : undefined}
                x2={Array.isArray(refElement.value) ? refElement.value[1] : undefined}
                fill={refElement.fill || "#999"}
                fillOpacity={refElement.fillOpacity ?? 0.1}
              />
            );
          }

          return null;
        })}

        {/* Render scatter data */}
        {isCategoricalScatter ? (
          // For categorical data, render one Scatter per category
          categories.map((category, idx) => (
            <Scatter
              key={`scatter-${category}`}
              name={String(category)}
              data={scatterData.filter((d) => d.category === category)}
              fill={paletteToUse[idx % paletteToUse.length]}
              isAnimationActive={animationDuration > 0}
              animationDuration={animationDuration}
              animationEasing={animationEasing as any}
              {...(sizeField && { zAxisId: "z" })}
            />
          ))
        ) : (
          // For non-categorical data, render single Scatter
          <Scatter
            name="Series"
            data={scatterData}
            fill={paletteToUse[0]}
            isAnimationActive={animationDuration > 0}
            animationDuration={animationDuration}
            animationEasing={animationEasing as any}
            {...(sizeField && { zAxisId: "z" })}
          />
        )}

        {/* Render brush for range selection if enabled */}
        {showBrush && (
          <Brush
            height={brushConfig?.height ?? 40}
            y={brushConfig?.y}
            fill={brushConfig?.fill || colors.gridStroke}
            stroke={brushConfig?.stroke || colors.axisStroke}
            fillOpacity={brushConfig?.fillOpacity ?? 0.3}
            travellerWidth={8}
          />
        )}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}
