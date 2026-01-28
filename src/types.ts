// Chart Types
export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "composed"
  | "scatter"
  | "radar"
  | "funnel"
  | "sankey"
  | "treemap";

export type SeriesType = "bar" | "line" | "area";
export type Layout = "horizontal" | "vertical";
export type StackOffset = "none" | "expand" | "positive" | "sign" | "silhouette" | "wiggle";
export type CurveType = "monotone" | "natural" | "linear" | "cardinal" | "catmullRom";
export type IconType = "circle" | "cross" | "diamond" | "line" | "none" | "rect" | "square" | "star" | "triangle" | "wye";
export type Position = "top" | "bottom" | "left" | "right" | "inside" | "outside" | "center";
export type LabelFormatter =
  | "Percentage" | "Currency" | "Decimal" | "default"  // Standard formatters
  | "percentage" | "value" | "name" | "conversion";     // Chart-specific formatters

// Tooltip Configuration
export interface TooltipConfig {
  enabled?: boolean;
  trigger?: "hover" | "click";
  shared?: boolean;
  contentType?: "default" | "custom";
  formatter?: Record<string, string>; // e.g. { "sales": "Currency", "count": "Decimal" }
  labelFormatter?: string;
  itemSorter?: "name" | "value" | "dataKey";
  filterNull?: boolean;
  position?: "auto" | "fixed";
  offset?: number;
  animate?: boolean;
  animationDuration?: number;
  cursorStyle?: Record<string, string>;
  contentStyle?: Record<string, string>;
  wrapperStyle?: Record<string, string>;
  includeHidden?: boolean;
}

// Legend Configuration
export interface LegendConfig {
  enabled?: boolean;
  layout?: "horizontal" | "vertical";
  align?: "center" | "left" | "right";
  verticalAlign?: "bottom" | "top" | "middle";
  iconType?: IconType;
  iconSize?: number;
  inactiveColor?: string;
  onClick?: "filter" | "highlight" | "none";
  formatter?: string; // custom format function
  wrapperStyle?: Record<string, string>;
  itemStyle?: Record<string, string>;
  textStyle?: Record<string, string>;
}

// Label Configuration
export interface LabelConfig {
  enabled?: boolean;
  position?: Position;
  offset?: number;
  angle?: number;
  color?: string;
  formatter?: LabelFormatter;
  zIndex?: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "lighter";
}

// Reference Element Configuration
export interface ReferenceElement {
  type: "line" | "area";
  value?: number | string;
  position?: Position;
  stroke?: string;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
  label?: string;
  labelPosition?: Position;
}

// Brush Configuration
export interface BrushConfig {
  enabled?: boolean;
  dataStartIndex?: number;
  dataEndIndex?: number;
  y?: number;
  height?: number;
  travelAxis?: "x" | "y";
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  showPreview?: boolean;
}

// Axis Configuration
export interface AxisConfig {
  type?: "number" | "category";
  dataKey?: string;
  label?: string;
  labelAngle?: number;
  labelPosition?: Position;
  scale?: "linear" | "logarithmic";
  hide?: boolean;
  stroke?: string;
  textStyle?: Record<string, string>;
  tickCount?: number;
  domain?: [number | string, number | string];
}

// Chart-specific styling
export interface ChartStyling {
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  padding?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

// Main Configuration
export interface ChartConfig {
  // Basic
  chartType?: ChartType;
  title?: string;
  subtitle?: string;
  data: unknown[] | { datasetId: string };

  // Axes
  xAxis?: string;
  yAxis?: string;
  yAxis2?: string;

  // Series
  series?: string[];
  seriesConfig?: Record<string, SeriesType>;

  // Layout & Sizing
  layout?: Layout;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;

  // Bars & Spacing
  barSize?: number | string;
  barGap?: number | string;
  barCategoryGap?: number | string;
  maxBarSize?: number;
  barRadius?: number | number[];

  // Stacking
  stackOffset?: StackOffset;
  reverseStackOrder?: boolean;
  baseValue?: number | "dataMax" | "dataMin";

  // Lines & Areas
  curveType?: CurveType;
  strokeWidth?: number;
  fillOpacity?: number;
  dotSize?: number;
  dotColor?: string;
  animationDuration?: number;
  animationEasing?: "ease" | "linear" | "easeIn" | "easeOut" | "easeInOut";

  // Data Labels
  label?: LabelConfig;

  // Components
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  brush?: BrushConfig;
  referenceElements?: ReferenceElement[];
  axisConfig?: {
    x?: AxisConfig;
    y?: AxisConfig;
    y2?: AxisConfig;
  };

  // Interactivity
  clickable?: boolean;
  syncId?: string;
  syncMethod?: "index" | "value";

  // Styling
  theme?: "light" | "dark";
  styling?: ChartStyling;
  palette?: string[]; // Custom color palette

  // Pie/Radar specific
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;

  // Scatter specific
  bubbleSize?: "auto" | number;
  bubbleColor?: string;
}

export interface ParsedChartConfig {
  chartType: ChartType;
  title: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  xAxis: string;
  series: string[];
  seriesConfig: Record<string, SeriesType>;
  theme: "light" | "dark";

  // Optional enhanced configs
  layout?: Layout;
  barSize?: number | string;
  barGap?: number | string;
  barCategoryGap?: number | string;
  maxBarSize?: number;
  barRadius?: number | number[];
  stackOffset?: StackOffset;
  reverseStackOrder?: boolean;
  baseValue?: number | "dataMax" | "dataMin";
  curveType?: CurveType;
  strokeWidth?: number;
  fillOpacity?: number;
  dotSize?: number;
  dotColor?: string;
  animationDuration?: number;
  animationEasing?: "ease" | "linear" | "easeIn" | "easeOut" | "easeInOut";
  label?: LabelConfig;
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  brush?: BrushConfig;
  referenceElements?: ReferenceElement[];
  axisConfig?: {
    x?: AxisConfig;
    y?: AxisConfig;
    y2?: AxisConfig;
  };
  seriesYAxisMap?: Record<string, "left" | "right">;
  yAxis?: string;
  yAxis2?: string;
  syncId?: string;
  styling?: ChartStyling;
  palette?: string[];
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}
