import type { BrushConfig } from "../types";

/**
 * Represents the state of a brush selection
 */
export interface BrushState {
  isEnabled: boolean;
  dataStartIndex: number;
  dataEndIndex: number;
  isResetting: boolean;
}

/**
 * Represents the result of a brush change event
 */
export interface BrushChangeResult {
  startIndex: number;
  endIndex: number;
  range: number;
}

/**
 * Represents configuration for built Recharts Brush props
 */
export interface BuiltBrushConfig {
  dataStartIndex: number;
  dataEndIndex?: number;
  y?: number;
  height: number;
  travelAxis: "x" | "y";
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
  showPreview?: boolean;
}

/**
 * Build Recharts Brush configuration from ChartConfig.brush
 * This function takes the brush configuration and returns props suitable for Recharts Brush component
 *
 * @param config - BrushConfig from ChartConfig
 * @param dataLength - Total length of data (used for validation)
 * @returns BuiltBrushConfig ready for Recharts Brush component
 */
export function buildBrushConfig(
  config: BrushConfig | undefined,
  dataLength: number
): BuiltBrushConfig {
  if (!config) {
    throw new Error("Brush config is required");
  }

  // Validate data length
  if (dataLength <= 0) {
    throw new Error("Data length must be greater than 0");
  }

  // Determine start index (default: 0)
  const dataStartIndex = Math.max(0, config.dataStartIndex ?? 0);

  // Determine end index (default: length of data)
  let dataEndIndex = config.dataEndIndex ?? dataLength;
  dataEndIndex = Math.min(dataEndIndex, dataLength);

  // Ensure start index is not greater than end index
  if (dataStartIndex >= dataEndIndex) {
    console.warn(
      `Brush start index (${dataStartIndex}) is >= end index (${dataEndIndex}). Adjusting to valid range.`
    );
    // Use full range if invalid
    return {
      dataStartIndex: 0,
      dataEndIndex: dataLength,
      y: config.y,
      height: config.height ?? 40,
      travelAxis: config.travelAxis ?? "x",
      fill: config.fill ?? "#8884d8",
      stroke: config.stroke ?? "#666",
      fillOpacity: config.fillOpacity ?? 0.1,
      showPreview: config.showPreview ?? true,
    };
  }

  return {
    dataStartIndex,
    dataEndIndex,
    y: config.y,
    height: config.height ?? 40,
    travelAxis: config.travelAxis ?? "x",
    fill: config.fill ?? "#8884d8",
    stroke: config.stroke ?? "#666",
    fillOpacity: config.fillOpacity ?? 0.1,
    showPreview: config.showPreview ?? true,
  };
}

/**
 * Handle brush range changes
 * Called when user interacts with the brush to change the selection range
 *
 * @param startIndex - New start index of the brush selection
 * @param endIndex - New end index of the brush selection
 * @param dataLength - Total length of data for validation
 * @returns BrushChangeResult with validated indices and range information
 */
export function onBrushChange(
  startIndex: number,
  endIndex: number,
  dataLength: number
): BrushChangeResult {
  // Validate indices
  const validatedStartIndex = Math.max(0, Math.min(startIndex, dataLength - 1));
  const validatedEndIndex = Math.max(
    validatedStartIndex + 1,
    Math.min(endIndex, dataLength)
  );

  return {
    startIndex: validatedStartIndex,
    endIndex: validatedEndIndex,
    range: validatedEndIndex - validatedStartIndex,
  };
}

/**
 * Reset brush to full data range
 * Used when user wants to see all data again
 *
 * @param dataLength - Total length of data
 * @returns BrushChangeResult with full range
 */
export function resetBrush(dataLength: number): BrushChangeResult {
  if (dataLength <= 0) {
    throw new Error("Data length must be greater than 0");
  }

  return {
    startIndex: 0,
    endIndex: dataLength,
    range: dataLength,
  };
}

/**
 * Filter data based on brush selection
 * Returns a subset of data that falls within the selected brush range
 *
 * @param data - Full dataset
 * @param startIndex - Start index of brush selection
 * @param endIndex - End index of brush selection
 * @returns Filtered data array
 */
export function filterDataByBrushRange<T extends Record<string, unknown>>(
  data: T[],
  startIndex: number,
  endIndex: number
): T[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const validatedStart = Math.max(0, startIndex);
  const validatedEnd = Math.min(endIndex, data.length);

  if (validatedStart >= validatedEnd) {
    return [];
  }

  return data.slice(validatedStart, validatedEnd);
}

/**
 * Handle keyboard controls for brush expansion/collapse
 * Supports arrow keys: left/right to move, up/down to expand/collapse
 *
 * @param key - The keyboard key pressed
 * @param currentStart - Current brush start index
 * @param currentEnd - Current brush end index
 * @param dataLength - Total length of data
 * @param stepSize - Number of items to move/expand per key press (default: 1)
 * @returns BrushChangeResult with new indices, or null if key is not a brush control key
 */
export function handleBrushKeyboard(
  key: string,
  currentStart: number,
  currentEnd: number,
  dataLength: number,
  stepSize: number = 1
): BrushChangeResult | null {
  let newStart = currentStart;
  let newEnd = currentEnd;

  switch (key) {
    case "ArrowLeft":
      // Move selection left
      newStart = Math.max(0, currentStart - stepSize);
      newEnd = Math.max(newStart + 1, currentEnd - stepSize);
      break;

    case "ArrowRight":
      // Move selection right
      newEnd = Math.min(dataLength, currentEnd + stepSize);
      newStart = Math.min(newEnd - 1, currentStart + stepSize);
      break;

    case "ArrowUp":
      // Expand selection (increase range)
      newStart = Math.max(0, currentStart - stepSize);
      newEnd = Math.min(dataLength, currentEnd + stepSize);
      break;

    case "ArrowDown":
      // Collapse selection (decrease range)
      newStart = Math.min(currentEnd - 1, currentStart + stepSize);
      newEnd = Math.max(newStart + 1, currentEnd - stepSize);
      break;

    default:
      return null;
  }

  return onBrushChange(newStart, newEnd, dataLength);
}

/**
 * Handle touch events for brush on mobile devices
 * Converts touch event coordinates to brush indices
 *
 * @param touchX - X coordinate from touch event
 * @param containerWidth - Width of the chart container
 * @param dataLength - Total length of data
 * @param isTouchStart - True if this is the start of a touch, false if it's an ongoing drag
 * @returns Calculated index for the touch position
 */
export function handleBrushTouch(
  touchX: number,
  containerWidth: number,
  dataLength: number,
  isTouchStart: boolean = true
): number {
  if (containerWidth <= 0) {
    return 0;
  }

  // Calculate which data index corresponds to the touch X position
  const ratio = Math.max(0, Math.min(1, touchX / containerWidth));
  const index = Math.round(ratio * (dataLength - 1));

  return Math.max(0, Math.min(index, dataLength - 1));
}

/**
 * Synchronize brush state across multiple charts with the same syncId
 * This is useful when multiple charts need to show the same data range
 *
 * @param brushState - Current brush state
 * @param syncId - The sync ID from chart config
 * @returns Modified brush state if sync is enabled, otherwise unchanged state
 */
export function syncBrushState(
  brushState: BrushState,
  syncId: string | undefined
): BrushState {
  if (!syncId) {
    return brushState;
  }

  // Store sync state in sessionStorage for cross-chart synchronization
  const syncKey = `brush-sync-${syncId}`;

  const syncedState: BrushState = {
    isEnabled: brushState.isEnabled,
    dataStartIndex: brushState.dataStartIndex,
    dataEndIndex: brushState.dataEndIndex,
    isResetting: brushState.isResetting,
  };

  try {
    sessionStorage.setItem(syncKey, JSON.stringify(syncedState));
  } catch (error) {
    console.warn("Failed to store brush sync state:", error);
  }

  return syncedState;
}

/**
 * Retrieve synchronized brush state from sessionStorage
 * Used to restore brush state across multiple synchronized charts
 *
 * @param syncId - The sync ID from chart config
 * @returns Retrieved brush state or null if not found
 */
export function getSyncedBrushState(syncId: string | undefined): BrushState | null {
  if (!syncId) {
    return null;
  }

  const syncKey = `brush-sync-${syncId}`;

  try {
    const stored = sessionStorage.getItem(syncKey);
    if (stored) {
      return JSON.parse(stored) as BrushState;
    }
  } catch (error) {
    console.warn("Failed to retrieve brush sync state:", error);
  }

  return null;
}

/**
 * Validate brush configuration against data
 * Checks for edge cases like empty data, single point, etc.
 *
 * @param config - BrushConfig to validate
 * @param data - Data array to validate against
 * @returns Error message if validation fails, null if valid
 */
export function validateBrushConfig(
  config: BrushConfig | undefined,
  data: unknown[] | null | undefined
): string | null {
  if (!data || !Array.isArray(data)) {
    return "Data must be an array";
  }

  if (data.length === 0) {
    return "Cannot enable brush on empty data";
  }

  if (!config) {
    return null; // Brush is optional
  }

  // Check data indices
  if (
    config.dataStartIndex !== undefined &&
    config.dataStartIndex < 0
  ) {
    return "dataStartIndex cannot be negative";
  }

  if (
    config.dataEndIndex !== undefined &&
    config.dataEndIndex > data.length
  ) {
    return `dataEndIndex (${config.dataEndIndex}) exceeds data length (${data.length})`;
  }

  if (
    config.dataStartIndex !== undefined &&
    config.dataEndIndex !== undefined &&
    config.dataStartIndex >= config.dataEndIndex
  ) {
    return "dataStartIndex must be less than dataEndIndex";
  }

  // Check height
  if (config.height !== undefined && config.height <= 0) {
    return "height must be greater than 0";
  }

  // Check fill opacity
  if (
    config.fillOpacity !== undefined &&
    (config.fillOpacity < 0 || config.fillOpacity > 1)
  ) {
    return "fillOpacity must be between 0 and 1";
  }

  return null;
}

/**
 * Create initial brush state
 * Helper function to create a fresh brush state object
 *
 * @param dataLength - Total length of data
 * @param enabled - Whether brush is enabled (default: true)
 * @returns Initial BrushState
 */
export function createInitialBrushState(
  dataLength: number,
  enabled: boolean = true
): BrushState {
  if (dataLength <= 0) {
    throw new Error("Data length must be greater than 0");
  }

  return {
    isEnabled: enabled,
    dataStartIndex: 0,
    dataEndIndex: dataLength,
    isResetting: false,
  };
}

/**
 * Calculate visible data range percentage
 * Useful for UI indicators showing how much data is visible
 *
 * @param startIndex - Start index of visible range
 * @param endIndex - End index of visible range
 * @param dataLength - Total length of data
 * @returns Percentage of data visible (0-100)
 */
export function calculateVisibleDataPercentage(
  startIndex: number,
  endIndex: number,
  dataLength: number
): number {
  if (dataLength <= 0) {
    return 0;
  }

  const visibleCount = endIndex - startIndex;
  return Math.round((visibleCount / dataLength) * 100);
}

/**
 * Determine optimal brush height based on data length
 * Smaller datasets might need smaller brushes, larger datasets might need taller brushes
 *
 * @param dataLength - Total length of data
 * @returns Suggested height in pixels
 */
export function calculateOptimalBrushHeight(dataLength: number): number {
  if (dataLength <= 10) {
    return 30;
  }
  if (dataLength <= 50) {
    return 40;
  }
  if (dataLength <= 200) {
    return 60;
  }
  return 80;
}
