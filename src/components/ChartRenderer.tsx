import React, { useMemo, useState, useRef } from "react";
import type { ChartConfig, ParsedChartConfig } from "../types";
import { parseConfig } from "../utils/parseConfig";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { AreaChart } from "./charts/AreaChart";
import { PieChart } from "./charts/PieChart";
import { ComposedChart } from "./charts/ComposedChart";
import { SankeyChart } from "./charts/SankeyChart";
import { TreemapChart } from "./charts/TreemapChart";
import { ScatterChart } from "./charts/ScatterChart";
import { RadarChart } from "./charts/RadarChart";
import { FunnelChart } from "./charts/FunnelChart";
import { createChartDataDescription } from "../utils/a11y";

interface ChartRendererProps {
  config: ChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

export function ChartRenderer({ config, theme, reducedMotion }: ChartRendererProps) {
  const [renderError, setRenderError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const parsedConfig = useMemo(() => {
    try {
      const parsed = parseConfig(config);
      console.info("Parsed config:", parsed);
      setRenderError(null);
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error parsing config:", message);
      setRenderError(message);
      throw error;
    }
  }, [config]);

  // Generate data description for screen readers
  const dataDescription = useMemo(() => {
    if (parsedConfig.data.length === 0) return "";
    return createChartDataDescription(
      parsedConfig.data,
      parsedConfig.series,
      parsedConfig.xAxis
    );
  }, [parsedConfig]);

  if (renderError) {
    return (
      <div
        style={{
          padding: "16px",
          color: "var(--color-text-error, #ff6b6b)",
          border: "2px solid var(--color-text-error, #ff6b6b)",
          borderRadius: "4px",
        }}
        role="alert"
        aria-live="assertive"
      >
        <strong>Chart Error:</strong> {renderError}
      </div>
    );
  }

  const chartType = parsedConfig.chartType;

  const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    minHeight: 0,
  };

  const titleStyle = {
    fontSize: "clamp(20px, 5vw, 32px)",
    fontWeight: 600,
    color: "var(--color-text-primary)",
    margin: "0 0 8px 0",
    lineHeight: 1.2,
  };

  const chartsWrapperStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
    width: "100%" as const,
    gap: "16px",
    flexWrap: "wrap" as const,
    overflow: "auto" as const,
  };

  const chartAriaLabel = `${parsedConfig.title || "Chart"} - ${chartType} chart with ${parsedConfig.series.length} series and ${parsedConfig.data.length} data points`;

  return (
    <div style={containerStyle}>
      <div>
        {parsedConfig.title && (
          <h1 style={titleStyle} id="chart-title">
            {parsedConfig.title}
          </h1>
        )}
        {parsedConfig.subtitle && (
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "8px" }}>
            {parsedConfig.subtitle}
          </p>
        )}
      </div>

      <div
        ref={chartRef}
        style={chartsWrapperStyle}
        role="img"
        aria-label={chartAriaLabel}
        aria-describedby="chart-description"
        tabIndex={0}
      >
        {chartType === "bar" && (
          <BarChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "line" && (
          <LineChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "area" && (
          <AreaChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "pie" && (
          <PieChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "composed" && (
          <ComposedChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "scatter" && (
          <ScatterChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "radar" && (
          <RadarChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "funnel" && (
          <FunnelChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "sankey" && (
          <SankeyChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
        {chartType === "treemap" && (
          <TreemapChart config={parsedConfig} theme={theme} reducedMotion={reducedMotion} />
        )}
      </div>

      {/* Hidden description for screen readers */}
      <div id="chart-description" style={{ position: "absolute", left: "-10000px" }}>
        {dataDescription}
      </div>
    </div>
  );
}
