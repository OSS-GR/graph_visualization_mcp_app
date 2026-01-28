import React, { useMemo, useState } from "react";
import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  Cell,
  Legend,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";

interface FunnelChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function FunnelChart({ config, theme, reducedMotion }: FunnelChartProps) {
  const colors = getChartColors(config.theme);
  const palette = config.palette || colors.palette;
  const [filteredSeries, setFilteredSeries] = useState<Set<string>>(new Set());

  // Console logging for debugging
  console.log("[FunnelChart] Rendering with config:", {
    chartType: config.chartType,
    series: config.series,
    dataPoints: config.data.length,
    xAxis: config.xAxis,
    animationDuration: config.animationDuration,
    syncId: config.syncId,
    label: config.label,
  });

  // Prepare funnel data - expecting conversion flow from categories to values
  const funnelData = useMemo(() => {
    const xAxisKey = config.xAxis || "stage";
    const yAxisKey = config.series[0] || "value";

    // Transform data into funnel format
    const transformed = config.data.map((item, index) => {
      const stage = String((item as Record<string, unknown>)[xAxisKey] ?? `Stage ${index + 1}`);
      const value = Number((item as Record<string, unknown>)[yAxisKey]) || 0;

      return {
        name: stage,
        value,
        originalItem: item,
        index,
      };
    });

    // Sort by value in descending order for typical funnel visualization
    return transformed.sort((a, b) => b.value - a.value);
  }, [config.data, config.xAxis, config.series]);

  // Calculate total and percentages
  const totalValue = useMemo(() => {
    return funnelData.reduce((sum, item) => sum + item.value, 0);
  }, [funnelData]);

  // Add percentage information to data
  const funnelDataWithPercentages = useMemo(() => {
    return funnelData.map((item, index) => {
      const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0";
      const prevItem = index > 0 ? funnelData[index - 1] : null;
      const conversionFromPrev =
        prevItem && prevItem.value > 0
          ? ((item.value / prevItem.value) * 100).toFixed(1)
          : "100";

      return {
        ...item,
        percentage: parseFloat(percentage),
        conversionFromPrev: parseFloat(conversionFromPrev),
      };
    });
  }, [funnelData, totalValue]);

  // Filter data based on legend click
  const displayData = useMemo(() => {
    if (filteredSeries.size === 0) return funnelDataWithPercentages;
    return funnelDataWithPercentages.filter((item) => !filteredSeries.has(item.name));
  }, [funnelDataWithPercentages, filteredSeries]);

  // Animation configuration
  const animationDuration = config.animationDuration ?? 400;
  const animationEasing = config.animationEasing ?? "ease";

  // Determine label renderer
  const getLabelContent = (entry: Record<string, unknown>) => {
    const labelConfig = config.label;

    if (!labelConfig?.enabled) {
      // Default: show name and value
      return `${entry.name}: ${entry.value}`;
    }

    const parts = [];

    if (labelConfig.formatter === "percentage") {
      parts.push(`${entry.percentage}%`);
    } else if (labelConfig.formatter === "value") {
      parts.push(String(entry.value));
    } else if (labelConfig.formatter === "name") {
      parts.push(String(entry.name));
    } else if (labelConfig.formatter === "conversion") {
      parts.push(`${entry.conversionFromPrev}%`);
    } else {
      // Default: show name and value with percentage
      parts.push(`${entry.name}`);
      parts.push(`${entry.value}`);
      parts.push(`(${entry.percentage}%)`);
    }

    return parts.join(" ");
  };

  // Handle legend click for filtering
  const handleLegendClick = (e: { dataKey?: string }) => {
    console.log("[FunnelChart] Legend clicked:", e.dataKey);
    if (!e.dataKey) return;

    const newFiltered = new Set(filteredSeries);
    if (newFiltered.has(e.dataKey)) {
      newFiltered.delete(e.dataKey);
    } else {
      newFiltered.add(e.dataKey);
    }
    setFilteredSeries(newFiltered);
  };

  console.log("[FunnelChart] Funnel data prepared:", {
    stageCount: displayData.length,
    totalValue,
    filteredCount: filteredSeries.size,
    animationDuration,
    animationEasing,
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart
        syncId={config.syncId}
        margin={{
          top: config.styling?.margin?.top ?? 20,
          right: config.styling?.margin?.right ?? 20,
          left: config.styling?.margin?.left ?? 20,
          bottom: config.styling?.margin?.bottom ?? 20,
        }}
        style={{
          backgroundColor: config.styling?.backgroundColor,
        }}
      >
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
          onClick={(e: any) => handleLegendClick({ dataKey: e?.dataKey })}
        />

        {/* Render funnel chart */}
        <Funnel
          name="Conversion Funnel"
          data={displayData}
          dataKey="value"
          isAnimationActive={animationDuration > 0}
          animationDuration={animationDuration}
          animationEasing={animationEasing as any}
        >
          {displayData.map((entry, index) => (
            <Cell
              key={`funnel-cell-${index}`}
              fill={palette[index % palette.length]}
            />
          ))}

          {/* Render labels if enabled */}
          {config.label?.enabled && (
            <LabelList
              dataKey="name"
              position={config.label.position || "center"}
              offset={config.label.offset ?? 10}
              fill={config.label.color || colors.textColor}
              fontSize={config.label.fontSize || 12}
              fontWeight={config.label.fontWeight || "normal"}
            />
          )}
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
}
