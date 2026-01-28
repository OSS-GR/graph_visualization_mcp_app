import React, { useMemo, useState } from "react";
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
  type Margin,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";

// Normalize easing string formats from camelCase to kebab-case
function normalizeEasing(easing?: string): string {
  if (!easing) return "ease";
  return easing.replace(/([A-Z])/g, "-$1").toLowerCase();
}

interface TreemapChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
  color?: string;
  [key: string]: unknown;
}

export function TreemapChart({ config, theme, reducedMotion }: TreemapChartProps) {
  const colors = getChartColors(theme || config.theme);
  const palette = config.palette || colors.palette;
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Debug logging
  console.info("TreemapChart rendering:", {
    chartType: config.chartType,
    dataLength: config.data.length,
    hasLabels: config.label?.enabled,
    syncId: config.syncId,
    paletteLength: palette.length,
  });

  // Transform data for Treemap
  const treemapData = useMemo(() => {
    try {
      const data = config.data as Record<string, unknown>[];

      // Check if data has hierarchical structure
      const firstItem = data[0];

      // Case 1: Data with explicit 'children' property (hierarchical)
      if (
        firstItem &&
        typeof firstItem === "object" &&
        "children" in firstItem &&
        "name" in firstItem
      ) {
        console.info("Using hierarchical structure with children");

        // Build hierarchical data with color assignment
        const buildHierarchy = (item: Record<string, unknown>, depth: number = 0): TreemapNode => {
          const node: TreemapNode = {
            name: String(item.name) || "Unknown",
            value: Number(item.value) || undefined,
            color: (item.color as string) || palette[depth % palette.length],
          };

          if (Array.isArray(item.children)) {
            node.children = (item.children as Record<string, unknown>[]).map((child) =>
              buildHierarchy(child, depth + 1)
            );
          }

          return node;
        };

        return data.map((item) => buildHierarchy(item as Record<string, unknown>));
      }

      // Case 2: Build from flat data with name/value pattern
      if (data.every((item) => "name" in item && "value" in item)) {
        console.info("Building Treemap from flat name/value structure");

        return data.map((item, index) => ({
          name: String((item as Record<string, unknown>).name) || `Item ${index}`,
          value: Number((item as Record<string, unknown>).value) || 0,
          color: (item as Record<string, unknown>).color as string || palette[index % palette.length],
        }));
      }

      // Case 3: Try to use first available numeric column as value
      const availableKeys = Object.keys(firstItem || {});
      const valueKey = config.series?.[0] || availableKeys.find((key) => {
        return data.some((item) => typeof (item as Record<string, unknown>)[key] === "number");
      });

      if (valueKey) {
        console.info("Building Treemap from series data");

        return data.map((item, index) => ({
          name: String((item as Record<string, unknown>)[config.xAxis] || `Item ${index}`),
          value: Number((item as Record<string, unknown>)[valueKey]) || 0,
          color: palette[index % palette.length],
        }));
      }

      // Fallback
      console.warn("Data does not match Treemap pattern, using empty structure");
      return [];
    } catch (error) {
      console.error("Error transforming data for Treemap:", error);
      return [];
    }
  }, [config.data, config.xAxis, config.series, palette]);

  // Get animation settings
  const animationDuration = reducedMotion ? 0 : (config.animationDuration ?? 400);
  const animationEasing = config.animationEasing ?? "ease";

  console.info("TreemapChart data:", {
    nodeCount: treemapData.length,
    totalValue: treemapData.reduce((sum, node) => sum + (node.value || 0), 0),
  });

  if (treemapData.length === 0) {
    return (
      <div style={{ padding: "16px", color: colors.textColor }}>
        <p>
          Treemap requires data with name/value structure or hierarchical
          children. Current data: {JSON.stringify(config.data.slice(0, 2))}
        </p>
      </div>
    );
  }

  // Custom shape renderer for labels and colors
  const renderCustomizedContent = (props: Record<string, unknown>) => {
    const {
      x,
      y,
      width,
      height,
      name,
      value,
      fill,
    } = props as {
      x: number;
      y: number;
      width: number;
      height: number;
      name: string;
      value: number;
      fill: string;
    };

    const isHovered = hoveredNode === name;

    return (
      <g
        onMouseEnter={() => setHoveredNode(name)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fill || palette[0],
            stroke: isHovered ? colors.textColor : colors.borderColor,
            strokeWidth: isHovered ? 2 : 1,
            opacity: isHovered ? 1 : 0.8,
          }}
        />
        {config.label?.enabled && width > 40 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill={config.label?.color || colors.textColor}
              fontSize={config.label?.fontSize || 12}
              fontWeight={config.label?.fontWeight || "normal"}
              style={{ pointerEvents: "none" }}
            >
              {name}
            </text>
            {config.label?.formatter === "value" && (
              <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                textAnchor="middle"
                fill={config.label?.color || colors.textColor}
                fontSize={(config.label?.fontSize || 12) - 2}
                style={{ pointerEvents: "none" }}
              >
                {value}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treemapData}
        dataKey="value"
        stroke={colors.borderColor}
        fill={palette[0]}
        aspectRatio={16 / 9}
        animationDuration={animationDuration}
        animationEasing={normalizeEasing(animationEasing) as any}
        content={renderCustomizedContent}
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
          cursor={{ fill: colors.gridStroke, fillOpacity: 0.1 }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
