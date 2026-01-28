import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

// Define the input schema using Zod
const VisualizationInputSchema = z.object({
  // Basic
  data: z
    .array(z.record(z.string(), z.unknown()))
    .or(z.object({ datasetId: z.string() })),
  chartType: z.enum(["bar", "line", "area", "pie", "composed", "scatter", "radar", "funnel", "sankey", "treemap"]).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),

  // Axes
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  yAxis2: z.string().optional(),

  // Series
  series: z.array(z.string()).optional(),
  seriesConfig: z.record(z.string(), z.enum(["bar", "line", "area"])).optional(),

  // Layout & Sizing
  layout: z.enum(["horizontal", "vertical"]).optional(),
  width: z.union([z.number(), z.string()]).optional(),
  height: z.union([z.number(), z.string()]).optional(),
  responsive: z.boolean().optional(),

  // Bars & Spacing
  barSize: z.union([z.number(), z.string()]).optional(),
  barGap: z.union([z.number(), z.string()]).optional(),
  barCategoryGap: z.union([z.number(), z.string()]).optional(),
  barRadius: z.union([z.number(), z.array(z.number())]).optional(),
  maxBarSize: z.number().optional(),

  // Stacking
  stackOffset: z.enum(["none", "expand", "positive", "sign", "silhouette", "wiggle"]).optional(),
  reverseStackOrder: z.boolean().optional(),
  baseValue: z.union([z.number(), z.enum(["dataMax", "dataMin"])]).optional(),

  // Lines & Areas
  curveType: z.enum(["monotone", "natural", "linear", "cardinal", "catmullRom"]).optional(),
  strokeWidth: z.number().optional(),
  fillOpacity: z.number().optional(),
  dotSize: z.number().optional(),
  dotColor: z.string().optional(),

  // Animation
  animationDuration: z.number().optional(),
  animationEasing: z.enum(["ease", "linear", "easeIn", "easeOut", "easeInOut"]).optional(),

  // Labels
  label: z.object({
    enabled: z.boolean().optional(),
    position: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
    offset: z.number().optional(),
    angle: z.number().optional(),
    color: z.string().optional(),
    formatter: z.enum(["Percentage", "Currency", "Decimal", "default", "percentage", "value", "name", "conversion"]).optional(),
    fontSize: z.number().optional(),
  }).optional(),

  // Tooltip
  tooltip: z.object({
    enabled: z.boolean().optional(),
    trigger: z.enum(["hover", "click"]).optional(),
    shared: z.boolean().optional(),
    contentType: z.enum(["default", "custom"]).optional(),
    formatter: z.record(z.string(), z.unknown()).optional(),
    labelFormatter: z.string().optional(),
    itemSorter: z.enum(["name", "value", "dataKey"]).optional(),
    filterNull: z.boolean().optional(),
    position: z.enum(["auto", "fixed"]).optional(),
    offset: z.number().optional(),
    animate: z.boolean().optional(),
    animationDuration: z.number().optional(),
    contentStyle: z.record(z.string(), z.unknown()).optional(),
    wrapperStyle: z.record(z.string(), z.unknown()).optional(),
    includeHidden: z.boolean().optional(),
  }).optional(),

  // Legend
  legend: z.object({
    enabled: z.boolean().optional(),
    layout: z.enum(["horizontal", "vertical"]).optional(),
    align: z.enum(["center", "left", "right"]).optional(),
    verticalAlign: z.enum(["bottom", "top", "middle"]).optional(),
    iconType: z.enum(["circle", "cross", "diamond", "line", "none", "rect", "square", "star", "triangle", "wye"]).optional(),
    iconSize: z.number().optional(),
    inactiveColor: z.string().optional(),
    onClick: z.enum(["filter", "highlight", "none"]).optional(),
    formatter: z.string().optional(),
    wrapperStyle: z.record(z.string(), z.unknown()).optional(),
    itemStyle: z.record(z.string(), z.unknown()).optional(),
    textStyle: z.record(z.string(), z.unknown()).optional(),
  }).optional(),

  // Brush
  brush: z.object({
    enabled: z.boolean().optional(),
    dataStartIndex: z.number().optional(),
    dataEndIndex: z.number().optional(),
    y: z.number().optional(),
    height: z.number().optional(),
    travelAxis: z.enum(["x", "y"]).optional(),
    fill: z.string().optional(),
    stroke: z.string().optional(),
    fillOpacity: z.number().optional(),
    showPreview: z.boolean().optional(),
  }).optional(),

  // References
  referenceElements: z.array(z.object({
    type: z.enum(["line", "area"]),
    value: z.union([z.number(), z.string(), z.array(z.number()), z.array(z.string())]).optional(),
    position: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
    stroke: z.string().optional(),
    strokeDasharray: z.string().optional(),
    fill: z.string().optional(),
    fillOpacity: z.number().optional(),
    label: z.string().optional(),
    labelPosition: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
  })).optional(),

  // Axis Configuration
  axisConfig: z.object({
    x: z.object({
      type: z.enum(["number", "category"]).optional(),
      label: z.string().optional(),
      labelAngle: z.number().optional(),
      labelPosition: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
      scale: z.enum(["linear", "logarithmic"]).optional(),
      hide: z.boolean().optional(),
      stroke: z.string().optional(),
      textStyle: z.record(z.string(), z.unknown()).optional(),
      tickCount: z.number().optional(),
      domain: z.array(z.union([z.number(), z.string()])).optional(),
    }).optional(),
    y: z.object({
      type: z.enum(["number", "category"]).optional(),
      label: z.string().optional(),
      labelAngle: z.number().optional(),
      labelPosition: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
      scale: z.enum(["linear", "logarithmic"]).optional(),
      hide: z.boolean().optional(),
      stroke: z.string().optional(),
      textStyle: z.record(z.string(), z.unknown()).optional(),
      tickCount: z.number().optional(),
      domain: z.array(z.union([z.number(), z.string()])).optional(),
    }).optional(),
    y2: z.object({
      type: z.enum(["number", "category"]).optional(),
      label: z.string().optional(),
      labelAngle: z.number().optional(),
      labelPosition: z.enum(["top", "bottom", "left", "right", "inside", "outside", "center"]).optional(),
      scale: z.enum(["linear", "logarithmic"]).optional(),
      hide: z.boolean().optional(),
      stroke: z.string().optional(),
      textStyle: z.record(z.string(), z.unknown()).optional(),
      tickCount: z.number().optional(),
      domain: z.array(z.union([z.number(), z.string()])).optional(),
    }).optional(),
  }).optional(),

  // Interactivity
  syncId: z.string().optional(),
  syncMethod: z.enum(["index", "value"]).optional(),
  clickable: z.boolean().optional(),

  // Styling
  theme: z.enum(["light", "dark"]).optional(),
  styling: z.object({
    margin: z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional(),
    }).optional(),
    padding: z.number().optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.number().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
  }).optional(),
  palette: z.array(z.string()).optional(),

  // Pie/Radar specific
  cx: z.union([z.number(), z.string()]).optional(),
  cy: z.union([z.number(), z.string()]).optional(),
  innerRadius: z.number().optional(),
  outerRadius: z.number().optional(),
  startAngle: z.number().optional(),
  endAngle: z.number().optional(),

  // Scatter specific
  bubbleSize: z.union([z.literal("auto"), z.number()]).optional(),
  bubbleColor: z.string().optional(),
});

/**
 * Factory function to create a new MCP server instance.
 * Each server instance is independent and can have its own lifecycle.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Graph Visualization MCP App",
    version: "1.0.0",
  });

  // Resource URI - proper format with ui:// scheme
  const resourceUri = "ui://graph-visualization/visualization.html";

  // Tool callback - echoes the input back to pass to the UI
  async function createVisualizationHandler(args: unknown): Promise<CallToolResult> {
    console.error("[TOOL] create_visualization called with args:", args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(args),
        },
      ],
    };
  }

  // Register the visualization tool with UI metadata
  registerAppTool(
    server,
    "create_visualization",
    {
      description:
        "Create interactive data visualizations from raw JSON data or stored datasets",
      inputSchema: VisualizationInputSchema,
      _meta: {
        ui: {
          resourceUri, // Links tool to the resource UI
        },
      },
    },
    createVisualizationHandler
  );

  // Register the visualization resource (HTML UI)
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const htmlPath = path.join(DIST_DIR, "src", "index.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  return server;
}
