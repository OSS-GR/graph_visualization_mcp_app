import React, { useMemo, useState } from "react";
import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ParsedChartConfig } from "../../types";
import { getChartColors } from "../../utils/chartColors";
import { CustomTooltip } from "./CustomTooltip";

interface SankeyChartProps {
  config: ParsedChartConfig;
  theme?: "light" | "dark";
  reducedMotion?: boolean;
}

interface SankeyNode {
  name: string;
}

interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
}

export function SankeyChart({ config, theme, reducedMotion }: SankeyChartProps) {
  const colors = getChartColors(theme || config.theme);
  const palette = config.palette || colors.palette;
  const [highlightedLink, setHighlightedLink] = useState<number | null>(null);

  // Debug logging
  console.info("SankeyChart rendering:", {
    chartType: config.chartType,
    dataLength: config.data.length,
    hasLabels: config.label?.enabled,
    syncId: config.syncId,
    paletteLength: palette.length,
  });

  // Transform data for Sankey
  const sankeyData = useMemo(() => {
    try {
      const data = config.data as Record<string, unknown>[];

      // Check if data has nodes and links structure
      const firstItem = data[0];

      // Case 1: Data with explicit 'nodes' and 'links' properties
      if (
        firstItem &&
        typeof firstItem === "object" &&
        "nodes" in firstItem &&
        "links" in firstItem
      ) {
        const nodesArray = (firstItem as Record<string, unknown>).nodes as SankeyNode[] | undefined;
        const linksArray = (firstItem as Record<string, unknown>).links as SankeyLinkData[] | undefined;

        if (Array.isArray(nodesArray) && Array.isArray(linksArray)) {
          console.info("Using explicit nodes and links structure");
          return {
            nodes: nodesArray,
            links: linksArray,
          };
        }
      }

      // Case 2: Build from source/target/value pattern
      if (data.every((item) => "source" in item && "target" in item && "value" in item)) {
        console.info("Building Sankey from source/target/value structure");

        const nodeSet = new Set<string>();
        const links: SankeyLinkData[] = [];

        // Collect unique nodes
        data.forEach((item) => {
          const itemRecord = item as Record<string, unknown>;
          const source = String(itemRecord.source);
          const target = String(itemRecord.target);
          nodeSet.add(source);
          nodeSet.add(target);

          const link: SankeyLinkData = {
            source: 0, // Will be set after nodeArray created
            target: 0, // Will be set after nodeArray created
            value: Number(itemRecord.value) || 0,
          };
          links.push(link);
        });

        const nodeArray: SankeyNode[] = Array.from(nodeSet).map((name) => ({
          name,
        }));

        // Map source/target names to indices
        const nodeIndexMap = new Map(nodeArray.map((n, i) => [n.name, i]));
        links.forEach((link, idx) => {
          const itemRecord = data[idx] as Record<string, unknown>;
          const source = String(itemRecord.source);
          const target = String(itemRecord.target);
          link.source = nodeIndexMap.get(source) ?? 0;
          link.target = nodeIndexMap.get(target) ?? 0;
        });

        return {
          nodes: nodeArray,
          links,
        };
      }

      // Fallback: create empty structure
      console.warn("Data does not match Sankey pattern, using empty structure");
      return {
        nodes: [],
        links: [],
      };
    } catch (error) {
      console.error("Error transforming data for Sankey:", error);
      return {
        nodes: [],
        links: [],
      };
    }
  }, [config.data]);

  // Get animation settings
  const animationDuration = reducedMotion ? 0 : (config.animationDuration ?? 400);
  const animationEasing = config.animationEasing ?? "ease";

  console.info("SankeyChart data:", {
    nodeCount: sankeyData.nodes.length,
    linkCount: sankeyData.links.length,
  });

  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return (
      <div style={{ padding: "16px", color: colors.textColor }}>
        <p>
          Sankey chart requires data with nodes and links structure or
          source/target/value pattern. Current data: {JSON.stringify(config.data.slice(0, 2))}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        node={{ fill: palette[0], fillOpacity: 1 }}
        link={{ stroke: colors.gridStroke, strokeOpacity: 0.5 }}
        nodePadding={50}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
      </Sankey>
    </ResponsiveContainer>
  );
}
