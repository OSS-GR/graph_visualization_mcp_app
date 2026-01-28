/**
 * Accessibility utilities for enhanced WCAG AAA compliance
 */

export interface ContrastRatio {
  ratio: number;
  level: "AAA" | "AA" | "Fail";
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const [rs, gs, bs] = [r, g, b].map((val) => {
    const c = val / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio and WCAG level
 */
export function getContrastRatio(color1: string, color2: string): ContrastRatio {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  let level: "AAA" | "AA" | "Fail" = "Fail";
  if (ratio >= 7) level = "AAA";
  else if (ratio >= 4.5) level = "AA";

  return { ratio: Math.round(ratio * 100) / 100, level };
}

/**
 * Generate a descriptive label for data point
 */
export function generateDataPointLabel(
  dataKey: string,
  value: unknown,
  label?: string
): string {
  const seriesName = label || dataKey;
  return `${seriesName}: ${value}`;
}

/**
 * Generate chart summary for screen readers
 */
export function generateChartSummary(
  title: string,
  chartType: string,
  dataLength: number,
  seriesCount: number
): string {
  return `${title}. ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart with ${seriesCount} series and ${dataLength} data points.`;
}

/**
 * Format value for accessibility announcement
 */
export function formatAccessibleValue(value: unknown): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }
  return String(value);
}

/**
 * Generate keyboard shortcut help text
 */
export function getKeyboardShortcuts(): string {
  return `
    Keyboard shortcuts:
    Tab: Move focus to chart elements
    Arrow keys: Navigate between data points
    Enter: Activate focused element
    Escape: Close tooltip or menu
  `;
}

/**
 * Create ARIA description for chart data
 */
export function createChartDataDescription(
  data: Record<string, unknown>[],
  series: string[],
  xAxis: string,
  limit: number = 5
): string {
  const items = data.slice(0, limit);
  const descriptions = items
    .map((item) => {
      const xValue = item[xAxis] ?? "Unknown";
      const seriesValues = series
        .map((s) => `${s}: ${item[s] ?? "N/A"}`)
        .join(", ");
      return `${xValue} - ${seriesValues}`;
    })
    .join("; ");

  const totalItems = data.length;
  const suffix =
    totalItems > limit ? ` (showing ${limit} of ${totalItems} items)` : "";

  return `Chart data: ${descriptions}${suffix}`;
}

/**
 * Generate focus-friendly class name
 */
export function getFocusStyle(): React.CSSProperties {
  return {
    outline: "2px solid var(--color-focus, #2563eb)",
    outlineOffset: "2px",
  };
}

/**
 * Check if high contrast mode is enabled
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia("(prefers-contrast: more)").matches;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check system theme preference
 */
export function getPrefersColorScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Create screen reader announcement
 */
export function createAnnouncement(message: string, politeness: "polite" | "assertive" = "polite"): HTMLElement {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", politeness);
  announcement.setAttribute("aria-atomic", "true");
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  return announcement;
}
