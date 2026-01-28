interface ChartColors {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  palette: string[];
  gridStroke: string;
  axisStroke: string;
}

const lightTheme: ChartColors = {
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#e5e7eb",
  palette: [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ],
  gridStroke: "#e5e7eb",
  axisStroke: "#9ca3af",
};

const darkTheme: ChartColors = {
  backgroundColor: "#1f2937",
  textColor: "#f3f4f6",
  borderColor: "#374151",
  palette: [
    "#60a5fa",
    "#f87171",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f472b6",
    "#2dd4bf",
    "#fb923c",
  ],
  gridStroke: "#374151",
  axisStroke: "#6b7280",
};

export function getChartColors(theme: "light" | "dark"): ChartColors {
  return theme === "dark" ? darkTheme : lightTheme;
}
