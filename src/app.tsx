import type { App } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ChartRenderer } from "./components/ChartRenderer";
import type { ChartConfig } from "./types";
import { createAnnouncement, getPrefersColorScheme, prefersHighContrast, prefersReducedMotion } from "./utils/a11y";

function extractChartConfig(callToolResult: CallToolResult): ChartConfig {
  const textContent = callToolResult.content?.find(
    (c): c is { type: "text"; text: string } => c.type === "text"
  );
  if (!textContent) {
    throw new Error("No text content in tool result");
  }
  return JSON.parse(textContent.text) as ChartConfig;
}

function VisualizationApp() {
  const [config, setConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(getPrefersColorScheme());
  const [highContrast, setHighContrast] = useState(prefersHighContrast());
  const [reducedMotion] = useState(prefersReducedMotion());
  const announcementRef = useRef<HTMLDivElement>(null);

  const { app, error: appError } = useApp({
    appInfo: { name: "Graph Visualization", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolinput = (params) => {
        console.info("Tool input received:", params);
      };

      app.ontoolresult = (result) => {
        console.info("Tool result received:", result);
        try {
          setIsLoading(false);
          const chartConfig = extractChartConfig(result);
          setConfig(chartConfig);
          setError(null);
          // Announce to screen readers
          const announcement = createAnnouncement(
            `Chart loaded: ${chartConfig.title || "Data visualization"}. ${chartConfig.chartType || "Chart"} type.`
          );
          announcementRef.current?.appendChild(announcement);
          setTimeout(() => announcement.remove(), 3000);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("Error parsing chart config:", message);
          setError(`Error: ${message}`);
          setIsLoading(false);
          // Announce error to screen readers
          const announcement = createAnnouncement(
            `Error loading chart: ${message}`,
            "assertive"
          );
          announcementRef.current?.appendChild(announcement);
          setTimeout(() => announcement.remove(), 5000);
        }
      };

      app.onhostcontextchanged = (params) => {
        console.info("Host context changed:", params);
      };

      app.onteardown = async () => {
        console.info("App is being torn down");
        return {};
      };
    },
  });

  useHostStyles(app);

  useEffect(() => {
    if (config) {
      console.info("Config updated:", config);
    }
  }, [config]);

  useEffect(() => {
    // Listen for theme preference changes
    const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    // Listen for high contrast preference changes
    const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    themeMediaQuery.addEventListener("change", handleThemeChange);
    contrastMediaQuery.addEventListener("change", handleContrastChange);

    return () => {
      themeMediaQuery.removeEventListener("change", handleThemeChange);
      contrastMediaQuery.removeEventListener("change", handleContrastChange);
    };
  }, []);

  // Determine which theme to use - prefer config theme over system preference
  const effectiveTheme = (config?.theme as "light" | "dark") || theme;
  const themeClass = `theme-${effectiveTheme}${highContrast ? " high-contrast" : ""}${reducedMotion ? " reduced-motion" : ""}`;

  if (appError) {
    return (
      <div
        style={styles.container}
        className={themeClass}
        role="alert"
        aria-live="assertive"
      >
        <strong>ERROR:</strong> {appError.message}
      </div>
    );
  }
  if (!app) {
    return (
      <div style={styles.container} className={themeClass}>
        <p style={styles.loadingText}>Connecting...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className={themeClass}>
      <div
        ref={announcementRef}
        role="region"
        aria-live="polite"
        aria-label="Status announcements"
      />
      {isLoading && (
        <div style={styles.loadingContainer} role="status" aria-label="Loading">
          <p style={styles.loadingText}>Loading chart...</p>
        </div>
      )}

      {error && (
        <div
          style={styles.errorContainer}
          role="alert"
          aria-live="assertive"
          aria-label="Error message"
        >
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {config && !error && (
        <div
          style={styles.chartContainer}
          id="main"
          role="main"
          aria-label="Chart visualization"
        >
          <ChartRenderer config={config} theme={effectiveTheme} reducedMotion={reducedMotion} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    padding: "16px",
    overflow: "auto",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  loadingText: {
    color: "var(--color-text-secondary, #666666)",
  },
  errorContainer: {
    padding: "16px",
    backgroundColor: "var(--color-background-secondary, #f5f5f5)",
    borderRadius: "4px",
    border: "1px solid var(--color-border-error, #ff6b6b)",
  },
  errorText: {
    color: "var(--color-text-error, #ff6b6b)",
  },
  chartContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VisualizationApp />
  </StrictMode>,
);
