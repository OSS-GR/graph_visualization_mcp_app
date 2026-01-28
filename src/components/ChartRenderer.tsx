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
  const [showDataTable, setShowDataTable] = useState(false);
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
    minHeight: "300px",
    width: "100%" as const,
    gap: "16px",
    flexWrap: "wrap" as const,
  };

  const chartAriaLabel = `${parsedConfig.title || "Chart"} - ${chartType} chart with ${parsedConfig.series.length} series and ${parsedConfig.data.length} data points`;

  const controlsStyle = {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
    flexWrap: "wrap" as const,
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid var(--color-border-default)",
    borderRadius: "4px",
    backgroundColor: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  };

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

      {/* Accessibility controls */}
      <div style={controlsStyle}>
        <button
          style={buttonStyle}
          onClick={() => setShowDataTable(!showDataTable)}
          aria-pressed={showDataTable}
          title="Show data table for screen reader compatibility"
        >
          {showDataTable ? "Hide" : "Show"} Data Table
        </button>
        <button
          style={buttonStyle}
          onClick={() => chartRef.current?.focus()}
          title="Focus the chart element"
        >
          Focus Chart
        </button>
      </div>

      {/* Data table for accessibility */}
      {showDataTable && (
        <div
          style={{
            overflowX: "auto",
            marginTop: "16px",
            border: "1px solid var(--color-border-default)",
            borderRadius: "4px",
          }}
          role="region"
          aria-label="Chart data table"
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-border-default)",
                  backgroundColor: "var(--color-background-secondary)",
                }}
              >
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {parsedConfig.xAxis}
                </th>
                {parsedConfig.series.map((series) => (
                  <th
                    key={series}
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {series}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedConfig.data.slice(0, 10).map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid var(--color-border-default)",
                  }}
                >
                  <td
                    style={{
                      padding: "8px",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {String(row[parsedConfig.xAxis] || "")}
                  </td>
                  {parsedConfig.series.map((series) => (
                    <td
                      key={series}
                      style={{
                        padding: "8px",
                        textAlign: "right",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {String(row[series] || "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {parsedConfig.data.length > 10 && (
            <p
              style={{
                padding: "8px",
              }}
            >
              Showing 10 of {parsedConfig.data.length} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
}
