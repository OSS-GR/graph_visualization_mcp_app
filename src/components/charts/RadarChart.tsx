import React, { useMemo } from "react";
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";

// Custom tick renderer for angle axis labels - positioned further out
const CustomAngleTick = (props: any) => {
  const { x, y, payload, fill, cx = 0, cy = 0 } = props;

  // Calculate distance from center and push labels further out
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const scale = distance > 0 ? 1.3 : 1; // Push 30% further from center

  const offsetX = cx + dx * scale;
  const offsetY = cy + dy * scale;

  return (
    <g transform={`translate(${offsetX},${offsetY})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="middle"
        fill={fill}
        fontSize={14}
        fontWeight="bold"
      >
        {payload.value}
      </text>
    </g>
  );
};

interface RadarChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function RadarChart({ config, theme, reducedMotion }: RadarChartProps) {
  const colors = getChartColors(config.theme);
  const paletteToUse = config.palette || colors.palette;

  // Console logging for debugging
  console.log("[RadarChart] Rendering with config:", {
    chartType: config.chartType,
    series: config.series,
    dataPoints: config.data.length,
    xAxis: config.xAxis,
    seriesCount: config.series.length,
    animationDuration: config.animationDuration,
    syncId: config.syncId,
  });

  // Prepare radar data with multiple dimensions
  const radarData = useMemo(() => {
    const xAxisKey = config.xAxis || "category";

    // Detect if data needs to be transposed
    // If we have more series than data items, the data is likely transposed
    // (each item represents a polygon, not an angle point)
    const needsTranspose = config.series.length > config.data.length;

    if (needsTranspose) {
      // Transform: series become angle points, data items become polygon series
      // Create angle points from series
      return config.series.map((seriesKey) => {
        const angleItem: Record<string, unknown> = {
          [xAxisKey]: seriesKey,
        };

        // For each data item (polygon), extract its value for this series
        config.data.forEach((dataItem) => {
          const itemLabel = String((dataItem as Record<string, unknown>)[xAxisKey] ?? "");
          const value = Number((dataItem as Record<string, unknown>)[seriesKey]) || 0;
          angleItem[itemLabel] = value;
        });

        return angleItem;
      });
    } else {
      // Standard format: data items are angle points
      return config.data.map((item) => {
        const category = String((item as Record<string, unknown>)[xAxisKey] ?? "");

        const dataItem: Record<string, unknown> = {
          [xAxisKey]: category,
        };

        config.series.forEach((seriesKey) => {
          dataItem[seriesKey] = Number((item as Record<string, unknown>)[seriesKey]) || 0;
        });

        return dataItem;
      });
    }
  }, [config.data, config.xAxis, config.series]);

  // Animation configuration
  const animationDuration = config.animationDuration ?? 800;
  const animationEasing = config.animationEasing ?? "ease";

  // Get center and radius configuration
  const cx = config.cx ?? "50%";
  const cy = config.cy ?? "50%";
  const outerRadius = config.outerRadius ?? 80;

  // Determine which series to render based on transpose state
  const needsTranspose = config.series.length > config.data.length;
  const seriesToRender = needsTranspose
    ? config.data.map((item) => String((item as Record<string, unknown>)[config.xAxis || "category"] ?? ""))
    : config.series;

  // Log the transposed data for debugging
  if (needsTranspose) {
    console.log("[RadarChart] TRANSPOSED DATA:", {
      radarData,
      xAxisKey: config.xAxis,
      needsTranspose,
      seriesToRender,
      firstDataItem: radarData[0],
      allDataItems: radarData,
    });
  }

  // Calculate max value from all data for proper scaling
  const maxDataValue = Math.max(
    ...radarData.flatMap((item) =>
      Object.values(item)
        .filter((val) => typeof val === "number")
        .map((val) => Number(val) || 0)
    )
  );

  // Round up to nearest 10 for clean domain
  const domainMax = Math.ceil(maxDataValue / 10) * 10 || 100;

  console.log("[RadarChart] Radar data prepared:", {
    dataPoints: radarData.length,
    seriesToRender,
    needsTranspose,
    cx,
    cy,
    outerRadius,
    domainMax,
    animationDuration,
    animationEasing,
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart
        data={radarData}
        cx={cx}
        cy={cy}
        outerRadius={outerRadius}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
      >
        <PolarGrid />
        <PolarAngleAxis
          dataKey={config.xAxis || "category"}
          stroke={colors.axisStroke}
          tick={<CustomAngleTick fill={colors.textColor} />}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, domainMax]}
          stroke={colors.axisStroke}
          tick={false}
        />
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
        <Legend
          wrapperStyle={{ color: colors.textColor, paddingTop: "20px" }}
          layout="horizontal"
          align="right"
          verticalAlign="bottom"
        />

        {/* Render radar for each series */}
        {seriesToRender.map((series, index) => {
          console.log(`[RadarChart] Rendering radar for series: ${series}`, {
            index,
            color: paletteToUse[index % paletteToUse.length],
          });

          return (
            <Radar
              key={series}
              name={series}
              dataKey={series}
              stroke={paletteToUse[index % paletteToUse.length]}
              fill={paletteToUse[index % paletteToUse.length]}
              fillOpacity={config.fillOpacity ?? 0.4}
              isAnimationActive={animationDuration > 0}
              animationDuration={animationDuration}
              animationEasing={animationEasing as any}
              dot={{
                fill: paletteToUse[index % paletteToUse.length],
                r: config.dotSize ?? 4,
              }}
              activeDot={{
                r: Math.max((config.dotSize ?? 4) + 2, 6),
              }}
            />
          );
        })}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
