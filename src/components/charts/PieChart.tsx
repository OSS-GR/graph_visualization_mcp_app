import React, { useMemo, useState } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { buildCustomLabelContent, shouldUseLabelLine } from "../../utils/labelConfig";
import { CustomTooltip } from "./CustomTooltip";

// Normalize easing string formats from camelCase to kebab-case
function normalizeEasing(easing?: string): string {
  if (!easing) return "ease";
  return easing.replace(/([A-Z])/g, "-$1").toLowerCase();
}

interface PieChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function PieChart({ config, theme, reducedMotion }: PieChartProps) {
  const colors = getChartColors(config.theme);
  const palette = config.palette || colors.palette;
  const [filteredSeries, setFilteredSeries] = useState<Set<string>>(new Set());

  // Debug logging
  console.log("PieChart config:", {
    chartType: config.chartType,
    cx: config.cx,
    cy: config.cy,
    innerRadius: config.innerRadius,
    outerRadius: config.outerRadius,
    startAngle: config.startAngle,
    endAngle: config.endAngle,
    label: config.label,
    syncId: config.syncId,
    palette: palette.length,
  });

  // For pie chart, we need to aggregate data differently
  const pieData = useMemo(() => {
    if (config.series.length === 0) return [];

    // Use the first series as the value and xAxis as the name
    const series = config.series[0]!;
    const xAxisKey = config.xAxis || "index";
    const data = config.data.map((item, index) => {
      const name = String((item as Record<string, unknown>)[xAxisKey] ?? `Item ${index}`);
      const value = Number((item as Record<string, unknown>)[series]) || 0;
      return {
        name,
        value,
        originalItem: item,
      };
    });

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0",
    }));
  }, [config]);

  // Filter data based on legend click
  const displayData = useMemo(() => {
    if (filteredSeries.size === 0) return pieData;
    return pieData.filter((item) => !filteredSeries.has(item.name));
  }, [pieData, filteredSeries]);

  // Get center position with defaults
  const cx = config.cx ?? "50%";
  const cy = config.cy ?? "50%";

  // Get radius values with defaults
  const outerRadius = config.outerRadius ?? 80;
  const innerRadius = config.innerRadius ?? 0;

  // Get angle values with defaults
  const startAngle = config.startAngle ?? 0;
  const endAngle = config.endAngle ?? 360;

  // Get animation settings
  const animationDuration = config.animationDuration ?? 400;
  const animationEasing = config.animationEasing ?? "ease";

  // Note: Pie charts in Recharts use a different label signature
  // For now, we'll skip custom label function and use built-in support
  const shouldShowLabels = config.label?.enabled && config.label?.position !== "center";

  // Handle legend click for filtering
  const handleLegendClick = (e: any) => {
    const dataKey = typeof e?.dataKey === "string" ? e.dataKey : String(e?.dataKey ?? "");
    console.log("Legend clicked:", dataKey);
    if (!dataKey) return;

    const newFiltered = new Set(filteredSeries);
    if (newFiltered.has(dataKey)) {
      newFiltered.delete(dataKey);
    } else {
      newFiltered.add(dataKey);
    }
    setFilteredSeries(newFiltered);
  };

  console.log("PieChart render:", {
    dataPoints: displayData.length,
    filteredCount: filteredSeries.size,
    cx,
    cy,
    outerRadius,
    innerRadius,
    startAngle,
    endAngle,
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart
        syncId={config.syncId}
        style={{ backgroundColor: config.styling?.backgroundColor }}
      >
        <Pie
          data={displayData}
          cx={cx}
          cy={cy}
          labelLine={shouldShowLabels}
          label={shouldShowLabels}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="#8884d8"
          dataKey="value"
          animationDuration={animationDuration}
          animationEasing={normalizeEasing(animationEasing) as any}
        >
          {displayData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={palette[index % palette.length]}
            />
          ))}
          {config.label?.enabled && config.label?.position === "center" && (
            <Label
              position="center"
              offset={config.label?.offset}
              fill={config.label?.color || colors.textColor}
              fontSize={config.label?.fontSize || 14}
            >
              {config.label?.formatter === "percentage"
                ? `${displayData.reduce((sum, d) => sum + (d.value as number), 0)}%`
                : `Total: ${displayData.reduce((sum, d) => sum + (d.value as number), 0)}`}
            </Label>
          )}
        </Pie>
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
          wrapperStyle={{ color: colors.textColor }}
          onClick={handleLegendClick}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
